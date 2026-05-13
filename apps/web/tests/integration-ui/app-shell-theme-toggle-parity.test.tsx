import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next-themes", () => ({
	useTheme: () => ({
		resolvedTheme: "light",
		setTheme: vi.fn(),
	}),
}));

globalThis.React = React;

import { ThemeToggleButton } from "@/app/_components/theme-toggle-button";
import { AppShellThemeToggle } from "@/app/(app)/_components/app-shell/app-shell-theme-toggle";

const PARITY_TOKENS = ["border-border/70", "bg-background/70", "rounded-full"];

describe("AppShell theme toggle parity with marketing top bar", () => {
	it("renders the marketing theme toggle with the shared parity signature when the marketing className is applied", () => {
		// Mirror the marketing top-bar consumer in home-hero-top-bar.tsx and
		// codebase-demo-top-bar.tsx, which both pass
		// `className="border-border/70 bg-background/70"` to the shared button.
		render(<ThemeToggleButton className="border-border/70 bg-background/70" />);
		const button = screen.getByRole("button", { name: /switch to/i });
		for (const token of PARITY_TOKENS) {
			expect(button.className).toContain(token);
		}
	});

	it("renders the workspace theme toggle with the same parity signature at workspace density", () => {
		render(<AppShellThemeToggle />);
		const button = screen.getByRole("button", { name: /toggle theme/i });
		for (const token of PARITY_TOKENS) {
			expect(button.className).toContain(token);
		}
		expect(button.className).toContain("size-8");
	});
});
