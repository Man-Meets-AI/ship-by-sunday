import { renderEntrySurface } from "../src/startup/render-entry-surface";
import { shouldRenderStartupSurface } from "../src/startup/resolve-human-mode";

describe("CLI startup surface", () => {
	it("only renders the human entry surface when stdin and stdout are both ttys", () => {
		expect(
			shouldRenderStartupSurface({
				argv: [],
				stdinIsTTY: true,
				stdoutIsTTY: true,
			}),
		).toBe(true);

		expect(
			shouldRenderStartupSurface({
				argv: [],
				stdinIsTTY: false,
				stdoutIsTTY: true,
			}),
		).toBe(false);

		expect(
			shouldRenderStartupSurface({
				argv: ["resume"],
				stdinIsTTY: true,
				stdoutIsTTY: true,
			}),
		).toBe(false);
	});

	it("renders the repository identity and recommended next commands", () => {
		const surface = renderEntrySurface({
			projectRootPath: "/tmp/ship-by-sunday",
			options: {
				colorEnabled: false,
				terminalWidth: 120,
			},
		});

		expect(surface).toContain("Repository: ship-by-sunday");
		expect(surface).toContain("Working root: /tmp/ship-by-sunday");
		expect(surface).toContain(
			"Guided blueprint intake, readiness checks, and blueprint generation for this repository.",
		);
		expect(surface).toContain("bun run sbs resume");
		expect(surface).toContain("bun run sbs next --json");
		expect(surface).toContain("bun run sbs review --json");
	});
});
