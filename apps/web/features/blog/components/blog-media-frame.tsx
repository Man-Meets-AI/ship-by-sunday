import Image from "next/image";

import { cn } from "@/lib/utils";

type BlogMediaFrameProps = {
	kind: "image" | "video";
	src: string;
	alt: string;
	posterSrc?: string;
	priority?: boolean;
	className?: string;
};

export function BlogMediaFrame({
	kind,
	src,
	alt,
	posterSrc,
	priority = false,
	className,
}: BlogMediaFrameProps) {
	return (
		<div
			className={cn(
				"relative overflow-hidden rounded-[32px] border border-border/70 bg-[linear-gradient(145deg,rgba(253,253,253,0.96),rgba(245,245,245,0.8))] shadow-[0_28px_90px_-40px_rgba(15,23,42,0.45)] dark:bg-[linear-gradient(145deg,rgba(24,24,27,0.95),rgba(10,10,11,0.88))]",
				className,
			)}
		>
			<div className="absolute inset-x-0 top-0 h-px bg-white/50 dark:bg-white/10" />
			<div className="relative aspect-[4/3] w-full">
				{kind === "image" ? (
					<Image
						src={src}
						alt={alt}
						fill
						priority={priority}
						sizes="(min-width: 1280px) 46rem, (min-width: 1024px) 42vw, 100vw"
						className="object-cover"
					/>
				) : (
					<video
						className="h-full w-full object-cover"
						controls
						playsInline
						preload="metadata"
						poster={posterSrc}
						aria-label={alt}
					>
						<source src={src} type="video/mp4" />
					</video>
				)}
			</div>
		</div>
	);
}
