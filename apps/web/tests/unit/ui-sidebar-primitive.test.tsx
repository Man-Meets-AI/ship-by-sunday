/** @vitest-environment jsdom */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import React from "react";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
	Sidebar,
	SidebarContent,
	SidebarInset,
	SidebarProvider,
	SidebarRail,
} from "@/components/ui/sidebar";

const sidebarSource = readFileSync(
	join(process.cwd(), "src/components/ui/sidebar.tsx"),
	"utf8",
);

const originalRequestAnimationFrame = window.requestAnimationFrame;
const originalCancelAnimationFrame = window.cancelAnimationFrame;

function createMemoryStorage(): Storage {
	const store = new Map<string, string>();

	return {
		get length() {
			return store.size;
		},
		clear: vi.fn(() => store.clear()),
		getItem: vi.fn((key: string) => store.get(key) ?? null),
		key: vi.fn((index: number) => Array.from(store.keys())[index] ?? null),
		removeItem: vi.fn((key: string) => store.delete(key)),
		setItem: vi.fn((key: string, value: string) => {
			store.set(key, value);
		}),
	} as Storage;
}

function installLocalStorage() {
	Object.defineProperty(window, "localStorage", {
		configurable: true,
		value: createMemoryStorage(),
	});
}

function installDesktopMediaQuery() {
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
}

function renderResizableSidebar({
	onResize = vi.fn(),
	onRailClick,
	shouldAcceptWidth,
}: {
	onResize?: (width: number) => void;
	onRailClick?: React.MouseEventHandler<HTMLButtonElement>;
	shouldAcceptWidth?: (context: {
		currentWidth: number;
		nextWidth: number;
		wrapper: HTMLElement;
	}) => boolean;
} = {}) {
	return render(
		<SidebarProvider>
			<Sidebar
				resizable={{
					minWidth: 224,
					maxWidth: 360,
					onResize,
					shouldAcceptWidth,
					storageKey: "sidebar-test-width",
				}}
			>
				<SidebarContent>
					<div>Navigation</div>
				</SidebarContent>
				<SidebarRail onClick={onRailClick} />
			</Sidebar>
			<SidebarInset>Main content</SidebarInset>
		</SidebarProvider>,
	);
}

beforeEach(() => {
	installLocalStorage();
	installDesktopMediaQuery();
	window.requestAnimationFrame = (callback: FrameRequestCallback) => {
		callback(0);
		return 1;
	};
	window.cancelAnimationFrame = vi.fn();
	HTMLElement.prototype.setPointerCapture = vi.fn();
	HTMLElement.prototype.releasePointerCapture = vi.fn();
	HTMLElement.prototype.hasPointerCapture = vi.fn(() => true);
});

afterEach(() => {
	cleanup();
	window.requestAnimationFrame = originalRequestAnimationFrame;
	window.cancelAnimationFrame = originalCancelAnimationFrame;
	vi.restoreAllMocks();
});

