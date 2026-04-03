"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight";
import {
	getBlueprintStageDefinition,
	type BlueprintStageId,
} from "@blueprint-compiler";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

export function BlueprintStartOverviewCard({
	nextStageId,
}: {
	nextStageId: BlueprintStageId;
}) {
	const router = useRouter();
	const nextStage = getBlueprintStageDefinition(nextStageId);

	useKeyboardShortcut(
		"Enter",
		() => {
			router.push(nextStage.route);
		},
		{
			ctrlOrMeta: true,
		},
	);

	return (
		<HeroHighlight
			containerClassName="h-auto min-h-[18rem] bg-transparent px-6 py-12 md:min-h-[22rem] md:px-10"
			className="w-full"
		>
			<section className="flex flex-col items-center gap-10 text-center">
				<motion.h2
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, ease }}
					className="font-marketing-display text-7xl leading-[0.82] tracking-tight uppercase md:text-8xl lg:text-9xl"
				>
					Build the BRIEF{" "}
					<Highlight className="text-foreground dark:text-foreground">
						before
					</Highlight>{" "}
					you build the app.
				</motion.h2>

				<motion.div
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.16, duration: 0.5, ease }}
				>
					<Button asChild size="lg" className="h-14 rounded-full px-8 text-lg">
						<Link
							href={nextStage.route}
							className="inline-flex items-center gap-2"
						>
							Continue with {nextStage.label}
							<KbdGroup className="ml-1">
								<Kbd className="bg-primary-foreground/10 text-primary-foreground">
									⌘
								</Kbd>
								<Kbd className="bg-primary-foreground/10 text-primary-foreground">
									↵
								</Kbd>
							</KbdGroup>
						</Link>
					</Button>
				</motion.div>
			</section>
		</HeroHighlight>
	);
}
