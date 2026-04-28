import { afterEach, vi } from "vitest";

import "./react-singleton";

let cleanupTestingLibrary: null | (() => void) = null;

async function cleanupReactTestingLibrary() {
	if (!cleanupTestingLibrary) {
		const testingLibrary = await import("@testing-library/react");
		cleanupTestingLibrary = testingLibrary.cleanup;
	}

	cleanupTestingLibrary();
}

afterEach(async () => {
	await cleanupReactTestingLibrary();
	vi.restoreAllMocks();
});

Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: vi.fn().mockImplementation((query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		addListener: vi.fn(),
		removeListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
});

Object.defineProperty(window, "scrollTo", {
	writable: true,
	value: vi.fn(),
});

class ResizeObserverMock {
	observe = vi.fn();
	unobserve = vi.fn();
	disconnect = vi.fn();
}

Object.defineProperty(window, "ResizeObserver", {
	writable: true,
	value: ResizeObserverMock,
});
