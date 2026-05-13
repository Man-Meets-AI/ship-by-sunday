import { Bot, Code2 } from "lucide-react";
import Link from "next/link";

import { AppShell } from "@/app/(workspace)/_components/app-shell";
import type { PaidAppHomeModel } from "@/app/(workspace)/_lib/paid-app-home-model";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

const pathIcons = {
	starter: Code2,
	workers: Bot,
} as const;

export function PaidAppHomePage({
	accountEmail,
	model,
	showCheckoutWelcome,
}: {
	accountEmail?: string;
	model: PaidAppHomeModel;
	showCheckoutWelcome: boolean;
}) {
	return (
		<AppShell viewportMode="app" appScrollMode="page" showSkillRail={false}>
			<div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 pb-10 pt-2">
				<section className="border-b border-border/60 pb-6">
					<p className="text-sm text-muted-foreground">
						{showCheckoutWelcome
							? accountEmail
								? `Access is live for ${accountEmail}.`
								: "Access is live."
							: "Paid app hub"}
					</p>
					<div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
						<div className="max-w-3xl">
							<h1 className="font-heading-serif text-4xl leading-tight text-foreground sm:text-5xl">
								{showCheckoutWelcome ? "You're in." : model.title}
							</h1>
							<p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
								{showCheckoutWelcome
									? "Choose where you want to start. You can come back here anytime from the logo, user menu, or Command-K."
									: model.description}
							</p>
						</div>
						<div className="flex flex-wrap gap-2">
							{model.secondaryLinks.map((link) => (
								<Button key={link.id} asChild variant="outline" size="sm">
									<Link href={link.href}>{link.label}</Link>
								</Button>
							))}
						</div>
					</div>
				</section>
				<section
					aria-label="Product paths"
					className="grid gap-4 md:grid-cols-2"
					data-testid="paid-app-home-paths"
				>
					{model.paths.map((path) => {
						const Icon = pathIcons[path.id];
						return (
							<Card key={path.id} className="flex min-h-[15rem] flex-col">
								<CardHeader>
									<div className="mb-4 flex size-10 items-center justify-center rounded-lg border border-border/70 bg-muted/40">
										<Icon
											className="size-5 text-muted-foreground"
											aria-hidden
										/>
									</div>
									<CardTitle>{path.title}</CardTitle>
									<CardDescription className="leading-6">
										{path.description}
									</CardDescription>
								</CardHeader>
								<CardContent className="flex-1" />
								<CardFooter>
									<Button asChild className="w-full">
										<Link href={path.href}>{path.actionLabel}</Link>
									</Button>
								</CardFooter>
							</Card>
						);
					})}
				</section>
			</div>
		</AppShell>
	);
}
