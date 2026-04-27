import Link from "next/link";

import { cn } from "@/lib/utils";
import {
	ProductBrand,
	productWordmarkClassName,
} from "@/components/product-brand";
import { Button } from "@/components/ui/button";
import { routeConfig } from "@/config/product";
import { PromoBanner } from "@/app/_components/home-page/promo-banner";
import type { HomePageContent } from "@/app/_content/home-page";

type Hero = HomePageContent["hero"];

export function HomeHeroTopBar({ hero }: { hero: Hero }) {
	return (
		<div className="w-full">
			{hero.promoBanner ? (
				<div className="border-y border-border/60 bg-secondary/65">
					<PromoBanner
						label={hero.promoBanner.label}
						message={hero.promoBanner.message}
						className="flex min-h-11 items-center justify-center px-4 text-center sm:px-6 lg:px-12"
					/>
				</div>
			) : null}
			<nav className="flex w-full items-center justify-between px-6 py-4 lg:px-12">
				<ProductBrand
					href={routeConfig.home}
					labelClassName={cn(productWordmarkClassName, "text-lg")}
				/>
				<div className="flex items-center gap-4">
					<Link
						href={routeConfig.signIn}
						className="inline-flex h-10 items-center rounded-full px-4 text-sm font-medium text-muted-foreground transition-all hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
					>
						{hero.loginLabel}
					</Link>
					<Button
						asChild
						className="h-10 rounded-full bg-foreground px-6 text-sm font-semibold text-background transition-transform hover:scale-105 active:scale-95"
					>
						<Link href={routeConfig.pricingHash}>{hero.primaryCta}</Link>
					</Button>
				</div>
			</nav>
		</div>
	);
}
