import { redirect } from "next/navigation";

import { routeConfig } from "@/config/product";

export default function TutorialsPage() {
	redirect(routeConfig.tutorials);
}
