import Stripe from "stripe";
import { prisma } from "../db";

export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2025-08-27.basil",
    });
  }

  // Price IDs for subscription plans
  private plans = {
    FREE: null,
    PRO: process.env.STRIPE_PRO_PRICE_ID || "price_pro",
    PREMIUM: process.env.STRIPE_PREMIUM_PRICE_ID || "price_premium",
  };

  /**
   * Create a Stripe customer for a user
   */
  async createCustomer(userId: string, email: string, name: string) {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata: { userId },
      });

      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: userId },
        data: {
          subscription: {
            ...(await this.getUserSubscription(userId)),
            stripeCustomerId: customer.id,
          },
        },
      });

      return customer;
    } catch (error) {
      console.error("Create customer error:", error);
      throw error;
    }
  }

  /**
   * Create a checkout session for subscription
   */
  async createCheckoutSession(
    userId: string,
    plan: "PRO" | "PREMIUM",
    successUrl: string,
    cancelUrl: string
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new Error("User not found");

    const subscription = (user.subscription as any) || {};

    // Create customer if not exists
    let customerId = subscription.stripeCustomerId;

    if (!customerId) {
      const customer = await this.createCustomer(userId, user.email, user.fullName || "");
      customerId = customer.id;
    }

    const priceId = this.plans[plan];

    if (!priceId) throw new Error(`Invalid plan: ${plan}`);

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        plan,
      },
    });

    return session;
  }

  /**
   * Create a customer portal session
   */
  async createPortalSession(userId: string, returnUrl: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new Error("User not found");

    const subscription = (user.subscription as any) || {};
    const customerId = subscription.stripeCustomerId;

    if (!customerId) throw new Error("No Stripe customer found");

    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session;
  }

  /**
   * Handle webhook events
   */
  async handleWebhook(rawBody: string, signature: string) {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ""
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      throw new Error("Webhook signature verification failed");
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        await this.handleCheckoutComplete(event.data.object as Stripe.Checkout.Session);
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
        await this.handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case "invoice.payment_succeeded":
        await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
    }

    return { received: true };
  }

  private async handleCheckoutComplete(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan || "PRO";

    if (!userId) return;

    // Get subscription details
    const subscription = await this.stripe.subscriptions.retrieve(
      session.subscription as string
    );

    // Update user subscription
    await prisma.user.update({
      where: { id: userId },
      data: {
        role: plan as "PRO" | "PREMIUM",
        subscription: {
          tier: plan,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscription.items.data[0]?.price.id || "",
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now as fallback
          status: "active",
        },
      },
    });

    // Log event
    await prisma.event.create({
      data: {
        type: "SUBSCRIPTION_CREATED",
        entityType: "USER",
        entityId: userId,
        data: { plan, subscriptionId: subscription.id },
        userId,
      },
    });
  }

  private async handleSubscriptionUpdate(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.userId;

    if (!userId) {
      // Try to find user by customer ID
      const user = await prisma.user.findFirst({
        where: {
          subscription: {
            path: ["stripeCustomerId"],
            equals: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id,
          },
        },
      });

      if (!user) return;
    }

    const plan = this.getPlanFromPriceId(subscription.items.data[0]?.price.id || "");

    await prisma.user.update({
      where: { id: userId },
      data: {
        role: plan as "FREE" | "PRO" | "PREMIUM",
        subscription: {
          tier: plan,
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscription.items.data[0]?.price.id || "",
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now as fallback
          status: subscription.status,
        },
      },
    });
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const user = await prisma.user.findFirst({
      where: {
        subscription: {
          path: ["stripeSubscriptionId"],
          equals: subscription.id,
        },
      },
    });

    if (!user) return;

    // Downgrade to FREE
    await prisma.user.update({
      where: { id: user.id },
      data: {
        role: "FREE",
        subscription: {
          tier: "FREE",
          stripeSubscriptionId: null,
          stripePriceId: null,
          expiresAt: null,
          status: "cancelled",
        },
      },
    });

    // Log event
    await prisma.event.create({
      data: {
        type: "SUBSCRIPTION_CANCELLED",
        entityType: "USER",
        entityId: user.id,
        data: { previousPlan: this.getPlanFromPriceId(subscription.items.data[0]?.price.id || "") },
        userId: user.id,
      },
    });
  }

  private async handlePaymentSucceeded(invoice: Stripe.Invoice) {
    console.log("Payment succeeded for invoice:", invoice.id);

    // Log payment
    await prisma.event.create({
      data: {
        type: "PAYMENT_SUCCEEDED",
        entityType: "INVOICE",
        entityId: invoice.id,
        data: {
          amount: invoice.amount_paid,
          currency: invoice.currency,
          customer: typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id || null,
        },
      },
    });
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice) {
    console.error("Payment failed for invoice:", invoice.id);

    // Log payment failure
    await prisma.event.create({
      data: {
        type: "PAYMENT_FAILED",
        entityType: "INVOICE",
        entityId: invoice.id,
        data: {
          amount: invoice.amount_due,
          currency: invoice.currency,
          customer: typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id || null,
          attemptCount: invoice.attempt_count,
        },
      },
    });
  }

  private getPlanFromPriceId(priceId: string): string {
    for (const [plan, id] of Object.entries(this.plans)) {
      if (id === priceId) return plan;
    }
    return "FREE";
  }

  private async getUserSubscription(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    return (user?.subscription as any) || {};
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new Error("User not found");

    const subscription = (user.subscription as any) || {};

    if (!subscription.stripeSubscriptionId) {
      throw new Error("No active subscription");
    }

    // Cancel at period end
    const stripeSubscription = await this.stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      { cancel_at_period_end: true }
    );

    // Update user subscription
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscription: {
          ...subscription,
          status: "cancelling",
          cancelAt: new Date(stripeSubscription.cancel_at! * 1000).toISOString(),
        },
      },
    });

    return stripeSubscription;
  }

  /**
   * Resume cancelled subscription
   */
  async resumeSubscription(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new Error("User not found");

    const subscription = (user.subscription as any) || {};

    if (!subscription.stripeSubscriptionId) {
      throw new Error("No subscription to resume");
    }

    // Resume subscription
    const stripeSubscription = await this.stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      { cancel_at_period_end: false }
    );

    // Update user subscription
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscription: {
          ...subscription,
          status: "active",
          cancelAt: null,
        },
      },
    });

    return stripeSubscription;
  }

  /**
   * Get subscription status
   */
  async getSubscriptionStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new Error("User not found");

    const subscription = (user.subscription as any) || {};

    if (!subscription.stripeSubscriptionId) {
      return { status: "none", plan: "FREE" };
    }

    const stripeSubscription = await this.stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    );

    return {
      status: stripeSubscription.status,
      plan: subscription.tier,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now as fallback
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
    };
  }
}