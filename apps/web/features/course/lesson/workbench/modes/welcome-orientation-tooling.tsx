"use client";

import Link from "next/link";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { routeConfig } from "@/config/product";

import { WELCOME_RECOMMENDED_STACK_DATE_LABEL } from "./welcome-orientation-constants";

export function WelcomeOrientationTooling() {
	return (
		<div className="space-y-3">
			<Alert>
				<AlertTitle>Recommended stack</AlertTitle>
				<AlertDescription>
					Tooling guidance is date-stamped:{" "}
					<span className="font-medium text-foreground">
						as of {WELCOME_RECOMMENDED_STACK_DATE_LABEL}
					</span>
					. When vendors ship breaking changes, we update the sprint
					materials—not your discipline.
				</AlertDescription>
			</Alert>
			<Accordion type="single" collapsible className="w-full">
				<AccordionItem value="tooling">
					<AccordionTrigger>Tooling for this course</AccordionTrigger>
					<AccordionContent className="text-muted-foreground">
						<p>
							Default path: OpenAI workspace with{" "}
							<span className="font-medium text-foreground">Codex</span> for
							implementation. Same sprint if you prefer{" "}
							<span className="font-medium text-foreground">Claude</span>—pick
							one stack and finish reps.
						</p>
					</AccordionContent>
				</AccordionItem>
			</Accordion>
			<Separator />
			<div className="flex flex-wrap gap-3">
				<Button variant="outline" size="sm" asChild>
					<Link href={routeConfig.docs}>Setup docs</Link>
				</Button>
			</div>
		</div>
	);
}
