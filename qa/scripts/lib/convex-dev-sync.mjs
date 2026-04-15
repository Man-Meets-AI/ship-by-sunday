export function buildHostedConvexDevSyncCommand() {
	return {
		command: "bunx",
		args: ["convex", "dev", "--once", "--typecheck", "disable"],
	};
}
