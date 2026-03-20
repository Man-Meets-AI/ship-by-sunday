import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { productConfig, routeConfig } from "@/config/product";
import type { HomePageContent } from "@/features/marketing/content/home";

import { HomeHeroThemeToggle } from "./home-hero-theme-toggle";

type Hero = HomePageContent["hero"];

export function HomeHeroTopBar({ hero }: { hero: Hero }) {
	return (
		<div className="flex flex-col gap-6">
			<div className="flex w-full flex-wrap items-center justify-end gap-2">
				<Button variant="outline" size="sm" asChild>
					<Link href={routeConfig.docs}>{hero.docsLabel}</Link>
				</Button>
				<Button variant="outline" size="sm" asChild>
					<Link href={routeConfig.signIn}>{hero.loginLabel}</Link>
				</Button>
				<HomeHeroThemeToggle />
			</div>
			<div className="mx-auto grid w-full max-w-2xl grid-cols-[1fr_auto_1fr] items-center gap-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
				<span className="min-w-0 truncate text-left">{hero.topBarStart}</span>
				<Button
					variant="ghost"
					size="sm"
					className="h-auto shrink-0 gap-2 py-1"
					asChild
				>
					<Link href="/">
						<Image
							src={productConfig.images.logo}
							alt={`${productConfig.name} logo`}
							width={44}
							height={44}
							priority
							className="rounded-lg"
						/>
					</Link>
				</Button>
				<span className="min-w-0 truncate text-right">{hero.topBarEnd}</span>
			</div>
		</div>
	);
}
