import { useCallback, useSyncExternalStore } from "react";

const canMatchMedia = () =>
  typeof window !== "undefined" && typeof window.matchMedia === "function";

/** Whether a CSS media query currently matches, updated as the viewport changes. */
export const useMediaQuery = (query: string): boolean => {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!canMatchMedia()) return () => {};
      const mediaQuery = window.matchMedia(query);
      mediaQuery.addEventListener("change", onChange);
      return () => mediaQuery.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => canMatchMedia() && window.matchMedia(query).matches,
    () => false,
  );
};
