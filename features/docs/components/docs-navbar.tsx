import Link from "next/link";
import { Navbar } from "nextra-theme-docs";

import { routeConfig } from "@/config/product";
import { DocsThemeToggle } from "@/features/docs/components/docs-theme-toggle";
import { ProductBrand } from "@/shared/branding/product-brand";

const navLinkClassName =
	"rounded-full border border-product-border/60 bg-product-surface/70 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-product-text transition-colors hover:bg-product-surface-alt";

const pricingHref = `${routeConfig.home}${routeConfig.pricingHash}`;

export function DocsNavbar() {
	return (
		<Navbar
			logo={
				<div className="flex items-center gap-3">
					<ProductBrand
						showLabel
						imageSize={28}
						labelClassName="font-display text-sm uppercase tracking-[0.12em] text-product-text sm:text-base"
					/>
					<span className="rounded-full border border-product-border/60 bg-product-surface-strong/80 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-product-muted sm:text-[11px]">
						Starter Docs
					</span>
				</div>
			}
			logoLink={routeConfig.home}
			align="right"
		>
			<Link href={routeConfig.home} className={navLinkClassName}>
				Home
			</Link>
			<Link href={pricingHref} className={navLinkClassName}>
				Pricing
			</Link>
			<Link href={routeConfig.signIn} className={navLinkClassName}>
				Sign in
			</Link>
			<DocsThemeToggle />
		</Navbar>
	);
}
