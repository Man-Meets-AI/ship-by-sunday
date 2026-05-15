import Link from "next/link";
import type { Metadata } from "next";
import {
	Bot,
	CheckCircle2,
	ListChecks,
	ShieldCheck,
	Wrench,
} from "lucide-react";

import { CheckoutButton } from "@/app/checkout/_components/checkout-button";
import {
	PublicRouteContainer,
	PublicRouteDescription,
	PublicRouteEyebrow,
	PublicRouteHeader,
	PublicRouteIcon,
	PublicRouteListItem,
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
		<PublicRoutePage>
			<PublicSiteHeader activeHref={routeConfig.workers} />
			<PublicRouteSection>
				<PublicRouteContainer className="grid min-h-[calc(88svh-4rem)] content-center gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr]">
					<PublicRouteHeader>
						<PublicRouteEyebrow>Ship by Sunday Workers</PublicRouteEyebrow>
						<PublicRouteTitle>
							Install AI workers into your existing codebase.
						</PublicRouteTitle>
						<PublicRouteDescription>
							A private codebase doctor pass, top findings, one approved worker
							loop, and proof or blocked-proof report for founders, agencies,
							and software teams already building with AI.
						</PublicRouteDescription>
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
					</PublicRouteHeader>
					<div className="grid content-center gap-3">
						<PublicRoutePanel>
							<PublicRoutePanelBody>
								<PublicRouteIcon>
									<Wrench className="size-5" aria-hidden />
								</PublicRouteIcon>
								<PublicRoutePanelTitle className="mt-4">
									Founding installs are hands-on.
								</PublicRoutePanelTitle>
								<PublicRoutePanelDescription>
									You get the local runner and Worker system while I help you
									through setup, diagnosis, the first approved loop, and proof
									review as self-serve hardens.
								</PublicRoutePanelDescription>
							</PublicRoutePanelBody>
						</PublicRoutePanel>
						<PublicRoutePanel>
							<PublicRoutePanelBody>
								<PublicRouteIcon>
									<ShieldCheck className="size-5" aria-hidden />
								</PublicRouteIcon>
								<PublicRoutePanelTitle className="mt-4">
									Local by default.
								</PublicRoutePanelTitle>
								<PublicRoutePanelDescription>
									Raw source, secrets, long logs, local absolute paths, and
									Codex transcripts stay out of the app by default.
								</PublicRoutePanelDescription>
							</PublicRoutePanelBody>
						</PublicRoutePanel>
					</div>
				</PublicRouteContainer>
			</PublicRouteSection>
			<PublicRouteSection tone="muted">
				<PublicRouteContainer className="grid gap-10 py-14 lg:grid-cols-2">
					<div>
						<PublicRouteIcon>
							<Bot className="size-5" aria-hidden />
						</PublicRouteIcon>
						<PublicRouteSectionTitle>What happens</PublicRouteSectionTitle>
						<ol className="mt-6 grid gap-3">
							{processSteps.map((step, index) => (
								<PublicRouteListItem key={step}>
									<PublicRouteStepMarker>{index + 1}</PublicRouteStepMarker>
									<span>{step}</span>
								</PublicRouteListItem>
							))}
						</ol>
					</div>
					<div>
						<PublicRouteIcon>
							<ListChecks className="size-5" aria-hidden />
						</PublicRouteIcon>
						<PublicRouteSectionTitle>The first loops</PublicRouteSectionTitle>
						<ul className="mt-6 grid gap-3 sm:grid-cols-2">
							{firstLoops.map((loop) => (
								<PublicRouteListItem key={loop}>
									<CheckCircle2
										className="mt-1 size-4 shrink-0 text-foreground"
										aria-hidden
									/>
									<span>{loop}</span>
								</PublicRouteListItem>
							))}
						</ul>
					</div>
				</PublicRouteContainer>
			</PublicRouteSection>
		</PublicRoutePage>
	);
}
