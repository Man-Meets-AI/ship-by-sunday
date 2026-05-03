/** @vitest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CodexConnectionCardActions } from "@/app/(workspace)/_components/codex-connection-card/codex-connection-card-actions";

describe("CodexConnectionCardActions", () => {
	it("opens a confirmation dialog before disconnecting", async () => {
		const onDisconnectAccount = vi.fn().mockResolvedValue(undefined);
		const user = userEvent.setup();

		render(
			<CodexConnectionCardActions
				connected
				requestState="idle"
				onStartManagedLogin={vi.fn()}
				onPollLoginStatus={vi.fn()}
				onRefreshRateLimits={vi.fn()}
				onDisconnectAccount={onDisconnectAccount}
			/>,
		);

		await user.click(screen.getByTestId("codex-connection-disconnect-trigger"));
		expect(
			await screen.findByRole("alertdialog", {
				name: /disconnect codex account/i,
			}),
		).toBeTruthy();

		await user.click(screen.getByTestId("codex-connection-disconnect-confirm"));
		expect(onDisconnectAccount).toHaveBeenCalledTimes(1);
	});

	it("renders connect and poll actions when disconnected", () => {
		render(
			<CodexConnectionCardActions
				connected={false}
				requestState="idle"
				onStartManagedLogin={vi.fn()}
				onPollLoginStatus={vi.fn()}
				onRefreshRateLimits={vi.fn()}
				onDisconnectAccount={vi.fn()}
			/>,
		);

		expect(screen.getByTestId("codex-connection-start-login")).toBeTruthy();
		expect(screen.getByTestId("codex-connection-poll-status")).toBeTruthy();
	});
});
