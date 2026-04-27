"use client";

import { useEffect, useMemo, useRef } from "react";
import type { PresetConfig } from "@/lib/blueprint-flow/blueprint-theme-helpers";
import {
	buildPreviewCssVars,
	getGoogleFontsUrl,
} from "@/lib/blueprint-flow/blueprint-theme-tokens";
import { getPreviewIcons } from "@/lib/blueprint-flow/blueprint-theme-icons";

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
			className="sticky top-24 flex flex-col overflow-hidden rounded-xl border border-border/60 shadow-sm transition-all duration-300"
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

// ---------------------------------------------------------------------------
// Font loader — injects a Google Fonts <link> into <head> on font change.
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

type IconSet = ReturnType<typeof getPreviewIcons>;

function PreviewTopBar({ icons }: { icons: IconSet }) {
	const BellIcon = icons.Bell;

	return (
		<div
			className="flex h-8 items-center justify-between px-3"
			style={{ borderBottom: "1px solid var(--border)" }}
		>
			<div className="flex items-center gap-1.5">
				<div
					className="size-2.5 rounded-full"
					style={{ backgroundColor: "var(--primary)" }}
				/>
				<span
					className="text-[11px] font-medium"
					style={{ color: "var(--foreground)", opacity: 0.8 }}
				>
					my-app
				</span>
			</div>
			<div className="flex items-center gap-1">
				<BellIcon className="size-3 opacity-40" />
				<div
					className="size-4 rounded-full"
					style={{ backgroundColor: "var(--muted)" }}
				/>
			</div>
		</div>
	);
}

function PreviewSidebar({
	icons,
	isInverted,
	isBoldAccent,
}: {
	icons: IconSet;
	isInverted: boolean;
	isBoldAccent: boolean;
}) {
	const navItems = [
		{ label: "Home", Icon: icons.Home, active: true },
		{ label: "Analytics", Icon: icons.Chart, active: false },
		{ label: "Settings", Icon: icons.Settings, active: false },
	] as const;

	return (
		<div
			className="flex w-[100px] shrink-0 flex-col gap-0.5 p-2 transition-colors duration-300"
			style={{
				backgroundColor: "var(--sidebar)",
				color: "var(--sidebar-foreground)",
				borderRight: "1px solid var(--sidebar-border)",
			}}
		>
			{navItems.map(({ label, Icon, active }) => (
				<div
					key={label}
					className="flex items-center gap-1.5 px-2 py-1 text-[10px] transition-colors duration-200"
					style={{
						borderRadius: "calc(var(--radius) * 0.65)",
						backgroundColor: active
							? isBoldAccent
								? "var(--sidebar-primary)"
								: "var(--sidebar-accent)"
							: undefined,
						color: active
							? isBoldAccent
								? "var(--sidebar-primary-foreground)"
								: "var(--sidebar-accent-foreground)"
							: isInverted
								? "oklch(0.6 0 0)"
								: "oklch(0.45 0 0)",
					}}
				>
					<Icon className="size-3 shrink-0" />
					{label}
				</div>
			))}
		</div>
	);
}

function PreviewWelcomeCard({ style }: { style: string }) {
	const isMinimal = style === "mira" || style === "lyra";

	return (
		<div
			className="flex flex-col gap-2 p-3 transition-all duration-300"
			style={{
				borderRadius: "var(--radius)",
				border: isMinimal
					? "none"
					: "var(--preview-border-w) solid var(--border)",
				boxShadow: "var(--preview-shadow)",
				backgroundColor: "var(--card)",
				color: "var(--card-foreground)",
			}}
		>
			<div>
				<div className="text-[11px] font-medium">Welcome back</div>
				<div
					className="text-[9px] leading-relaxed"
					style={{ color: "var(--muted-foreground)" }}
				>
					Your project is ready to ship.
				</div>
			</div>
			<button
				type="button"
				className="h-6 w-fit px-2.5 text-[10px] font-medium transition-all duration-300 hover:opacity-90"
				style={{
					borderRadius: "calc(var(--radius) * 0.65)",
					backgroundColor: "var(--primary)",
					color: "var(--primary-foreground)",
				}}
			>
				Get started
			</button>
		</div>
	);
}

function PreviewStatCard({
	label,
	value,
	delta,
}: {
	label: string;
	value: string;
	delta: string;
}) {
	return (
		<div
			className="flex flex-col gap-1 p-2 transition-all duration-300"
			style={{
				borderRadius: "var(--radius)",
				border: "var(--preview-border-w) solid var(--border)",
				boxShadow: "var(--preview-shadow)",
			}}
		>
			<span className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>
				{label}
			</span>
			<div className="flex items-baseline gap-1">
				<span className="text-sm font-semibold tabular-nums">{value}</span>
				<span
					className="text-[9px] font-medium"
					style={{ color: "var(--primary)" }}
				>
					{delta}
				</span>
			</div>
		</div>
	);
}

function PreviewInputRow() {
	return (
		<div className="flex flex-col gap-1">
			<span className="text-[9px] font-medium">Project name</span>
			<div
				className="flex h-6 items-center px-2 text-[10px] transition-all duration-300"
				style={{
					borderRadius: "calc(var(--radius) * 0.65)",
					border: "1px solid var(--input)",
					backgroundColor: "var(--background)",
					color: "var(--muted-foreground)",
				}}
			>
				my-app
			</div>
		</div>
	);
}

function PreviewBadgeRow({ config }: { config: PresetConfig }) {
	return (
		<div className="flex flex-wrap gap-1">
			<span
				className="inline-flex h-[18px] items-center rounded-full px-1.5 text-[9px] font-medium transition-all duration-300"
				style={{
					backgroundColor: "var(--primary)",
					color: "var(--primary-foreground)",
				}}
			>
				{config.style}
			</span>
			<span
				className="inline-flex h-[18px] items-center rounded-full px-1.5 text-[9px] font-medium transition-all duration-300"
				style={{
					border: "1px solid var(--border)",
					color: "var(--muted-foreground)",
				}}
			>
				{config.font}
			</span>
			<span
				className="inline-flex h-[18px] items-center rounded-full px-1.5 text-[9px] font-medium transition-all duration-300"
				style={{
					border: "1px solid var(--border)",
					color: "var(--muted-foreground)",
				}}
			>
				{config.iconLibrary}
			</span>
		</div>
	);
}
