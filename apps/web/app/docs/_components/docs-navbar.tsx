import Link from "next/link";
import { Navbar } from "nextra-theme-docs";

import {
	ProductBrand,
	productWordmarkClassName,
} from "@/components/product-brand";
import { routeConfig } from "@/config/product";
import { DocsThemeToggle } from "@/app/docs/_components/docs-theme-toggle";
import { docsDisplayConfig } from "@/config/starter-selectors";

const navLinkClassName =
	"inline-flex h-8 items-center justify-center rounded-full border border-product-border/60 bg-product-surface/60 px-3 text-sm font-medium text-product-muted transition-colors hover:border-product-border hover:bg-product-surface hover:text-product-text";

export function DocsNavbar() {
	return (
		<Navbar
			logo={
				<div className="flex items-center gap-3">
					<ProductBrand labelClassName={productWordmarkClassName} />
					<span className="hidden text-[0.68rem] uppercase tracking-[0.22em] text-product-muted sm:inline">
						{docsDisplayConfig.siteName}
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
