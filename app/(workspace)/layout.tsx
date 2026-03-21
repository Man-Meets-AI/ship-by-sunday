import type { ReactNode } from "react";
import type { Metadata } from "next";

import { AccessRequiredPage } from "@/features/product-access/components/access-required-page";
import { getServerProductAccess } from "@/features/product-access/server/product-access";

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
		return children;
	}

	return <AccessRequiredPage initialAccess={access} />;
}
