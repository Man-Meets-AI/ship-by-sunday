import Link from "next/link";
import type { Metadata } from "next";
import {
	Bot,
	CheckCircle2,
	ListChecks,
	ShieldCheck,
	Wrench,
} from "lucide-react";

import { PublicSiteHeader } from "@/app/_components/public-site/public-site-header";
import { CheckoutButton } from "@/app/checkout/_components/checkout-button";
import { Button } from "@/components/ui/button";
import { routeConfig } from "@/config/product";
import { checkoutOffers } from "@/platform/billing/checkout/checkout-offers";

export const metadata: Metadata = {
	title: "Workers",
	description:
		"Install AI workers into your existing codebase with a private doctor pass, top findings, one approved loop, and proof.",
};

const workersOffer = checkoutOffers.workers;

const processSteps = [
	"Pair the local runner",
	"Run the private doctor pass",
	"Review the top findings",
	"Approve one worker loop",
	"Get proof or blocked proof",
	"See the next recommended loop",
] as const;

const firstLoops = [
	"Source Truth Agent Readiness",
	"Broken App Triage",
	"Observability Debuggability",
	"Mature Repo Adoption",
	"Proof Harness",
	"Revenue Path Audit",
	"UX Conversion Snapshot",
	"Test Hardening",
] as const;

export default function WorkersPage() {
	return (
		<main className="min-h-screen bg-background text-foreground">
			<PublicSiteHeader activeHref={routeConfig.workers} />
			<section className="border-b border-border/60">
				<div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl content-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
					<div className="max-w-3xl">
						<p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
							Ship by Sunday Workers
						</p>
						<h1 className="mt-5 font-heading-serif text-5xl leading-[0.98] tracking-normal text-foreground sm:text-7xl">
							Install AI workers into your existing codebase.
						</h1>
						<p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
							A private codebase doctor pass, top findings, one approved worker
							loop, and proof or blocked-proof report for founders, agencies,
							and software teams already building with AI.
						</p>
						<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
							<CheckoutButton
								offerId="workers"
								label={`Get Workers - ${workersOffer.priceDisplay}`}
								testId="workers-checkout-cta"
							/>
							<Button asChild variant="outline" size="lg">
								<Link href={routeConfig.starter}>
									I am starting from an idea
								</Link>
							</Button>
						</div>
					</div>
					<div className="grid content-center gap-3">
						<div className="rounded-md border border-border/70 bg-muted/30 p-5">
							<Wrench className="size-5 text-muted-foreground" aria-hidden />
							<h2 className="mt-4 text-xl font-semibold text-foreground">
								Founding installs are hands-on.
							</h2>
							<p className="mt-2 text-sm leading-6 text-muted-foreground">
								You get the local runner and Worker system while I help you
								through setup, diagnosis, the first approved loop, and proof
								review as self-serve hardens.
							</p>
						</div>
						<div className="rounded-md border border-border/70 bg-background p-5">
							<ShieldCheck
								className="size-5 text-muted-foreground"
								aria-hidden
							/>
							<h2 className="mt-4 text-xl font-semibold text-foreground">
								Local by default.
							</h2>
							<p className="mt-2 text-sm leading-6 text-muted-foreground">
								Raw source, secrets, long logs, local absolute paths, and Codex
								transcripts stay out of the app by default.
							</p>
						</div>
					</div>
				</div>
			</section>
			<section className="border-b border-border/60 bg-muted/20">
				<div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
					<div>
						<Bot className="size-5 text-muted-foreground" aria-hidden />
						<h2 className="mt-4 font-heading-serif text-3xl leading-tight text-foreground sm:text-4xl">
							What happens
						</h2>
						<ol className="mt-6 grid gap-3">
							{processSteps.map((step, index) => (
								<li
									key={step}
									className="flex items-start gap-3 rounded-md border border-border/70 bg-background p-4 text-sm leading-6 text-muted-foreground"
								>
									<span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
										{index + 1}
									</span>
									<span>{step}</span>
								</li>
							))}
						</ol>
					</div>
					<div>
						<ListChecks className="size-5 text-muted-foreground" aria-hidden />
						<h2 className="mt-4 font-heading-serif text-3xl leading-tight text-foreground sm:text-4xl">
							The first loops
						</h2>
						<ul className="mt-6 grid gap-3 sm:grid-cols-2">
							{firstLoops.map((loop) => (
								<li
									key={loop}
									className="flex items-start gap-3 rounded-md border border-border/70 bg-background p-4 text-sm leading-6 text-muted-foreground"
								>
									<CheckCircle2
										className="mt-1 size-4 shrink-0 text-foreground"
										aria-hidden
									/>
									<span>{loop}</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			</section>
		</main>
	);
}
