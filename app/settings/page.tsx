"use client";

import { UserProfile } from "@clerk/nextjs";

import { ProductShell } from "@/components/product-shell";
import { ViewerGate } from "@/components/viewer-gate";

export default function Page() {
	return (
		<ProductShell
			title="Settings"
			subtitle="Manage the signed-in account that owns your Ship by Sunday access."
		>
			<ViewerGate>
				<section className="border border-line bg-white p-5 shadow-card">
					<UserProfile path="/settings" />
				</section>
			</ViewerGate>
		</ProductShell>
	);
}
