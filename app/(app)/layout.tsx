import type { ReactNode } from "react";
import type { Metadata } from "next";

import { requireProductAccess } from "@/features/product-access/server/product-access";

export const metadata: Metadata = {
	robots: {
		index: false,
		follow: false,
	},
};

export default async function AppLayout({ children }: { children: ReactNode }) {
	await requireProductAccess();

	return children;
}
