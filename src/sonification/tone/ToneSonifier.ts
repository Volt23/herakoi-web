/**
 * ToneSonifier implements the Sonifier interface using Tone.js.
 *
 * Why: To provide a richer, more "astronomical" and pleasant sound experience
 * using procedural audio generation, effects (reverb, delay), and complex synthesis
 * that goes beyond basic oscillators.
 *
 * What: Maps ImageSample data to musical parameters:
 * - Hue -> Pitch (quantized to scales for pleasantness)
 * - Saturation -> Effect/Modulation intensity
 * - Value -> Volume/Velocity
 */

import * as Tone from "tone";
import type { ImageSample, Sonifier, SonifierOptions } from "#src/core/interfaces";

export type ToneSonifierOptions = SonifierOptions & {
  minFreq?: number;
  maxFreq?: number;
  minVol?: number;
  maxVol?: number;
  reverbWet?: number;
  delayWet?: number;
  synthType?: "fm" | "am" | "poly";
};

export type ToneSonifierAnalyserOptions = {
  fftSize?: number;
  smoothingTimeConstant?: number;
};

// Map voices to point IDs
type VoiceState = {
  id: string;
  frequency: number;
  volume: number;
  lastUpdate: number;
  active: boolean;
};

export class ToneSonifier implements Sonifier {
  private synth: Tone.PolySynth | null = null;
  private reverb: Tone.Reverb | null = null;
  private delay: Tone.FeedbackDelay | null = null;
  private limiter: Tone.Limiter | null = null;
  private mainOutput: Tone.Gain | null = null; // Master gain before destination
  private analyser: Tone.Analyser | null = null; // For visualization

  private activeVoices = new Map<string, VoiceState>();
  private initialized = false;
  private stopped = false;

  // Configuration - volumes are now linear gain (0-1) directly
  private minFreq = 100;
  private maxFreq = 800;
  private minVol = 0.05; // Linear gain (quiet)
  private maxVol = 0.6; // Linear gain (loud)
  private synthType: "fm" | "am" | "poly" = "fm";

  // Effects settings
  private reverbWet = 0.4;
  private delayWet = 0.2;

  constructor(options: ToneSonifierOptions = {}) {
    this.configure(options);
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // await Tone.start(); // Removed to prevent blocking on load
    // Context will be started/resumed via resume() on user interaction

    // Create audio graph
    // Chain: Synth -> Delay -> Reverb -> Limiter -> MainOutput -> Destination (Scale up to avoid clipping then limit)

    this.limiter = new Tone.Limiter(-2).toDestination();
    this.mainOutput = new Tone.Gain(1.0).connect(this.limiter);

    // Initialize effects
    this.reverb = new Tone.Reverb({
      decay: 4,
      preDelay: 0.1,
      wet: this.reverbWet,
    }).connect(this.mainOutput);
    // Use generate() to build the impulse response
    await this.reverb.generate();

    this.delay = new Tone.FeedbackDelay({
      delayTime: "8n",
      feedback: 0.3,
      wet: this.delayWet,
    }).connect(this.reverb);

    // Initialize Synth based on type
    this.setupSynth();

    // Create Analyser for visualization
    this.analyser = new Tone.Analyser("fft", 2048);
    // Connect output to analyser as well
    this.mainOutput.connect(this.analyser);

    this.initialized = true;
    console.log("ToneSonifier initialized");
  }

  async resume(): Promise<void> {
    if (Tone.context.state !== "running") {
      await Tone.start();
    }
  }

  private setupSynth() {
    if (this.synth) {
      this.synth.dispose();
    }

    // Choose different synth presets based on type
    // biome-ignore lint/suspicious/noExplicitAny: Tone.js types are complex for polymorphic assignment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let voice: any = Tone.FMSynth;
    // biome-ignore lint/suspicious/noExplicitAny: Tone.js types are complex for polymorphic assignment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let options: any = {
      harmonicity: 3,
      modulationIndex: 10,
      oscillator: { type: "sine" },
      envelope: { attack: 0.1, decay: 0.2, sustain: 0.8, release: 1 },
      modulation: { type: "square" },
      modulationEnvelope: { attack: 0.1, decay: 0.1, sustain: 1, release: 0.5 },
    };

    if (this.synthType === "am") {
      voice = Tone.AMSynth;
      options = {
        harmonicity: 2,
        oscillator: { type: "triangle" },
        envelope: { attack: 0.1, decay: 0.5, sustain: 1, release: 2 },
        modulation: { type: "sine" },
        modulationEnvelope: { attack: 0.5, decay: 0, sustain: 1, release: 0.5 },
      };
    } else if (this.synthType === "poly") {
      voice = Tone.Synth; // Basic synth but polyphonic
      options = {
        oscillator: { type: "triangle8" }, // Super-saw like
        envelope: { attack: 0.2, decay: 1, sustain: 0.5, release: 1 },
      };
    }

    this.synth = new Tone.PolySynth(voice, options);

