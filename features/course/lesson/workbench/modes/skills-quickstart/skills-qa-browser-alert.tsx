"use client";

import { AlertTriangleIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function SkillsQaBrowserAlert() {
	return (
		<Alert variant="default">
			<AlertTriangleIcon />
			<AlertTitle>QA Browser — check these first</AlertTitle>
			<AlertDescription className="space-y-2 text-muted-foreground">
				<ul className="list-inside list-disc space-y-1 text-sm">
					<li>
						Exercise flows as a{" "}
						<strong className="text-foreground">test user</strong>, not your
						admin account, when you care about real buyer behavior.
					</li>
					<li>
						<strong className="text-foreground">Clerk</strong> may need relaxed
						security settings in non-prod so automated sign-in can complete.
					</li>
					<li>
						Keep <strong className="text-foreground">Stripe</strong> mode parity
						(test vs live) aligned with the URL you are testing.
					</li>
					<li>
						Some flows still need{" "}
						<strong className="text-foreground">manual password entry</strong>{" "}
						in the browser — do not assume full hands-off auth every time.
					</li>
				</ul>
			</AlertDescription>
		</Alert>
	);
}
