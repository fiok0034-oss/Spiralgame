/**
 * Központi funkciókapcsoló a Gemini AI magyar hangfelolvasás (TTS) ideiglenes elrejtéséhez.
 * A teljes TTS háttérrendszer (server/ttsCore.ts, netlify/functions/audio-tts.ts,
 * src/audio/aiVoiceService.ts, SpatialSoundscapeEngine.ts, voicePersonaMapper.ts,
 * cache és felirat-időzítés) változatlanul megmarad.
 *
 * Visszakapcsoláshoz állítsd `true` értékre.
 */
export const TTS_ENABLED = false;
