import Link from "next/link";

import { ProductBrand } from "@/components/product-brand";
import { routeConfig } from "@/config/product";
import { getBlogPagePath } from "@/app/blog/_server/page-paths";

const blogNavigationLinks = [
	{ href: routeConfig.home, label: "Home" },
	{ href: routeConfig.docs, label: "Docs" },
	{ href: getBlogPagePath(), label: "Blog" },
] as const;

type BlogSurfaceHeaderProps = {
	activeHref?: string;
};

export function BlogSurfaceHeader({ activeHref }: BlogSurfaceHeaderProps) {
	return (
		<header className="border-b border-border bg-background">
			<div className="mx-auto grid h-16 max-w-[1720px] grid-cols-[1fr_auto] items-center gap-4 px-4 sm:px-6 lg:grid-cols-[1fr_auto_1fr] lg:px-8">
				<ProductBrand
					href={routeConfig.home}
					uppercase={false}
					labelClassName="text-sm font-semibold tracking-tight text-foreground"
				/>
				<nav
					aria-label="Blog navigation"
					className="hidden items-center gap-7 text-sm text-foreground/70 lg:flex"
				>
					{blogNavigationLinks.map((link) => {
						const isActive = activeHref === link.href;

						return (
							<Link
								key={link.href}
								href={link.href}
								aria-current={isActive ? "page" : undefined}
								className="transition-colors hover:text-foreground aria-[current=page]:text-foreground"
							>
								{link.label}
							</Link>
						);
					})}
				</nav>
				<div className="justify-self-end">
					<Link
						href={`${routeConfig.home}${routeConfig.pricingHash}`}
						className="text-sm font-medium text-foreground transition-colors hover:text-foreground/70 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
					>
						Get the system
					</Link>
				</div>
			</div>
		</header>
	);
}
