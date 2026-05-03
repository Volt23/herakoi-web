import { Hand, MousePointer2 } from "lucide-react";
import { mediaPipeDetectionPluginId } from "#src/plugins/detection/mediapipe/config";
import { pointerDetectionPluginId } from "#src/plugins/detection/pointer/config";
import { cn } from "#src/shared/utils/cn";
import { useActivePlugin } from "#src/state/appConfigStore";

const baseButtonClass =
  "flex h-9 w-9 items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export const DetectionModeToggle = () => {
  const [activeId, setActiveId] = useActivePlugin("detection");
  const isHands = activeId === mediaPipeDetectionPluginId;
  const isPointer = activeId === pointerDetectionPluginId;

  return (
    <fieldset
      aria-label="Detection mode"
      className="flex items-center gap-1 rounded-full border border-border/50 bg-black/50 p-1 backdrop-blur"
    >
      <button
        type="button"
        aria-label="Hand tracking"
        aria-pressed={isHands}
        onClick={() => setActiveId(mediaPipeDetectionPluginId)}
        className={cn(
          baseButtonClass,
          isHands
            ? "bg-white/10 text-white"
            : "text-muted-foreground hover:bg-black/40 hover:text-foreground",
        )}
      >
        <Hand className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Mouse / touch"
        aria-pressed={isPointer}
        onClick={() => setActiveId(pointerDetectionPluginId)}
        className={cn(
          baseButtonClass,
          isPointer
            ? "bg-white/10 text-white"
            : "text-muted-foreground hover:bg-black/40 hover:text-foreground",
        )}
      >
        <MousePointer2 className="h-4 w-4" />
      </button>
    </fieldset>
  );
};
