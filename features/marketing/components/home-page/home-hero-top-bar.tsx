import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { productConfig, routeConfig } from "@/config/product";
import type { HomePageContent } from "@/features/marketing/content/home";

type Hero = HomePageContent["hero"];

export function HomeHeroTopBar({ hero }: { hero: Hero }) {
	return (
		<nav className="flex w-full items-center justify-between border-y border-border/80 px-4 py-4">
			<Link href="/" className="flex items-center gap-3">
				<Image
					src={productConfig.images.logo}
					alt={`${productConfig.name} logo`}
					width={40}
					height={40}
					priority
					className="rounded-lg"
				/>
				<div className="flex flex-col leading-none">
					<span className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
						{hero.topBarStart}
					</span>
					<span className="text-sm font-semibold sm:text-base">
						{productConfig.name}
					</span>
				</div>
			</Link>
			<Button variant="outline" size="sm" asChild>
				<Link href={routeConfig.docs}>{hero.docsLabel}</Link>
			</Button>
		</nav>
	);
}
