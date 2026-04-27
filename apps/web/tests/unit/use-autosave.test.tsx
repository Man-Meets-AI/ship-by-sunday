/** @vitest-environment jsdom */

import { act } from "react";
import { createRoot } from "react-dom/client";

import { useAutosave } from "@/hooks/use-autosave";

type AutosaveHookProps = Parameters<typeof useAutosave>[0];

function renderAutosaveHook(initialProps: AutosaveHookProps) {
	const container = document.createElement("div");
	document.body.append(container);
	const root = createRoot(container);

	function TestAutosaveHook(props: AutosaveHookProps) {
		useAutosave(props);
		return null;
	}

	function render(props: AutosaveHookProps) {
		act(() => {
			root.render(<TestAutosaveHook {...props} />);
		});
	}

	render(initialProps);

	return {
		rerender(nextProps: AutosaveHookProps) {
			render(nextProps);
		},
		unmount() {
			act(() => {
				root.unmount();
			});
			container.remove();
		},
	};
}

describe("useAutosave", () => {
	let actEnvironment: unknown;

	beforeEach(() => {
		actEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
		globalThis.IS_REACT_ACT_ENVIRONMENT = true;
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		globalThis.IS_REACT_ACT_ENVIRONMENT = actEnvironment;
	});

	it("runs autosave after the debounce window closes", async () => {
		const onAutosave = vi.fn();

		renderAutosaveHook({
			shouldAutosave: true,
			delayMs: 100,
			onAutosave,
		});

		await act(async () => {
			vi.advanceTimersByTime(99);
		});

		expect(onAutosave).not.toHaveBeenCalled();

		await act(async () => {
			vi.advanceTimersByTime(1);
		});

		expect(onAutosave).toHaveBeenCalledTimes(1);
	});

	it("cleans up a pending autosave when the component unmounts", async () => {
		const onAutosave = vi.fn();
		const { unmount } = renderAutosaveHook({
			shouldAutosave: true,
			delayMs: 100,
			onAutosave,
		});

		unmount();

		await act(async () => {
			vi.runAllTimers();
		});

		expect(onAutosave).not.toHaveBeenCalled();
	});

	it("uses the latest autosave callback without resetting the timer", async () => {
		const firstAutosave = vi.fn();
		const secondAutosave = vi.fn();
		const { rerender } = renderAutosaveHook({
			shouldAutosave: true,
			delayMs: 100,
			onAutosave: firstAutosave,
		});

		rerender({
			shouldAutosave: true,
			delayMs: 100,
			onAutosave: secondAutosave,
		});

		await act(async () => {
			vi.advanceTimersByTime(100);
		});

		expect(firstAutosave).not.toHaveBeenCalled();
		expect(secondAutosave).toHaveBeenCalledTimes(1);
	});
});
