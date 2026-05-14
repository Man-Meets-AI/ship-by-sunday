import { NextResponse } from "next/server";

import {
	syncWorkerSealTeam6CalWebhookToConvex,
	verifyCalWebhookSignature,
	WorkerSealTeam6CalWebhookPayloadError,
} from "@/lib/cal/worker-seal-team-6-webhook";
import { requireServerEnv } from "@/platform/env/server";

export const dynamic = "force-dynamic";

const maxCalWebhookBodyBytes = 128 * 1024;

export async function POST(request: Request) {
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

	const payloadResult = await readCalWebhookBody(request);
	if (payloadResult.kind === "too_large") {
		return NextResponse.json(
			{ error: "Cal.com webhook body is too large." },
			{ status: 413 },
		);
	}
	const payload = payloadResult.body;

	if (
		!verifyCalWebhookSignature({
			payload: payloadResult.bodyBytes,
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

async function readCalWebhookBody(
	request: Request,
): Promise<
	{ kind: "ok"; body: string; bodyBytes: Uint8Array } | { kind: "too_large" }
> {
	const contentLength = parseContentLength(
		request.headers.get("content-length"),
	);
	if (contentLength !== null && contentLength > maxCalWebhookBodyBytes) {
		return { kind: "too_large" };
	}

	if (!request.body) {
		return { kind: "ok", body: "", bodyBytes: new Uint8Array() };
	}

	const reader = request.body.getReader();
	const chunks: Uint8Array[] = [];
	let bytesRead = 0;

	while (true) {
		const { done, value } = await reader.read();
		if (done) {
			break;
		}

		bytesRead += value.byteLength;
		if (bytesRead > maxCalWebhookBodyBytes) {
			await reader.cancel();
			return { kind: "too_large" };
		}

		chunks.push(value);
	}

	const bodyBytes = new Uint8Array(bytesRead);
	let offset = 0;
	for (const chunk of chunks) {
		bodyBytes.set(chunk, offset);
		offset += chunk.byteLength;
	}

	return { kind: "ok", body: new TextDecoder().decode(bodyBytes), bodyBytes };
}

function parseContentLength(value: string | null) {
	if (!value) {
		return null;
	}

	const parsedValue = Number(value);
	return Number.isSafeInteger(parsedValue) && parsedValue >= 0
		? parsedValue
		: null;
}
