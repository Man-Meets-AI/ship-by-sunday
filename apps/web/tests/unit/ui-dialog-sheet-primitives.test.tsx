/** @vitest-environment jsdom */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
	Dialog,
	DialogBackdrop,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogOverlay,
	DialogPanel,
	DialogPopup,
	DialogPortal,
	DialogTitle,
	DialogTrigger,
	DialogViewport,
} from "@/components/ui/dialog";
import {
	Sheet,
	SheetBackdrop,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetOverlay,
	SheetPanel,
	SheetPopup,
	SheetPortal,
	SheetTitle,
	SheetTrigger,
	SheetViewport,
} from "@/components/ui/sheet";

const dialogSource = readFileSync(
	join(process.cwd(), "src/components/ui/dialog.tsx"),
	"utf8",
);

const sheetSource = readFileSync(
	join(process.cwd(), "src/components/ui/sheet.tsx"),
	"utf8",
);

describe("T3 Code Dialog and Sheet primitive recipes", () => {
	afterEach(() => {
		cleanup();
	});

	it("keeps Radix-compatible Dialog exports and adds T3 aliases", () => {
		expect(Dialog).toBeTypeOf("function");
		expect(DialogTrigger).toBeTypeOf("function");
		expect(DialogPortal).toBeTypeOf("function");
		expect(DialogClose).toBeTypeOf("function");
		expect(DialogBackdrop).toBeTypeOf("function");
		expect(DialogOverlay).toBe(DialogBackdrop);
		expect(DialogContent).toBeTypeOf("function");
		expect(DialogPopup).toBeTypeOf("function");
		expect(DialogContent).toBe(DialogPopup);
		expect(DialogHeader).toBeTypeOf("function");
		expect(DialogFooter).toBeTypeOf("function");
		expect(DialogTitle).toBeTypeOf("function");
		expect(DialogDescription).toBeTypeOf("function");
		expect(DialogPanel).toBeTypeOf("function");
		expect(DialogViewport).toBeTypeOf("function");
	});

	it("keeps Radix-compatible Sheet exports and adds T3 aliases", () => {
		expect(Sheet).toBeTypeOf("function");
		expect(SheetTrigger).toBeTypeOf("function");
		expect(SheetPortal).toBeTypeOf("function");
		expect(SheetClose).toBeTypeOf("function");
		expect(SheetBackdrop).toBeTypeOf("function");
		expect(SheetOverlay).toBe(SheetBackdrop);
		expect(SheetContent).toBeTypeOf("function");
		expect(SheetPopup).toBeTypeOf("function");
		expect(SheetContent).toBe(SheetPopup);
		expect(SheetHeader).toBeTypeOf("function");
		expect(SheetFooter).toBeTypeOf("function");
		expect(SheetTitle).toBeTypeOf("function");
		expect(SheetDescription).toBeTypeOf("function");
		expect(SheetPanel).toBeTypeOf("function");
		expect(SheetViewport).toBeTypeOf("function");
	});

	it("renders Dialog through Radix while exposing the T3 popup structure", () => {
		render(
			<Dialog open>
				<DialogContent showCloseButton={false}>
					<DialogHeader>
						<DialogTitle>Connect account</DialogTitle>
						<DialogDescription>Sign in before drafting.</DialogDescription>
					</DialogHeader>
					<DialogPanel>Body</DialogPanel>
					<DialogFooter variant="bare">
						<button type="button">Cancel</button>
					</DialogFooter>
				</DialogContent>
			</Dialog>,
		);

		const dialog = screen.getByRole("dialog", { name: "Connect account" });
		const viewport = document.querySelector('[data-slot="dialog-viewport"]');

		expect(dialog.getAttribute("data-slot")).toBe("dialog-popup");
		expect(dialog.className).toContain("rounded-2xl");
		expect(dialog.className).toContain("bg-popover");
		expect(viewport?.className).toContain("bg-white/48");
		expect(
			screen
				.getByText("Body")
				.closest("[data-slot]")
				?.getAttribute("data-slot"),
		).toBe("dialog-panel");
	});

	it("preserves SheetContent side props and custom data-slot passthrough", () => {
		render(
			<Sheet open>
				<SheetContent
					data-slot="sidebar"
					side="left"
					showCloseButton={false}
					variant="inset"
				>
					<SheetHeader>
						<SheetTitle>Navigation</SheetTitle>
						<SheetDescription>Workspace links</SheetDescription>
					</SheetHeader>
					<SheetPanel>Mobile links</SheetPanel>
					<SheetFooter variant="bare">
						<button type="button">Done</button>
					</SheetFooter>
				</SheetContent>
			</Sheet>,
		);

		const sheet = screen.getByRole("dialog", { name: "Navigation" });
		const viewport = document.querySelector('[data-slot="sheet-viewport"]');

		expect(sheet.getAttribute("data-slot")).toBe("sidebar");
		expect(sheet.getAttribute("data-side")).toBe("left");
		expect(sheet.className).toContain("max-w-md");
		expect(sheet.className).toContain("sm:rounded-2xl");
		expect(viewport?.className).toContain("justify-start");
		expect(
			screen
				.getByText("Mobile links")
				.closest("[data-slot]")
				?.getAttribute("data-slot"),
		).toBe("sheet-panel");
	});

	it("copies T3 modal surface tokens onto Dialog and Sheet sources", () => {
		expect(dialogSource).toContain('data-slot="dialog-backdrop"');
		expect(dialogSource).toContain("DialogBackdrop as DialogOverlay");
		expect(dialogSource).toContain('data-slot="dialog-viewport"');
		expect(dialogSource).toContain("bg-white/48");
		expect(dialogSource).toContain("dark:bg-black/28");
		expect(dialogSource).toContain('data-slot="dialog-popup"');
		expect(dialogSource).toContain("DialogPopup as DialogContent");
		expect(dialogSource).toContain("bottomStickOnMobile");
		expect(dialogSource).toContain('variant === "bare"');
		expect(dialogSource).not.toContain("DialogCreateHandle");

		expect(sheetSource).toContain('data-slot="sheet-backdrop"');
		expect(sheetSource).toContain("SheetBackdrop as SheetOverlay");
		expect(sheetSource).toContain('data-slot="sheet-viewport"');
		expect(sheetSource).toContain('data-slot="sheet-popup"');
		expect(sheetSource).toContain("SheetPopup as SheetContent");
		expect(sheetSource).toContain('side === "right"');
		expect(sheetSource).toContain('variant === "inset"');
		expect(sheetSource).toContain("keepMounted");

		for (const source of [dialogSource, sheetSource]) {
			expect(source).toContain("bg-popover");
			expect(source).toContain("text-popover-foreground");
			expect(source).toContain("not-dark:bg-clip-padding");
			expect(source).toContain(
				"before:shadow-[0_1px_--theme(--color-black/4%)]",
			);
			expect(source).toContain("data-[state=open]:animate-in");
			expect(source).toContain("data-ending-style:opacity-0");
		}
	});
});
