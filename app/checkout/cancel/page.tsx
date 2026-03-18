import Link from "next/link";

import { routeConfig } from "@/config/product";
import { ProductShell } from "@/features/course/shared/components/product-shell";

export default function Page() {
	return (
		<ProductShell
			title="Checkout canceled"
			subtitle="No charge was completed, and you can restart whenever you're ready."
			enableMissionQuery={false}
			showSkillRail={false}
		>
			<section className="relative mx-auto w-full max-w-4xl overflow-hidden border border-product-border/70 bg-product-surface/80 p-5 shadow-panel backdrop-blur-xl sm:p-7">
				<div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-product-accent/10 to-transparent" />
				<div className="relative">
					<p className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
						Checkout canceled
					</p>
					<h1 className="mt-4 max-w-3xl text-balance font-display text-3xl uppercase leading-none tracking-[0.08em] text-product-text sm:text-4xl">
						No charge was completed
					</h1>
					<p className="mt-4 max-w-2xl text-sm leading-relaxed text-product-muted">
						You can return to the offer, review the pricing, and restart checkout
						whenever you are ready. Nothing was charged from this canceled flow.
					</p>
					<div className="mt-7 border border-product-border/55 bg-product-surface-strong/72 p-4">
						<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-product-muted">
							Next step
						</p>
						<p className="mt-3 max-w-2xl text-sm leading-relaxed text-product-text">
							Go back to pricing if you still want Ship by Sunday, or return home
							if you were just checking the offer.
						</p>
						<div className="mt-4 flex flex-wrap gap-2.5">
							<Link
								href={`${routeConfig.home}${routeConfig.pricingHash}`}
								className="sbs-hover-lift sbs-press-feedback inline-flex min-w-[12rem] justify-center rounded-none border border-product-accent bg-product-accent/10 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-product-accent transition-colors hover:bg-product-accent hover:text-product-bg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-product-accent"
							>
								Back to pricing
							</Link>
							<Link
								href={routeConfig.home}
								className="sbs-hover-lift sbs-press-feedback inline-flex min-w-[11rem] justify-center rounded-none border border-product-border bg-product-surface px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-product-text transition-colors hover:bg-product-surface-alt focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-product-accent"
							>
								Go home
							</Link>
						</div>
					</div>
				</div>
			</section>
		</ProductShell>
	);
}
