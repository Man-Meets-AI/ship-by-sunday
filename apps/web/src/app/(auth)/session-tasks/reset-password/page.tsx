import type { Metadata } from "next";
import { TaskResetPassword } from "@clerk/nextjs";

import { AuthPageShell } from "@/app/(auth)/_components/auth-page-shell";
import { resetPasswordSupportPanelContent } from "@/app/(auth)/_lib/identity-route-panel-content";
import { getTaskRedirectUrlComplete } from "@/platform/auth/auth-route-utils";

export const metadata: Metadata = {
	robots: {
		index: false,
		follow: false,
	},
};

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<{ redirect_url?: string }>;
}) {
	const { redirect_url: redirectUrl } = await searchParams;

	return (
		<AuthPageShell
			title="Reset your password"
			description="Finish the Clerk task so we can complete your sign-in."
			supportPanel={resetPasswordSupportPanelContent}
		>
			<TaskResetPassword
				redirectUrlComplete={getTaskRedirectUrlComplete(redirectUrl)}
			/>
		</AuthPageShell>
	);
}
