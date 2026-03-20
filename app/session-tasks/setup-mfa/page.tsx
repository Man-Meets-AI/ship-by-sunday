import type { Metadata } from "next";
import { TaskSetupMFA } from "@clerk/nextjs";

import { AuthPageShell } from "@/features/auth/sign-in/auth-page-shell";
import { getTaskRedirectUrlComplete } from "@/features/auth/sign-in/sign-in-route-utils";

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
			title="Set up multi-factor authentication"
			description="Finish the Clerk task so we can complete your sign-in."
		>
			<TaskSetupMFA redirectUrlComplete={getTaskRedirectUrlComplete(redirectUrl)} />
		</AuthPageShell>
	);
}
