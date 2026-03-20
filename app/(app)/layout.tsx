import type { ReactNode } from "react";

import { requireProductAccess } from "@/features/product-access/server/product-access";

export default async function AppLayout({ children }: { children: ReactNode }) {
	await requireProductAccess();

	return children;
}
