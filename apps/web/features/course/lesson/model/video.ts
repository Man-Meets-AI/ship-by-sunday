import { apiConfig } from "@/config/product";
import type { LessonConfig, LessonVideoContent } from "./contracts";
import { videoAssets } from "./media";
import { resolveLessonVideoAssetId } from "./video-assignments";

export function getBunnyEmbedUrl(libraryId: number | string, videoId: string) {
	return `${apiConfig.bunnyEmbedBaseUrl}/${libraryId}/${videoId}`;
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
		return video;
	}

	return {
		...video,
		url: resolvedUrl,
	};
}

export function getVideoAsset(assetId?: string | null) {
	return assetId ? (videoAssets[assetId] ?? null) : null;
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
