/**
 * @vitest-environment happy-dom
 */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Hand, MousePointer2 } from "lucide-react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useAppConfigStore } from "#src/state/appConfigStore";
import { ModeToggle } from "./ModeToggle";

const options = [
  { pluginId: "detection/mediapipe", label: "Hand tracking", icon: Hand },
  { pluginId: "detection/pointer", label: "Mouse / touch", icon: MousePointer2 },
];

const renderToggle = () =>
  render(<ModeToggle slot="detection" label="Detection mode" options={options} />);

const liveRegion = (container: HTMLElement) => container.querySelector("[aria-live]");

describe("ModeToggle", () => {
  beforeEach(() => {
    useAppConfigStore.getState().setActivePlugin("detection", "detection/mediapipe");
  });

  afterEach(cleanup);

  it("stays clickable inside pointer-events-none containers", () => {
    renderToggle();
    expect(screen.getByRole("group", { name: "Detection mode" }).className).toContain(
      "pointer-events-auto",
    );
  });

  it("announces nothing until the mode changes", () => {
    const { container } = renderToggle();
    expect(liveRegion(container)?.textContent ?? "").toBe("");
  });

  it("announces the new mode after a change and updates the store", () => {
    const { container } = renderToggle();
    fireEvent.click(screen.getByRole("button", { name: "Mouse / touch" }));
    expect(useAppConfigStore.getState().activePlugins.detection).toBe("detection/pointer");
    expect(liveRegion(container)?.textContent).toBe("Detection mode: Mouse / touch");
  });
});
