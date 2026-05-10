export type SupportMessage = {
	readonly id: string;
	readonly source: "visitor" | "operator" | "system";
	readonly body: string | null;
	readonly attachment: SupportMessageAttachment | null;
	readonly createdAt: number;
	readonly deliveryStatus:
		| "not_required"
		| "sending"
		| "delivered_to_parker"
		| "delivery_failed";
	readonly deliveryFailureClass: string | null;
};

export type SupportMessageAttachment = {
	readonly kind: "screenshot";
	readonly fileName: string;
	readonly contentType: string;
	readonly size: number;
	readonly url: string | null;
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

export type SupportOutgoingAttachment = {
	readonly kind: "screenshot";
	readonly file: File;
};

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
	attachment,
}: {
	readonly messageText: string;
	readonly pagePath: string;
	readonly entrySurface: SupportWidgetEntrySurface;
	readonly attachment: SupportOutgoingAttachment | null;
}) {
	const uploadedAttachment = attachment
		? await uploadSupportAttachment(attachment.file)
		: null;
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
			attachment: uploadedAttachment,
		}),
	});
	return await readSupportThreadResponse(response);
}

async function uploadSupportAttachment(file: File) {
	const uploadUrlResponse = await fetch("/api/support/attachments", {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			fileName: file.name,
			contentType: file.type,
			size: file.size,
		}),
	});
	const uploadUrlBody = (await uploadUrlResponse.json().catch(() => null)) as {
		uploadUrl?: string;
		error?: string;
	} | null;
	if (!uploadUrlResponse.ok || !uploadUrlBody?.uploadUrl) {
		throw new Error(uploadUrlBody?.error ?? "Unable to prepare screenshot.");
	}

	const storageResponse = await fetch(uploadUrlBody.uploadUrl, {
		method: "POST",
		headers: {
			"Content-Type": file.type,
		},
		body: file,
	});
	const storageBody = (await storageResponse.json().catch(() => null)) as {
		storageId?: string;
	} | null;
	if (!storageResponse.ok || !storageBody?.storageId) {
		throw new Error("Unable to upload screenshot.");
	}

	return {
		kind: "screenshot",
		storageId: storageBody.storageId,
		fileName: file.name,
		contentType: file.type,
		size: file.size,
	};
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
