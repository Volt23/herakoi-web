import { useCallback } from "react";
import type { ActivePlugins } from "../../state/appConfigStore";
import { useActivePlugin } from "../../state/appConfigStore";

type SwitchableSlot = "detection" | "sampling" | "sonification";

type UsePluginSwitchParams = {
  startTransport: () => Promise<unknown>;
  stopTransport: () => void;
};

/**
 * Switch the active plugin of a slot: stop transport → switch plugin → restart.
 * Stopping first flushes active tones before the old handles are disposed.
 */
export const usePluginSwitch = <K extends SwitchableSlot>(
  slot: K,
  { startTransport, stopTransport }: UsePluginSwitchParams,
) => {
  const [, setActiveId] = useActivePlugin(slot);

  return useCallback(
    (id: string) => {
      stopTransport();
      setActiveId(id as ActivePlugins[K]);
      void startTransport();
    },
    [startTransport, stopTransport, setActiveId],
  );
};
