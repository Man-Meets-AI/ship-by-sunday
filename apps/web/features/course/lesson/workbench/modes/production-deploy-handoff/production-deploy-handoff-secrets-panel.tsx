"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { README_DEPLOY_PROMPT } from "./production-deploy-handoff-constants";

function buildFullPacket(args: {
	productName: string;
	domain: string;
	cloudflareToken: string;
	stripeSecret: string;
	clerkKeys: string;
}) {
	return `${README_DEPLOY_PROMPT}

---
Context (non-secret)
Product name: ${args.productName.trim() || "(not set)"}
Domain: ${args.domain.trim() || "(not set)"}

---
Production credentials (for your agent / env only—never commit or stream)
Cloudflare API token: ${args.cloudflareToken.trim() || "(empty)"}
Stripe live secret key: ${args.stripeSecret.trim() || "(empty)"}
Clerk production keys: ${args.clerkKeys.trim() || "(empty)"}
`;
}

export function ProductionDeployHandoffSecretsPanel({
	productName,
	domain,
}: {
	productName: string;
	domain: string;
}) {
	const [cloudflareToken, setCloudflareToken] = useState("");
	const [stripeSecret, setStripeSecret] = useState("");
	const [clerkKeys, setClerkKeys] = useState("");

	async function copyFullPacket() {
		try {
			await navigator.clipboard.writeText(
				buildFullPacket({
					productName,
					domain,
					cloudflareToken,
					stripeSecret,
					clerkKeys,
				}),
			);
			toast.success("Full handoff copied—paste only in a private agent session");
		} catch {
			toast.error("Could not copy");
		}
	}

	return (
		<Card>
			<CardHeader className="space-y-1">
				<CardTitle className="text-base">Gather credentials (not saved here)</CardTitle>
				<CardDescription>
					Values below stay in this browser session only—they are not stored on our
					servers. Paste into your agent or hosting env when you are ready.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="deploy-handoff-cf-token">Cloudflare API token</Label>
					<Input
						id="deploy-handoff-cf-token"
						type="password"
						autoComplete="off"
						value={cloudflareToken}
						onChange={(e) => setCloudflareToken(e.target.value)}
						placeholder="Paste token when ready"
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="deploy-handoff-stripe">
						Stripe live secret key (paste)
					</Label>
					<Input
						id="deploy-handoff-stripe"
						type="password"
						autoComplete="off"
						value={stripeSecret}
						onChange={(e) => setStripeSecret(e.target.value)}
						placeholder="sk_live_…"
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="deploy-handoff-clerk">Clerk keys</Label>
					<p className="text-sm text-muted-foreground">
						Publishable + secret from your production Clerk instance.
					</p>
					<Textarea
						id="deploy-handoff-clerk"
						className="min-h-[72px] font-mono text-xs"
						autoComplete="off"
						value={clerkKeys}
						onChange={(e) => setClerkKeys(e.target.value)}
						placeholder="NEXT_PUBLIC_CLERK_… and CLERK_SECRET_KEY…"
					/>
				</div>
				<Button type="button" variant="outline" size="sm" onClick={copyFullPacket}>
					Copy full handoff packet
				</Button>
			</CardContent>
		</Card>
	);
}
