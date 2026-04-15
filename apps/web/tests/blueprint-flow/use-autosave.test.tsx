/** @vitest-environment jsdom */

import { act, renderHook } from "@testing-library/react";

import { useAutosave } from "@/features/shared/hooks/use-autosave";

describe("useAutosave", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("runs autosave after the debounce window closes", async () => {
		const onAutosave = vi.fn();

		renderHook(() =>
			useAutosave({
				shouldAutosave: true,
				delayMs: 100,
				onAutosave,
			}),
		);

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
		const { unmount } = renderHook(() =>
			useAutosave({
				shouldAutosave: true,
				delayMs: 100,
				onAutosave,
			}),
		);

		unmount();

		await act(async () => {
			vi.runAllTimers();
		});

		expect(onAutosave).not.toHaveBeenCalled();
	});

	it("uses the latest autosave callback without resetting the timer", async () => {
		const firstAutosave = vi.fn();
		const secondAutosave = vi.fn();
		const { rerender } = renderHook(
			({ onAutosave }: { onAutosave: () => void }) =>
				useAutosave({
					shouldAutosave: true,
					delayMs: 100,
					onAutosave,
				}),
			{
				initialProps: {
					onAutosave: firstAutosave,
				},
			},
		);

		rerender({
			onAutosave: secondAutosave,
		});

		await act(async () => {
			vi.advanceTimersByTime(100);
		});

		expect(firstAutosave).not.toHaveBeenCalled();
		expect(secondAutosave).toHaveBeenCalledTimes(1);
	});
});
