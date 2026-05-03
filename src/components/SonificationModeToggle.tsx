import { AudioWaveform, Piano } from "lucide-react";
import { oscillatorSonificationPluginId } from "#src/plugins/sonification/oscillator/config";
import { pianoSamplerPluginId } from "#src/plugins/sonification/piano-sampler/config";
import { cn } from "#src/shared/utils/cn";
import { useActivePlugin } from "#src/state/appConfigStore";

const baseButtonClass =
  "flex h-9 w-9 items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export const SonificationModeToggle = () => {
  const [activeId, setActiveId] = useActivePlugin("sonification");
  const isOscillator = activeId === oscillatorSonificationPluginId;
  const isPiano = activeId === pianoSamplerPluginId;

  return (
    <fieldset
      aria-label="Sonification mode"
      className="flex flex-col items-center gap-1 rounded-full border border-border/50 bg-black/55 p-1 backdrop-blur"
    >
      <button
        type="button"
        aria-label="Synth oscillator"
        aria-pressed={isOscillator}
        onClick={() => setActiveId(oscillatorSonificationPluginId)}
        className={cn(
          baseButtonClass,
          isOscillator
            ? "bg-white/10 text-white"
            : "text-muted-foreground hover:bg-black/40 hover:text-foreground",
        )}
      >
        <AudioWaveform className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Piano sampler"
        aria-pressed={isPiano}
        onClick={() => setActiveId(pianoSamplerPluginId)}
        className={cn(
          baseButtonClass,
          isPiano
            ? "bg-white/10 text-white"
            : "text-muted-foreground hover:bg-black/40 hover:text-foreground",
        )}
      >
        <Piano className="h-4 w-4" />
      </button>
    </fieldset>
  );
};
