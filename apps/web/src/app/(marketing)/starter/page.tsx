import Link from "next/link";
import type { Metadata } from "next";
import {
	ArrowRight,
	ClipboardList,
	PlayCircle,
	WandSparkles,
} from "lucide-react";

import { PublicSiteHeader } from "@/app/_components/public-site/public-site-header";
import { CheckoutButton } from "@/app/checkout/_components/checkout-button";
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
		<main className="min-h-screen bg-background text-foreground">
			<PublicSiteHeader activeHref={routeConfig.starter} />
			<section className="border-b border-border/60">
				<div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl content-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
					<div className="max-w-3xl">
						<p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
							Starter
						</p>
						<h1 className="mt-5 font-heading-serif text-5xl leading-[0.98] tracking-normal text-foreground sm:text-7xl">
							Ship your idea by Sunday.
						</h1>
						<p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
							Answer guided product questions to get a customized AI-ready repo
							path with source truth, a Program, and ExecPlans, or start from
							the template app and follow the guided videos.
						</p>
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
					</div>
					<div className="grid content-center gap-3">
						<div className="rounded-md border border-border/70 bg-muted/30 p-5">
							<ClipboardList
								className="size-5 text-muted-foreground"
								aria-hidden
							/>
							<h2 className="mt-4 text-xl font-semibold text-foreground">
								Customized path
							</h2>
							<p className="mt-2 text-sm leading-6 text-muted-foreground">
								Use the step-by-step questions when you want the repo docs and
								operating spine shaped around your idea.
							</p>
						</div>
						<div className="rounded-md border border-border/70 bg-background p-5">
							<PlayCircle
								className="size-5 text-muted-foreground"
								aria-hidden
							/>
							<h2 className="mt-4 text-xl font-semibold text-foreground">
								Template plus videos
							</h2>
							<p className="mt-2 text-sm leading-6 text-muted-foreground">
								Skip customization when you want the template app and guided
								build-along videos first.
							</p>
						</div>
					</div>
				</div>
			</section>
			<section className="border-b border-border/60 bg-muted/20">
				<div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
					<div>
						<WandSparkles
							className="size-5 text-muted-foreground"
							aria-hidden
						/>
						<h2 className="mt-4 font-heading-serif text-3xl leading-tight text-foreground sm:text-4xl">
							Built for people leveling up from vibe coding.
						</h2>
						<p className="mt-4 text-sm leading-6 text-muted-foreground">
							Starter is for the moment when prompts and no-code-ish tools are
							not enough, but you still want an AI-first build path.
						</p>
					</div>
					<ul className="grid gap-3 sm:grid-cols-2">
						{includedItems.map((item) => (
							<li
								key={item}
								className="flex items-start gap-3 rounded-md border border-border/70 bg-background p-4 text-sm leading-6 text-muted-foreground"
							>
								<ArrowRight
									className="mt-1 size-4 shrink-0 text-foreground"
									aria-hidden
								/>
								<span>{item}</span>
							</li>
						))}
					</ul>
				</div>
			</section>
		</main>
	);
}
