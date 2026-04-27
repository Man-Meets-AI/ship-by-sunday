import { createRequire } from "node:module";
import { afterEach, vi } from "vitest";

const require = createRequire(import.meta.url);
const moduleResolver = require("node:module") as {
	_resolveFilename: (
		request: string,
		parent: unknown,
		isMain: boolean,
		options?: unknown,
	) => string;
};
const originalResolveFilename = moduleResolver._resolveFilename;
const rootReactModules = new Map([
	["react", require.resolve("react")],
	["react/jsx-runtime", require.resolve("react/jsx-runtime")],
	["react/jsx-dev-runtime", require.resolve("react/jsx-dev-runtime")],
	["react-dom", require.resolve("react-dom")],
	["react-dom/client", require.resolve("react-dom/client")],
	["react-dom/server", require.resolve("react-dom/server")],
	["react-dom/test-utils", require.resolve("react-dom/test-utils")],
]);

for (const [moduleName, modulePath] of rootReactModules) {
	vi.doMock(moduleName, async () => await import(modulePath));
}

moduleResolver._resolveFilename = function resolveSingleReactRenderer(
	request,
	parent,
	isMain,
	options,
) {
	const rootReactModule = rootReactModules.get(request);
	if (rootReactModule) {
		return rootReactModule;
	}

	return originalResolveFilename.call(this, request, parent, isMain, options);
};

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
