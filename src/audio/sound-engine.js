// Module 3: Zero-Asset WebAudio Procedural Synthesizer, Coquille/Piste Acoustic Physics, French-Electro BGM & Trilingual Referee TTS

class RefereeVoiceEngine {
  constructor() {
    this.enabled = true;
    this.synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
    this.voices = [];
    if (this.synth) {
      const loadVoices = () => { this.voices = this.synth.getVoices() || []; };
      loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = loadVoices;
      }
    }
  }

  warmup() {
    if (this.synth && this.voices.length === 0) {
      this.voices = this.synth.getVoices() || [];
    }
  }

  speakLangText(text, langCode = 'fr-FR', rate = 1.05) {
    if (!this.enabled) return;
    sound.playRefereeVocalFormant();
    if (!this.synth) return;
    try {
      this.synth.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = langCode;
      utter.rate = rate;
      utter.pitch = 0.96;
      utter.volume = 0.90;
      if (this.voices.length === 0) this.voices = this.synth.getVoices() || [];
      const prefix = langCode.slice(0, 2).toLowerCase();
      const matched = this.voices.find(v => v.lang && v.lang.toLowerCase().startsWith(prefix));
      if (matched) utter.voice = matched;
      this.synth.speak(utter);
    } catch (_) {}
  }

  speakCue(cueKey, customText = null) {
    if (!this.enabled) return;
    const cuePhrases = {
      engarde: 'En garde !',
      prets: 'Prêts ?',
      allez: 'Allez !',
      parade: 'Parade !',
      remise: 'Halte ! Remise touchée !',
      touch_player: 'Halte ! Touché, point à gauche !',
      riposte_player: 'Halte ! Parade-riposte, point à gauche !',
      touch_ai: 'Halte ! Attaque touchée, point à droite !',
      coup_double: 'Halte ! Coup double, un point partout !',
      simultaneous: 'Halte ! Actions simultanées, pas de touche !',
      offtarget: 'Halte ! Non valable, hors cible !',
      sortie: 'Halte ! Sortie de piste !',
      corps_jaune: 'Halte ! Corps-à-corps, carton jaune !',
      corps_rouge: 'Halte ! Corps-à-corps, carton rouge, point !',
      bravo: 'Très bien ! Excellent !',
      victory: 'Halte ! Fin de l\'assaut, victoire !'
    };
    const phrase = customText || cuePhrases[cueKey] || 'Allez !';
    this.speakLangText(phrase, 'fr-FR', 1.12);
  }
}

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.bgmEnabled = true;
    this._nextBeatTime = 0;
    this._beatStep = 0;
    this._lastScrapeTime = 0;
  }

  init() {
    if (typeof navigator !== 'undefined' && navigator.userActivation && !navigator.userActivation.hasBeenActive) {
      return;
    }
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playRefereeVocalFormant() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filt = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(142, now);
    osc.frequency.exponentialRampToValueAtTime(118, now + 0.11);
    filt.type = 'bandpass';
    filt.frequency.value = 680;
    filt.Q.value = 4.5;
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(filt);
    filt.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  playClang(baseFreq = 1040, intensity = 1.0, isPerfect = false) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const ratios = isPerfect ? [1.0, 1.5, 2.42, 3.86, 5.12] : [1.0, 2.37, 3.89, 5.41];
    ratios.forEach((r, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = idx === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(baseFreq * r, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * r * 0.97, now + (isPerfect ? 0.52 : 0.30));
      const amp = (0.18 * intensity) / (idx + 1);
      gain.gain.setValueAtTime(amp, now);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + (isPerfect ? 0.52 : 0.30));
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + (isPerfect ? 0.54 : 0.32));
    });
  }

  // Hollow hemispherical steel bell-guard (Coquille) ricochet acoustic signature
  playCoquilleDeflect(isEpeeBowl = false) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const base = isEpeeBowl ? 780 : 960;
    [1.0, 1.84, 3.12, 4.65].forEach((r, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(base * r, now);
      osc.frequency.exponentialRampToValueAtTime(base * r * 1.03, now + 0.22);
      gain.gain.setValueAtTime(0.15 / (idx + 1), now);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.23);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.24);
    });
  }

  // Grounded metallic copper-nickel piste floor tip tap
  playPisteFloorStrike() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(145, now + 0.09);
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.10);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  playSabreCut() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    this.playSwoosh(1.55);
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1820, now);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.16);
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  playBladeScrape(freq = 1600, pressure = 0.5) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (now - this._lastScrapeTime < 0.065) return;
    this._lastScrapeTime = now;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.linearRampToValueAtTime(freq * 1.12, now + 0.055);
    gain.gain.setValueAtTime(0.035 * pressure, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.065);
  }

  playSwoosh(speed = 1.0) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const dur = 0.14 / Math.max(0.6, speed);
    const bufferSize = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(660 * speed, now);
    filter.frequency.exponentialRampToValueAtTime(2300 * speed, now + dur * 0.9);
    filter.Q.value = 2.8;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.005, now + dur);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
  }

  playPointClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2400, now);
    osc.frequency.exponentialRampToValueAtTime(360, now + 0.045);
    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.055);
  }

  playScoreMachine(type = 'player') {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    if (type === 'player') {
      osc.frequency.setValueAtTime(987.77, now);
      osc.frequency.setValueAtTime(1318.51, now + 0.09);
    } else if (type === 'ai') {
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.setValueAtTime(440.0, now + 0.11);
    } else {
      osc.frequency.setValueAtTime(740.0, now);
    }
    gain.gain.setValueAtTime(0.10, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.46);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.48);
  }

  playCrowdReaction(cheer = true) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const dur = cheer ? 0.85 : 0.45;
    const bufferSize = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const env = Math.sin((i / bufferSize) * Math.PI);
      data[i] = (Math.random() * 2 - 1) * env;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filt = this.ctx.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.setValueAtTime(cheer ? 920 : 480, now);
    filt.Q.value = 1.4;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(cheer ? 0.13 : 0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.002, now + dur);
    src.connect(filt);
    filt.connect(gain);
    gain.connect(this.ctx.destination);
    src.start(now);
  }

  playShoeSqueak() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2650, now);
    osc.frequency.exponentialRampToValueAtTime(3250, now + 0.055);
    gain.gain.setValueAtTime(0.045, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.065);
  }

  playFootstep(heavy = false) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(heavy ? 138 : 96, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.065);
    gain.gain.setValueAtTime(heavy ? 0.18 : 0.10, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
    if (heavy) this.playShoeSqueak();
  }

  playMasterStrikeActivation() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [220, 329.63, 440, 659.25, 880].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = idx < 2 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq * 0.85, now);
      osc.frequency.exponentialRampToValueAtTime(freq, now + 0.08);
      gain.gain.setValueAtTime(0.085, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.50);
    });
  }

  playUIClick(freq = 920) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.45, now + 0.042);
    gain.gain.setValueAtTime(0.11, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.048);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.052);
  }

  playStingerSwoosh() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.playSwoosh(0.85);
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(145, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.25);
    gain.gain.setValueAtTime(0.20, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.27);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.28);
  }

  tickDynamicArenaMusic(isFighting, intensity = 0) {
    if (!this.enabled || !this.bgmEnabled || !isFighting || !this.ctx || this.ctx.state === 'suspended') {
      this._nextBeatTime = 0;
      return;
    }
    const now = this.ctx.currentTime;
    const stepDur = intensity >= 2 ? 0.111 : 0.119;
    if (this._nextBeatTime < now) this._nextBeatTime = now + 0.02;

    while (this._nextBeatTime < now + 0.10) {
      const t = this._nextBeatTime;
      const step = this._beatStep % 16;
      const root = intensity >= 2 ? 65.41 : 55.0;
      const bassPattern = [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1.19, 0, 1.33, 0];
      const mult = bassPattern[step];

      if (mult > 0) {
        const osc = this.ctx.createOscillator();
        const filt = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(root * mult, t);
        filt.type = 'lowpass';
        filt.frequency.setValueAtTime(210 + intensity * 260 + (step % 4 === 0 ? 180 : 0), t);
        filt.frequency.exponentialRampToValueAtTime(92, t + stepDur * 0.85);
        gain.gain.setValueAtTime(step % 4 === 0 ? 0.052 : 0.034, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + stepDur * 0.9);
        osc.connect(filt);
        filt.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + stepDur);
      }

      if (step % 4 === 2 || (intensity >= 1 && step % 2 === 1)) {
        const hatOsc = this.ctx.createOscillator();
        const hatGain = this.ctx.createGain();
        hatOsc.type = 'square';
        hatOsc.frequency.setValueAtTime(intensity >= 1 && step % 4 === 2 ? root * 8 : 6500, t);
        hatGain.gain.setValueAtTime(0.011, t);
        hatGain.gain.exponentialRampToValueAtTime(0.0008, t + 0.034);
        hatOsc.connect(hatGain);
        hatGain.connect(this.ctx.destination);
        hatOsc.start(t);
        hatOsc.stop(t + 0.038);
      }

      this._nextBeatTime += stepDur;
      this._beatStep++;
    }
  }
}

const sound = new SoundEngine();
const refVoice = new RefereeVoiceEngine();
