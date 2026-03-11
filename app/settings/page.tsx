import { UserProfile } from "@clerk/nextjs";

import { ProductShell } from "@/components/product-shell";
import { requireCourseAccess } from "@/lib/server/course-access";
import { getInitialProductTheme } from "@/lib/server/product-theme";

export default async function Page() {
	await requireCourseAccess();
	const initialTheme = await getInitialProductTheme();

	return (
		<ProductShell
			initialTheme={initialTheme}
			title="Settings"
			subtitle="Manage the signed-in account that owns your Ship by Sunday access."
		>
			<section className="rounded-none border border-product-border bg-product-surface/78 p-5 shadow-panel backdrop-blur-xl">
				<UserProfile path="/settings" />
			</section>
		</ProductShell>
	);
}
