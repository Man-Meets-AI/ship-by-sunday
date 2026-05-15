import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
	ArrowRight,
	CalendarClock,
	CheckCircle2,
	FileCode2,
	ShieldCheck,
	Wrench,
} from "lucide-react";

import {
	PublicRouteContainer,
	PublicRouteDescription,
	PublicRouteEyebrow,
	PublicRouteHeader,
	PublicRouteIcon,
	PublicRouteListItem,
	PublicRouteListPanel,
	PublicRoutePage,
	PublicRoutePanel,
	PublicRoutePanelBody,
	PublicRoutePanelDescription,
	PublicRoutePanelTitle,
	PublicRouteSection,
	PublicRouteSectionTitle,
	PublicRouteStepMarker,
	PublicRouteTitle,
} from "@/components/layout/public-route-surface";
import { PublicSiteHeader } from "@/components/layout/public-site-header";
import { Button } from "@/components/ui/button";
import {
	assetPaths,
	routeConfig,
	supportContactConfig,
} from "@/config/product";
import { WorkerSealTeam6CalBooking } from "@/components/workerSealTeam6/WorkerSealTeam6CalBooking";
import { createWorkerSealTeam6CalBookingConfig } from "@/components/workerSealTeam6/WorkerSealTeam6CalBooking.logic";

export const metadata: Metadata = {
	title: "Worker Seal Team 6",
	description:
		"A $2500 hands-on hour for teams with a live codebase that need the first AI-worker loop chosen, bounded, and proven.",
};

const readinessSignals = [
	"Your repo is already real, messy, and worth protecting.",
	"You have tried AI workers or coding agents, but the loop keeps wandering.",
	"You need one bounded intervention before committing to a longer system.",
	"You want source-truth, proof, and next action instead of generic advice.",
] as const;

const hourSteps = [
	{
		title: "Trace the live codebase",
		description:
			"We look at the repo, current blockers, source-truth gaps, and the places an AI worker would drift or cause damage.",
	},
	{
		title: "Choose one loop",
		description:
			"We pick the highest-leverage worker loop for the hour and define the exact boundary, success signal, and stop condition.",
	},
	{
		title: "Leave with proof",
		description:
			"You get the recommended first loop, what to run next, what not to automate yet, and the proof or blocked-proof path.",
	},
] as const;

const bookingFacts = [
	"No app account is required before scheduling.",
	"Cal.com owns payment, intake, confirmation, and rescheduling.",
	"Convex mirrors verified booking state for support and fulfillment proof.",
] as const;

export default function WorkerSealTeam6Page() {
	const calBookingConfig = createWorkerSealTeam6CalBookingConfig({
		calLinkEnv: process.env.NEXT_PUBLIC_WORKER_SEAL_TEAM_6_CAL_LINK,
		calOriginEnv: process.env.NEXT_PUBLIC_WORKER_SEAL_TEAM_6_CAL_ORIGIN,
		directSchedulingHref: supportContactConfig.telegramHref,
	});

	return (
		<PublicRoutePage>
			<PublicSiteHeader activeHref={routeConfig.workerSealTeam6} />
			<PublicRouteSection className="relative overflow-hidden">
				<Image
					src={assetPaths.founderProof}
					alt=""
					fill
					priority
					className="object-cover object-[63%_46%] opacity-[0.22]"
					sizes="100vw"
				/>
				<div className="absolute inset-0 bg-background/84" />
				<PublicRouteContainer className="relative grid min-h-[calc(82svh-4rem)] content-center py-16">
					<PublicRouteHeader className="max-w-4xl">
						<PublicRouteEyebrow>Worker Seal Team 6</PublicRouteEyebrow>
						<PublicRouteTitle className="max-w-3xl">
							One hands-on hour for the first AI-worker loop.
						</PublicRouteTitle>
						<PublicRouteDescription>
							A $2,500 service for teams with a live codebase that need the
							first worker loop chosen, bounded, and proven before they scale
							automation.
						</PublicRouteDescription>
						<div className="mt-8 flex flex-col gap-3 sm:flex-row">
							<Button asChild size="lg">
								<a href="#booking">
									Book the hands-on hour
									<ArrowRight data-icon="inline-end" aria-hidden />
								</a>
							</Button>
							<Button asChild size="lg" variant="outline">
								<Link href={routeConfig.workers}>
									Compare Workers subscription
								</Link>
							</Button>
						</div>
					</PublicRouteHeader>
				</PublicRouteContainer>
			</PublicRouteSection>

			<ReadinessSection />
			<HourSection />
			<BookingSection calBookingConfig={calBookingConfig} />
			<CrossSellSection />
		</PublicRoutePage>
	);
}

