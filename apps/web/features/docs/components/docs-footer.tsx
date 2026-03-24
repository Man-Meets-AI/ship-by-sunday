import Link from "next/link";
import { Footer } from "nextra-theme-docs";

import { routeConfig } from "@/config/product";
import {
	docsDisplayConfig,
	marketingDisplayConfig,
} from "@/features/starter/lib/starter-selectors";

const footerLinkClassName =
	"text-xs font-bold uppercase tracking-[0.14em] text-product-muted transition-colors hover:text-product-text";

export function DocsFooter() {
	return (
		<Footer className="border-t border-product-border/50 bg-product-surface/70">
			<div className="flex w-full flex-col gap-4 text-sm text-product-muted sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p className="font-display text-xl uppercase tracking-[0.08em] text-product-text">
						{docsDisplayConfig.siteName}
					</p>
					<p className="mt-1 max-w-2xl text-sm leading-relaxed">
						{docsDisplayConfig.description}
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-4">
					<Link href={routeConfig.home} className={footerLinkClassName}>
						Home
					</Link>
					<Link
						href={docsDisplayConfig.pricingHref}
						className={footerLinkClassName}
					>
						{marketingDisplayConfig.primaryCtaLabel}
					</Link>
					<Link href={routeConfig.signIn} className={footerLinkClassName}>
						Sign in
					</Link>
				</div>
			</div>
		</Footer>
	);
}
