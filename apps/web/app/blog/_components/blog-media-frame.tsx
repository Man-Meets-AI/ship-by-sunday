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
		<div className={cn("relative overflow-hidden bg-muted", className)}>
			<div className="relative aspect-square w-full">
				{kind === "image" ? (
					<Image
						src={src}
						alt={alt}
						fill
						priority={priority}
						sizes="(min-width: 1280px) 48rem, (min-width: 768px) 50vw, 100vw"
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
