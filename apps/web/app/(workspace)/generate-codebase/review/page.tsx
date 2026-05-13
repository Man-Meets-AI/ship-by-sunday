import { redirect } from "next/navigation";

import { routeConfig } from "@/config/product";

export default function Page() {
	redirect(routeConfig.review);
}
