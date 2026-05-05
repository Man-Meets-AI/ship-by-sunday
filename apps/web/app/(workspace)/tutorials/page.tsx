import type { Metadata } from "next";

import { TutorialVideosPage } from "./_components/tutorial-videos-page";
import { buildTutorialVideoLibrary } from "./_lib/tutorial-video-library";

export const metadata: Metadata = {
	title: "Tutorial Videos",
};

export default function TutorialsPage() {
	return <TutorialVideosPage library={buildTutorialVideoLibrary()} />;
}
