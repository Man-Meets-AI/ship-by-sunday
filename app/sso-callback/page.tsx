import { SsoCallbackPage } from "@/features/auth/sign-in/sso-callback-page";

export default async function Page({
	searchParams,
}: {
	searchParams: Promise<{ redirect_url?: string }>;
}) {
	const { redirect_url: redirectUrl } = await searchParams;

	return <SsoCallbackPage redirectPath={redirectUrl ?? null} />;
}
