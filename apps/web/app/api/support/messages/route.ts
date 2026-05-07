import {
	getSupportMessagesFromRequest,
	sendSupportMessageFromRequest,
} from "@/app/api/support/_server/support-message-route";

export async function GET(request: Request) {
	return await getSupportMessagesFromRequest(request);
}

export async function POST(request: Request) {
	return await sendSupportMessageFromRequest(request);
}
