import type { LessonResourceContent } from "@/content/lessons/types";
import contentManifestJson from "@/lib/course/content-manifest.json";

type LessonContentManifest = {
	lessons: Record<string, { slug: string }>;
	worksheetResourcesByBlock: Record<string, LessonResourceContent[]>;
	templateResourcesByLessonId: Record<
		string,
		{
			label: string;
			href: string;
		}
	>;
};

export const lessonContentManifest =
	contentManifestJson as LessonContentManifest;
