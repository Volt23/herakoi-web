import { usePipelineStore } from "../../state/pipelineStore";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Slider } from "../ui/slider";

export const AudioPanel = () => {
  const oscillator = usePipelineStore((state) => state.oscillator);
  const setOscillator = usePipelineStore((state) => state.setOscillator);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          Frequency range ({oscillator.minFreq}Hz – {oscillator.maxFreq}Hz)
        </Label>
        <Slider
          min={50}
          max={2000}
          step={10}
          value={[oscillator.minFreq, oscillator.maxFreq]}
          aria-label="Frequency range"
          thumbLabels={["Minimum frequency", "Maximum frequency"]}
          onValueChange={([min, max]) => setOscillator({ minFreq: min, maxFreq: max })}
        />
      </div>
      <div className="space-y-2">
        <Label>
          Volume range ({Math.round(oscillator.minVol * 100)}% –{" "}
          {Math.round(oscillator.maxVol * 100)}%)
        </Label>
        <Slider
          min={0}
          max={100}
          step={1}
          value={[oscillator.minVol * 100, oscillator.maxVol * 100]}
          aria-label="Volume range"
          thumbLabels={["Minimum volume", "Maximum volume"]}
          onValueChange={([min, max]) => setOscillator({ minVol: min / 100, maxVol: max / 100 })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Reverb ({Math.round((oscillator.reverbWet ?? 0.3) * 100)}%)</Label>
          <Slider
            min={0}
            max={100}
            step={1}
            value={[(oscillator.reverbWet ?? 0.3) * 100]}
            aria-label="Reverb Amount"
            thumbLabels={["Reverb Wet"]}
            onValueChange={([val]) => setOscillator({ reverbWet: val / 100 })}
          />
        </div>
        <div className="space-y-2">
          <Label>Delay ({Math.round((oscillator.delayWet ?? 0.2) * 100)}%)</Label>
          <Slider
            min={0}
            max={100}
            step={1}
            value={[(oscillator.delayWet ?? 0.2) * 100]}
            aria-label="Delay Amount"
            thumbLabels={["Delay Wet"]}
            onValueChange={([val]) => setOscillator({ delayWet: val / 100 })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Synthesizer Type</Label>
        <Select
          value={oscillator.synthType ?? "fm"}
          onValueChange={(value) => setOscillator({ synthType: value as "fm" | "am" | "poly" })}
        >
          <SelectTrigger aria-label="Synthesizer Type">
            <SelectValue placeholder="Synth Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fm">FM Space (Metallic)</SelectItem>
            <SelectItem value="am">AM Sci-Fi (Pulsing)</SelectItem>
            <SelectItem value="poly">Poly Saw (Classic)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
