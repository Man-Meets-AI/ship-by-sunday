import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeToggleButton } from "@/app/_components/theme-toggle-button";
import { DocsThemeToggle } from "@/app/docs/_components/docs-theme-toggle";
import { DOCS_THEME_STORAGE_KEY } from "@/app/docs/_lib/theme-preferences";

vi.mock("next-themes", async () => {
	const React = await vi.importActual<typeof import("react")>("react");
	const ThemeContext = React.createContext<{
		resolvedTheme: "dark" | "light";
		setTheme: (theme: "dark" | "light") => void;
	} | null>(null);

	function ThemeProvider({
		children,
		defaultTheme = "light",
	}: {
		children: ReactNode;
		defaultTheme?: "dark" | "light";
	}) {
		const [resolvedTheme, setResolvedTheme] = React.useState<"dark" | "light">(
			() => {
				const storedTheme = window.localStorage.getItem("theme");
				return storedTheme === "dark" || storedTheme === "light"
					? storedTheme
					: defaultTheme;
			},
		);

		const setTheme = React.useCallback((theme: "dark" | "light") => {
			window.localStorage.setItem("theme", theme);
			document.documentElement.className = theme;
			setResolvedTheme(theme);
		}, []);

		React.useEffect(() => {
			document.documentElement.className = resolvedTheme;
		}, [resolvedTheme]);

		return React.createElement(
			ThemeContext.Provider,
			{ value: { resolvedTheme, setTheme } },
			children,
		);
	}

	function useTheme() {
		const context = React.useContext(ThemeContext);

		if (!context) {
			throw new Error("useTheme must be used inside ThemeProvider");
		}

		return context;
	}

	return { ThemeProvider, useTheme };
});

const { ThemeProvider } = await import("next-themes");

function renderWithThemeProvider(children: ReactNode) {
	return render(
		<ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
			{children}
		</ThemeProvider>,
	);
}

describe("public theme toggles", () => {
	beforeEach(() => {
		window.localStorage.clear();
		document.cookie = "docs-theme=; path=/; max-age=0";
		document.documentElement.className = "";
		delete document.documentElement.dataset.productTheme;
	});

	it("toggles the app theme through next-themes storage and html classes", async () => {
		const user = userEvent.setup();

		renderWithThemeProvider(<ThemeToggleButton />);

		await user.click(
			await screen.findByRole("button", { name: "Switch to dark mode" }),
		);

		await waitFor(() => {
			expect(document.documentElement.classList.contains("dark")).toBe(true);
		});
		expect(window.localStorage.getItem("theme")).toBe("dark");
	});

	it("migrates the legacy docs theme preference into the shared app theme", async () => {
		window.localStorage.setItem(DOCS_THEME_STORAGE_KEY, "dark");

		renderWithThemeProvider(<DocsThemeToggle />);

		await waitFor(() => {
			expect(window.localStorage.getItem("theme")).toBe("dark");
		});
		expect(window.localStorage.getItem(DOCS_THEME_STORAGE_KEY)).toBeNull();
		expect(document.documentElement.classList.contains("dark")).toBe(true);
		expect(document.documentElement.dataset.productTheme).toBe("dark");
		expect(document.cookie).toContain("docs-theme=dark");
	});
});
