import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { routeConfig } from "@/config/product";

export const metadata: Metadata = {
	robots: {
		index: false,
		follow: false,
	},
};

export default async function Page() {
	redirect(routeConfig.start);
}
