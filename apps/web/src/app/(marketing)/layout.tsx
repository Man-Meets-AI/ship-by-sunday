import type { ReactNode } from "react";

import { PublicSupportWidget } from "@/components/layout/public-support-widget";

export default function MarketingLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	return (
		<>
			{children}
			<PublicSupportWidget />
		</>
	);
}
