/**
 * @vitest-environment happy-dom
 */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SonificationAudioPanel } from "./SonificationAudioPanel";

const mockCompact = (matches: boolean) => {
  vi.spyOn(window, "matchMedia").mockReturnValue({
    matches,
    addEventListener: () => {},
    removeEventListener: () => {},
  } as unknown as MediaQueryList);
};

const renderPanel = () =>
  render(
    <SonificationAudioPanel muted={false}>
      <span>volume slider</span>
    </SonificationAudioPanel>,
  );

describe("SonificationAudioPanel", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("shows the controls without a toggle on wide screens", () => {
    mockCompact(false);
    renderPanel();
    expect(screen.getByText("volume slider")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Volume controls" })).toBeNull();
  });

  it("starts collapsed on compact screens and expands in place", () => {
    mockCompact(true);
    renderPanel();
    const toggle = screen.getByRole("button", { name: "Volume controls" });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("volume slider")).toBeNull();

    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    const controls = document.getElementById(toggle.getAttribute("aria-controls") ?? "");
    expect(controls?.textContent).toBe("volume slider");

    fireEvent.click(toggle);
    expect(screen.queryByText("volume slider")).toBeNull();
  });
});
