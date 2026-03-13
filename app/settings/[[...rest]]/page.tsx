import { UserProfile } from "@clerk/nextjs";

import { CodexConnectionCard } from "@/components/codex-connection-card";
import { ProductShell } from "@/components/product-shell";
import { requireCourseAccess } from "@/lib/server/course-access";
import { getInitialProductTheme } from "@/lib/server/product-theme";

export default async function Page() {
	await requireCourseAccess();
	const initialTheme = await getInitialProductTheme();

	return (
		<ProductShell
			initialTheme={initialTheme}
			viewportMode="app"
			showSkillRail={false}
		>
			<div className="flex flex-1 flex-col gap-3 xl:min-h-0 xl:overflow-y-auto">
				<section className="rounded-none border border-product-border bg-product-surface/78 p-5 shadow-panel backdrop-blur-xl">
					<p className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
						Account settings
					</p>
					<h1 className="mt-3 font-display text-4xl uppercase leading-none tracking-[0.08em] text-product-text">
						Manage your account
					</h1>
					<p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-product-muted">
						Manage the signed-in account that owns your Ship by Sunday access.
					</p>
				</section>

				<CodexConnectionCard />

				<section className="overflow-hidden rounded-none border border-product-border bg-product-surface/78 p-2 shadow-panel backdrop-blur-xl sm:p-4">
					<UserProfile path="/settings" />
				</section>
			</div>
		</ProductShell>
	);
}
