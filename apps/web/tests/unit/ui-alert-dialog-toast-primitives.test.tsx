/** @vitest-environment jsdom */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { toast } from "sonner";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next-themes", () => ({
	useTheme: () => ({ theme: "light" }),
}));

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogBackdrop,
	AlertDialogCancel,
	AlertDialogClose,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogMedia,
	AlertDialogOverlay,
	AlertDialogPanel,
	AlertDialogPopup,
	AlertDialogPortal,
	AlertDialogTitle,
	AlertDialogTrigger,
	AlertDialogViewport,
} from "@/components/ui/alert-dialog";
import {
	Toaster,
	toastActionButtonClassName,
	toastClassNames,
	toastCloseButtonClassName,
	toastDescriptionClassName,
	toastIconClassName,
	toastRootClassName,
	toastStyle,
	toastTitleClassName,
} from "@/components/ui/sonner";

const alertDialogSource = readFileSync(
	join(process.cwd(), "src/components/ui/alert-dialog.tsx"),
	"utf8",
);

const sonnerSource = readFileSync(
	join(process.cwd(), "src/components/ui/sonner.tsx"),
	"utf8",
);

describe("T3 Code AlertDialog and Toast primitive recipes", () => {
	afterEach(() => {
		toast.dismiss();
		cleanup();
	});

	it("keeps Radix-compatible AlertDialog exports and adds T3 aliases", () => {
		expect(AlertDialog).toBeTypeOf("function");
		expect(AlertDialogTrigger).toBeTypeOf("function");
		expect(AlertDialogPortal).toBeTypeOf("function");
		expect(AlertDialogBackdrop).toBeTypeOf("function");
		expect(AlertDialogOverlay).toBe(AlertDialogBackdrop);
		expect(AlertDialogContent).toBeTypeOf("function");
		expect(AlertDialogPopup).toBeTypeOf("function");
		expect(AlertDialogContent).toBe(AlertDialogPopup);
		expect(AlertDialogHeader).toBeTypeOf("function");
		expect(AlertDialogFooter).toBeTypeOf("function");
		expect(AlertDialogPanel).toBeTypeOf("function");
		expect(AlertDialogMedia).toBeTypeOf("function");
		expect(AlertDialogTitle).toBeTypeOf("function");
		expect(AlertDialogDescription).toBeTypeOf("function");
		expect(AlertDialogAction).toBeTypeOf("function");
		expect(AlertDialogCancel).toBeTypeOf("function");
		expect(AlertDialogClose).toBeTypeOf("function");
		expect(AlertDialogViewport).toBeTypeOf("function");
	});

	it("renders AlertDialog through Radix while exposing the T3 popup structure", () => {
		render(
			<AlertDialog open>
				<AlertDialogContent size="sm" data-testid="danger-dialog">
					<AlertDialogHeader>
						<AlertDialogMedia>!</AlertDialogMedia>
						<AlertDialogTitle>Delete workspace?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogPanel>Workspace files stay on disk.</AlertDialogPanel>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction variant="destructive">Delete</AlertDialogAction>
					</AlertDialogFooter>
					<AlertDialogClose>Close</AlertDialogClose>
				</AlertDialogContent>
			</AlertDialog>,
		);

		const dialog = screen.getByRole("alertdialog", {
			name: "Delete workspace?",
		});
		const viewport = document.querySelector(
			'[data-slot="alert-dialog-viewport"]',
		);

		expect(dialog.getAttribute("data-slot")).toBe("alert-dialog-popup");
		expect(dialog.getAttribute("data-size")).toBe("sm");
		expect(dialog.className).toContain("rounded-2xl");
		expect(dialog.className).toContain("bg-popover");
		expect(dialog.className).toContain("not-dark:bg-clip-padding");
		expect(viewport?.className).toContain("bg-white/48");
		expect(
			screen
				.getByText("Workspace files stay on disk.")
				.closest("[data-slot]")
				?.getAttribute("data-slot"),
		).toBe("alert-dialog-panel");
		expect(
			screen.getByRole("button", { name: "Delete" }).getAttribute("data-slot"),
		).toBe("alert-dialog-action");
		expect(
			screen.getByRole("button", { name: "Cancel" }).getAttribute("data-slot"),
		).toBe("alert-dialog-cancel");
	});

	it("exposes T3 Sonner class recipes through supported Sonner slots", async () => {
		const undo = vi.fn();
		render(<Toaster duration={Infinity} visibleToasts={1} />);

		toast.success("Codebase saved", {
			action: {
				label: "Undo",
				onClick: undo,
			},
			description: "Your local draft is ready.",
			duration: Infinity,
		});

		await screen.findByText("Codebase saved");

		const toastRoot = screen
			.getByText("Codebase saved")
			.closest("[data-sonner-toast]");
		expect(toastRoot?.getAttribute("data-type")).toBe("success");
		expect(toastRoot?.className).toContain("bg-popover");
		expect(toastRoot?.className).toContain("not-dark:bg-clip-padding");
		expect(toastRoot?.querySelector("[data-icon]")?.className).toContain(
			"h-lh",
		);
		expect(screen.getByText("Your local draft is ready.").className).toContain(
			"text-muted-foreground",
		);
		expect(screen.getByRole("button", { name: "Undo" }).className).toContain(
			"h-7",
		);
		expect(
			screen.getByRole("button", { name: "Close toast" }).className,
		).toContain("-top-1.5");
	});

	it("keeps exported toast recipe tokens aligned with the T3 popup surface", () => {
		expect(toastClassNames.toast).toBe(toastRootClassName);
		expect(toastClassNames.title).toBe(toastTitleClassName);
		expect(toastClassNames.description).toBe(toastDescriptionClassName);
		expect(toastClassNames.icon).toBe(toastIconClassName);
		expect(toastClassNames.closeButton).toBe(toastCloseButtonClassName);
		expect(toastClassNames.actionButton).toBe(toastActionButtonClassName);
		expect(toastStyle).toMatchObject({
			"--normal-bg": "var(--popover)",
			"--normal-border": "var(--border)",
			"--normal-text": "var(--popover-foreground)",
		});
		expect(toastRootClassName).toContain("before:shadow-[0_1px_--theme");
		expect(toastCloseButtonClassName).toContain("rounded-full");
	});

	it("copies T3 alert dialog and toast surface tokens without adding Base UI", () => {
		expect(alertDialogSource).toContain('data-slot="alert-dialog-backdrop"');
		expect(alertDialogSource).toContain(
			"AlertDialogBackdrop as AlertDialogOverlay",
		);
		expect(alertDialogSource).toContain('data-slot="alert-dialog-viewport"');
		expect(alertDialogSource).toContain("bg-white/48");
		expect(alertDialogSource).toContain("dark:bg-black/28");
		expect(alertDialogSource).toContain(
			'data-slot={dataSlot ?? "alert-dialog-popup"}',
		);
		expect(alertDialogSource).toContain(
			"AlertDialogPopup as AlertDialogContent",
		);
		expect(alertDialogSource).toContain("bottomStickOnMobile");
		expect(alertDialogSource).toContain('variant === "bare"');
		expect(alertDialogSource).toContain("bg-popover");
		expect(alertDialogSource).toContain("text-popover-foreground");
		expect(alertDialogSource).toContain("not-dark:bg-clip-padding");
		expect(alertDialogSource).toContain(
			"before:shadow-[0_1px_--theme(--color-black/4%)]",
		);
		expect(alertDialogSource).toContain("data-[state=open]:animate-in");

		expect(sonnerSource).toContain("toastRootClassName");
		expect(sonnerSource).toContain("toastClassNames");
		expect(sonnerSource).toContain("closeButton = true");
		expect(sonnerSource).toContain("rounded-lg border bg-popover");
		expect(sonnerSource).toContain("not-dark:bg-clip-padding");
		expect(sonnerSource).toContain("before:shadow-[0_1px_--theme");
		expect(sonnerSource).toContain('buttonVariants({ size: "xs"');
		expect(`${alertDialogSource}\n${sonnerSource}`).not.toContain(
			"@base-ui/react",
		);
	});
});
