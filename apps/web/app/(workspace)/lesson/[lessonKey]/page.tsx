import { redirect } from "next/navigation";
import { routeConfig } from "@/config/product";

export default async function Page() {
	redirect(routeConfig.start);
}
