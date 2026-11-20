import { soundEngine } from './SoundEngine';

export type AudioChannel = 'ambient' | 'narration' | 'dialogue' | 'sfx';
export type VoiceFxMode = 'clean' | 'radio1983' | 'infinite_resonance';

export interface SpatialSoundscapeOptions {
  windIntensity: number; // 0..1
  obeliskProximity: number; // 0..1
  stereoPan: number; // -1..1
}

class SpatialSoundscapeEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientDuckGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private narrationGain: GainNode | null = null;
  private dialogueGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  public masterVolume = 0.8;
  public ambientVolume = 0.6;
  public narrationVolume = 0.9;
  public dialogueVolume = 0.9;
  public sfxVolume = 0.8;
  public isMuted = false;

  // Spatial soundscape active nodes (Prototype 8)
  private isSoundscapeActive = false;
  private windSource: AudioBufferSourceNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private windPanner: StereoPannerNode | null = null;
  private windGain: GainNode | null = null;
  private windLfo: OscillatorNode | null = null;

  private obeliskOscA: OscillatorNode | null = null;
  private obeliskOscB: OscillatorNode | null = null;
  private obeliskPanner: StereoPannerNode | null = null;
  private obeliskGain: GainNode | null = null;

  private creakIntervalId: number | null = null;
  private activeVoiceSource: AudioBufferSourceNode | null = null;
  private activeVoiceCleanup: (() => void) | null = null;
  private activeFallbackAudio: HTMLAudioElement | null = null;
  private activeFallbackUrl: string | null = null;
  private gestureListenerAttached = false;
  private currentOptions: SpatialSoundscapeOptions = {
    windIntensity: 0.65,
    obeliskProximity: 0.45,
    stereoPan: 0,
  };

  constructor() {
    this.attachGestureUnlock();
  }

  private attachGestureUnlock(): void {
    if (typeof window === 'undefined' || this.gestureListenerAttached) return;
    this.gestureListenerAttached = true;

    const unlock = () => {
      if (this.ctx && this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      soundEngine.unlockFromUserGesture?.();
    };

    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
  }

  public unlockFromUserGesture(): void {
    const ctx = this.ensureContext();
    if (ctx && ctx.state === 'suspended') {
      void ctx.resume();
    }
    soundEngine.unlockFromUserGesture?.();
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    this.attachGestureUnlock();

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;

      const ctx = new AudioCtx();
      this.ctx = ctx;

      this.masterGain = ctx.createGain();
      this.ambientDuckGain = ctx.createGain();
      this.ambientGain = ctx.createGain();
      this.narrationGain = ctx.createGain();
      this.dialogueGain = ctx.createGain();
      this.sfxGain = ctx.createGain();

      this.ambientGain.connect(this.ambientDuckGain);
      this.ambientDuckGain.connect(this.masterGain);
      this.narrationGain.connect(this.masterGain);
      this.dialogueGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(ctx.destination);

      this.applyVolumes();
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  public getContext(): AudioContext | null {
    return this.ensureContext();
  }

  public setVolumes(volumes: Partial<Record<'master' | AudioChannel, number>>): void {
    if (typeof volumes.master === 'number') this.masterVolume = Math.max(0, Math.min(1, volumes.master));
    if (typeof volumes.ambient === 'number') this.ambientVolume = Math.max(0, Math.min(1, volumes.ambient));
    if (typeof volumes.narration === 'number')
      this.narrationVolume = Math.max(0, Math.min(1, volumes.narration));
    if (typeof volumes.dialogue === 'number') this.dialogueVolume = Math.max(0, Math.min(1, volumes.dialogue));
    if (typeof volumes.sfx === 'number') this.sfxVolume = Math.max(0, Math.min(1, volumes.sfx));
    this.applyVolumes();
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    this.applyVolumes();
  }

  private applyVolumes(): void {
    const effectiveMaster = this.isMuted ? 0 : this.masterVolume;
    if (this.activeFallbackAudio) {
      const chVol =
        this.activeFallbackAudio.dataset.channel === 'narration'
          ? this.narrationVolume
          : this.dialogueVolume;
      this.activeFallbackAudio.volume = Math.max(0, Math.min(1, effectiveMaster * chVol));
    }
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.masterGain?.gain.setTargetAtTime(effectiveMaster, t, 0.06);
    this.ambientGain?.gain.setTargetAtTime(this.ambientVolume, t, 0.08);
    this.narrationGain?.gain.setTargetAtTime(this.narrationVolume, t, 0.05);
    this.dialogueGain?.gain.setTargetAtTime(this.dialogueVolume, t, 0.05);
    this.sfxGain?.gain.setTargetAtTime(this.sfxVolume, t, 0.04);
  }

  public setDucking(active: boolean): void {
    soundEngine.setAmbientDucking(active);
    if (!this.ctx || !this.ambientDuckGain) return;
    const target = active ? 0.28 : 1.0;
    this.ambientDuckGain.gain.setTargetAtTime(target, this.ctx.currentTime, active ? 0.14 : 0.45);
  }

  private createNoiseBuffer(ctx: AudioContext, seconds: number, pink = true): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * seconds);
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    if (!pink) {
      for (let i = 0; i < length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      return buffer;
    }

    let b0 = 0,
      b1 = 0,
      b2 = 0,
      b3 = 0,
      b4 = 0,
      b5 = 0,
      b6 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  // Prototype 8: Spatial Antarctic soundscape (katabatic stereo wind + proximity obelisk hum + ice creaks)
  public startSpatialSoundscape(options?: Partial<SpatialSoundscapeOptions>): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.ambientGain) return;
    if (options) {
      this.currentOptions = { ...this.currentOptions, ...options };
    }
    if (this.isSoundscapeActive) {
      this.updateSpatialSoundscape(this.currentOptions);
      return;
    }

    this.isSoundscapeActive = true;
    const now = ctx.currentTime;

    // 1. Katabatic polar wind with moving stereo sweep
    const windNoise = ctx.createBufferSource();
    windNoise.buffer = this.createNoiseBuffer(ctx, 4, true);
    windNoise.loop = true;

    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.setValueAtTime(340, now);
    windFilter.Q.setValueAtTime(2.6, now);

    const windPanner = ctx.createStereoPanner();
    windPanner.pan.setValueAtTime(this.currentOptions.stereoPan * 0.4, now);

    const windGain = ctx.createGain();
    windGain.gain.setValueAtTime(0.001, now);
    windGain.gain.linearRampToValueAtTime(0.18 * this.currentOptions.windIntensity, now + 1.2);

    const windLfo = ctx.createOscillator();
    windLfo.type = 'sine';
    windLfo.frequency.setValueAtTime(0.11, now);
    const lfoPanDepth = ctx.createGain();
    lfoPanDepth.gain.setValueAtTime(0.55, now);
    const lfoFreqDepth = ctx.createGain();
    lfoFreqDepth.gain.setValueAtTime(140, now);

    windLfo.connect(lfoPanDepth);
    lfoPanDepth.connect(windPanner.pan);
    windLfo.connect(lfoFreqDepth);
    lfoFreqDepth.connect(windFilter.frequency);

    windNoise.connect(windFilter);
    windFilter.connect(windPanner);
    windPanner.connect(windGain);
    windGain.connect(this.ambientGain);

    windNoise.start(now);
    windLfo.start(now);

    this.windSource = windNoise;
    this.windFilter = windFilter;
    this.windPanner = windPanner;
    this.windGain = windGain;
    this.windLfo = windLfo;

    // 2. Proximity-attenuated Δ-T1 Obelisk sub-harmonic hum (54 Hz + 108.5 Hz)
    const oscA = ctx.createOscillator();
    oscA.type = 'sine';
    oscA.frequency.setValueAtTime(54, now);

    const oscB = ctx.createOscillator();
    oscB.type = 'triangle';
    oscB.frequency.setValueAtTime(108.5, now);

    const obeliskLowpass = ctx.createBiquadFilter();
    obeliskLowpass.type = 'lowpass';
    obeliskLowpass.frequency.setValueAtTime(220, now);

    const obeliskPanner = ctx.createStereoPanner();
    obeliskPanner.pan.setValueAtTime(this.currentOptions.stereoPan, now);

    const obeliskGain = ctx.createGain();
    obeliskGain.gain.setValueAtTime(0.001, now);
    obeliskGain.gain.linearRampToValueAtTime(0.16 * this.currentOptions.obeliskProximity, now + 1.0);

    oscA.connect(obeliskLowpass);
    oscB.connect(obeliskLowpass);
    obeliskLowpass.connect(obeliskPanner);
    obeliskPanner.connect(obeliskGain);
    obeliskGain.connect(this.ambientGain);

    oscA.start(now);
    oscB.start(now);

    this.obeliskOscA = oscA;
    this.obeliskOscB = oscB;
    this.obeliskPanner = obeliskPanner;
    this.obeliskGain = obeliskGain;

    // 3. Occasional distant ice shelf stress creak in random stereo azimuth
    this.creakIntervalId = window.setInterval(() => {
      if (!this.isSoundscapeActive || !this.ctx || !this.ambientGain) return;
      if (Math.random() > 0.65) {
        this.triggerDistantIceCreak((Math.random() * 2 - 1) * 0.85);
      }
    }, 3600);
  }

  public updateSpatialSoundscape(options: Partial<SpatialSoundscapeOptions>): void {
    this.currentOptions = { ...this.currentOptions, ...options };
    if (!this.ctx || !this.isSoundscapeActive) return;
    const t = this.ctx.currentTime;

    if (this.windGain) {
      this.windGain.gain.setTargetAtTime(0.24 * this.currentOptions.windIntensity, t, 0.15);
    }
    if (this.windFilter) {
      this.windFilter.frequency.setTargetAtTime(240 + this.currentOptions.windIntensity * 320, t, 0.2);
    }
    if (this.obeliskGain) {
      this.obeliskGain.gain.setTargetAtTime(0.2 * this.currentOptions.obeliskProximity, t, 0.12);
    }
    if (this.obeliskPanner) {
      this.obeliskPanner.pan.setTargetAtTime(
        Math.max(-1, Math.min(1, this.currentOptions.stereoPan)),
        t,
        0.1
      );
    }
  }

  public stopSpatialSoundscape(): void {
    this.isSoundscapeActive = false;
    if (this.creakIntervalId !== null) {
      window.clearInterval(this.creakIntervalId);
      this.creakIntervalId = null;
    }
    try {
      this.windSource?.stop();
      this.windLfo?.stop();
      this.obeliskOscA?.stop();
      this.obeliskOscB?.stop();
    } catch {
      // ignore stopped nodes
    }
    this.windSource?.disconnect();
    this.windFilter?.disconnect();
    this.windPanner?.disconnect();
    this.windGain?.disconnect();
    this.windLfo?.disconnect();
    this.obeliskOscA?.disconnect();
    this.obeliskOscB?.disconnect();
    this.obeliskPanner?.disconnect();
    this.obeliskGain?.disconnect();

    this.windSource = null;
    this.windLfo = null;
    this.obeliskOscA = null;
    this.obeliskOscB = null;
  }

  public triggerDistantIceCreak(pan = -0.6): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.ambientGain) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(118 + Math.random() * 45, now);
    osc.frequency.exponentialRampToValueAtTime(52, now + 0.95);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(290, now);
    filter.Q.setValueAtTime(6.5, now);

    const panner = ctx.createStereoPanner();
    panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.15);

    osc.connect(filter);
    filter.connect(panner);
    panner.connect(gain);
    gain.connect(this.ambientGain);

    osc.start(now);
    osc.stop(now + 1.2);
  }

  // Prototype 4, 5, 6: Play AI-generated WAV AudioBuffer through character-specific Web Audio FX
  public async playDecodedVoiceBuffer(
    wavArrayBuffer: ArrayBuffer,
    channel: 'narration' | 'dialogue',
    fxMode: VoiceFxMode,
    onEnded?: () => void,
    mimeType = 'audio/wav'
  ): Promise<number> {
    this.stopActiveVoice();

    const ctx = this.ensureContext();
    if (ctx && ctx.state === 'suspended') {
      try {
        await Promise.race([
          ctx.resume(),
          new Promise((resolve) => window.setTimeout(resolve, 350)),
        ]);
      } catch {
        // Fallback to HTML5 Audio below if AudioContext stays suspended
      }
    }

    const targetBus = channel === 'narration' ? this.narrationGain : this.dialogueGain;
    if (ctx && targetBus && ctx.state === 'running') {
      try {
        const decoded = await ctx.decodeAudioData(wavArrayBuffer.slice(0));
        const source = ctx.createBufferSource();
        source.buffer = decoded;

        const cleanupNodes: AudioNode[] = [source];
        let radioStaticSource: AudioBufferSourceNode | null = null;
        let driftLfo: OscillatorNode | null = null;

        this.setDucking(true);

        if (fxMode === 'radio1983') {
          // 1983 shortwave radio profile: trimmed lows & crisp presence peak so Hungarian speech stays clear
          const hp = ctx.createBiquadFilter();
          hp.type = 'highpass';
          hp.frequency.value = 260;

          const lp = ctx.createBiquadFilter();
          lp.type = 'lowpass';
          lp.frequency.value = 3600;

          const presenceEq = ctx.createBiquadFilter();
          presenceEq.type = 'peaking';
          presenceEq.frequency.value = 1650;
          presenceEq.Q.value = 0.9;
          presenceEq.gain.value = 4.5;

          const shaper = ctx.createWaveShaper();
          const samples = 256;
          const curve = new Float32Array(new ArrayBuffer(samples * 4));
          const k = 4;
          for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] = ((3 + k) * x * 20 * (Math.PI / 180)) / (Math.PI + k * Math.abs(x));
          }
          shaper.curve = curve;

          const makeupGain = ctx.createGain();
          makeupGain.gain.value = 1.22;

          const panner = ctx.createStereoPanner();
          driftLfo = ctx.createOscillator();
          driftLfo.frequency.value = 0.22;
          const driftDepth = ctx.createGain();
          driftDepth.gain.value = 0.22;
          driftLfo.connect(driftDepth);
          driftDepth.connect(panner.pan);
          driftLfo.start();

          source.connect(hp);
          hp.connect(lp);
          lp.connect(presenceEq);
          presenceEq.connect(shaper);
          shaper.connect(makeupGain);
          makeupGain.connect(panner);
          panner.connect(targetBus);

          // Faint 1983 carrier hiss beneath Lena's transmission
          radioStaticSource = ctx.createBufferSource();
          radioStaticSource.buffer = this.createNoiseBuffer(ctx, 2, false);
          radioStaticSource.loop = true;
          const hissFilter = ctx.createBiquadFilter();
          hissFilter.type = 'bandpass';
          hissFilter.frequency.value = 2400;
          hissFilter.Q.value = 1.4;
          const hissGain = ctx.createGain();
          hissGain.gain.value = 0.018;
          radioStaticSource.connect(hissFilter);
          hissFilter.connect(hissGain);
          hissGain.connect(panner);
          radioStaticSource.start();

          cleanupNodes.push(
            hp,
            lp,
            presenceEq,
            shaper,
            makeupGain,
            panner,
            driftDepth,
            hissFilter,
            hissGain
          );
        } else if (fxMode === 'infinite_resonance') {
          // Ethereal dual-delay + subtle shimmer cathedral tail for The Infinite
          const dryGain = ctx.createGain();
          dryGain.gain.value = 0.94;
          source.connect(dryGain);
          dryGain.connect(targetBus);

          const delayL = ctx.createDelay(1.0);
          delayL.delayTime.value = 0.24;
          const delayR = ctx.createDelay(1.0);
          delayR.delayTime.value = 0.37;

          const fbL = ctx.createGain();
          fbL.gain.value = 0.38;
          const fbR = ctx.createGain();
          fbR.gain.value = 0.34;

          const wetFilter = ctx.createBiquadFilter();
          wetFilter.type = 'lowpass';
          wetFilter.frequency.value = 1850;

          const wetPanL = ctx.createStereoPanner();
          wetPanL.pan.value = -0.6;
          const wetPanR = ctx.createStereoPanner();
          wetPanR.pan.value = 0.6;

          const wetGain = ctx.createGain();
          wetGain.gain.value = 0.4;

          source.connect(wetFilter);
          wetFilter.connect(delayL);
          wetFilter.connect(delayR);

          delayL.connect(fbL);
          fbL.connect(delayR);
          delayR.connect(fbR);
          fbR.connect(delayL);

          delayL.connect(wetPanL);
          delayR.connect(wetPanR);
          wetPanL.connect(wetGain);
          wetPanR.connect(wetGain);
          wetGain.connect(targetBus);

          cleanupNodes.push(
            dryGain,
            delayL,
            delayR,
            fbL,
            fbR,
            wetFilter,
            wetPanL,
            wetPanR,
            wetGain
          );
        } else {
          // Clean intimate narrator / character warmth
          const warmShelf = ctx.createBiquadFilter();
          warmShelf.type = 'lowshelf';
          warmShelf.frequency.value = 180;
          warmShelf.gain.value = 2.0;
          source.connect(warmShelf);
          warmShelf.connect(targetBus);
          cleanupNodes.push(warmShelf);
        }

        const cleanup = () => {
          this.setDucking(false);
          try {
            radioStaticSource?.stop();
            driftLfo?.stop();
          } catch {
            // already stopped
          }
          cleanupNodes.forEach((n) => {
            try {
              n.disconnect();
            } catch {
              // ignore
            }
          });
        };

        this.activeVoiceSource = source;
        this.activeVoiceCleanup = cleanup;

        source.onended = () => {
          if (this.activeVoiceSource === source) {
            this.activeVoiceSource = null;
            this.activeVoiceCleanup = null;
          }
          cleanup();
          onEnded?.();
        };

        source.start(0);
        return decoded.duration;
      } catch (err) {
        this.setDucking(false);
        console.warn('[SpatialSoundscapeEngine] Web Audio decode/play fallback triggered:', err);
      }
    }

    // HTML5 <audio> fallback for mobile/suspended AudioContext edge cases
    return this.playViaHtmlAudioFallback(wavArrayBuffer, mimeType, channel, onEnded);
  }

  private async playViaHtmlAudioFallback(
    wavArrayBuffer: ArrayBuffer,
    mimeType: string,
    channel: 'narration' | 'dialogue',
    onEnded?: () => void
  ): Promise<number> {
    if (typeof Audio === 'undefined' || typeof URL === 'undefined') {
      throw new Error('A böngésző nem támogatja a hanglejátszást.');
    }

    const blob = new Blob([wavArrayBuffer], { type: mimeType || 'audio/wav' });
    const objectUrl = URL.createObjectURL(blob);
    const audio = new Audio(objectUrl);
    audio.dataset.channel = channel;

    const effectiveMaster = this.isMuted ? 0 : this.masterVolume;
    const chVol = channel === 'narration' ? this.narrationVolume : this.dialogueVolume;
    audio.volume = Math.max(0, Math.min(1, effectiveMaster * chVol));

    this.activeFallbackAudio = audio;
    this.activeFallbackUrl = objectUrl;
    this.setDucking(true);

    const cleanup = () => {
      this.setDucking(false);
      if (this.activeFallbackAudio === audio) {
        this.activeFallbackAudio = null;
      }
      if (this.activeFallbackUrl === objectUrl) {
        URL.revokeObjectURL(objectUrl);
        this.activeFallbackUrl = null;
      }
    };

    audio.onended = () => {
      cleanup();
      onEnded?.();
    };
    audio.onerror = () => {
      cleanup();
      onEnded?.();
    };

    try {
      await audio.play();
      const duration =
        Number.isFinite(audio.duration) && audio.duration > 0
          ? audio.duration
          : Math.max(2, wavArrayBuffer.byteLength / 48000);
      return duration;
    } catch (err) {
      cleanup();
      const name = err instanceof Error ? err.name : '';
      if (name === 'NotAllowedError') {
        throw new Error(
          'A böngésző hangengedélyre vár. Kattints újra a Felolvasás gombra a hang indításához.'
        );
      }
      throw new Error(
        `A hanglejátszás nem indult el (${err instanceof Error ? err.message : 'ismeretlen hiba'}).`
      );
    }
  }

  public stopActiveVoice(): void {
    if (this.activeVoiceSource) {
      try {
        this.activeVoiceSource.onended = null;
        this.activeVoiceSource.stop();
      } catch {
        // ignore
      }
      this.activeVoiceSource = null;
    }
    if (this.activeVoiceCleanup) {
      this.activeVoiceCleanup();
      this.activeVoiceCleanup = null;
    }
    if (this.activeFallbackAudio) {
      try {
        this.activeFallbackAudio.onended = null;
        this.activeFallbackAudio.onerror = null;
        this.activeFallbackAudio.pause();
        this.activeFallbackAudio.currentTime = 0;
      } catch {
        // ignore
      }
      this.activeFallbackAudio = null;
    }
    if (this.activeFallbackUrl) {
      try {
        URL.revokeObjectURL(this.activeFallbackUrl);
      } catch {
        // ignore
      }
      this.activeFallbackUrl = null;
    }
    this.setDucking(false);
  }

  // Prototype 7: Tactile Procedural Interaction SFX
  public playPaperRustle(pan = 0): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;
    const now = ctx.currentTime;

    const src = ctx.createBufferSource();
    src.buffer = this.createNoiseBuffer(ctx, 0.24, false);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1950, now);
    filter.frequency.exponentialRampToValueAtTime(3400, now + 0.14);
    filter.Q.setValueAtTime(1.8, now);

    const panner = ctx.createStereoPanner();
    panner.pan.setValueAtTime(pan, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.24, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.04, now + 0.1);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.13);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    src.connect(filter);
    filter.connect(panner);
    panner.connect(gain);
    gain.connect(this.sfxGain);

    src.start(now);
    src.stop(now + 0.23);
  }

  public playCrtSwitchClick(pan = 0): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;
    const now = ctx.currentTime;

    // Mechanical relay snap
    const snapOsc = ctx.createOscillator();
    snapOsc.type = 'square';
    snapOsc.frequency.setValueAtTime(1400, now);
    snapOsc.frequency.exponentialRampToValueAtTime(180, now + 0.035);

    const snapGain = ctx.createGain();
    snapGain.gain.setValueAtTime(0.22, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    // Cathode high-voltage micro-chirp
    const cathodeOsc = ctx.createOscillator();
    cathodeOsc.type = 'sine';
    cathodeOsc.frequency.setValueAtTime(4200, now + 0.03);
    cathodeOsc.frequency.exponentialRampToValueAtTime(9800, now + 0.18);

    const cathodeGain = ctx.createGain();
    cathodeGain.gain.setValueAtTime(0.001, now + 0.03);
    cathodeGain.gain.linearRampToValueAtTime(0.05, now + 0.06);
    cathodeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    const panner = ctx.createStereoPanner();
    panner.pan.setValueAtTime(pan, now);

    snapOsc.connect(snapGain);
    snapGain.connect(panner);
    cathodeOsc.connect(cathodeGain);
    cathodeGain.connect(panner);
    panner.connect(this.sfxGain);

    snapOsc.start(now);
    snapOsc.stop(now + 0.05);
    cathodeOsc.start(now + 0.03);
    cathodeOsc.stop(now + 0.23);
  }

  public playIceFracture(pan = 0): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;
    const now = ctx.currentTime;

    // Subglacial thud
    const subOsc = ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(115, now);
    subOsc.frequency.exponentialRampToValueAtTime(34, now + 0.35);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.32, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    // Crystalline ice crackle
    const noise = ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(ctx, 0.35, false);

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(2400, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.28, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    const panner = ctx.createStereoPanner();
    panner.pan.setValueAtTime(pan, now);

    subOsc.connect(subGain);
    subGain.connect(panner);
    noise.connect(hp);
    hp.connect(noiseGain);
    noiseGain.connect(panner);
    panner.connect(this.sfxGain);

    subOsc.start(now);
    subOsc.stop(now + 0.4);
    noise.start(now);
    noise.stop(now + 0.32);
  }

  public playCrystalChime(baseHz = 528, pan = 0): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;
    const now = ctx.currentTime;

    const ratios = [1, 1.5, 2.02];
    const panner = ctx.createStereoPanner();
    panner.pan.setValueAtTime(pan, now);
    panner.connect(this.sfxGain);

    ratios.forEach((ratio, idx) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseHz * ratio, now);

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.11 / (idx + 1), now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 1.35 - idx * 0.2);

      osc.connect(g);
      g.connect(panner);
      osc.start(now);
      osc.stop(now + 1.4);
    });
  }
}

export const spatialSoundscapeEngine = new SpatialSoundscapeEngine();