describe("T3 Code Sidebar primitive adapter", () => {
	it("keeps Radix-compatible exports while adding T3 scroll and resize recipes", async () => {
		const onResize = vi.fn();
		window.localStorage.setItem("sidebar-test-width", "512");

		renderResizableSidebar({ onResize });

		const wrapper = document.querySelector<HTMLElement>(
			'[data-slot="sidebar-wrapper"]',
		);
		const content = document.querySelector<HTMLElement>(
			'[data-slot="sidebar-content"]',
		);
		const viewport = document.querySelector<HTMLElement>(
			'[data-slot="scroll-area-viewport"]',
		);

		await waitFor(() => {
			expect(wrapper?.style.getPropertyValue("--sidebar-width")).toBe("360px");
		});
		expect(onResize).toHaveBeenCalledWith(360);
		expect(content?.className).toContain("gap-2");
		expect(viewport?.className).toContain("mask-t-from");
		expect(sidebarSource).toContain("resizable?: boolean");
		expect(sidebarSource).toContain("SidebarInstanceContext");
		expect(sidebarSource).toContain("TooltipProvider delayDuration={0}");
		expect(sidebarSource).toContain(
			'const SIDEBAR_WIDTH_MOBILE = "calc(100vw - 0.75rem)"',
		);
		expect(sidebarSource).not.toContain("var(--spacing(3))");
		expect(sidebarSource).toContain("group-data-[side=right]:left-0 md:flex");
		expect(sidebarSource).not.toContain("sm:flex");
		expect(sidebarSource).not.toContain("@base-ui/react");
		expect(sidebarSource).not.toContain("effect/Schema");
	});

	it("persists accepted drag widths and suppresses the click that follows a drag", () => {
		const onResize = vi.fn();
		renderResizableSidebar({ onResize });

		const root = document.querySelector<HTMLElement>('[data-slot="sidebar"]');
		const container = document.querySelector<HTMLElement>(
			'[data-slot="sidebar-container"]',
		);
		const wrapper = document.querySelector<HTMLElement>(
			'[data-slot="sidebar-wrapper"]',
		);
		const rail = document.querySelector<HTMLButtonElement>(
			'[data-slot="sidebar-rail"]',
		);

		expect(root?.getAttribute("data-state")).toBe("expanded");
		expect(container).toBeTruthy();
		expect(rail).toBeTruthy();
		container!.getBoundingClientRect = () =>
			({
				width: 260,
				height: 800,
				top: 0,
				left: 0,
				right: 260,
				bottom: 800,
				x: 0,
				y: 0,
				toJSON: () => ({}),
			}) as DOMRect;

		fireEvent.pointerDown(rail!, { button: 0, clientX: 260, pointerId: 7 });
		fireEvent.pointerMove(rail!, { clientX: 300, pointerId: 7 });
		fireEvent.pointerUp(rail!, { pointerId: 7 });
		fireEvent.click(rail!);

		expect(wrapper?.style.getPropertyValue("--sidebar-width")).toBe("300px");
		expect(window.localStorage.getItem("sidebar-test-width")).toBe("300");
		expect(onResize).toHaveBeenLastCalledWith(300);
		expect(root?.getAttribute("data-state")).toBe("expanded");
	});

	it("flushes the final pending drag width before a delayed animation frame runs", () => {
		const onResize = vi.fn();
		const cancelAnimationFrame = vi.fn();
		window.requestAnimationFrame = vi.fn(
			(_callback: FrameRequestCallback) => 41,
		);
		window.cancelAnimationFrame = cancelAnimationFrame;
		renderResizableSidebar({ onResize });

		const container = document.querySelector<HTMLElement>(
			'[data-slot="sidebar-container"]',
		);
		const wrapper = document.querySelector<HTMLElement>(
			'[data-slot="sidebar-wrapper"]',
		);
		const rail = document.querySelector<HTMLButtonElement>(
			'[data-slot="sidebar-rail"]',
		);

		container!.getBoundingClientRect = () =>
			({
				width: 260,
				height: 800,
				top: 0,
				left: 0,
				right: 260,
				bottom: 800,
				x: 0,
				y: 0,
				toJSON: () => ({}),
			}) as DOMRect;

		fireEvent.pointerDown(rail!, { button: 0, clientX: 260, pointerId: 9 });
		fireEvent.pointerMove(rail!, { clientX: 315, pointerId: 9 });
		fireEvent.pointerUp(rail!, { pointerId: 9 });

		expect(cancelAnimationFrame).toHaveBeenCalledWith(41);
		expect(wrapper?.style.getPropertyValue("--sidebar-width")).toBe("315px");
		expect(window.localStorage.getItem("sidebar-test-width")).toBe("315");
		expect(onResize).toHaveBeenLastCalledWith(315);
	});

	it("suppresses caller click handlers after a resize drag", () => {
		const onRailClick = vi.fn();
		renderResizableSidebar({ onRailClick });

		const container = document.querySelector<HTMLElement>(
			'[data-slot="sidebar-container"]',
		);
		const rail = document.querySelector<HTMLButtonElement>(
			'[data-slot="sidebar-rail"]',
		);
		container!.getBoundingClientRect = () =>
			({
				width: 260,
				height: 800,
				top: 0,
				left: 0,
				right: 260,
				bottom: 800,
				x: 0,
				y: 0,
				toJSON: () => ({}),
			}) as DOMRect;

		fireEvent.pointerDown(rail!, { button: 0, clientX: 260, pointerId: 10 });
		fireEvent.pointerMove(rail!, { clientX: 300, pointerId: 10 });
		fireEvent.pointerUp(rail!, { pointerId: 10 });
		fireEvent.click(rail!);

		expect(onRailClick).not.toHaveBeenCalled();
	});

	it("rejects drag widths that would violate the caller's main-content guard", () => {
		renderResizableSidebar({
			shouldAcceptWidth: ({ nextWidth }) => nextWidth <= 280,
		});

		const container = document.querySelector<HTMLElement>(
			'[data-slot="sidebar-container"]',
		);
		const wrapper = document.querySelector<HTMLElement>(
			'[data-slot="sidebar-wrapper"]',
		);
		const rail = document.querySelector<HTMLButtonElement>(
			'[data-slot="sidebar-rail"]',
		);

		container!.getBoundingClientRect = () =>
			({
				width: 260,
				height: 800,
				top: 0,
				left: 0,
				right: 260,
				bottom: 800,
				x: 0,
				y: 0,
				toJSON: () => ({}),
			}) as DOMRect;

		fireEvent.pointerDown(rail!, { button: 0, clientX: 260, pointerId: 8 });
		fireEvent.pointerMove(rail!, { clientX: 340, pointerId: 8 });

		expect(wrapper?.style.getPropertyValue("--sidebar-width")).toBe("260px");
	});
});
