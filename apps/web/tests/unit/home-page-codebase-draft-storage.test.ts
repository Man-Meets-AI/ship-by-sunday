import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
	HOME_PAGE_CODEBASE_DRAFT_STORAGE_KEY,
	type HomePageCodebaseDraftFields,
	clearHomePageCodebaseDraft,
	loadHomePageCodebaseDraft,
	parseHomePageCodebaseDraftEnvelope,
	saveHomePageCodebaseDraft,
} from "@/app/_components/home-page/sections/codebase-demo/home-page-codebase-draft-storage";

const baseFields: HomePageCodebaseDraftFields = {
	product_name: "Telemetry Pro",
	product_summary: "A focused telemetry workspace for solo founders.",
	primary_user: "Solo founders shipping in public",
	design_preset_id: "linear",
	theme_preset: "abc123",
	pricing_model: "monthly",
	pricing: "29",
};

class InMemoryStorage {
	private readonly store = new Map<string, string>();

	getItem(key: string): string | null {
		return this.store.has(key) ? (this.store.get(key) ?? null) : null;
	}

	setItem(key: string, value: string): void {
		this.store.set(key, value);
	}

	removeItem(key: string): void {
		this.store.delete(key);
	}

	clear(): void {
		this.store.clear();
	}

	get length(): number {
		return this.store.size;
	}

	key(index: number): string | null {
		return Array.from(this.store.keys())[index] ?? null;
	}
}

const originalWindow = globalThis.window;

function installWindowWithStorage(storage: InMemoryStorage) {
	(globalThis as { window: { localStorage: InMemoryStorage } }).window = {
		localStorage: storage,
	};
}

function removeWindow() {
	delete (globalThis as Record<string, unknown>).window;
}

describe("home page codebase draft storage parser", () => {
	it("returns null when JSON is invalid", () => {
		expect(parseHomePageCodebaseDraftEnvelope("not json")).toBeNull();
	});

	it("returns null when version is missing or wrong", () => {
		expect(
			parseHomePageCodebaseDraftEnvelope(
				JSON.stringify({ savedAt: 1, fields: baseFields }),
			),
		).toBeNull();
		expect(
			parseHomePageCodebaseDraftEnvelope(
				JSON.stringify({ version: 2, savedAt: 1, fields: baseFields }),
			),
		).toBeNull();
	});

	it("returns null when an unknown field key is present", () => {
		const corruptFields = { ...baseFields, evil_extra: "nope" };
		expect(
			parseHomePageCodebaseDraftEnvelope(
				JSON.stringify({
					version: 1,
					savedAt: 123,
					fields: corruptFields,
				}),
			),
		).toBeNull();
	});

	it("returns null when pricing is non-numeric or negative", () => {
		expect(
			parseHomePageCodebaseDraftEnvelope(
				JSON.stringify({
					version: 1,
					savedAt: 1,
					fields: { ...baseFields, pricing: "free" },
				}),
			),
		).toBeNull();
		expect(
			parseHomePageCodebaseDraftEnvelope(
				JSON.stringify({
					version: 1,
					savedAt: 1,
					fields: { ...baseFields, pricing: "-5" },
				}),
			),
		).toBeNull();
	});

	it("accepts an empty pricing string", () => {
		const envelope = parseHomePageCodebaseDraftEnvelope(
			JSON.stringify({
				version: 1,
				savedAt: 1,
				fields: { ...baseFields, pricing: "" },
			}),
		);
		expect(envelope?.fields.pricing).toBe("");
	});

	it("returns null for an unsupported pricing_model", () => {
		expect(
			parseHomePageCodebaseDraftEnvelope(
				JSON.stringify({
					version: 1,
					savedAt: 1,
					fields: { ...baseFields, pricing_model: "weekly" },
				}),
			),
		).toBeNull();
	});
});

describe("home page codebase draft storage IO", () => {
	beforeEach(() => {
		removeWindow();
	});

	afterEach(() => {
		if (originalWindow) {
			(globalThis as { window: typeof originalWindow }).window = originalWindow;
		} else {
			removeWindow();
		}
		vi.restoreAllMocks();
	});

	it("returns null on load and is a no-op on save when window is absent", () => {
		expect(loadHomePageCodebaseDraft()).toBeNull();
		expect(() => saveHomePageCodebaseDraft(baseFields)).not.toThrow();
		expect(() => clearHomePageCodebaseDraft()).not.toThrow();
	});

	it("round-trips a saved draft", () => {
		const storage = new InMemoryStorage();
		installWindowWithStorage(storage);

		saveHomePageCodebaseDraft(baseFields);
		const persisted = storage.getItem(HOME_PAGE_CODEBASE_DRAFT_STORAGE_KEY);
		expect(persisted).not.toBeNull();
		const envelope = parseHomePageCodebaseDraftEnvelope(persisted ?? "");
		expect(envelope?.version).toBe(1);
		expect(envelope?.fields).toEqual(baseFields);
		expect(loadHomePageCodebaseDraft()).toEqual(baseFields);
	});

	it("clears a saved draft", () => {
		const storage = new InMemoryStorage();
		installWindowWithStorage(storage);

		saveHomePageCodebaseDraft(baseFields);
		clearHomePageCodebaseDraft();
		expect(loadHomePageCodebaseDraft()).toBeNull();
		expect(storage.getItem(HOME_PAGE_CODEBASE_DRAFT_STORAGE_KEY)).toBeNull();
	});

	it("returns null when the persisted envelope has the wrong version", () => {
		const storage = new InMemoryStorage();
		installWindowWithStorage(storage);
		storage.setItem(
			HOME_PAGE_CODEBASE_DRAFT_STORAGE_KEY,
			JSON.stringify({ version: 99, savedAt: 1, fields: baseFields }),
		);
		expect(loadHomePageCodebaseDraft()).toBeNull();
	});

	it("returns null when the persisted JSON is corrupt", () => {
		const storage = new InMemoryStorage();
		installWindowWithStorage(storage);
		storage.setItem(HOME_PAGE_CODEBASE_DRAFT_STORAGE_KEY, "{not-json");
		expect(loadHomePageCodebaseDraft()).toBeNull();
	});
});
