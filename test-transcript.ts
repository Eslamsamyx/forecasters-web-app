// Test transcript service
import { TranscriptionService } from './src/server/services/transcription';

async function test() {
  const service = new TranscriptionService();

  // Test with a short video
  const videoUrl = 'https://youtube.com/watch?v=YQHsXMglC9A';

  console.log('Testing transcript extraction for:', videoUrl);

  try {
    const result = await service.getTranscriptForVideo(videoUrl);
    console.log('\n=== RESULT ===');
    console.log('Source:', result.source);
    console.log('Provenance:', result.provenance);
    console.log('Transcript length:', result.transcript.length);
    console.log('First 200 chars:', result.transcript.substring(0, 200));
  } catch (error) {
    console.error('ERROR:', error);
  }
}

test();