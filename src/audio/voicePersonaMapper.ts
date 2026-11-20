import { AiVoicePersona } from './aiVoiceService';
import { AudioChannel, VoiceFxMode } from './SpatialSoundscapeEngine';

export interface SceneVoiceMapping {
  persona: AiVoicePersona;
  channel: Extract<AudioChannel, 'narration' | 'dialogue'>;
  fxMode: VoiceFxMode;
  speakerLabel: string;
}

export function resolveSceneVoiceMapping(
  sceneId: string,
  speaker: string
): SceneVoiceMapping {
  const s = speaker.toLowerCase();

  if (s.includes('végtelen') || s.includes('infinite') || s.includes('kamra')) {
    return {
      persona: 'infinite',
      channel: 'dialogue',
      fxMode: 'infinite_resonance',
      speakerLabel: speaker.toUpperCase(),
    };
  }

  if (s.includes('lena')) {
    const isRadio = sceneId.startsWith('l1_') || s.includes('rádió') || s.includes('szalag');
    return {
      persona: 'lena',
      channel: 'dialogue',
      fxMode: isRadio ? 'radio1983' : 'clean',
      speakerLabel: speaker.toUpperCase(),
    };
  }

  if (s.includes('viktor')) {
    return {
      persona: 'viktor',
      channel: 'dialogue',
      fxMode: 'clean',
      speakerLabel: speaker.toUpperCase(),
    };
  }

  if (s.includes('mira')) {
    return {
      persona: 'mira',
      channel: 'dialogue',
      fxMode: 'clean',
      speakerLabel: speaker.toUpperCase(),
    };
  }

  if (s.includes('levente')) {
    return {
      persona: 'levente',
      channel: 'dialogue',
      fxMode: 'clean',
      speakerLabel: speaker.toUpperCase(),
    };
  }

  return {
    persona: 'narrator',
    channel: 'narration',
    fxMode: 'clean',
    speakerLabel: speaker.toUpperCase(),
  };
}
