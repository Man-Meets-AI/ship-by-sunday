import Link from "next/link";

import {
	ProductBrand,
	productWordmarkClassName,
} from "@/components/product-brand";
import { routeConfig } from "@/config/product";
import { DocsThemeToggle } from "@/app/docs/_components/docs-theme-toggle";

const navLinkClassName =
	"inline-flex h-9 items-center justify-center rounded-full px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60";

const signInLinkClassName =
	"inline-flex h-9 items-center justify-center rounded-full bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60";

export function DocsNavbar() {
	return (
		<header className="sbs-docs-navbar">
			<div className="flex min-w-0 items-center gap-3">
				<ProductBrand
					href={routeConfig.home}
					className="-mx-2 min-h-11 px-2"
					labelClassName={productWordmarkClassName}
				/>
			</div>
			<nav className="flex w-full flex-wrap items-center justify-start gap-1 sm:w-auto sm:justify-end sm:gap-1.5">
				<Link href={routeConfig.home} className={navLinkClassName}>
					Man Meets AI
				</Link>
				<Link href={routeConfig.starter} className={navLinkClassName}>
					Starter
				</Link>
				<Link href={routeConfig.workers} className={navLinkClassName}>
					Workers
				</Link>
				<Link href={routeConfig.signIn} className={signInLinkClassName}>
					Sign in
				</Link>
				<DocsThemeToggle />
			</nav>
		</header>
	);
}
