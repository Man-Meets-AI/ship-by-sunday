import Image from "next/image";

import type { HomePageHeroMedia } from "@/features/marketing/content/home";

const heroMediaFrameClassName =
	"relative mx-auto w-full max-w-3xl overflow-hidden rounded-[2rem] border border-border/60 bg-background/85 p-2 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.35)] backdrop-blur-sm";

export function HomeHeroMedia({ media }: { media: HomePageHeroMedia }) {
	if (media.kind === "embed") {
		return (
			<div className={heroMediaFrameClassName}>
				<div className="relative aspect-video overflow-hidden rounded-[calc(2rem-0.5rem)] bg-black">
					<iframe
						src={media.embedUrl}
						title={media.title}
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						allowFullScreen
						className="absolute inset-0 h-full w-full border-0"
						referrerPolicy="strict-origin-when-cross-origin"
					/>
				</div>
			</div>
		);
	}

	return (
		<div className={heroMediaFrameClassName}>
			<div className="relative aspect-video overflow-hidden rounded-[calc(2rem-0.5rem)] bg-muted/30">
				<Image
					src={media.previewImageSrc}
					alt={media.previewImageAlt}
					fill
					priority
					sizes="(min-width: 1280px) 960px, (min-width: 768px) 80vw, 100vw"
					className="object-cover object-center"
				/>
				<div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_30%,rgba(15,23,42,0.18))]" />
			</div>
		</div>
	);
}
