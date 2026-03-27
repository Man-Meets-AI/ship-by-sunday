"use client";

import { IconCloud } from "@/components/ui/icon-cloud";
import { getProviderIconNodes } from "./provider-icons";

export function TechStackCloud() {
	const icons = getProviderIconNodes();

	return (
		<div className="relative flex items-center justify-center">
			<IconCloud icons={icons} />
		</div>
	);
}
