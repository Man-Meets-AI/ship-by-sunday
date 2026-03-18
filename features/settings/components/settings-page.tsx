import { UserProfile } from "@clerk/nextjs";

import { CodexConnectionCard } from "@/features/codex/components/codex-connection-card";
import { ProductShell } from "@/features/course/shared/components/product-shell";
import { StarterRepoAccessCard } from "@/features/starter-repo/components/starter-repo-access-card";

export function SettingsPage() {
	return (
		<ProductShell viewportMode="app" showSkillRail={false}>
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

				<StarterRepoAccessCard surface="settings" />

				<section className="overflow-hidden rounded-none border border-product-border bg-product-surface/78 p-2 shadow-panel backdrop-blur-xl sm:p-4">
					<UserProfile path="/settings" />
				</section>
			</div>
		</ProductShell>
	);
}
