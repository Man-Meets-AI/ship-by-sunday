import Link from "next/link";
import { Navbar } from "nextra-theme-docs";

import {
	ProductBrand,
	productWordmarkClassName,
} from "@/components/product-brand";
import { routeConfig } from "@/config/product";
import { DocsThemeToggle } from "@/features/docs/components/docs-theme-toggle";
import { docsDisplayConfig } from "@/features/starter/lib/starter-selectors";

const navLinkClassName =
	"inline-flex h-8 items-center justify-center rounded-lg border bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground";

export function DocsNavbar() {
	return (
		<Navbar
			logo={
				<div className="flex items-center gap-3">
					<ProductBrand labelClassName={productWordmarkClassName} />
					<span className="rounded-full border bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground sm:text-[11px]">
						{docsDisplayConfig.badgeLabel}
					</span>
				</div>
			}
			logoLink={routeConfig.home}
			align="right"
		>
			<Link href={routeConfig.home} className={navLinkClassName}>
				Home
			</Link>
			<Link href={docsDisplayConfig.pricingHref} className={navLinkClassName}>
				Pricing
			</Link>
			<Link href={routeConfig.signIn} className={navLinkClassName}>
				Sign in
			</Link>
			<DocsThemeToggle />
		</Navbar>
	);
}
