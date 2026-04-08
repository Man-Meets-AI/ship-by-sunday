import Link from "next/link";

import { cn } from "@/lib/utils";
import {
	ProductBrand,
	productWordmarkFontClassName,
} from "@/components/product-brand";
import { routeConfig } from "@/config/product";
import type { HomePageContent } from "@/features/marketing/content/home";

type Hero = HomePageContent["hero"];

export function HomeHeroTopBar({ hero }: { hero: Hero }) {
	return (
		<nav className="flex w-full items-center justify-between px-4 py-3 sm:px-6 sm:py-4 lg:px-12">
			<ProductBrand
				href={routeConfig.home}
				labelClassName={cn(
					productWordmarkFontClassName,
					"whitespace-nowrap text-base font-normal leading-none tracking-[0.08em] text-foreground sm:text-lg",
				)}
			/>
			<div className="flex items-center justify-end">
				<Link
					href={routeConfig.signIn}
					className="inline-flex h-10 items-center rounded-full px-2 text-sm font-medium text-muted-foreground transition-all hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:px-4"
				>
					{hero.loginLabel}
				</Link>
			</div>
		</nav>
	);
}
