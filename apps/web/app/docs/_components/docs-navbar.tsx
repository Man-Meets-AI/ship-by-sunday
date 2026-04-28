import Link from "next/link";

import {
	ProductBrand,
	productWordmarkClassName,
} from "@/components/product-brand";
import { routeConfig } from "@/config/product";
import { DocsThemeToggle } from "@/app/docs/_components/docs-theme-toggle";
import { docsDisplayConfig } from "@/config/starter-selectors";

const navLinkClassName =
	"inline-flex min-h-11 items-center justify-center rounded-full border border-border/60 bg-background/70 px-4 text-sm font-medium text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground";

export function DocsNavbar() {
	return (
		<header className="sbs-docs-navbar">
			<div className="flex min-w-0 items-center gap-3">
				<ProductBrand
					href={routeConfig.home}
					className="-mx-2 min-h-11 px-2"
					labelClassName={productWordmarkClassName}
				/>
				<span className="hidden text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground sm:inline">
					{docsDisplayConfig.siteName}
				</span>
			</div>
			<nav className="flex w-full flex-wrap items-center justify-start gap-2 sm:w-auto sm:justify-end">
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
			</nav>
		</header>
	);
}
