import Link from "next/link";

import type { AppShellBillingAttention } from "@/app/(app)/_components/app-shell/app-shell-props";

type AppShellBillingAttentionBannerProps = {
	billingAttention?: AppShellBillingAttention | null;
};

export function AppShellBillingAttentionBanner({
	billingAttention,
}: AppShellBillingAttentionBannerProps) {
	if (!billingAttention) {
		return null;
	}

	return (
		<section
			aria-label="Billing attention"
			aria-live="polite"
			className="mx-auto w-full max-w-[1920px] px-2 pt-2 sm:px-3 sm:pt-3"
		>
			<div className="flex flex-col gap-3 rounded-lg border border-border/70 bg-muted/50 px-4 py-3 text-sm text-foreground shadow-none sm:flex-row sm:items-center sm:justify-between">
				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-2">
						<p className="font-medium">{billingAttention.title}</p>
						{billingAttention.statusLabel ? (
							<span className="rounded-full border border-border/70 px-2 py-0.5 font-mono text-[0.68rem] uppercase text-muted-foreground">
								{billingAttention.statusLabel}
							</span>
						) : null}
					</div>
					<p className="mt-1 max-w-3xl text-muted-foreground">
						{billingAttention.message}
					</p>
				</div>
				{billingAttention.action ? (
					<Link
						href={billingAttention.action.href}
						className="inline-flex h-8 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-background px-3 text-sm font-medium text-foreground underline-offset-4 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					>
						{billingAttention.action.label}
					</Link>
				) : null}
			</div>
		</section>
	);
}
