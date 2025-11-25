/**
 * Alert Manager
 *
 * Monitors security events and triggers alerts when thresholds are exceeded.
 * Tracks event counts per IP/user and sends notifications when rules are violated.
 */

import { securityConfig } from '../config';
import type { SecurityEventData, AlertRule, AlertTrigger } from './types';
import { prisma } from '../../db';

interface EventCounter {
  count: number;
  timestamps: number[];
  lastReset: number;
}

export class AlertManager {
  private counters = new Map<string, EventCounter>();
  private alertsSent = new Set<string>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start periodic cleanup of old counters
    this.startCleanup();
  }

  /**
   * Check if event should trigger an alert
   */
  async checkAlert(event: SecurityEventData): Promise<AlertTrigger | null> {
    const rule = this.getAlertRule(event.type);
    if (!rule) {
      return null;
    }

    // Create unique key for this event type + IP/user
    const key = this.getCounterKey(event);

    // Get or create counter
    let counter = this.counters.get(key);
    if (!counter) {
      counter = { count: 0, timestamps: [], lastReset: Date.now() };
      this.counters.set(key, counter);
    }

    // Add current timestamp
    const now = Date.now();
    counter.timestamps.push(now);
    counter.count++;

    // Remove timestamps outside the window
    if (rule.window > 0) {
      counter.timestamps = counter.timestamps.filter(
        ts => now - ts < rule.window
      );
      counter.count = counter.timestamps.length;
    }

    // Check if threshold exceeded
    if (counter.count >= rule.threshold) {
      // Check if we already sent alert for this key recently (prevent spam)
      const alertKey = `${key}-${Math.floor(now / rule.window)}`;
      if (!this.alertsSent.has(alertKey)) {
        this.alertsSent.add(alertKey);

        // Create alert trigger
        const trigger: AlertTrigger = {
          rule: event.type,
          count: counter.count,
          threshold: rule.threshold,
          window: rule.window,
          events: [event],
          triggeredAt: new Date(),
        };

        // Send alert
        await this.sendAlert(trigger, event);

        // Reset counter
        counter.count = 0;
        counter.timestamps = [];
        counter.lastReset = now;

        return trigger;
      }
    }

    return null;
  }

  /**
   * Send alert notification
   */
  private async sendAlert(trigger: AlertTrigger, event: SecurityEventData): Promise<void> {
    try {
      console.warn('🚨 [SECURITY ALERT]', {
        rule: trigger.rule,
        count: trigger.count,
        threshold: trigger.threshold,
        ipAddress: event.ipAddress,
        userId: event.userId,
      });

      // Save alert to database
      await this.saveAlertToDatabase(trigger, event);

      // Send email if configured
      if (securityConfig.alerts.emailTo) {
        await this.sendEmailAlert(trigger, event);
      }

      // Send webhook if configured
      if (securityConfig.alerts.webhookUrl) {
        await this.sendWebhookAlert(trigger, event);
      }
    } catch (error) {
      console.error('[AlertManager] Failed to send alert:', error);
    }
  }

  /**
   * Save alert to database
   */
  private async saveAlertToDatabase(
    trigger: AlertTrigger,
    event: SecurityEventData
  ): Promise<void> {
    try {
      await prisma.securityEvent.create({
        data: {
          type: 'SECURITY_ALERT',
          severity: 'CRITICAL',
          category: 'SYSTEM',
          ipAddress: event.ipAddress,
          userId: event.userId,
          action: 'security_alert',
          resource: event.resource,
          method: event.method,
          path: event.path,
          success: false,
          metadata: {
            alertRule: trigger.rule,
            count: trigger.count,
            threshold: trigger.threshold,
            window: trigger.window,
            originalEvent: {
              ...event,
              timestamp: event.timestamp?.toISOString(),
            },
          },
          alertSent: true,
          alertedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('[AlertManager] Failed to save alert to database:', error);
    }
  }

  /**
   * Send email alert (stub - implement with your email service)
   */
  private async sendEmailAlert(
    trigger: AlertTrigger,
    event: SecurityEventData
  ): Promise<void> {
    // TODO: Implement email sending using your email service
    // For now, just log
    console.log('[AlertManager] Email alert would be sent to:', securityConfig.alerts.emailTo);
    console.log('Alert details:', {
      rule: trigger.rule,
      count: trigger.count,
      ipAddress: event.ipAddress,
      userId: event.userId,
    });
  }

  /**
   * Send webhook alert
   */
  private async sendWebhookAlert(
    trigger: AlertTrigger,
    event: SecurityEventData
  ): Promise<void> {
    try {
      if (!securityConfig.alerts.webhookUrl) return;

      const response = await fetch(securityConfig.alerts.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          alert: {
            rule: trigger.rule,
            count: trigger.count,
            threshold: trigger.threshold,
            window: trigger.window,
            triggeredAt: trigger.triggeredAt,
          },
          event: {
            type: event.type,
            severity: event.severity,
            ipAddress: event.ipAddress,
            userId: event.userId,
            action: event.action,
            path: event.path,
            timestamp: event.timestamp,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook returned ${response.status}`);
      }
    } catch (error) {
      console.error('[AlertManager] Failed to send webhook alert:', error);
    }
  }

  /**
   * Get alert rule for event type
   */
  private getAlertRule(eventType: string): AlertRule | null {
    const rules = securityConfig.alerts.rules as Record<string, AlertRule>;
    return rules[eventType] || null;
  }

  /**
   * Generate counter key for event
   */
  private getCounterKey(event: SecurityEventData): string {
    // Use IP address as primary key, fallback to userId
    const identifier = event.ipAddress || event.userId || 'unknown';
    return `${event.type}:${identifier}`;
  }

  /**
   * Start periodic cleanup of old counters
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      const maxAge = 3600000; // 1 hour

      // Remove old counters
      for (const [key, counter] of this.counters.entries()) {
        if (now - counter.lastReset > maxAge) {
          this.counters.delete(key);
        }
      }

      // Remove old alert keys
      this.alertsSent.clear();
    }, 300000); // Every 5 minutes
  }

  /**
   * Stop cleanup
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Get current alert statistics
   */
  getStats() {
    return {
      activeCounters: this.counters.size,
      alertsSent: this.alertsSent.size,
    };
  }
}

// Singleton instance
export const alertManager = new AlertManager();
