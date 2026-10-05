import { type ComponentType, useState } from "react";
import type { AppActivePlugins } from "#src/pluginConfigRegistry";
import { cn } from "#src/shared/utils/cn";
import { useActivePlugin } from "#src/state/appConfigStore";
import { ScreenReaderAnnouncer } from "./ScreenReaderAnnouncer";

export type ModeToggleOption = {
  pluginId: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

type ModeToggleProps = {
  slot: "detection" | "sonification";
  label: string;
  options: ModeToggleOption[];
  orientation?: "horizontal" | "vertical";
};

const buttonClass =
  "flex h-9 w-9 items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** Quick switch between the plugins of one pipeline slot, synced with Settings. */
export const ModeToggle = ({
  slot,
  label,
  options,
  orientation = "horizontal",
}: ModeToggleProps) => {
  const [activeId, setActiveId] = useActivePlugin(slot);
  const [announcement, setAnnouncement] = useState("");

  return (
    <>
      <fieldset
        aria-label={label}
        className={cn(
          "pointer-events-auto flex items-center gap-1 rounded-full border border-border/50 bg-black/55 p-1 backdrop-blur",
          orientation === "vertical" && "flex-col",
        )}
      >
        {options.map(({ pluginId, label: optionLabel, icon: Icon }) => {
          const isActive = activeId === pluginId;
          return (
            <button
              key={pluginId}
              type="button"
              aria-label={optionLabel}
              aria-pressed={isActive}
              onClick={() => {
                setActiveId(pluginId as AppActivePlugins[typeof slot]);
                setAnnouncement(`${label}: ${optionLabel}`);
              }}
              className={cn(
                buttonClass,
                isActive
                  ? "bg-white/10 text-white"
                  : "text-muted-foreground hover:bg-black/40 hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </fieldset>
      <ScreenReaderAnnouncer message={announcement} />
    </>
  );
};
