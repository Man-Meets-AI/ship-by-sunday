import Link from "next/link";

import { ThemeToggleButton } from "@/app/_components/theme-toggle-button";
import {
	ProductBrand,
	productWordmarkClassName,
} from "@/components/product-brand";
import { routeConfig } from "@/config/product";
import { getBlogPagePath } from "@/app/blog/_server/page-paths";

const blogNavigationLinks = [
	{ href: routeConfig.home, label: "Man Meets AI" },
	{ href: routeConfig.starter, label: "Starter" },
	{ href: routeConfig.workers, label: "Workers" },
	{ href: getBlogPagePath(), label: "Blog" },
] as const;

type BlogSurfaceHeaderProps = {
	activeHref?: string;
};

export function BlogSurfaceHeader({ activeHref }: BlogSurfaceHeaderProps) {
	return (
		<header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
			<div className="mx-auto flex h-16 max-w-[1720px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
				<div className="flex min-w-0 items-center gap-3">
					<ProductBrand
						href={routeConfig.home}
						className="-mx-2 min-h-11 px-2"
						labelClassName={productWordmarkClassName}
					/>
					<span className="hidden text-[0.68rem] font-bold uppercase tracking-[0.22em] text-muted-foreground sm:inline">
						Essays
					</span>
				</div>
				<nav
					aria-label="Blog navigation"
					className="hidden items-center gap-1 rounded-full border border-border/70 bg-muted/35 p-1 text-sm text-muted-foreground lg:flex"
				>
					{blogNavigationLinks.map((link) => {
						const isActive = activeHref === link.href;

						return (
							<Link
								key={link.href}
								href={link.href}
								aria-current={isActive ? "page" : undefined}
								className="inline-flex min-h-11 items-center rounded-full px-4 font-medium transition-colors hover:bg-background hover:text-foreground aria-[current=page]:bg-foreground aria-[current=page]:text-background"
							>
								{link.label}
							</Link>
						);
					})}
				</nav>
				<div className="flex shrink-0 items-center justify-end gap-2">
					<Link
						href={routeConfig.signIn}
						className="hidden min-h-11 items-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-foreground/80 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:inline-flex"
					>
						Sign in
					</Link>
					<ThemeToggleButton className="border-border/70 bg-background/70" />
				</div>
			</div>
		</header>
	);
}
