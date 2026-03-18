import Link from "next/link";
import { Footer } from "nextra-theme-docs";

import { routeConfig } from "@/config/product";

const footerLinkClassName =
	"text-xs font-bold uppercase tracking-[0.14em] text-product-muted transition-colors hover:text-product-text";

const pricingHref = `${routeConfig.home}${routeConfig.pricingHash}`;

export function DocsFooter() {
	return (
		<Footer className="border-t border-product-border/50 bg-product-surface/70">
			<div className="flex w-full flex-col gap-4 text-sm text-product-muted sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p className="font-display text-xl uppercase tracking-[0.08em] text-product-text">
						Ship by Sunday Starter Docs
					</p>
					<p className="mt-1 max-w-2xl text-sm leading-relaxed">
						Customer-facing setup and troubleshooting docs for the starter,
						curated from the repo source docs and optimized for fast fixes.
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-4">
					<Link href={routeConfig.home} className={footerLinkClassName}>
						Home
					</Link>
					<Link href={pricingHref} className={footerLinkClassName}>
						Get access
					</Link>
					<Link href={routeConfig.signIn} className={footerLinkClassName}>
						Sign in
					</Link>
				</div>
			</div>
		</Footer>
	);
}
