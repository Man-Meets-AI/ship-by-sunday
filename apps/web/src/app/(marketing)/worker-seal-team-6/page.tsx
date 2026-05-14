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

import { PublicSiteHeader } from "@/app/_components/public-site/public-site-header";
import { Button } from "@/components/ui/button";
import {
	assetPaths,
	routeConfig,
	supportContactConfig,
} from "@/config/product";
import { WorkerSealTeam6CalBooking } from "./_components/worker-seal-team-6-cal-booking";
import { createWorkerSealTeam6CalBookingConfig } from "./_lib/worker-seal-team-6-cal-config";

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
		<main className="min-h-screen bg-background text-foreground">
			<PublicSiteHeader activeHref={routeConfig.workerSealTeam6} />
			<section className="relative min-h-[calc(88svh-4rem)] overflow-hidden border-b border-border/60">
				<Image
					src={assetPaths.founderProof}
					alt=""
					fill
					priority
					className="object-cover object-[63%_46%] opacity-35"
					sizes="100vw"
				/>
				<div className="absolute inset-0 bg-background/76" />
				<div className="relative mx-auto flex min-h-[calc(88svh-4rem)] max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
					<div className="max-w-4xl">
						<p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
							Worker Seal Team 6
						</p>
						<h1 className="mt-5 max-w-3xl font-heading-serif text-5xl leading-[0.98] tracking-normal text-foreground sm:text-7xl">
							One hands-on hour for the first AI-worker loop.
						</h1>
						<p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
							A $2,500 service for teams with a live codebase that need the
							first worker loop chosen, bounded, and proven before they scale
							automation.
						</p>
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
					</div>
				</div>
			</section>

			<section className="border-b border-border/60 bg-muted/20">
				<div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
					<div>
						<FileCode2 className="size-5 text-muted-foreground" aria-hidden />
						<h2 className="mt-4 font-heading-serif text-3xl leading-tight text-foreground sm:text-4xl">
							Use it when the codebase is already real.
						</h2>
						<p className="mt-4 text-sm leading-6 text-muted-foreground">
							This is not a generic strategy call. It is for the moment when a
							repo, a team, and a shipping deadline need a narrow worker loop
							that can survive contact with production constraints.
						</p>
					</div>
					<ul className="grid gap-3 sm:grid-cols-2">
						{readinessSignals.map((signal) => (
							<li
								key={signal}
								className="flex items-start gap-3 rounded-md border border-border/70 bg-background p-4 text-sm leading-6 text-muted-foreground"
							>
								<CheckCircle2
									className="mt-1 size-4 shrink-0 text-foreground"
									aria-hidden
								/>
								<span>{signal}</span>
							</li>
						))}
					</ul>
				</div>
			</section>

			<section className="border-b border-border/60">
				<div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
					<div>
						<Wrench className="size-5 text-muted-foreground" aria-hidden />
						<h2 className="mt-4 font-heading-serif text-3xl leading-tight text-foreground sm:text-4xl">
							What happens in the hour
						</h2>
					</div>
					<ol className="grid gap-3">
						{hourSteps.map((step, index) => (
							<li
								key={step.title}
								className="rounded-md border border-border/70 bg-background p-5"
							>
								<div className="flex items-center gap-3">
									<span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
										{index + 1}
									</span>
									<h3 className="font-semibold text-foreground">
										{step.title}
									</h3>
								</div>
								<p className="mt-3 text-sm leading-6 text-muted-foreground">
									{step.description}
								</p>
							</li>
						))}
					</ol>
				</div>
			</section>

			<section id="booking" className="border-b border-border/60 bg-muted/20">
				<div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
					<div>
						<CalendarClock
							className="size-5 text-muted-foreground"
							aria-hidden
						/>
						<h2 className="mt-4 font-heading-serif text-3xl leading-tight text-foreground sm:text-4xl">
							Book the paid hour through Cal.com.
						</h2>
						<p className="mt-4 text-sm leading-6 text-muted-foreground">
							Scheduling, payment, intake, confirmation, and rescheduling stay
							in one booking system. If the embedded calendar is unavailable,
							the hosted booking page and direct line stay available.
						</p>
					</div>
					<div className="grid content-start gap-5">
						<WorkerSealTeam6CalBooking {...calBookingConfig} />
						<ul className="grid content-start gap-3">
							{bookingFacts.map((fact) => (
								<li
									key={fact}
									className="flex items-start gap-3 rounded-md border border-border/70 bg-background p-4 text-sm leading-6 text-muted-foreground"
								>
									<ShieldCheck
										className="mt-1 size-4 shrink-0 text-foreground"
										aria-hidden
									/>
									<span>{fact}</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			</section>

			<section>
				<div className="mx-auto grid max-w-7xl gap-4 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
					<div className="rounded-md border border-border/70 bg-background p-5">
						<h2 className="font-semibold text-foreground">Need a system?</h2>
						<p className="mt-2 text-sm leading-6 text-muted-foreground">
							Workers is the subscription for ongoing private doctor passes,
							approved loops, and proof across an existing codebase.
						</p>
						<Link
							href={routeConfig.workers}
							className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-foreground underline underline-offset-4"
						>
							Open Workers
							<ArrowRight className="size-4" aria-hidden />
						</Link>
					</div>
					<div className="rounded-md border border-border/70 bg-background p-5">
						<h2 className="font-semibold text-foreground">
							Starting from an idea?
						</h2>
						<p className="mt-2 text-sm leading-6 text-muted-foreground">
							Starter is the one-year path for turning a new idea into source
							truth, a template app, and worker-ready plans.
						</p>
						<Link
							href={routeConfig.starter}
							className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-foreground underline underline-offset-4"
						>
							Open Starter
							<ArrowRight className="size-4" aria-hidden />
						</Link>
					</div>
				</div>
			</section>
		</main>
	);
}
