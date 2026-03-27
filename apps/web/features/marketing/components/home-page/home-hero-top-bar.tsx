import Link from "next/link";

import { cn } from "@/lib/utils";
import {
	ProductBrand,
	productWordmarkClassName,
} from "@/components/product-brand";
import { Button } from "@/components/ui/button";
import { routeConfig } from "@/config/product";
import type { HomePageContent } from "@/features/marketing/content/home";
import { isStarterModuleEnabled } from "@/features/starter/lib/starter-selectors";

type Hero = HomePageContent["hero"];

export function HomeHeroTopBar({ hero }: { hero: Hero }) {
	const docsEnabled = isStarterModuleEnabled("docs");

	return (
		<nav className="flex w-full items-center justify-between px-6 py-4 lg:px-12">
			<ProductBrand
				href={routeConfig.home}
				labelClassName={cn(productWordmarkClassName, "text-lg")}
			/>
			<div className="flex items-center gap-2">
				{docsEnabled ? (
					<Link
						href={routeConfig.docs}
						className="hidden h-10 items-center rounded-full border border-border/40 px-5 text-sm font-medium text-foreground/70 transition-all hover:border-foreground/20 hover:text-foreground hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:inline-flex"
					>
						{hero.docsLabel}
					</Link>
				) : null}
				<Link
					href={routeConfig.signIn}
					className="inline-flex h-10 items-center rounded-full px-4 text-sm font-medium text-muted-foreground transition-all hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
				>
					{hero.loginLabel}
				</Link>
				<Button
					asChild
					className="ml-2 h-10 rounded-full bg-foreground px-6 text-sm font-semibold text-background transition-transform hover:scale-105 active:scale-95"
				>
					<Link href={routeConfig.pricingHash}>{hero.primaryCta}</Link>
				</Button>
			</div>
		</nav>
	);
}
