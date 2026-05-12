"use client";

import { Check, Copy, Terminal } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

export const packageRunnerIds = ["bun", "npm", "pnpm", "yarn"] as const;

export type PackageRunnerId = (typeof packageRunnerIds)[number];

export type PackageRunnerCommand = {
	id: PackageRunnerId;
	label: string;
	command: string;
};

const packageRunnerPrefixes: Record<PackageRunnerId, string> = {
	bun: "bunx",
	npm: "npx",
	pnpm: "pnpm dlx",
	yarn: "yarn dlx",
};

function commandWithPackageRunner(
	command: string,
	packageRunner: PackageRunnerId,
) {
	const nextPrefix = packageRunnerPrefixes[packageRunner];
	const knownPrefixes = [
		`${packageRunnerPrefixes.pnpm} `,
		`${packageRunnerPrefixes.yarn} `,
		`${packageRunnerPrefixes.bun} `,
		`${packageRunnerPrefixes.npm} `,
	];

	for (const knownPrefix of knownPrefixes) {
		if (command.startsWith(knownPrefix)) {
			return `${nextPrefix} ${command.slice(knownPrefix.length)}`;
		}
	}

	return command;
}

export function buildPackageRunnerCommands({
	primaryCommand,
	fallbackCommand,
}: {
	primaryCommand: string | null;
	fallbackCommand: string | null;
}) {
	const baseCommand = fallbackCommand ?? primaryCommand;
	if (!baseCommand) {
		return [];
	}

	return packageRunnerIds.map((id) => {
		if (id === "bun" && primaryCommand) {
			return { id, label: id, command: primaryCommand };
		}
		if (id === "npm" && fallbackCommand) {
			return { id, label: id, command: fallbackCommand };
		}

		return {
			id,
			label: id,
			command: commandWithPackageRunner(baseCommand, id),
		};
	});
}

export function buildPackageRunnerCommandsFromBunCommand(command: string) {
	return buildPackageRunnerCommands({
		primaryCommand: command,
		fallbackCommand: commandWithPackageRunner(command, "npm"),
	});
}

function CopyCommandButton({
	command,
	disabled,
	label,
}: {
	command: string;
	disabled?: boolean;
	label: string;
}) {
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!copied) {
			return;
		}

		const timeout = window.setTimeout(() => setCopied(false), 1600);
		return () => window.clearTimeout(timeout);
	}, [copied]);

	async function copyCommand() {
		if (disabled) {
			return;
		}
		await navigator.clipboard.writeText(command);
		setCopied(true);
	}

	return (
		<Button
			type="button"
			variant="ghost"
			size="sm"
			onClick={() => void copyCommand()}
			disabled={disabled}
			aria-label={copied ? `Copied ${label}` : `Copy ${label}`}
		>
			{copied ? (
				<Check className="size-3.5" aria-hidden />
			) : (
				<Copy className="size-3.5" aria-hidden />
			)}
			{copied ? "Copied" : "Copy"}
		</Button>
	);
}

export function SetupPackageRunnerCommand({
	label,
	commands,
	disabled = false,
	emptyText = "Command unavailable.",
	onPackageRunnerChange,
	selectedPackageRunner,
}: {
	label: string;
	commands: PackageRunnerCommand[];
	disabled?: boolean;
	emptyText?: string;
	onPackageRunnerChange?: (packageRunner: PackageRunnerId) => void;
	selectedPackageRunner?: PackageRunnerId;
}) {
	const [internalPackageRunner, setInternalPackageRunner] =
		useState<PackageRunnerId>("bun");
	const activePackageRunner = selectedPackageRunner ?? internalPackageRunner;
	const selectedCommand =
		commands.find((command) => command.id === activePackageRunner) ??
		commands[0] ??
		null;

	function selectPackageRunner(value: string) {
		if (!packageRunnerIds.includes(value as PackageRunnerId)) {
			return;
		}
		const nextPackageRunner = value as PackageRunnerId;
		if (!selectedPackageRunner) {
			setInternalPackageRunner(nextPackageRunner);
		}
		onPackageRunnerChange?.(nextPackageRunner);
	}

	return (
		<div
			className={cn(
				"rounded-lg border border-border/60 bg-muted/20",
				disabled && "opacity-65",
			)}
			aria-disabled={disabled}
		>
			<div className="flex flex-col gap-2 border-b border-border/50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex min-w-0 items-center gap-2 text-xs font-medium text-muted-foreground">
					<Terminal className="size-3.5 shrink-0" aria-hidden />
					<span className="truncate">{label}</span>
				</div>
				{selectedCommand ? (
					<div className="flex items-center gap-2">
						<ToggleGroup
							type="single"
							value={selectedCommand.id}
							onValueChange={selectPackageRunner}
							variant="outline"
							size="sm"
							aria-label={`${label} package manager`}
							className="overflow-hidden"
						>
							{commands.map((command) => (
								<ToggleGroupItem
									key={command.id}
									value={command.id}
									aria-label={`Use ${command.label}`}
									className="h-7 px-2 text-xs"
									disabled={disabled}
								>
									{command.label}
								</ToggleGroupItem>
							))}
						</ToggleGroup>
						<CopyCommandButton
							command={selectedCommand.command}
							disabled={disabled}
							label={label}
						/>
					</div>
				) : null}
			</div>
			<pre className="overflow-x-auto px-3 py-3 text-xs leading-6">
				<code className="font-mono">
					{selectedCommand?.command ?? emptyText}
				</code>
			</pre>
		</div>
	);
}
