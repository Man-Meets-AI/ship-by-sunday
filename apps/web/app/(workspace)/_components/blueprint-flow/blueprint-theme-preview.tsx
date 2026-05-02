"use client";

import { useEffect, useMemo, useRef } from "react";
import {
	PreviewSidebar,
	PreviewTopBar,
} from "@/app/(workspace)/_components/blueprint-flow/blueprint-theme-preview-frame";
import {
	PreviewBadgeRow,
	PreviewInputRow,
	PreviewStatCard,
	PreviewWelcomeCard,
} from "@/app/(workspace)/_components/blueprint-flow/blueprint-theme-preview-stack";
import type { PresetConfig } from "@/lib/blueprint-flow/blueprint-theme-helpers";
import { getPreviewIcons } from "@/lib/blueprint-flow/blueprint-theme-icons";
import {
	buildPreviewCssVars,
	getGoogleFontsUrl,
} from "@/lib/blueprint-flow/blueprint-theme-tokens";

type BlueprintThemePreviewProps = {
	config: PresetConfig;
};

export function BlueprintThemePreview({ config }: BlueprintThemePreviewProps) {
	const vars = useMemo(() => buildPreviewCssVars(config), [config]);
	const icons = useMemo(
		() => getPreviewIcons(config.iconLibrary),
		[config.iconLibrary],
	);
	const isInverted =
		config.menuColor === "inverted" ||
		config.menuColor === "inverted-translucent";
	const isBoldAccent = config.menuAccent === "bold";

	useGoogleFont(config.font);

	return (
		<div
			className="sticky top-24 flex flex-col overflow-hidden rounded-xl border border-border/60 shadow-sm transition-all duration-300 motion-reduce:transition-none"
			style={{
				...vars,
				backgroundColor: "var(--background)",
				color: "var(--foreground)",
			}}
		>
			<PreviewTopBar icons={icons} />
			<div className="flex min-h-[280px]">
				<PreviewSidebar
					icons={icons}
					isInverted={isInverted}
					isBoldAccent={isBoldAccent}
				/>
				<div
					className="flex flex-1 flex-col p-3.5"
					style={{ gap: "var(--preview-gap)" }}
				>
					<PreviewWelcomeCard style={config.style} />
					<div className="grid grid-cols-2 gap-2">
						<PreviewStatCard label="Revenue" value="$4,280" delta="+12%" />
						<PreviewStatCard label="Users" value="1,847" delta="+8%" />
					</div>
					<PreviewInputRow />
					<PreviewBadgeRow config={config} />
				</div>
			</div>
		</div>
	);
}

function useGoogleFont(font: string) {
	const linkRef = useRef<HTMLLinkElement | null>(null);

	useEffect(() => {
		const url = getGoogleFontsUrl(font);
		if (!url) return;

		if (linkRef.current) {
			linkRef.current.href = url;
			return;
		}

		const link = document.createElement("link");
		link.rel = "stylesheet";
		link.href = url;
		link.dataset.previewFont = font;
		document.head.appendChild(link);
		linkRef.current = link;

		return () => {
			link.remove();
			linkRef.current = null;
		};
	}, [font]);
}
