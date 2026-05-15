import "server-only";

import { fetchQuery } from "convex/nextjs";
import type { FunctionReturnType } from "convex/server";

import { api } from "@/convex/_generated/api";
import { getConvexServerSession } from "@/platform/auth/convex-auth";
import type { AppShellBillingAttention } from "@/app/(app)/_components/app-shell/app-shell-props";

type ViewerBillingState = FunctionReturnType<
	typeof api.billing.viewerBillingState
>;
type ReadyViewerBillingState = Extract<ViewerBillingState, { kind: "ready" }>;
type WorkersBillingAttention =
	ReadyViewerBillingState["workers"]["billingAttention"];

export function mapWorkersBillingAttentionToAppShell(
	billingAttention: WorkersBillingAttention,
): AppShellBillingAttention | null {
	if (billingAttention.kind !== "workers_past_due") {
		return null;
	}

	return {
		title: "Payment needs attention",
		message:
			"Workers access stays active during the retry window. Update the payment method to keep the workspace current.",
		statusLabel: "past_due",
		...(billingAttention.paymentRecoveryUrl
			? {
					action: {
						label: "Update payment method",
						href: billingAttention.paymentRecoveryUrl,
					},
				}
			: {}),
	};
}

export async function getServerAppShellBillingAttention(): Promise<AppShellBillingAttention | null> {
	const session = await getConvexServerSession();
	if (!session.token) {
		return null;
	}

	const billingState = (await fetchQuery(
		api.billing.viewerBillingState,
		{},
		{ token: session.token },
	)) as ViewerBillingState;

	if (billingState.kind !== "ready") {
		return null;
	}

	return mapWorkersBillingAttentionToAppShell(
		billingState.workers.billingAttention,
	);
}
