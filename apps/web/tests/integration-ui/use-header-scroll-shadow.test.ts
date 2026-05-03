import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useHeaderScrollShadow } from "@/app/(workspace)/_hooks/app-shell/use-header-scroll-shadow";

const MAIN_ID = "app-shell-main-test";

function flushAnimationFrame() {
	act(() => {
		vi.runAllTimers();
	});
}

afterEach(() => {
	document.body.innerHTML = "";
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
	vi.useRealTimers();
});

describe("useHeaderScrollShadow", () => {
	it("returns false at scrollTop = 0, true after scrolling past the threshold, and false again on scroll back to 0", () => {
		vi.useFakeTimers();
		vi.stubGlobal(
			"requestAnimationFrame",
			(callback: FrameRequestCallback) =>
				setTimeout(() => callback(performance.now()), 0) as unknown as number,
		);
		vi.stubGlobal("cancelAnimationFrame", (handle: number) =>
			clearTimeout(handle),
		);

		const main = document.createElement("div");
		main.id = MAIN_ID;
		document.body.appendChild(main);

		const { result } = renderHook(() =>
			useHeaderScrollShadow({ mainId: MAIN_ID }),
		);

		flushAnimationFrame();
		expect(result.current).toBe(false);

		act(() => {
			Object.defineProperty(window, "scrollY", {
				configurable: true,
				value: 40,
			});
			window.dispatchEvent(new Event("scroll"));
		});
		flushAnimationFrame();
		expect(result.current).toBe(true);

		act(() => {
			Object.defineProperty(window, "scrollY", {
				configurable: true,
				value: 0,
			});
			window.dispatchEvent(new Event("scroll"));
		});
		flushAnimationFrame();
		expect(result.current).toBe(false);
	});

	it("toggles based on the inner main element scrollTop when window stays at 0", () => {
		vi.useFakeTimers();
		vi.stubGlobal(
			"requestAnimationFrame",
			(callback: FrameRequestCallback) =>
				setTimeout(() => callback(performance.now()), 0) as unknown as number,
		);
		vi.stubGlobal("cancelAnimationFrame", (handle: number) =>
			clearTimeout(handle),
		);

		const main = document.createElement("div");
		main.id = MAIN_ID;
		document.body.appendChild(main);

		const { result } = renderHook(() =>
			useHeaderScrollShadow({ mainId: MAIN_ID }),
		);

		flushAnimationFrame();
		expect(result.current).toBe(false);

		act(() => {
			Object.defineProperty(main, "scrollTop", {
				configurable: true,
				value: 40,
			});
			main.dispatchEvent(new Event("scroll"));
		});
		flushAnimationFrame();
		expect(result.current).toBe(true);

		act(() => {
			Object.defineProperty(main, "scrollTop", {
				configurable: true,
				value: 0,
			});
			main.dispatchEvent(new Event("scroll"));
		});
		flushAnimationFrame();
		expect(result.current).toBe(false);
	});
});
