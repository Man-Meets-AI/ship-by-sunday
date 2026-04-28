import { createRequire } from "node:module";
import { vi } from "vitest";

const require = createRequire(import.meta.url);
const reactSingletonResolverFlag = "__shipBySundayReactSingletonResolver";

type ModuleResolver = {
	_resolveFilename: (
		request: string,
		parent: unknown,
		isMain: boolean,
		options?: unknown,
	) => string;
	[reactSingletonResolverFlag]?: boolean;
};

const moduleResolver = require("node:module") as ModuleResolver;
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

if (!moduleResolver[reactSingletonResolverFlag]) {
	const originalResolveFilename = moduleResolver._resolveFilename;

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

	moduleResolver[reactSingletonResolverFlag] = true;
}
