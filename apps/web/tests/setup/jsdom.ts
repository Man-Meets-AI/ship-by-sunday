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

class InMemoryStorage implements Storage {
	private readonly items = new Map<string, string>();

	get length() {
		return this.items.size;
	}

	clear() {
		this.items.clear();
	}

	getItem(key: string) {
		return this.items.get(key) ?? null;
	}

	key(index: number) {
		return Array.from(this.items.keys())[index] ?? null;
	}

	removeItem(key: string) {
		this.items.delete(key);
	}

	setItem(key: string, value: string) {
		this.items.set(key, value);
	}
}

if (typeof window.localStorage.clear !== "function") {
	Object.defineProperty(window, "localStorage", {
		configurable: true,
		value: new InMemoryStorage(),
	});
}

class ResizeObserverMock {
	observe = vi.fn();
	unobserve = vi.fn();
	disconnect = vi.fn();
}

Object.defineProperty(window, "ResizeObserver", {
	writable: true,
	value: ResizeObserverMock,
});
