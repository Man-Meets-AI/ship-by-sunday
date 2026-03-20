import type { Metadata } from "next";
import { SsoCallbackPage } from "@/features/auth/sign-in/sso-callback-page";

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

	return <SsoCallbackPage redirectPath={redirectUrl ?? null} />;
}
