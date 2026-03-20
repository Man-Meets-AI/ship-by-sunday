"use client";

import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { courseResourceConfig, starterRepoConfig } from "@/config/product";

const readmeHref = `${starterRepoConfig.url}#readme`;

export function CheckoutQaLoopResourcesCard() {
	return (
		<Card>
			<CardHeader className="space-y-1">
				<CardTitle className="text-base">Resources</CardTitle>
				<CardDescription>
					Dependencies for this pass: QA Browser skill, Playwright, Clerk,
					Stripe test mode, and your starter README.
				</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-wrap gap-2">
				<Button variant="secondary" size="sm" asChild>
					<a href={readmeHref} target="_blank" rel="noreferrer">
						README / setup
						<ExternalLink className="ml-1.5 size-3.5 opacity-70" />
					</a>
				</Button>
				<Button variant="secondary" size="sm" asChild>
					<a
						href={courseResourceConfig.buildSetup.clerk}
						target="_blank"
						rel="noreferrer"
					>
						Clerk
						<ExternalLink className="ml-1.5 size-3.5 opacity-70" />
					</a>
				</Button>
				<Button variant="secondary" size="sm" asChild>
					<a
						href={courseResourceConfig.buildSetup.stripe}
						target="_blank"
						rel="noreferrer"
					>
						Stripe
						<ExternalLink className="ml-1.5 size-3.5 opacity-70" />
					</a>
				</Button>
			</CardContent>
		</Card>
	);
}
