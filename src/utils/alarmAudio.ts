/**
 * High-Decibel Emergency Panic Siren Synthesizer
 * Uses Web Audio API dual-oscillator FM sweep to produce an intense,
 * far-reaching acoustic distress alarm designed for human emergency recognition.
 */

let audioCtx: AudioContext | null = null;
let oscillator1: OscillatorNode | null = null;
let oscillator2: OscillatorNode | null = null;
let gainNode: GainNode | null = null;
let lfo: OscillatorNode | null = null;
let lfoGain: GainNode | null = null;
let isSirenActive = false;

export function isAlarmRunning(): boolean {
  return isSirenActive;
}

export function startEmergencyAlarm(): boolean {
  try {
    if (isSirenActive) return true;

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) {
      console.warn("Web Audio API not supported in this browser");
      return false;
    }

    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // Master Volume Gain
    gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.95, now); // high output volume
    gainNode.connect(audioCtx.destination);

    // Primary Siren Oscillator (Sweeps 800Hz - 1350Hz)
    oscillator1 = audioCtx.createOscillator();
    oscillator1.type = 'sawtooth'; // rich harmonics for maximum audibility and penetration through wind/walls
    oscillator1.frequency.setValueAtTime(850, now);

    // Secondary Sub-Harmonic Oscillator for acoustic pressure (440Hz - 660Hz)
    oscillator2 = audioCtx.createOscillator();
    oscillator2.type = 'square';
    oscillator2.frequency.setValueAtTime(450, now);

    // LFO to modulate siren frequency up and down rapidly (1.8Hz cycle)
    lfo = audioCtx.createOscillator();
    lfo.type = 'triangle';
    lfo.frequency.setValueAtTime(2.2, now); // ~2.2 sirens per second

    lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(350, now); // Frequency deviation +/- 350 Hz

    lfo.connect(lfoGain);
    lfoGain.connect(oscillator1.frequency);
    lfoGain.connect(oscillator2.frequency);

    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);

    lfo.start(now);
    oscillator1.start(now);
    oscillator2.start(now);

    isSirenActive = true;
    return true;
  } catch (err) {
    console.error("Failed to trigger emergency alarm:", err);
    return false;
  }
}

export function stopEmergencyAlarm() {
  try {
    if (!isSirenActive) return;

    if (lfo) {
      lfo.stop();
      lfo.disconnect();
      lfo = null;
    }
    if (oscillator1) {
      oscillator1.stop();
      oscillator1.disconnect();
      oscillator1 = null;
    }
    if (oscillator2) {
      oscillator2.stop();
      oscillator2.disconnect();
      oscillator2 = null;
    }
    if (lfoGain) {
      lfoGain.disconnect();
      lfoGain = null;
    }
    if (gainNode) {
      gainNode.disconnect();
      gainNode = null;
    }

    isSirenActive = false;
  } catch (err) {
    console.error("Error stopping emergency alarm:", err);
    isSirenActive = false;
  }
}
