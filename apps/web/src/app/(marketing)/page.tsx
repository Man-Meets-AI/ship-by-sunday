import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import {
	PublicRouteContainer,
	PublicRouteDescription,
	PublicRouteEyebrow,
	PublicRouteHeader,
	PublicRoutePage,
	PublicRoutePanel,
	PublicRoutePanelBody,
	PublicRoutePanelDescription,
	PublicRoutePanelTitle,
	PublicRouteSection,
	PublicRouteSectionTitle,
	PublicRouteTitle,
} from "@/components/layout/public-route-surface";
import { PublicSiteHeader } from "@/components/layout/public-site-header";
import { Button } from "@/components/ui/button";
import { assetPaths, routeConfig } from "@/config/product";

export const metadata: Metadata = {
	title: "Man Meets AI",
	description:
		"Man Meets AI is the media and technology home for Ship by Sunday, Starter, and Workers.",
};

export default function Page() {
	return (
		<PublicRoutePage>
			<PublicSiteHeader activeHref={routeConfig.home} />
			<PublicRouteSection className="relative overflow-hidden">
				<Image
					src={assetPaths.founderProof}
					alt=""
					fill
					priority
					className="object-cover object-[60%_50%] opacity-[0.22]"
					sizes="100vw"
				/>
				<div className="absolute inset-0 bg-background/82" />
				<PublicRouteContainer className="relative grid min-h-[calc(88svh-4rem)] content-center py-16">
					<PublicRouteHeader className="max-w-4xl">
						<PublicRouteEyebrow>Man Meets AI</PublicRouteEyebrow>
						<PublicRouteTitle className="max-w-3xl">
							Media, tools, and worker systems for people building with AI.
						</PublicRouteTitle>
						<PublicRouteDescription>
							Ship by Sunday is the product arm. Starter helps new builders turn
							an idea into an AI-ready app path. Workers helps existing repos
							get ready for AI worker loops with boundaries and proof.
						</PublicRouteDescription>
						<div className="mt-8 flex flex-col gap-3 sm:flex-row">
							<Button asChild size="lg">
								<Link href={routeConfig.starter}>I have an idea</Link>
							</Button>
							<Button asChild size="lg" variant="outline">
								<Link href={routeConfig.workers}>I have a codebase</Link>
							</Button>
						</div>
					</PublicRouteHeader>
				</PublicRouteContainer>
			</PublicRouteSection>
			<PublicRouteSection tone="muted">
				<PublicRouteContainer className="grid gap-8 py-14 lg:grid-cols-[0.85fr_1.15fr]">
					<div>
						<PublicRouteEyebrow>What this is</PublicRouteEyebrow>
						<PublicRouteSectionTitle>
							Part media, part technology, part field notes from shipping with
							AI.
						</PublicRouteSectionTitle>
					</div>
					<div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
						<PublicRoutePanel>
							<PublicRoutePanelBody>
								<PublicRoutePanelTitle as="h3">Starter</PublicRoutePanelTitle>
								<PublicRoutePanelDescription>
									For people starting from an idea, a Lovable-style prototype,
									or a pile of prompts.
								</PublicRoutePanelDescription>
								<Link
									href={routeConfig.starter}
									className="mt-4 inline-flex text-sm font-medium text-foreground underline underline-offset-4"
								>
									Open Starter
								</Link>
							</PublicRoutePanelBody>
						</PublicRoutePanel>
						<PublicRoutePanel>
							<PublicRoutePanelBody>
								<PublicRoutePanelTitle as="h3">Workers</PublicRoutePanelTitle>
								<PublicRoutePanelDescription>
									For founders, agencies, and teams with existing repos that
									need worker-ready source truth and proof loops.
								</PublicRoutePanelDescription>
								<Link
									href={routeConfig.workers}
									className="mt-4 inline-flex text-sm font-medium text-foreground underline underline-offset-4"
								>
									Open Workers
								</Link>
							</PublicRoutePanelBody>
						</PublicRoutePanel>
						<PublicRoutePanel>
							<PublicRoutePanelBody>
								<PublicRoutePanelTitle as="h3">
									Worker Seal Team 6
								</PublicRoutePanelTitle>
								<PublicRoutePanelDescription>
									For teams with a live repo that need one hands-on hour to
									choose and bound the first AI-worker loop.
								</PublicRoutePanelDescription>
								<Link
									href={routeConfig.workerSealTeam6}
									className="mt-4 inline-flex text-sm font-medium text-foreground underline underline-offset-4"
								>
									Open Seal Team 6
								</Link>
							</PublicRoutePanelBody>
						</PublicRoutePanel>
					</div>
				</PublicRouteContainer>
			</PublicRouteSection>
		</PublicRoutePage>
	);
}
