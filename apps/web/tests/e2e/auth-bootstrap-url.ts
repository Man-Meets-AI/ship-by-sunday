const signedInWorkspaceLandingPaths = new Set([
	"/generate-codebase",
	"/starter/generate-codebase",
	"/home",
	"/starter/home",
	"/workers/setup",
]);

export function isSignedInWorkspaceLandingUrl(url: URL) {
	return signedInWorkspaceLandingPaths.has(url.pathname);
}
