import {
	isBunnyEmbedUrl,
	verifyBunnyEmbedUrl,
} from "@/lib/course/lesson/lib/video-verification";

export const runtime = "nodejs";

export async function GET(request: Request) {
	const requestUrl = new URL(request.url);
	const videoUrl = requestUrl.searchParams.get("url");

	if (!videoUrl || !isBunnyEmbedUrl(videoUrl)) {
		return Response.json(
			{ error: "Invalid Bunny video url." },
			{
				status: 400,
				headers: {
					"Cache-Control": "no-store",
				},
			},
		);
	}

	try {
		const availability = await verifyBunnyEmbedUrl(videoUrl);

		return Response.json(availability, {
			status: 200,
			headers: {
				"Cache-Control": "no-store",
			},
		});
	} catch {
		return Response.json(
			{ kind: "error" },
			{
				status: 502,
				headers: {
					"Cache-Control": "no-store",
				},
			},
		);
	}
}
