import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { PublicSiteHeader } from "@/app/_components/public-site/public-site-header";
import { Button } from "@/components/ui/button";
import { assetPaths, routeConfig } from "@/config/product";

export const metadata: Metadata = {
	title: "Man Meets AI",
	description:
		"Man Meets AI is the media and technology home for Ship by Sunday, Starter, and Workers.",
};

export default function Page() {
	return (
		<main className="min-h-screen bg-background text-foreground">
			<PublicSiteHeader activeHref={routeConfig.home} />
			<section className="relative min-h-[calc(100svh-4rem)] overflow-hidden border-b border-border/60">
				<Image
					src={assetPaths.founderProof}
					alt=""
					fill
					priority
					className="object-cover object-[60%_50%] opacity-35"
					sizes="100vw"
				/>
				<div className="absolute inset-0 bg-background/72" />
				<div className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
					<div className="max-w-4xl">
						<p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
							Man Meets AI
						</p>
						<h1 className="mt-5 max-w-3xl font-heading-serif text-5xl leading-[0.98] tracking-normal text-foreground sm:text-7xl">
							Media, tools, and worker systems for people building with AI.
						</h1>
						<p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
							Ship by Sunday is the product arm. Starter helps new builders turn
							an idea into an AI-ready app path. Workers helps existing repos
							get ready for AI worker loops with boundaries and proof.
						</p>
						<div className="mt-8 flex flex-col gap-3 sm:flex-row">
							<Button asChild size="lg">
								<Link href={routeConfig.starter}>I have an idea</Link>
							</Button>
							<Button asChild size="lg" variant="outline">
								<Link href={routeConfig.workers}>I have a codebase</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>
			<section className="border-b border-border/60 bg-muted/20">
				<div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
					<div>
						<p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
							What this is
						</p>
						<h2 className="mt-3 font-heading-serif text-3xl leading-tight text-foreground sm:text-4xl">
							Part media, part technology, part field notes from shipping with
							AI.
						</h2>
					</div>
					<div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
						<div className="rounded-md border border-border/70 bg-background p-5">
							<h3 className="font-semibold text-foreground">Starter</h3>
							<p className="mt-2 text-sm leading-6 text-muted-foreground">
								For people starting from an idea, a Lovable-style prototype, or
								a pile of prompts.
							</p>
							<Link
								href={routeConfig.starter}
								className="mt-4 inline-flex text-sm font-medium text-foreground underline underline-offset-4"
							>
								Open Starter
							</Link>
						</div>
						<div className="rounded-md border border-border/70 bg-background p-5">
							<h3 className="font-semibold text-foreground">Workers</h3>
							<p className="mt-2 text-sm leading-6 text-muted-foreground">
								For founders, agencies, and teams with existing repos that need
								worker-ready source truth and proof loops.
							</p>
							<Link
								href={routeConfig.workers}
								className="mt-4 inline-flex text-sm font-medium text-foreground underline underline-offset-4"
							>
								Open Workers
							</Link>
						</div>
						<div className="rounded-md border border-border/70 bg-background p-5">
							<h3 className="font-semibold text-foreground">
								Worker Seal Team 6
							</h3>
							<p className="mt-2 text-sm leading-6 text-muted-foreground">
								For teams with a live repo that need one hands-on hour to choose
								and bound the first AI-worker loop.
							</p>
							<Link
								href={routeConfig.workerSealTeam6}
								className="mt-4 inline-flex text-sm font-medium text-foreground underline underline-offset-4"
							>
								Open Seal Team 6
							</Link>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