function ReadinessSection() {
	return (
		<PublicRouteSection tone="muted">
			<PublicRouteContainer className="grid gap-8 py-14 lg:grid-cols-[0.85fr_1.15fr]">
				<div>
					<PublicRouteIcon>
						<FileCode2 className="size-5" aria-hidden />
					</PublicRouteIcon>
					<PublicRouteSectionTitle>
						Use it when the codebase is already real.
					</PublicRouteSectionTitle>
					<p className="mt-4 text-sm leading-6 text-muted-foreground">
						This is not a generic strategy call. It is for the moment when a
						repo, a team, and a shipping deadline need a narrow worker loop that
						can survive contact with production constraints.
					</p>
				</div>
				<ul className="grid gap-3 sm:grid-cols-2">
					{readinessSignals.map((signal) => (
						<PublicRouteListItem key={signal}>
							<CheckCircle2
								className="mt-1 size-4 shrink-0 text-foreground"
								aria-hidden
							/>
							<span>{signal}</span>
						</PublicRouteListItem>
					))}
				</ul>
			</PublicRouteContainer>
		</PublicRouteSection>
	);
}

function HourSection() {
	return (
		<PublicRouteSection>
			<PublicRouteContainer className="grid gap-10 py-14 lg:grid-cols-[0.8fr_1.2fr]">
				<div>
					<PublicRouteIcon>
						<Wrench className="size-5" aria-hidden />
					</PublicRouteIcon>
					<PublicRouteSectionTitle>
						What happens in the hour
					</PublicRouteSectionTitle>
				</div>
				<ol className="grid gap-3">
					{hourSteps.map((step, index) => (
						<PublicRouteListPanel key={step.title}>
							<PublicRoutePanelBody>
								<div className="flex items-center gap-3">
									<PublicRouteStepMarker className="size-7">
										{index + 1}
									</PublicRouteStepMarker>
									<PublicRoutePanelTitle as="h3">
										{step.title}
									</PublicRoutePanelTitle>
								</div>
								<PublicRoutePanelDescription className="mt-3">
									{step.description}
								</PublicRoutePanelDescription>
							</PublicRoutePanelBody>
						</PublicRouteListPanel>
					))}
				</ol>
			</PublicRouteContainer>
		</PublicRouteSection>
	);
}

function BookingSection({
	calBookingConfig,
}: {
	calBookingConfig: ReturnType<typeof createWorkerSealTeam6CalBookingConfig>;
}) {
	return (
		<PublicRouteSection id="booking" tone="muted">
			<PublicRouteContainer className="grid gap-8 py-14 lg:grid-cols-[0.9fr_1.1fr]">
				<div>
					<PublicRouteIcon>
						<CalendarClock className="size-5" aria-hidden />
					</PublicRouteIcon>
					<PublicRouteSectionTitle>
						Book the paid hour through Cal.com.
					</PublicRouteSectionTitle>
					<p className="mt-4 text-sm leading-6 text-muted-foreground">
						Scheduling, payment, intake, confirmation, and rescheduling stay in
						one booking system. If the embedded calendar is unavailable, the
						hosted booking page and direct line stay available.
					</p>
				</div>
				<div className="grid content-start gap-5">
					<WorkerSealTeam6CalBooking {...calBookingConfig} />
					<ul className="grid content-start gap-3">
						{bookingFacts.map((fact) => (
							<PublicRouteListItem key={fact}>
								<ShieldCheck
									className="mt-1 size-4 shrink-0 text-foreground"
									aria-hidden
								/>
								<span>{fact}</span>
							</PublicRouteListItem>
						))}
					</ul>
				</div>
			</PublicRouteContainer>
		</PublicRouteSection>
	);
}

function CrossSellSection() {
	return (
		<PublicRouteSection className="border-b-0">
			<PublicRouteContainer className="grid gap-4 py-14 lg:grid-cols-2">
				<PublicRoutePanel>
					<PublicRoutePanelBody>
						<PublicRoutePanelTitle>Need a system?</PublicRoutePanelTitle>
						<PublicRoutePanelDescription>
							Workers is the subscription for ongoing private doctor passes,
							approved loops, and proof across an existing codebase.
						</PublicRoutePanelDescription>
						<Link
							href={routeConfig.workers}
							className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-foreground underline underline-offset-4"
						>
							Open Workers
							<ArrowRight className="size-4" aria-hidden />
						</Link>
					</PublicRoutePanelBody>
				</PublicRoutePanel>
				<PublicRoutePanel>
					<PublicRoutePanelBody>
						<PublicRoutePanelTitle>
							Starting from an idea?
						</PublicRoutePanelTitle>
						<PublicRoutePanelDescription>
							Starter is the one-year path for turning a new idea into source
							truth, a template app, and worker-ready plans.
						</PublicRoutePanelDescription>
						<Link
							href={routeConfig.starter}
							className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-foreground underline underline-offset-4"
						>
							Open Starter
							<ArrowRight className="size-4" aria-hidden />
						</Link>
					</PublicRoutePanelBody>
				</PublicRoutePanel>
			</PublicRouteContainer>
		</PublicRouteSection>
	);
}
