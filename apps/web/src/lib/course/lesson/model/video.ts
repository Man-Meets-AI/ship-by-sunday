import { apiConfig } from "@/config/product";
import type { LessonConfig, LessonVideoContent } from "./contracts";
import { videoAssets } from "./media";
import { resolveLessonVideoAssetId } from "./video-assignments";

export const BUNNY_DEFAULT_THUMBNAIL_FILE_NAME = "thumbnail.jpg";

export function getBunnyEmbedUrl(libraryId: number | string, videoId: string) {
	return `${apiConfig.bunnyEmbedBaseUrl}/${libraryId}/${videoId}`;
}

export function getBunnyThumbnailSourceUrl({
	videoId,
	thumbnailFileName = BUNNY_DEFAULT_THUMBNAIL_FILE_NAME,
}: {
	videoId: string;
	thumbnailFileName?: string;
}) {
	return `${apiConfig.bunnyStreamCdnBaseUrl}/${encodeURIComponent(videoId)}/${encodeURIComponent(thumbnailFileName)}`;
}

export function getBunnyThumbnailProxyUrl(videoId: string) {
	return `/api/video/thumbnails/${encodeURIComponent(videoId)}`;
}

export function resolveLessonVideoPosterUrl(
	video?: LessonVideoContent | null,
): string | null {
	if (!video || video.status !== "ready") {
		return null;
	}

	if (video.posterUrl) {
		return video.posterUrl;
	}

	if (video.provider === "bunny" && video.libraryId && video.videoId) {
		return getBunnyThumbnailProxyUrl(video.videoId);
	}

	return null;
}

export function resolveLessonVideoUrl(
	video?: LessonVideoContent | null,
): string | null {
	if (!video || video.status !== "ready") {
		return null;
	}

	if (video.provider === "bunny") {
		if (!video.libraryId || !video.videoId) {
			return null;
		}

		return video.url ?? getBunnyEmbedUrl(video.libraryId, video.videoId);
	}

	return video.url ?? null;
}

export function isLessonVideoReady(video?: LessonVideoContent | null): boolean {
	return Boolean(resolveLessonVideoUrl(video));
}

export function hydrateLessonVideoContent(
	video?: LessonVideoContent | null,
): LessonVideoContent | undefined {
	if (!video) {
		return undefined;
	}

	const resolvedUrl = resolveLessonVideoUrl(video);
	if (!resolvedUrl || resolvedUrl === video.url) {
		const resolvedPosterUrl = resolveLessonVideoPosterUrl(video);
		if (!resolvedPosterUrl || resolvedPosterUrl === video.posterUrl) {
			return video;
		}

		return {
			...video,
			posterUrl: resolvedPosterUrl,
		};
	}

	return {
		...video,
		url: resolvedUrl,
		posterUrl: resolveLessonVideoPosterUrl(video) ?? video.posterUrl,
	};
}

export function getVideoAsset(assetId?: string | null) {
	return assetId ? (videoAssets[assetId] ?? null) : null;
}

export function getVideoAssetByBunnyVideoId(videoId?: string | null) {
	if (!videoId) {
		return null;
	}

	for (const video of Object.values(videoAssets)) {
		if (video?.provider === "bunny" && video.videoId === videoId) {
			return video;
		}
	}

	return null;
}

export function getLessonVideoAsset(
	lesson: Pick<LessonConfig, "id"> | null | undefined,
) {
	return lesson ? getVideoAsset(resolveLessonVideoAssetId(lesson.id)) : null;
}

export function attachGeneratedLessonMedia(lesson: LessonConfig): LessonConfig {
	const attachedVideo = getLessonVideoAsset(lesson);
	const mergedVideo = hydrateLessonVideoContent(
		attachedVideo
			? {
					...attachedVideo,
					title: lesson.content.coach.video?.title ?? lesson.title,
					posterUrl:
						lesson.content.coach.video?.posterUrl ?? attachedVideo.posterUrl,
				}
			: lesson.content.coach.video,
	);

	if (mergedVideo === lesson.content.coach.video) {
		return lesson;
	}

	return {
		...lesson,
		content: {
			...lesson.content,
			coach: {
				...lesson.content.coach,
				video: mergedVideo,
			},
		},
	};
}
