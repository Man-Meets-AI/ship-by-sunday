export type SupportMessage = {
	readonly id: string;
	readonly source: "visitor" | "operator" | "system";
	readonly body: string | null;
	readonly createdAt: number;
	readonly deliveryStatus:
		| "not_required"
		| "sending"
		| "delivered_to_parker"
		| "delivery_failed";
	readonly deliveryFailureClass: string | null;
};

export type SupportThreadState = {
	readonly status: "empty" | "open" | "closed" | "disabled";
	readonly supportId: string | null;
	readonly messages: readonly SupportMessage[];
	readonly fallbackHref: string;
	readonly error: string | null;
};

export type SupportWidgetEntrySurface =
	| "homepage_support_widget"
	| "workspace_support_widget";

export async function loadSupportThread() {
	const response = await fetch("/api/support/messages", {
		method: "GET",
		headers: {
			Accept: "application/json",
		},
		cache: "no-store",
	});
	return await readSupportThreadResponse(response);
}

export async function sendSupportMessage({
	messageText,
	pagePath,
	entrySurface,
}: {
	readonly messageText: string;
	readonly pagePath: string;
	readonly entrySurface: SupportWidgetEntrySurface;
}) {
	const response = await fetch("/api/support/messages", {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			messageText,
			pagePath,
			entrySurface,
		}),
	});
	return await readSupportThreadResponse(response);
}

async function readSupportThreadResponse(response: Response) {
	const body = (await response.json().catch(() => null)) as
		| SupportThreadState
		| { error?: string }
		| null;

	if (!response.ok) {
		throw new Error(
			body && "error" in body && body.error
				? body.error
				: "Unable to load support.",
		);
	}

	if (!body || !("messages" in body)) {
		throw new Error("Support returned an invalid response.");
	}

	return body;
}
