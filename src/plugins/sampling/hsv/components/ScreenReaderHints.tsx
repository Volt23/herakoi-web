import { useHSVRuntimeStore } from "../runtimeStore";

export const moveImageInstructions =
  "Desktop: drag to pan, wheel to zoom, Shift+wheel to rotate. Mobile: drag with one finger, pinch to zoom/rotate.";

/**
 * Cover-mode guidance for screen readers only. The visible tips were removed to declutter the UI,
 * so this live region keeps the same information available without rendering anything on screen.
 */
export const HSVScreenReaderHints = () => {
  const coverModeActive = useHSVRuntimeStore((state) => state.coverModeActive);
  const panInteractionEnabled = useHSVRuntimeStore((state) => state.panInteractionEnabled);

  let message = "";
  if (coverModeActive) {
    message = panInteractionEnabled
      ? `Move image on. ${moveImageInstructions}`
      : "Cover mode active. Turn on Move image in the toolbar to pan, zoom, and rotate the image.";
  }

  return (
    <div className="sr-only" aria-live="polite" aria-atomic="true">
      {message}
    </div>
  );
};
