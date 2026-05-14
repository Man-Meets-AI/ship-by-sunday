import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { WorkerSealTeam6CalBooking } from "@/app/(marketing)/worker-seal-team-6/_components/worker-seal-team-6-cal-booking";

describe("WorkerSealTeam6CalBooking", () => {
	afterEach(() => {
		delete window.Cal;
		document
			.querySelectorAll("[data-worker-seal-team-6-cal-embed-script]")
			.forEach((script) => script.remove());
	});

	it("renders the direct scheduling fallback when no Cal.com link is configured", () => {
		render(
			<WorkerSealTeam6CalBooking
				calLink={null}
				calOrigin="https://cal.com"
				hostedBookingUrl={null}
				directSchedulingHref="https://t.me/parkerrex"
			/>,
		);

		expect(screen.getByText("Direct scheduling")).toBeTruthy();
		expect(
			screen.getByRole("link", { name: /Start direct scheduling/i }).href,
		).toBe("https://t.me/parkerrex");
		expect(
			document.querySelector("[data-worker-seal-team-6-cal-embed-script]"),
		).toBeNull();
	});

	it("loads the Cal.com embed and keeps hosted/direct fallbacks", async () => {
		render(
			<WorkerSealTeam6CalBooking
				calLink="parker/worker-seal-team-6"
				calOrigin="https://cal.com"
				hostedBookingUrl="https://cal.com/parker/worker-seal-team-6"
				directSchedulingHref="https://t.me/parkerrex"
			/>,
		);

		expect(screen.getByTestId("worker-seal-team-6-cal-embed")).toBeTruthy();
		expect(
			screen.getByRole("link", { name: /Open hosted booking page/i }).href,
		).toBe("https://cal.com/parker/worker-seal-team-6");
		expect(screen.getByRole("link", { name: /Direct backup/i }).href).toBe(
			"https://t.me/parkerrex",
		);

		await waitFor(() => {
			const script = document.querySelector<HTMLScriptElement>(
				"[data-worker-seal-team-6-cal-embed-script]",
			);
			expect(script?.src).toBe("https://cal.com/embed/embed.js");
			expect(script?.dataset.calEmbedOrigin).toBe("https://cal.com");
		});
		expect(window.Cal?.ns?.["worker-seal-team-6"]?.q).toContainEqual([
			"inline",
			expect.objectContaining({
				calLink: "parker/worker-seal-team-6",
			}),
		]);
	});
});
