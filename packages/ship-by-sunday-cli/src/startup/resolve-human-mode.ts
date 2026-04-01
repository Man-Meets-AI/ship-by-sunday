export function shouldRenderStartupSurface({
	argv,
	stdinIsTTY,
	stdoutIsTTY,
}: {
	argv: string[];
	stdinIsTTY: boolean;
	stdoutIsTTY: boolean;
}) {
	return argv.length === 0 && stdinIsTTY && stdoutIsTTY;
}
