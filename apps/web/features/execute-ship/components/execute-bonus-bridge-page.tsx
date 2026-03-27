import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getLessonHref } from "@/features/course/lesson/model/manifest";
import { AppShell } from "@/features/course/shared/components/app-shell";
import { PacketVideoCard } from "@/features/packet-flow/components/video/packet-video-card";
import { getExecuteBonusBridgeMedia } from "@/features/execute-ship/lib/execute-bonus-bridge-media";

const bridgeNotes = [
	{
		label: "Continue in BUILD",
		body: "Lesson 3.1 picks up where the packet ended and turns it into working software.",
	},
	{
		label: "Re-anchor in Product",
		body: "Lesson 1.1 is the fastest way to revisit framing before you keep moving.",
	},
	{
		label: "Use the rest as references",
		body: "Product, Design, and Ship stay unlocked as supporting shelves for context and QA.",
	},
] as const;

export function ExecuteBonusBridgePage({
	productName,
}: {
	productName?: string;
}) {
	const bridgeMedia = getExecuteBonusBridgeMedia();

	return (
		<AppShell
			viewportMode="app"
			appScrollMode="page"
			enableMissionQuery={false}
			showMissionRail={false}
			showSkillRail={false}
		>
			<div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 pb-12 pt-4 sm:px-6 lg:px-8">
				<div className="border-b border-border/50 pb-6">
					<h1 className="mt-3 max-w-4xl text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
						{productName
							? `${productName} has its packet. Now ship the first slice.`
							: "The packet is done. Now ship the first slice."}
					</h1>
					<p className="mt-4 max-w-3xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
						Review &amp; Download finished the required funnel. Execute / Ship
						is the unlocked bonus library that helps you turn the packet into
						working software without reopening the intake workbench.
					</p>
				</div>

				<div className="space-y-8">
					<section className="space-y-4">
						<PacketVideoCard content={bridgeMedia} />
						<p className="max-w-2xl text-sm leading-6 text-muted-foreground">
							{bridgeMedia.description}
						</p>
					</section>

					<div className="grid gap-4 md:grid-cols-3">
						{bridgeNotes.map((note) => (
							<div key={note.label} className="border-l border-border/60 pl-4">
								<p className="text-sm font-semibold text-foreground">
									{note.label}
								</p>
								<p className="mt-2 text-sm leading-6 text-muted-foreground">
									{note.body}
								</p>
							</div>
						))}
					</div>

					<div className="flex flex-col gap-3 sm:flex-row">
						<Button asChild size="lg">
							<Link href={getLessonHref("3.1")}>Continue in Build</Link>
						</Button>
						<Button asChild size="lg" variant="outline">
							<Link href={getLessonHref("1.1")}>Start from the beginning</Link>
						</Button>
					</div>
				</div>
			</div>
		</AppShell>
	);
}
