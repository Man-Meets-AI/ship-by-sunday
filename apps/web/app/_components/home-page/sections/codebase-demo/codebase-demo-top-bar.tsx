import Link from "next/link";

import {
	ProductBrand,
	productWordmarkFontClassName,
} from "@/components/product-brand";
import { routeConfig } from "@/config/product";
import { ThemeToggleButton } from "@/app/_components/theme-toggle-button";
import { cn } from "@/lib/utils";

type CodebaseDemoTopBarTone = "default" | "dark";

export function CodebaseDemoTopBar({
	tone = "default",
}: {
	readonly tone?: CodebaseDemoTopBarTone;
}) {
	const isDarkTone = tone === "dark";
	const wordmarkClassName = cn(
		productWordmarkFontClassName,
		"whitespace-nowrap text-2xl font-normal leading-none tracking-wide sm:text-3xl",
		isDarkTone ? "text-white" : "text-foreground",
	);
	const navLinkClassName = cn(
		"transition-colors duration-200",
		isDarkTone
			? "text-white/65 hover:text-white"
			: "text-muted-foreground hover:text-foreground",
	);

	return (
		<div className="flex items-center justify-between gap-4 py-3">
			<ProductBrand
				href={routeConfig.home}
				labelClassName={wordmarkClassName}
			/>
			<nav
				className="flex items-center gap-3 text-sm sm:gap-5"
				aria-label="Homepage navigation"
			>
				<Link
					href={routeConfig.docs}
					className={cn("hidden sm:inline", navLinkClassName)}
				>
					Docs
				</Link>
				<Link href={routeConfig.signIn} className={navLinkClassName}>
					Sign in
				</Link>
				<ThemeToggleButton
					className={cn(
						isDarkTone
							? "border-white/25 bg-white/10 text-white hover:bg-white/15 hover:text-white"
							: "border-border/70 bg-background/70",
					)}
				/>
			</nav>
		</div>
	);
}
