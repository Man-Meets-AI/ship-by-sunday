import {
	BUNNY_DEFAULT_THUMBNAIL_FILE_NAME,
	getBunnyEmbedUrl,
	getBunnyThumbnailSourceUrl,
	getVideoAssetByBunnyVideoId,
} from "@/lib/course/lesson/model/video";

export const runtime = "nodejs";

const THUMBNAIL_CACHE_CONTROL =
	"public, max-age=86400, s-maxage=2592000, stale-while-revalidate=604800";

function imageResponse(body: BodyInit, upstreamResponse: Response) {
	return new Response(body, {
		status: 200,
		headers: {
			"Cache-Control": THUMBNAIL_CACHE_CONTROL,
			"Content-Type":
				upstreamResponse.headers.get("content-type") ?? "image/jpeg",
		},
	});
}

export async function GET(
	_request: Request,
	context: { params: Promise<{ videoId: string }> },
) {
	const { videoId } = await context.params;
	const video = getVideoAssetByBunnyVideoId(videoId);

	if (
		!video ||
		video.provider !== "bunny" ||
		!video.libraryId ||
		!video.videoId
	) {
		return new Response("Unknown tutorial video.", {
			status: 404,
			headers: {
				"Cache-Control": "public, max-age=300",
			},
		});
	}

	const thumbnailUrl = getBunnyThumbnailSourceUrl({
		videoId: video.videoId,
		thumbnailFileName:
			video.thumbnailFileName ?? BUNNY_DEFAULT_THUMBNAIL_FILE_NAME,
	});
	const playerUrl = getBunnyEmbedUrl(video.libraryId, video.videoId);

	try {
		const upstreamResponse = await fetch(thumbnailUrl, {
			headers: {
				Accept: "image/*",
				Referer: playerUrl,
			},
			cache: "force-cache",
		});

		if (!upstreamResponse.ok) {
			return new Response("Tutorial video thumbnail unavailable.", {
				status: 502,
				headers: {
					"Cache-Control": "no-store",
				},
			});
		}

		return imageResponse(
			await upstreamResponse.arrayBuffer(),
			upstreamResponse,
		);
	} catch {
		return new Response("Tutorial video thumbnail unavailable.", {
			status: 502,
			headers: {
				"Cache-Control": "no-store",
			},
		});
	}
}
