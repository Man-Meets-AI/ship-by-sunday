import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

export const homePageSectionClassName =
	"border-t border-border/60 py-10 sm:py-12";

export const homePageQuietSurfaceClassName =
	"rounded-[32px] border border-border/70 bg-muted/20";

export function HomePageSecondaryLink({
	href,
	label,
	className,
}: {
	readonly href: string;
	readonly label: string;
	readonly className?: string;
}) {
	return (
		<Link
			href={href}
			className={cn(
				"group inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border/60 px-5 text-sm font-medium text-foreground/80 transition-[border-color,color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-foreground/20 hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
				className,
			)}
		>
			<span>{label}</span>
			<ArrowUpRight className="size-4 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
		</Link>
	);
}
