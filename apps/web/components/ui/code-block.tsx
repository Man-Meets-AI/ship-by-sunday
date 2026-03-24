"use client";

import * as React from "react";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
	oneLight,
	vscDarkPlus,
} from "react-syntax-highlighter/dist/cjs/styles/prism";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CodeBlockTab = {
	name: string;
	code: string;
	language?: string;
	highlightLines?: number[];
};

type CodeBlockProps = {
	language: string;
	filename?: string;
	highlightLines?: number[];
	showLineNumbers?: boolean;
	wrapLongLines?: boolean;
	copyable?: boolean;
	className?: string;
	contentClassName?: string;
} & (
	| {
			code: string;
			tabs?: never;
	  }
	| {
			code?: never;
			tabs: CodeBlockTab[];
	  }
);

export function CodeBlock({
	language,
	filename,
	highlightLines = [],
	showLineNumbers = false,
	wrapLongLines = true,
	copyable = true,
	className,
	contentClassName,
	code,
	tabs = [],
}: CodeBlockProps) {
	const { resolvedTheme } = useTheme();
	const [activeTab, setActiveTab] = React.useState(0);
	const [copied, setCopied] = React.useState(false);

	const tabsExist = tabs.length > 0;
	const activeEntry = tabsExist
		? tabs[activeTab]
		: { code, language, highlightLines };

	React.useEffect(() => {
		if (!copied) {
			return;
		}

		const timeout = window.setTimeout(() => setCopied(false), 2000);
		return () => window.clearTimeout(timeout);
	}, [copied]);

	const copyToClipboard = async () => {
		if (!activeEntry.code) {
			return;
		}

		await navigator.clipboard.writeText(activeEntry.code);
		setCopied(true);
	};

	return (
		<div
			className={cn(
				"overflow-hidden rounded-lg border border-border bg-card text-card-foreground",
				className,
			)}
		>
			<div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
				<div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
					{tabsExist ? (
						tabs.map((tab, index) => (
							<button
								key={`${tab.name}-${index}`}
								type="button"
								onClick={() => setActiveTab(index)}
								className={cn(
									"rounded-md px-2 py-1 font-sans text-xs transition-colors",
									activeTab === index
										? "bg-muted text-foreground"
										: "text-muted-foreground hover:text-foreground",
								)}
							>
								{tab.name}
							</button>
						))
					) : (
						<span className="truncate font-mono text-xs text-muted-foreground">
							{filename ?? language}
						</span>
					)}
				</div>
				{copyable ? (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => void copyToClipboard()}
						aria-label={copied ? "Copied code" : "Copy code"}
					>
						{copied ? (
							<CheckIcon data-icon="inline-start" />
						) : (
							<CopyIcon data-icon="inline-start" />
						)}
						{copied ? "Copied" : "Copy"}
					</Button>
				) : null}
			</div>
			<div className={cn("max-h-64 overflow-auto p-3", contentClassName)}>
				<SyntaxHighlighter
					language={activeEntry.language ?? language}
					style={resolvedTheme === "dark" ? vscDarkPlus : oneLight}
					customStyle={{
						margin: 0,
						padding: 0,
						background: "transparent",
						fontSize: "0.75rem",
						lineHeight: "1.5",
					}}
					codeTagProps={{ className: "font-mono" }}
					wrapLines
					wrapLongLines={wrapLongLines}
					showLineNumbers={showLineNumbers}
					lineProps={(lineNumber) => ({
						style: {
							display: "block",
							width: "100%",
							borderRadius: "0.375rem",
							backgroundColor: activeEntry.highlightLines?.includes(lineNumber)
								? "var(--muted)"
								: "transparent",
						},
					})}
					PreTag="div"
				>
					{String(activeEntry.code ?? "")}
				</SyntaxHighlighter>
			</div>
		</div>
	);
}
