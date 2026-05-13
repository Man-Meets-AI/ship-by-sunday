import { prepareSupportAttachmentUploadFromRequest } from "@/app/api/support/_server/support-message-route";

export async function POST(request: Request) {
	return await prepareSupportAttachmentUploadFromRequest(request);
}
