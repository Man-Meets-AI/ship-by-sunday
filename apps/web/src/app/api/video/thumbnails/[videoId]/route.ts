import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";

import { apiConfig } from "@/config/product";
import { api } from "@/convex/_generated/api";
import {
	BUNNY_DEFAULT_THUMBNAIL_FILE_NAME,
	getBunnyEmbedUrl,
	getBunnyThumbnailSourceUrl,
	getVideoAssetByBunnyVideoId,
} from "@/lib/course/lesson/model/video";
import { hasProductSurfaceCapability } from "@/platform/access/product-surface-capabilities";

export const runtime = "nodejs";

const THUMBNAIL_CACHE_CONTROL = "private, max-age=86400";

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
	const authState = await auth();
	const token = authState.userId
		? await authState.getToken({ template: apiConfig.convexAuthTokenTemplate })
		: null;
	if (!token) {
		return new Response("Unauthorized", { status: 401 });
	}
	const access = await fetchQuery(
		api.entitlements.viewerProductAccess,
		{},
		{ token },
	);
	if (!hasProductSurfaceCapability(access, "tutorials")) {
		return new Response("Forbidden", { status: 403 });
	}

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
