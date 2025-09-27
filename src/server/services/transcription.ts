import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import axios from 'axios';
import FormData from 'form-data';
// @ts-ignore
import { getSubtitles } from 'youtube-captions-scraper';
import { YoutubeTranscript } from 'youtube-transcript';
import { env } from '@/env.mjs';
import { prisma } from '@/server/db';

const execAsync = promisify(require('child_process').exec);

export interface TranscriptResult {
  transcript: string;
  transcriptWithTimes?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
  provenance: string;
  source: 'youtube_captions' | 'youtube_transcript_api' | 'whisper_transcription' | 'rapidapi_audio' | 'fallback';
}

interface RapidApiResponse {
  link: string;
  title: string;
  filesize?: number;
  progress: number;
  duration: number;
  status: string;
  msg: string;
}

export class TranscriptionService {
  private tempDir: string;

  constructor() {
    // Create temp directory in project root
    this.tempDir = path.join(process.cwd(), 'temp_audio');

    // Ensure temp directory exists
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }

    // Clean up any orphaned files from previous runs
    this.cleanupOldFiles();
  }

  /**
   * Clean up orphaned audio files older than 1 hour
   */
  private cleanupOldFiles(): void {
    try {
      if (!fs.existsSync(this.tempDir)) return;

      const files = fs.readdirSync(this.tempDir);
      const oneHourAgo = Date.now() - (60 * 60 * 1000); // 1 hour in milliseconds

      for (const file of files) {
        if (file.endsWith('.mp3') || file.endsWith('.vtt')) {
          const filePath = path.join(this.tempDir, file);
          const stats = fs.statSync(filePath);

          if (stats.mtime.getTime() < oneHourAgo) {
            fs.unlinkSync(filePath);
            console.log(`[TranscriptionService] Cleaned up orphaned file: ${file}`);
          }
        }
      }
    } catch (error) {
      console.warn(`[TranscriptionService] Failed to cleanup old files:`, error);
    }
  }

  /**
   * Main transcription method following original app logic:
   * 1. Try YouTube captions (youtube-captions-scraper)
   * 2. Try YouTube transcript API (youtube-transcript)
   * 3. Fallback to audio download + OpenAI Whisper transcription
   */
  async getTranscriptForVideo(videoUrl: string, contentId?: string): Promise<TranscriptResult> {
    const videoId = this.extractVideoId(videoUrl);
    if (!videoId) {
      throw new Error(`Could not extract video ID from URL: ${videoUrl}`);
    }

    console.log(`[TranscriptionService] Processing video: ${videoUrl} (ID: ${videoId}, ContentID: ${contentId || 'none'})`);

    // Check if we have an existing audio file from previous attempts
    const existingAudioPath = await this.checkExistingAudio(videoId, contentId);
    if (existingAudioPath && fs.existsSync(existingAudioPath)) {
      console.log(`[TranscriptionService] Found existing audio file: ${existingAudioPath}, skipping download`);
      // Go directly to transcription
      const whisperResult = await this.transcribeExistingAudio(existingAudioPath, videoId, contentId);
      if (whisperResult) {
        return whisperResult;
      }
    }

    // Method 1: Try youtube-captions-scraper (current primary method)
    console.log(`[TranscriptionService] Method 1: Trying youtube-captions-scraper...`);
    const captionsResult = await this.tryYoutubeCaptionsScraper(videoId);
    if (captionsResult) {
      return captionsResult;
    }

    // Method 2: Try youtube-transcript API (backup method)
    console.log(`[TranscriptionService] Method 2: Trying youtube-transcript API...`);
    const transcriptResult = await this.tryYouTubeTranscriptAPI(videoId);
    if (transcriptResult) {
      return transcriptResult;
    }

    // Method 3: Fallback to audio download + Whisper (original app's final fallback)
    console.log(`[TranscriptionService] Method 3: Fallback to audio download + Whisper...`);
    const whisperResult = await this.tryAudioDownloadAndWhisper(videoUrl, videoId, contentId);
    if (whisperResult) {
      return whisperResult;
    }

    // Final fallback
    console.error(`[TranscriptionService] ❌ All transcript methods failed for video: ${videoId}`);
    return {
      transcript: '',
      provenance: 'all_methods_failed',
      source: 'fallback'
    };
  }

  /**
   * Method 1: Try youtube-captions-scraper with multiple languages
   * This is the current primary method used in the original app
   */
  private async tryYoutubeCaptionsScraper(videoId: string): Promise<TranscriptResult | null> {
    const languages = ['en', 'en-US', 'en-GB', 'auto'];

    for (const lang of languages) {
      try {
        console.log(`[TranscriptionService] Trying youtube-captions-scraper with language '${lang}' for ${videoId}`);
        const captions = await getSubtitles({ videoID: videoId, lang });

        if (captions && captions.length > 0) {
          const transcript = captions.map((c: { text: string }) => c.text).join(' ');
          if (transcript.length > 50) { // Minimum content threshold
            console.log(`[TranscriptionService] ✅ Got scraper captions (${lang}): ${transcript.length} characters`);
            return {
              transcript,
              provenance: `youtube_scraper_${lang}`,
              source: 'youtube_captions'
            };
          }
        }
      } catch (err) {
        console.log(`[TranscriptionService] ❌ Scraper failed for ${videoId} with lang '${lang}':`, err instanceof Error ? err.message : String(err));
        continue; // Try next language
      }
    }

    console.log(`[TranscriptionService] ⚠️ All scraper methods failed for ${videoId}`);
    return null;
  }

  /**
   * Method 2: Try youtube-transcript package (closest to Python youtube-transcript-api)
   * This implements the same logic as the Python script's fetch_captions function
   */
  private async tryYouTubeTranscriptAPI(videoId: string): Promise<TranscriptResult | null> {
    try {
      console.log(`[TranscriptionService] Trying YouTube transcript API for ${videoId}`);

      // Try multiple languages like the original app
      const languages = ['en', 'en-US', 'en-GB', 'auto'];

      for (const lang of languages) {
        try {
          // Try to fetch manually created transcript first, then auto-generated
          const transcriptArray = await YoutubeTranscript.fetchTranscript(videoId, {
            lang: lang
          });

          if (transcriptArray && transcriptArray.length > 0) {
            // Join segments like Python script: "\n".join(segment["text"] for segment in data)
            const transcript = transcriptArray.map(item => item.text).join('\n');

            if (transcript.length > 50) {
              console.log(`[TranscriptionService] ✅ Transcript API captions fetched successfully (${lang}): ${transcript.length} characters`);
              return {
                transcript,
                provenance: `youtube_transcript_${lang}`,
                source: 'youtube_transcript_api'
              };
            }
          }
        } catch (langError) {
          console.log(`[TranscriptionService] Language ${lang} failed:`, langError instanceof Error ? langError.message : String(langError));
          continue;
        }
      }
    } catch (error) {
      console.log(`[TranscriptionService] YouTube transcript API failed:`, error instanceof Error ? error.message : String(error));
    }

    return null;
  }

  /**
   * Method 3: Audio download + Whisper transcription (equivalent to original app's fallback)
   * Uses RapidAPI YouTube MP3 + OpenAI Whisper API
   */
  private async tryAudioDownloadAndWhisper(videoUrl: string, videoId: string, contentId?: string): Promise<TranscriptResult | null> {
    let audioPath: string | null = null;

    try {
      // Step 1: Download audio using RapidAPI
      console.log(`[TranscriptionService] Attempting to download audio for video: ${videoId}`);
      await this.updateContentStatus(contentId, 'AUDIO_DOWNLOADING');
      audioPath = await this.downloadAudioWithRapidAPI(videoUrl, videoId);

      // Save audio path to processingMetadata
      await this.updateContentMetadata(contentId, { audioPath, lastStep: 'AUDIO_DOWNLOADED' });
      await this.updateContentStatus(contentId, 'AUDIO_DOWNLOADED');
      console.log(`[TranscriptionService] ✅ Audio saved via RapidAPI to ${audioPath}`);

      // Step 2: Transcribe with OpenAI Whisper API
      console.log(`[TranscriptionService] Sending audio to Whisper API for transcription...`);
      await this.updateContentStatus(contentId, 'TRANSCRIBING');
      const transcriptResult = await this.transcribeWithOpenAIWhisper(audioPath);
      console.log(`[TranscriptionService] ✅ Whisper transcription complete: ${transcriptResult.transcript.length} characters`);

      // Mark as transcribed and save transcript
      await this.updateContentStatus(contentId, 'TRANSCRIBED');
      await this.updateContentMetadata(contentId, {
        lastStep: 'TRANSCRIBED',
        transcriptLength: transcriptResult.transcript.length
      });

      return {
        transcript: transcriptResult.transcript,
        transcriptWithTimes: transcriptResult.transcriptWithTimes,
        provenance: 'whisper_transcription_from_rapidapi',
        source: 'whisper_transcription'
      };

    } catch (error) {
      console.error(`[TranscriptionService] ❌ Audio download + Whisper failed:`, error);
      console.error(`[TranscriptionService] Error details:`, error instanceof Error ? error.stack : String(error));

      // Save error to metadata but keep audio file for retry
      await this.updateContentMetadata(contentId, {
        error: error instanceof Error ? error.message : String(error),
        retryCount: await this.getRetryCount(contentId) + 1
      });

      // Don't delete audio file on failure - keep it for retry!
      if (audioPath) {
        console.log(`[TranscriptionService] ⚠️ Keeping audio file for retry: ${audioPath}`);
      }

      return null;
    }
    // Only clean up on success - moved inside try block above
  }

  /**
   * Download audio using RapidAPI YouTube MP3 service
   * This replaces the yt-dlp method with a more reliable API-based approach
   */
  private async downloadAudioWithRapidAPI(videoUrl: string, videoId: string): Promise<string> {
    const outputPath = path.join(this.tempDir, `${videoId}.mp3`);
    const maxRetries = 10;
    const baseDelay = 15000; // 15 seconds

    if (!env.RAPIDAPI_KEY) {
      throw new Error('RAPIDAPI_KEY environment variable is required');
    }

    try {
      console.log(`[TranscriptionService] Downloading audio via RapidAPI for video: ${videoId}`);

      // Step 1: Get the MP3 download link from RapidAPI with retry logic
      const rapidApiUrl = `https://youtube-mp36.p.rapidapi.com/dl?id=${videoId}`;
      const rapidApiOptions = {
        method: 'GET' as const,
        headers: {
          'x-rapidapi-key': env.RAPIDAPI_KEY,
          'x-rapidapi-host': 'youtube-mp36.p.rapidapi.com'
        }
      };

      let result: RapidApiResponse | null = null;
      let retryCount = 0;

      while (retryCount <= maxRetries) {
        console.log(`[TranscriptionService] RapidAPI attempt ${retryCount + 1}/${maxRetries + 1}`);

        const response = await axios.get(rapidApiUrl, rapidApiOptions);
        result = response.data as RapidApiResponse;

        if (!result) {
          throw new Error(`RapidAPI returned no response`);
        }

        if (result.status === 'processing') {
          if (retryCount < maxRetries) {
            const delay = baseDelay * Math.pow(1.2, retryCount);
            console.log(`[TranscriptionService] ⏳ RapidAPI is still processing video. Waiting ${Math.round(delay/1000)}s before retry ${retryCount + 1}/${maxRetries}...`);
            console.log(`[TranscriptionService] 📊 Processing status: ${result.msg}, Progress: ${result.progress}%`);

            if (retryCount > 5 && result.progress === 0) {
              console.warn(`[TranscriptionService] ⚠️ No progress after ${retryCount} retries, video might be stuck in queue`);
            }

            await new Promise(resolve => setTimeout(resolve, delay));
            retryCount++;
            continue;
          } else {
            throw new Error(`RapidAPI processing timeout after ${maxRetries} retries. Video may be too long or complex for RapidAPI processing.`);
          }
        }

        if (result.status === 'ok' && result.link) {
          console.log(`[TranscriptionService] ✅ RapidAPI processing complete after ${retryCount} retries`);
          break;
        }

        if (result.status === 'fail') {
          console.error(`[TranscriptionService] ❌ RapidAPI returned failure: ${result.msg}`);
          throw new Error(`RapidAPI failed to process video: ${result.msg || 'Unknown error'}`);
        }

        throw new Error(`RapidAPI returned unexpected status: ${JSON.stringify(result)}`);
      }

      if (!result || result.status !== 'ok' || !result.link) {
        throw new Error(`RapidAPI failed to provide download link: ${JSON.stringify(result)}`);
      }

      console.log(`[TranscriptionService] Got MP3 link: ${result.title}`);
      const fileSizeMB = result.filesize ? `${(result.filesize / 1024 / 1024).toFixed(2)}MB` : 'Unknown size';
      console.log(`[TranscriptionService] Duration: ${result.duration}s, Size: ${fileSizeMB}`);

      // Step 2: Download the MP3 file
      const mp3Response = await axios.get(result.link, {
        responseType: 'arraybuffer',
        headers: {
          'Referer': 'https://ytjar.xyz/',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'audio/mpeg,audio/x-wav,audio/webm,audio/ogg,audio/*,*/*;q=0.1',
        }
      });

      if (mp3Response.status !== 200) {
        throw new Error(`Failed to download MP3: ${mp3Response.status} ${mp3Response.statusText}`);
      }

      // Step 3: Save the MP3 file
      const buffer = Buffer.from(mp3Response.data);
      fs.writeFileSync(outputPath, buffer);

      console.log(`[TranscriptionService] ✅ Audio downloaded successfully: ${outputPath} (${buffer.length} bytes)`);
      return outputPath;

    } catch (error) {
      console.error(`[TranscriptionService] RapidAPI download failed:`, error);
      throw error;
    }
  }

  /**
   * Transcribe using OpenAI Whisper API with retry logic for rate limiting
   */
  private async transcribeWithOpenAIWhisper(audioPath: string): Promise<{ transcript: string, transcriptWithTimes?: Array<{ start: number, end: number, text: string }> }> {
    if (!env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not found. Set OPENAI_API_KEY environment variable.');
    }

    // Check file size (OpenAI has 25MB limit)
    const stats = fs.statSync(audioPath);
    const fileSizeMB = stats.size / (1024 * 1024);

    if (fileSizeMB > 25) {
      throw new Error(`File too large for OpenAI API: ${fileSizeMB.toFixed(2)}MB (max 25MB)`);
    }

    console.log(`[TranscriptionService] 📤 Uploading ${fileSizeMB.toFixed(2)}MB audio to OpenAI...`);

    const form = new FormData();
    form.append('file', fs.createReadStream(audioPath));
    form.append('model', 'whisper-1');
    form.append('response_format', 'verbose_json'); // Get timestamps from OpenAI

    // Retry logic for rate limiting
    const maxRetries = 3;
    const baseDelay = 60000; // 60 seconds base delay for rate limits

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', form, {
          headers: {
            ...form.getHeaders(),
            'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
          },
          timeout: 300000, // 5 minute timeout
        });

        console.log(`[TranscriptionService] 📄 OpenAI returned ${response.data.text.length} characters`);

        // Extract timestamped segments if available
        let timestampedSegments: Array<{ start: number, end: number, text: string }> = [];
        if (response.data.segments) {
          timestampedSegments = response.data.segments.map((segment: any) => ({
            start: segment.start,
            end: segment.end,
            text: segment.text.trim()
          }));
        }

        return {
          transcript: response.data.text,
          transcriptWithTimes: timestampedSegments.length > 0 ? timestampedSegments : undefined
        };

      } catch (error: any) {
        const isRateLimitError = error.response?.status === 429;
        const isLastAttempt = attempt === maxRetries;

        if (isRateLimitError && !isLastAttempt) {
          // Exponential backoff: 60s, 120s, 240s
          const delay = baseDelay * Math.pow(2, attempt);
          const retryAfter = error.response?.headers?.['retry-after'];
          const actualDelay = retryAfter ? parseInt(retryAfter) * 1000 : delay;

          console.log(`[TranscriptionService] ⏳ Rate limited by OpenAI (429). Waiting ${actualDelay / 1000}s before retry ${attempt + 1}/${maxRetries}...`);
          console.log(`[TranscriptionService] 💡 Tip: Consider upgrading your OpenAI API tier for higher rate limits`);

          await new Promise(resolve => setTimeout(resolve, actualDelay));
          continue;
        }

        // Log the error details
        if (error.response) {
          console.error(`[TranscriptionService] ❌ OpenAI API error ${error.response.status}: ${error.response.statusText}`);
          if (error.response.data?.error) {
            console.error(`[TranscriptionService] Error details:`, error.response.data.error);
          }
        }

        throw error;
      }
    }

    throw new Error('Failed to transcribe audio after maximum retries');
  }

  /**
   * Check for existing audio file from previous attempts
   */
  private async checkExistingAudio(videoId: string, contentId?: string): Promise<string | null> {
    if (!contentId) return null;

    try {
      // Parse contentId to get forecaster and video IDs
      const [forecasterId, vid] = contentId.includes('_') ? contentId.split('_') : [null, contentId];

      // Look for content in database
      const content = await prisma.content.findFirst({
        where: {
          sourceId: videoId,
          sourceType: 'YOUTUBE',
          ...(forecasterId ? { forecasterId } : {})
        }
      });

      if (content?.processingMetadata) {
        const metadata = content.processingMetadata as any;
        if (metadata.audioPath && fs.existsSync(metadata.audioPath)) {
          return metadata.audioPath;
        }
      }
    } catch (error) {
      console.log(`[TranscriptionService] Error checking existing audio:`, error);
    }

    return null;
  }

  /**
   * Transcribe existing audio file (public for resume support)
   */
  async transcribeExistingAudio(audioPath: string, videoId: string, contentId?: string): Promise<TranscriptResult | null> {
    try {
      console.log(`[TranscriptionService] Transcribing existing audio: ${audioPath}`);
      await this.updateContentStatus(contentId, 'TRANSCRIBING');

      const transcriptResult = await this.transcribeWithOpenAIWhisper(audioPath);

      if (transcriptResult) {
        await this.updateContentStatus(contentId, 'TRANSCRIBED');
        await this.updateContentMetadata(contentId, {
          lastStep: 'TRANSCRIBED',
          transcriptLength: transcriptResult.transcript.length
        });

        // Clean up audio file after successful transcription
        if (fs.existsSync(audioPath)) {
          fs.unlinkSync(audioPath);
          console.log(`[TranscriptionService] Cleaned up audio file after successful transcription: ${audioPath}`);
        }

        return {
          transcript: transcriptResult.transcript,
          transcriptWithTimes: transcriptResult.transcriptWithTimes,
          provenance: 'whisper_transcription_from_existing_audio',
          source: 'whisper_transcription'
        };
      }

      return null;
    } catch (error) {
      console.error(`[TranscriptionService] Failed to transcribe existing audio:`, error);
      return null;
    }
  }

  /**
   * Update content status in database
   */
  private async updateContentStatus(contentId: string | undefined, status: string): Promise<void> {
    if (!contentId) return;

    try {
      const [forecasterId, videoId] = contentId.includes('_') ? contentId.split('_') : [null, contentId];

      await prisma.content.updateMany({
        where: {
          sourceId: videoId || contentId,
          sourceType: 'YOUTUBE',
          ...(forecasterId ? { forecasterId } : {})
        },
        data: { status }
      });
    } catch (error) {
      console.log(`[TranscriptionService] Error updating content status:`, error);
    }
  }

  /**
   * Update content metadata in database
   */
  private async updateContentMetadata(contentId: string | undefined, metadata: any): Promise<void> {
    if (!contentId) return;

    try {
      const [forecasterId, videoId] = contentId.includes('_') ? contentId.split('_') : [null, contentId];

      // Get existing metadata
      const content = await prisma.content.findFirst({
        where: {
          sourceId: videoId || contentId,
          sourceType: 'YOUTUBE',
          ...(forecasterId ? { forecasterId } : {})
        }
      });

      if (content) {
        const existingMetadata = content.processingMetadata as any || {};
        const updatedMetadata = { ...existingMetadata, ...metadata, updatedAt: new Date().toISOString() };

        await prisma.content.updateMany({
          where: {
            sourceId: videoId || contentId,
            sourceType: 'YOUTUBE',
            ...(forecasterId ? { forecasterId } : {})
          },
          data: { processingMetadata: updatedMetadata }
        });
      }
    } catch (error) {
      console.log(`[TranscriptionService] Error updating content metadata:`, error);
    }
  }

  /**
   * Get retry count from metadata
   */
  private async getRetryCount(contentId: string | undefined): Promise<number> {
    if (!contentId) return 0;

    try {
      const [forecasterId, videoId] = contentId.includes('_') ? contentId.split('_') : [null, contentId];

      const content = await prisma.content.findFirst({
        where: {
          sourceId: videoId || contentId,
          sourceType: 'YOUTUBE',
          ...(forecasterId ? { forecasterId } : {})
        }
      });

      if (content?.processingMetadata) {
        const metadata = content.processingMetadata as any;
        return metadata.retryCount || 0;
      }
    } catch (error) {
      console.log(`[TranscriptionService] Error getting retry count:`, error);
    }

    return 0;
  }

  /**
   * Extract video ID from YouTube URL
   */
  private extractVideoId(url: string): string | null {
    const match = url.match(/(?:v=|\/|youtu\.be\/)([0-9A-Za-z_-]{11})/);
    return match ? (match[1] || null) : null;
  }

  /**
   * Clean up temp directory
   */
  cleanup(): void {
    if (fs.existsSync(this.tempDir)) {
      try {
        fs.rmSync(this.tempDir, { recursive: true, force: true });
        console.log(`[TranscriptionService] Cleaned up temp directory: ${this.tempDir}`);
      } catch (error) {
        console.warn(`[TranscriptionService] Failed to clean up temp directory:`, error);
      }
    }
  }
}