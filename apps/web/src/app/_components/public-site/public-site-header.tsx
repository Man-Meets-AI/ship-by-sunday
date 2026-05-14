import Link from "next/link";

import { ThemeToggleButton } from "@/app/_components/theme-toggle-button";
import { Button } from "@/components/ui/button";
import { routeConfig } from "@/config/product";
import { cn } from "@/lib/utils";

const publicNavLinks = [
	{ href: routeConfig.home, label: "Man Meets AI" },
	{ href: routeConfig.starter, label: "Starter" },
	{ href: routeConfig.workers, label: "Workers" },
	{ href: routeConfig.workerSealTeam6, label: "Seal Team 6" },
	{ href: routeConfig.blog, label: "Blog" },
] as const;

export function PublicSiteHeader({
	activeHref,
	className,
}: {
	readonly activeHref?: string;
	readonly className?: string;
}) {
	return (
		<header
			className={cn(
				"sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-xl",
				className,
			)}
		>
			<div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
				<Link
					href={routeConfig.home}
					className="min-w-0 text-sm font-semibold tracking-normal text-foreground"
				>
					Man Meets AI
				</Link>
				<nav
					aria-label="Public navigation"
					className="hidden items-center gap-1 text-sm text-muted-foreground md:flex"
				>
					{publicNavLinks.map((link) => {
						const isActive = activeHref === link.href;
						return (
							<Link
								key={link.href}
								href={link.href}
								aria-current={isActive ? "page" : undefined}
								className="inline-flex min-h-10 items-center rounded-md px-3 font-medium transition-colors hover:bg-muted hover:text-foreground aria-[current=page]:bg-muted aria-[current=page]:text-foreground"
							>
								{link.label}
							</Link>
						);
					})}
				</nav>
				<div className="flex shrink-0 items-center gap-2">
					<Button asChild variant="outline" size="sm">
						<Link href={routeConfig.signIn}>Sign in</Link>
					</Button>
					<ThemeToggleButton className="border-border/70 bg-background/70" />
				</div>
			</div>
		</header>
	);
}
