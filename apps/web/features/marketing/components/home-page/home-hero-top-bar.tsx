import Link from "next/link";

import {
	ProductBrand,
	productWordmarkClassName,
} from "@/components/product-brand";
import { routeConfig } from "@/config/product";
import type { HomePageContent } from "@/features/marketing/content/home";
import { isStarterModuleEnabled } from "@/features/starter/lib/starter-selectors";

type Hero = HomePageContent["hero"];

export function HomeHeroTopBar({ hero }: { hero: Hero }) {
	const docsEnabled = isStarterModuleEnabled("docs");

	return (
		<nav className="flex w-full items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
			<ProductBrand
				href={routeConfig.home}
				labelClassName={productWordmarkClassName}
			/>
			<div className="flex items-center gap-2">
				{docsEnabled ? (
					<Link
						href={routeConfig.docs}
						className="inline-flex h-9 items-center rounded-full border border-border/60 px-4 text-sm font-medium text-foreground/80 transition-colors hover:border-foreground/20 hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
					>
						{hero.docsLabel}
					</Link>
				) : null}
				<Link
					href={routeConfig.signIn}
					className="inline-flex h-9 items-center rounded-full px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
				>
					{hero.loginLabel}
				</Link>
			</div>
		</nav>
	);
}
