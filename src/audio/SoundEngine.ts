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
}

export const soundEngine = new SoundEngine();
