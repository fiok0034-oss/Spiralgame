/**
 * Procedural Web Audio Engine for "A Spirál Lehelete"
 * Provides synthetic ambient soundscapes, Ice Breath pulse ("Jéglégzés"),
 * radio static, morse tones, and reality distortion stingers.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  
  // Drone oscillators
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private isDroneActive = false;

  // Radio static nodes
  private staticSource: AudioBufferSourceNode | null = null;
  private staticFilter: BiquadFilterNode | null = null;
  private staticGain: GainNode | null = null;

  // Ice breath pulse interval
  private iceBreathTimer: number | null = null;
  private isIceBreathActive = false;

  public isMuted = false;
  public masterVolume = 0.7;
  public ambientVolume = 0.5;
  public sfxVolume = 0.8;

  constructor() {
    // AudioContext will be lazily created on first user gesture
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.ambientGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
      this.ambientGain.gain.setValueAtTime(this.ambientVolume, this.ctx.currentTime);
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);

      this.ambientGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : this.masterVolume, this.ctx.currentTime, 0.05);
    }
  }

  public setVolumes(master: number, ambient: number, sfx: number) {
    this.masterVolume = master;
    this.ambientVolume = ambient;
    this.sfxVolume = sfx;
    if (this.ctx && this.masterGain && this.ambientGain && this.sfxGain) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : master, this.ctx.currentTime, 0.05);
      this.ambientGain.gain.setTargetAtTime(ambient, this.ctx.currentTime, 0.05);
      this.sfxGain.gain.setTargetAtTime(sfx, this.ctx.currentTime, 0.05);
    }
  }

  /**
   * Cold Antarctic ambient sub-bass drone
   */
  public startAmbientDrone() {
    this.initContext();
    if (!this.ctx || !this.ambientGain || this.isDroneActive) return;

    try {
      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc2 = this.ctx.createOscillator();
      this.droneFilter = this.ctx.createBiquadFilter();

      this.droneOsc1.type = 'sine';
      this.droneOsc1.frequency.setValueAtTime(54, this.ctx.currentTime); // 54Hz sub

      this.droneOsc2.type = 'triangle';
      this.droneOsc2.frequency.setValueAtTime(108.5, this.ctx.currentTime); // harmonic with slight detune

      this.droneFilter.type = 'lowpass';
      this.droneFilter.frequency.setValueAtTime(160, this.ctx.currentTime);
      this.droneFilter.Q.setValueAtTime(2, this.ctx.currentTime);

      const droneGain = this.ctx.createGain();
      droneGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      droneGain.gain.exponentialRampToValueAtTime(0.4, this.ctx.currentTime + 3);

      this.droneOsc1.connect(this.droneFilter);
      this.droneOsc2.connect(this.droneFilter);
      this.droneFilter.connect(droneGain);
      droneGain.connect(this.ambientGain);

      this.droneOsc1.start();
      this.droneOsc2.start();
      this.isDroneActive = true;
    } catch {
      // Audio autoplay policy fallback
    }
  }

  public stopAmbientDrone() {
    if (this.droneOsc1 && this.droneOsc2) {
      try {
        this.droneOsc1.stop();
        this.droneOsc2.stop();
        this.droneOsc1.disconnect();
        this.droneOsc2.disconnect();
      } catch {
        // Safe disconnect
      }
      this.isDroneActive = false;
    }
  }

  /**
   * "JÉGLÉGZÉS" (Ice Breath Pulse):
   * Deep dual-heartbeat pulse that rises and exhales gently:
   * dobbanás -> szünet -> dobbanás.
   */
  public playIceBreath() {
    this.initContext();
    if (!this.ctx || !this.ambientGain) return;

    const t = this.ctx.currentTime;
    
    // First beat: deep sub-thump
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(75, t);
    osc1.frequency.exponentialRampToValueAtTime(32, t + 0.35);

    gain1.gain.setValueAtTime(0.001, t);
    gain1.gain.linearRampToValueAtTime(0.6, t + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);

    osc1.connect(gain1);
    gain1.connect(this.ambientGain);
    osc1.start(t);
    osc1.stop(t + 0.5);

    // Second beat: echo heartbeat
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    const t2 = t + 0.28;
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(65, t2);
    osc2.frequency.exponentialRampToValueAtTime(28, t2 + 0.3);

    gain2.gain.setValueAtTime(0.001, t2);
    gain2.gain.linearRampToValueAtTime(0.4, t2 + 0.04);
    gain2.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.4);

    osc2.connect(gain2);
    gain2.connect(this.ambientGain);
    osc2.start(t2);
    osc2.stop(t2 + 0.45);

    // Filtered breath hiss exhale
    this.playFilteredHiss(t + 0.4, 0.9);
  }

  private playFilteredHiss(startTime: number, duration: number) {
    if (!this.ctx || !this.ambientGain) return;

    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(350, startTime);
    filter.frequency.linearRampToValueAtTime(180, startTime + duration);
    filter.Q.setValueAtTime(4.0, startTime);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.12, startTime + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ambientGain);

    noise.start(startTime);
    noise.stop(startTime + duration);
  }

  /**
   * Start recurring background ice breathing
   */
  public startIceBreathing(intervalMs = 8000) {
    if (this.isIceBreathActive) return;
    this.isIceBreathActive = true;
    this.playIceBreath();
    this.iceBreathTimer = window.setInterval(() => {
      this.playIceBreath();
    }, intervalMs);
  }

  public stopIceBreathing() {
    this.isIceBreathActive = false;
    if (this.iceBreathTimer !== null) {
      clearInterval(this.iceBreathTimer);
      this.iceBreathTimer = null;
    }
  }

  /**
   * Procedural Radio Static generator
   */
  public startRadioStatic(tuneTuning = 0.5) {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    this.stopRadioStatic();

    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    this.staticSource = this.ctx.createBufferSource();
    this.staticSource.buffer = buffer;
    this.staticSource.loop = true;

    this.staticFilter = this.ctx.createBiquadFilter();
    this.staticFilter.type = 'bandpass';
    // Frequency shifts depending on tuning
    const centerFreq = 500 + tuneTuning * 3000;
    this.staticFilter.frequency.setValueAtTime(centerFreq, this.ctx.currentTime);
    this.staticFilter.Q.setValueAtTime(3.5, this.ctx.currentTime);

    this.staticGain = this.ctx.createGain();
    this.staticGain.gain.setValueAtTime(0.15, this.ctx.currentTime);

    this.staticSource.connect(this.staticFilter);
    this.staticFilter.connect(this.staticGain);
    this.staticGain.connect(this.sfxGain);

    this.staticSource.start();
  }

  public updateRadioTuning(tuningRatio: number) {
    if (this.staticFilter && this.ctx) {
      const centerFreq = 400 + tuningRatio * 3200;
      this.staticFilter.frequency.setTargetAtTime(centerFreq, this.ctx.currentTime, 0.05);
    }
  }

  public stopRadioStatic() {
    if (this.staticSource) {
      try {
        this.staticSource.stop();
        this.staticSource.disconnect();
      } catch {
        // safe cleanup
      }
      this.staticSource = null;
    }
  }

  /**
   * Morse code beeps for radio coordinates (e.g., Δ-82)
   */
  public playMorseBeep(isDash = false) {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const duration = isDash ? 0.18 : 0.06;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.01);
    gain.gain.setValueAtTime(0.18, t + duration - 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + duration);
  }

  /**
   * Reality fracture distortion sting
   */
  public playRealityFracture() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(55, t + 0.6);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, t);
    filter.frequency.exponentialRampToValueAtTime(120, t + 0.6);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.65);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.7);
  }

  /**
   * Resonant crystal chime for obelisk and ancient guardian symbols
   */
  public playCrystalResonance(freq = 528) {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 2.5);
  }

  /**
   * UI Click tone
   */
  public playUiClick() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(920, t);
    osc.frequency.exponentialRampToValueAtTime(460, t + 0.05);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.06);
  }

  /**
   * UI Discovery stinger for new memory or relic
   */
  public playDiscovery() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const freqs = [330, 440, 660];
    freqs.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.15, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 1.3);
    });
  }

  /**
   * Georadar ping sound
   */
  public playRadarPing(proximity = 0.5) {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Pitch rises as anomaly is closer
    const pitch = 300 + proximity * 700;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, t);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  /**
   * Spatial pointer-driven GeoRadarScanner pulse with stereo panning and strength harmonic
   */
  public playScannerPulse(strength = 0.5, pan = 0) {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const clampedStrength = Math.max(0, Math.min(1, strength));
    const clampedPan = Math.max(-1, Math.min(1, pan));

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Base frequency climbs sharply as signal strength approaches 1.0
    const baseFreq = 220 + clampedStrength * 880;
    osc.type = clampedStrength > 0.75 ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * (1 + clampedStrength * 0.12), t + 0.09);

    const peakGain = 0.04 + clampedStrength * 0.18;
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(peakGain, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);

    // Optional harmonic overtone when signal is strong
    if (clampedStrength > 0.65) {
      const overtone = this.ctx.createOscillator();
      const overGain = this.ctx.createGain();
      overtone.type = 'sine';
      overtone.frequency.setValueAtTime(baseFreq * 1.5, t);
      overGain.gain.setValueAtTime(0.001, t);
      overGain.gain.linearRampToValueAtTime(peakGain * 0.4, t + 0.015);
      overGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      overtone.connect(overGain);
      overGain.connect(this.sfxGain);
      overtone.start(t);
      overtone.stop(t + 0.18);
    }

    if (typeof this.ctx.createStereoPanner === 'function') {
      const panner = this.ctx.createStereoPanner();
      panner.pan.setValueAtTime(clampedPan, t);
      osc.connect(gain);
      gain.connect(panner);
      panner.connect(this.sfxGain);
    } else {
      osc.connect(gain);
      gain.connect(this.sfxGain);
    }

    osc.start(t);
    osc.stop(t + 0.15);
  }

  /**
   * Tactile mechanical tick for rotating/disassembling artifacts and puzzle rings
   */
  public playMechanicalTick(pitchOffset = 0) {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520 + pitchOffset * 45, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.04);

    gain.gain.setValueAtTime(0.11, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  /**
   * Ability activation / synergy resonance sweep
   */
  public playAbilityActivate(tier = 1) {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const freqs = tier >= 3 ? [264, 396, 528, 792] : tier === 2 ? [330, 495, 660] : [432, 648];
    freqs.forEach((f, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime + idx * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);
      osc.frequency.exponentialRampToValueAtTime(f * 1.02, t + 0.5);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.14, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.75);
    });
  }

  /**
   * Harmonic chord for puzzle completion & crystal tuning
   */
  public playHarmonicChord(freqs: number[] = [256, 320, 384, 512]) {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    freqs.forEach((f) => {
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.11, t + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 1.9);
    });
  }

  /**
   * Timeline / Reality Editor shift sound
   */
  public playTimelineShift() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(560, t + 0.35);
    osc.frequency.exponentialRampToValueAtTime(210, t + 0.75);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.22, t + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.85);
  }

  /**
   * Tailored subtle multi-tone soundscape per Guardian Realm (#1..#9)
   */
  public playRealmSoundscape(guardianId: number) {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const chords: Record<number, { freqs: number[]; wave: OscillatorType; duration: number }> = {
      1: { freqs: [216, 432, 648], wave: 'sine', duration: 2.1 }, // Kassarah Ocean
      2: { freqs: [142, 285, 427], wave: 'triangle', duration: 2.0 }, // Ir-Haya Desert
      3: { freqs: [264, 396, 528], wave: 'triangle', duration: 1.8 }, // Thal-Muren Time
      4: { freqs: [277, 417, 625], wave: 'sine', duration: 2.0 }, // Az-Zahir Mirrors
      5: { freqs: [264, 432, 528], wave: 'sine', duration: 2.4 }, // Nok-Tura Cathedral
      6: { freqs: [174, 348, 522], wave: 'sine', duration: 1.7 }, // Var-Elis Soul Machine (58 BPM aura)
      7: { freqs: [370, 555, 741], wave: 'sine', duration: 2.2 }, // Kor-Vatha Inverted Sky
      8: { freqs: [256, 384, 528], wave: 'sine', duration: 2.3 }, // Sen-Maria Silent Garden
      9: { freqs: [216, 324, 528, 741], wave: 'sine', duration: 2.6 }, // The Ninth Threshold
    };

    const profile = chords[guardianId] || chords[1];
    profile.freqs.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime + idx * 0.09;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = profile.wave;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.09, t + 0.14);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + profile.duration);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + profile.duration + 0.05);
    });
  }

  /**
   * Subtle eerie anomaly sound for A Spirál Rejtett Megfigyelője clues
   */
  public playObserverAnomaly() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const low = this.ctx.createOscillator();
    const high = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    low.type = 'sine';
    low.frequency.setValueAtTime(111, t);
    low.frequency.linearRampToValueAtTime(98, t + 1.1);

    high.type = 'sine';
    high.frequency.setValueAtTime(888, t);
    high.frequency.linearRampToValueAtTime(884, t + 1.1);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.09, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

    low.connect(gain);
    high.connect(gain);
    gain.connect(this.sfxGain);

    low.start(t);
    high.start(t);
    low.stop(t + 1.25);
    high.stop(t + 1.25);
  }

  /**
   * Descending hush into near-silence for Stage 1 of the Chamber Beyond the Ninth
   */
  public playSilenceDrop() {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(52, t + 1.4);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.16, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 1.55);
  }

  /**
   * Secret voice-frequency chime for individual Echo Core hidden audio messages
   */
  public playEchoSecretTone(freqHz = 432) {
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    [freqHz, freqHz * 1.5].forEach((f, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(f, t + idx * 0.14);
      gain.gain.setValueAtTime(0.001, t + idx * 0.14);
      gain.gain.linearRampToValueAtTime(idx === 0 ? 0.14 : 0.06, t + idx * 0.14 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.14 + 1.6);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + idx * 0.14);
      osc.stop(t + idx * 0.14 + 1.7);
    });
  }

  /**
   * Final Guardian Council chord reflecting ally solidarity
   */
  public playCouncilResonance(alliesCount: number) {
    const base = alliesCount >= 6 ? [216, 324, 432, 528, 648] : alliesCount >= 3 ? [216, 324, 432] : [196, 261.6, 311.1];
    this.playHarmonicChord(base);
  }
}

export const soundEngine = new SoundEngine();



