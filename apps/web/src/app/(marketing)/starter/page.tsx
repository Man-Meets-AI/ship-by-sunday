import Link from "next/link";
import type { Metadata } from "next";
import {
	ArrowRight,
	ClipboardList,
	PlayCircle,
	WandSparkles,
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
	PublicRouteTitle,
} from "@/components/layout/public-route-surface";
import { PublicSiteHeader } from "@/components/layout/public-site-header";
import { Button } from "@/components/ui/button";
import { routeConfig } from "@/config/product";
import { checkoutOffers } from "@/platform/billing/checkout/checkout-offers";

export const metadata: Metadata = {
	title: "Starter",
	description:
		"Ship your idea by Sunday with guided product questions, a customized AI-ready repo path, a template app, and guided videos.",
};

const starterOffer = checkoutOffers.starter;

const includedItems = [
	"Guided product questions",
	"Customized repo source truth",
	"Program and ExecPlans for the generated app path",
	"Starter template app",
	"Guided videos",
	"Auth, database, payments, and launch flow walkthroughs",
] as const;

export default function StarterPage() {
	return (
		<PublicRoutePage>
			<PublicSiteHeader activeHref={routeConfig.starter} />
			<PublicRouteSection>
				<PublicRouteContainer className="grid min-h-[calc(88svh-4rem)] content-center gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr]">
					<PublicRouteHeader>
						<PublicRouteEyebrow>Starter</PublicRouteEyebrow>
						<PublicRouteTitle>Ship your idea by Sunday.</PublicRouteTitle>
						<PublicRouteDescription>
							Answer guided product questions to get a customized AI-ready repo
							path with source truth, a Program, and ExecPlans, or start from
							the template app and follow the guided videos.
						</PublicRouteDescription>
						<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
							<CheckoutButton
								offerId="starter"
								label={`Get Starter - ${starterOffer.priceDisplay}`}
								testId="starter-checkout-cta"
							/>
							<Button asChild variant="outline" size="lg">
								<Link href={routeConfig.workers}>
									I already have a codebase
								</Link>
							</Button>
						</div>
					</PublicRouteHeader>
					<div className="grid content-center gap-3">
						<PublicRoutePanel>
							<PublicRoutePanelBody>
								<PublicRouteIcon>
									<ClipboardList className="size-5" aria-hidden />
								</PublicRouteIcon>
								<PublicRoutePanelTitle className="mt-4">
									Customized path
								</PublicRoutePanelTitle>
								<PublicRoutePanelDescription>
									Use the step-by-step questions when you want the repo docs and
									operating spine shaped around your idea.
								</PublicRoutePanelDescription>
							</PublicRoutePanelBody>
						</PublicRoutePanel>
						<PublicRoutePanel>
							<PublicRoutePanelBody>
								<PublicRouteIcon>
									<PlayCircle className="size-5" aria-hidden />
								</PublicRouteIcon>
								<PublicRoutePanelTitle className="mt-4">
									Template plus videos
								</PublicRoutePanelTitle>
								<PublicRoutePanelDescription>
									Skip customization when you want the template app and guided
									build-along videos first.
								</PublicRoutePanelDescription>
							</PublicRoutePanelBody>
						</PublicRoutePanel>
					</div>
				</PublicRouteContainer>
			</PublicRouteSection>
			<PublicRouteSection tone="muted">
				<PublicRouteContainer className="grid gap-8 py-14 lg:grid-cols-[0.8fr_1.2fr]">
					<div>
						<PublicRouteIcon>
							<WandSparkles className="size-5" aria-hidden />
						</PublicRouteIcon>
						<PublicRouteSectionTitle>
							Built for people leveling up from vibe coding.
						</PublicRouteSectionTitle>
						<p className="mt-4 text-sm leading-6 text-muted-foreground">
							Starter is for the moment when prompts and no-code-ish tools are
							not enough, but you still want an AI-first build path.
						</p>
					</div>
					<ul className="grid gap-3 sm:grid-cols-2">
						{includedItems.map((item) => (
							<PublicRouteListItem key={item}>
								<ArrowRight
									className="mt-1 size-4 shrink-0 text-foreground"
									aria-hidden
								/>
								<span>{item}</span>
							</PublicRouteListItem>
						))}
					</ul>
				</PublicRouteContainer>
			</PublicRouteSection>
		</PublicRoutePage>
	);
}
