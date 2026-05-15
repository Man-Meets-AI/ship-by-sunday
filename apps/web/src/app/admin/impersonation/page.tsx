import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { SupportModeBar } from "@/app/_components/support-mode/support-mode-bar";
import { routeConfig } from "@/config/product";

import { AdminImpersonationPageClient } from "./_components/admin-impersonation-page-client";
import { loadAdminImpersonationPageData } from "./_server/admin-impersonation-server";

export const metadata: Metadata = {
	title: "Admin impersonation",
	robots: {
		index: false,
		follow: false,
	},
};

export default async function Page() {
	const pageData = await loadAdminImpersonationPageData();
	if (!pageData.ok) {
		if (pageData.status === 401) {
			redirect(routeConfig.signIn);
		}
		notFound();
	}

	return (
		<main className="min-h-screen bg-background text-foreground">
			<SupportModeBar initialStatus={pageData.data.status} />
			<AdminImpersonationPageClient data={pageData.data} />
		</main>
	);
}
