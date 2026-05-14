import { NextResponse } from "next/server";

import {
	syncWorkerSealTeam6CalWebhookToConvex,
	verifyCalWebhookSignature,
	WorkerSealTeam6CalWebhookPayloadError,
} from "@/lib/cal/worker-seal-team-6-webhook";
import { requireServerEnv } from "@/platform/env/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
	const payload = await request.text();
	const signature = request.headers.get("x-cal-signature-256");
	if (!signature) {
		return NextResponse.json(
			{ error: "Missing Cal.com signature." },
			{ status: 400 },
		);
	}

	let webhookSecret: string;
	try {
		webhookSecret = requireServerEnv("CAL_WEBHOOK_SECRET");
	} catch (error) {
		console.error("Cal.com webhook is missing provider configuration", {
			error,
		});
		return NextResponse.json(
			{ error: "Cal.com webhook is not configured." },
			{ status: 500 },
		);
	}

	if (
		!verifyCalWebhookSignature({
			payload,
			signature,
			secret: webhookSecret,
		})
	) {
		return NextResponse.json(
			{ error: "Invalid Cal.com signature." },
			{ status: 400 },
		);
	}

	try {
		const result = await syncWorkerSealTeam6CalWebhookToConvex(payload);
		return NextResponse.json({
			received: true,
			result: result.kind,
		});
	} catch (error) {
		if (error instanceof WorkerSealTeam6CalWebhookPayloadError) {
			return NextResponse.json({ error: error.message }, { status: 400 });
		}

		console.error("Cal.com Worker Seal Team 6 webhook sync failed", {
			error,
		});
		return NextResponse.json(
			{ error: "Unable to sync Cal.com booking event." },
			{ status: 500 },
		);
	}
}
