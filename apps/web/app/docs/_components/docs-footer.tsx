import Link from "next/link";

import { routeConfig } from "@/config/product";
import {
	docsDisplayConfig,
	marketingDisplayConfig,
} from "@/config/starter-selectors";

const footerLinkClassName =
	"inline-flex min-h-11 min-w-11 items-center text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground";

export function DocsFooter() {
	return (
		<footer className="sbs-docs-footer">
			<div>
				<p className="font-product-wordmark text-xl uppercase tracking-[0.08em] text-foreground">
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
		</footer>
	);
}
