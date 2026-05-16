import type { HomePageContent } from "@/app/_content/home-page";
import type { HomePageCodebaseDraftHandle } from "@/app/_components/home-page/sections/codebase-demo/use-home-page-codebase-draft";

export type StarterPreviewSection = HomePageContent["productPreviewSection"];
export type StarterPreviewSectionRow =
	StarterPreviewSection["sections"][number];
export type StarterPreviewDraft = HomePageCodebaseDraftHandle;
