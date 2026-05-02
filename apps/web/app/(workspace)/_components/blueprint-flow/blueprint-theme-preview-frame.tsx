"use client";

import type { getPreviewIcons } from "@/lib/blueprint-flow/blueprint-theme-icons";

type IconSet = ReturnType<typeof getPreviewIcons>;

export function PreviewTopBar({ icons }: { icons: IconSet }) {
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

export function PreviewSidebar({
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
			className="flex w-[100px] shrink-0 flex-col gap-0.5 p-2 transition-colors duration-300 motion-reduce:transition-none"
			style={{
				backgroundColor: "var(--sidebar)",
				color: "var(--sidebar-foreground)",
				borderRight: "1px solid var(--sidebar-border)",
			}}
		>
			{navItems.map(({ label, Icon, active }) => (
				<div
					key={label}
					className="flex items-center gap-1.5 px-2 py-1 text-[10px] transition-colors duration-200 motion-reduce:transition-none"
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