    // Connect synth to delay (start of effects chain) works best for space sounds
    // Also connect dry signal to reverb a bit? No, series is fine for this loop.
    if (this.delay) {
      this.synth.connect(this.delay);
    }
  }

  configure(options: ToneSonifierOptions): void {
    if (options.minFreq !== undefined) this.minFreq = options.minFreq;
    if (options.maxFreq !== undefined) this.maxFreq = options.maxFreq;
    // Store linear volume directly (0-1 range)
    if (options.minVol !== undefined) this.minVol = Math.max(0.01, options.minVol);
    if (options.maxVol !== undefined) this.maxVol = Math.min(1.0, options.maxVol);

    if (options.reverbWet !== undefined && this.reverb) {
      this.reverbWet = options.reverbWet;
      this.reverb.wet.rampTo(this.reverbWet, 0.5);
    }

    if (options.delayWet !== undefined && this.delay) {
      this.delayWet = options.delayWet;
      this.delay.wet.rampTo(this.delayWet, 0.5);
    }

    if (options.synthType && options.synthType !== this.synthType) {
      this.synthType = options.synthType;
      if (this.initialized) {
        this.setupSynth();
      }
    }
  }

  processSamples(samples: Map<string, ImageSample>): void {
    if (!this.initialized || !this.synth || this.stopped) return;

    const now = Tone.now();
    const seenIds = new Set<string>();

    for (const [id, sample] of samples) {
      const hueByte = this.pickNumber(sample.data, ["hueByte", "hue", "h"]) ?? 0;
      const valueByte = this.pickNumber(sample.data, ["valueByte", "value", "v"]) ?? 0;

      // Map frequency from hue
      const freq = this.mapToScale(hueByte, this.minFreq, this.maxFreq);
      // Map volume linearly: interpolate between minVol and maxVol
      const volNorm = valueByte / 255; // 0-1 normalized
      const targetVol = this.minVol + volNorm * (this.maxVol - this.minVol);

      seenIds.add(id);

      if (this.activeVoices.has(id)) {
        const state = this.activeVoices.get(id);
        if (!state) continue;

        // Check if we need to retrigger: pitch change > 15Hz OR volume change > 0.1
        const freqChanged = Math.abs(state.frequency - freq) > 15;
        const volChanged = Math.abs(state.volume - targetVol) > 0.1;

        if (freqChanged || volChanged) {
          // Retrigger the note
          this.synth.triggerRelease(state.frequency, now);
          this.synth.triggerAttack(freq, now, targetVol);
          state.frequency = freq;
          state.volume = targetVol;
        }
        state.active = true;
        state.lastUpdate = now;
      } else {
        // New voice
        this.synth.triggerAttack(freq, now, targetVol);
        this.activeVoices.set(id, {
          id,
          frequency: freq,
          volume: targetVol,
          lastUpdate: now,
          active: true,
        });
      }
    }

    // Release voices that are gone
    for (const [id, state] of this.activeVoices) {
      if (!seenIds.has(id)) {
        this.synth.triggerRelease(state.frequency, now);
        this.activeVoices.delete(id);
      }
    }
  }

  private mapToScale(val: number, min: number, max: number): number {
    // Simple linear map for now, can be upgraded to musical scales (Penatonic, etc)
    return min + (val / 255) * (max - min);
  }

  stop(): void {
    this.stopped = true;
    if (this.synth) {
      this.synth.releaseAll();
    }
    // Fade out master?
    if (this.mainOutput) {
      this.mainOutput.gain.rampTo(0, 0.5);
    }
  }

  getAnalyserNode(options: ToneSonifierAnalyserOptions = {}): AnalyserNode {
    // Tone.Analyser is a wrapper, but we can access the underlying node or connect existing one.
    // But the interface demands a web audio API AnalyserNode.
    // We can get it from Tone.Context or create a shim.
    // Actually Tone.Analyser HAS a .input / .output which are nodes (?) or we can use Tone.context.createAnalyser()

    // Since existing app expects standard AnalyserNode to connect to visualizer:
    if (!this.analyser) {
      // If not created yet (should be in init)
      this.analyser = new Tone.Analyser("fft", 2048);
    }

    // Tone.Analyser exposes the raw node via a getter if we delve, but standard consumption:
    // We can just create a raw web audio analyser and connect main output to it.

    // workaround to return a standard AnalyserNode from Tone logic
    const rawContext = Tone.getContext().rawContext;
    const rawAnalyser = rawContext.createAnalyser();

    if (this.mainOutput) {
      // Connect Tone Gain to Raw Analyser
      // Tone nodes can connect to raw nodes usually.
      this.mainOutput.connect(rawAnalyser);
    }

    if (options.fftSize) rawAnalyser.fftSize = options.fftSize;
    if (options.smoothingTimeConstant)
      rawAnalyser.smoothingTimeConstant = options.smoothingTimeConstant;

    return rawAnalyser;
  }

  private pickNumber(source: Record<string, number>, keys: string[]): number | null {
    for (const key of keys) {
      const value = source[key];
      if (typeof value === "number" && Number.isFinite(value)) {
        return value;
      }
    }
    return null;
  }
}
