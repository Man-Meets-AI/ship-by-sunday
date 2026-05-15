import { Bot, Code2 } from "lucide-react";
import Link from "next/link";

import { AppShell } from "@/app/(app)/_components/app-shell";
import type { PaidAppHomeModel } from "@/app/(app)/_lib/paid-app-home-model";
import {
	ProtectedRouteDescription,
	ProtectedRouteEyebrow,
	ProtectedRouteHeader,
	ProtectedRouteIcon,
	ProtectedRoutePage,
	ProtectedRoutePanel,
	ProtectedRoutePanelBody,
	ProtectedRoutePanelDescription,
	ProtectedRoutePanelHeader,
	ProtectedRoutePanelTitle,
	ProtectedRouteTitle,
} from "@/components/app/protected-route-surface";
import { Button } from "@/components/ui/button";

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
			<ProtectedRoutePage className="max-w-6xl gap-6">
				<ProtectedRouteHeader
					actions={
						model.secondaryLinks.length > 0 ? (
							<div className="flex flex-wrap gap-2">
								{model.secondaryLinks.map((link) => (
									<Button key={link.id} asChild variant="outline" size="sm">
										<Link href={link.href}>{link.label}</Link>
									</Button>
								))}
							</div>
						) : null
					}
				>
					<ProtectedRouteEyebrow>
						{showCheckoutWelcome
							? accountEmail
								? `Access is live for ${accountEmail}.`
								: "Access is live."
							: "Paid app hub"}
					</ProtectedRouteEyebrow>
					<ProtectedRouteTitle>
						{showCheckoutWelcome ? "You're in." : model.title}
					</ProtectedRouteTitle>
					<ProtectedRouteDescription>
						{showCheckoutWelcome
							? "Choose where you want to start. You can come back here anytime from the logo, user menu, or Command-K."
							: model.description}
					</ProtectedRouteDescription>
				</ProtectedRouteHeader>
				<section
					aria-label="Product paths"
					className="grid gap-4 md:grid-cols-2"
					data-testid="paid-app-home-paths"
				>
					{model.paths.map((path) => {
						const Icon = pathIcons[path.id];
						return (
							<ProtectedRoutePanel
								key={path.id}
								className="flex min-h-[15rem] flex-col"
							>
								<ProtectedRoutePanelHeader>
									<ProtectedRouteIcon className="mb-2">
										<Icon className="size-5" aria-hidden />
									</ProtectedRouteIcon>
									<ProtectedRoutePanelTitle>
										{path.title}
									</ProtectedRoutePanelTitle>
									<ProtectedRoutePanelDescription>
										{path.description}
									</ProtectedRoutePanelDescription>
								</ProtectedRoutePanelHeader>
								<ProtectedRoutePanelBody className="mt-auto">
									<Button asChild className="w-full">
										<Link href={path.href}>{path.actionLabel}</Link>
									</Button>
								</ProtectedRoutePanelBody>
							</ProtectedRoutePanel>
						);
					})}
				</section>
			</ProtectedRoutePage>
		</AppShell>
	);
}
