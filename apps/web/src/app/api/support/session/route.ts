import { getSupportSessionFromRequest } from "@/app/api/support/_server/support-message-route";

export async function GET(request: Request) {
	return await getSupportSessionFromRequest(request);
}
