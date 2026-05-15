import type { ReactNode } from "react";
import type { Metadata } from "next";

import { AppShellBillingAttentionProvider } from "@/app/(app)/_components/app-shell/app-shell-billing-attention-context";
import { AccessRequiredPage } from "@/app/(app)/_components/access-required/access-required-page";
import { WorkspaceDoctorPassToastWatcher } from "@/app/(app)/_components/existing-codebase-doctor-pass/workspace-doctor-pass-toast-watcher";
import { WorkspaceSupportWidget } from "@/app/(app)/_components/workspace-support/workspace-support-widget";
import { getServerAppShellBillingAttention } from "@/app/(app)/_server/app-shell-billing-attention";
import { starterHomePageConfig } from "@/config/product";
import { getServerProductAccess } from "@/platform/access/product-access";

export const metadata: Metadata = {
	robots: {
		index: false,
		follow: false,
	},
};

export default async function WorkspaceLayout({
	children,
}: {
	children: ReactNode;
}) {
	const access = await getServerProductAccess();

	if (access.hasAccess) {
		const billingAttention = await getServerAppShellBillingAttention();

		return (
			<AppShellBillingAttentionProvider billingAttention={billingAttention}>
				{access.fulfillmentTrack === "existing_codebase_doctor" ? (
					<WorkspaceDoctorPassToastWatcher />
				) : null}
				{children}
				{starterHomePageConfig.supportWidget.enabled ? (
					<WorkspaceSupportWidget
						fallbackHref={starterHomePageConfig.supportWidget.fallbackHref}
					/>
				) : null}
			</AppShellBillingAttentionProvider>
		);
	}

	return <AccessRequiredPage initialAccess={access} />;
}
