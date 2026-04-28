"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type DocsSidebarEntry =
	| {
			kind: "page";
			key: string;
			title: string;
			pathname: string;
	  }
	| {
			kind: "section";
			key: string;
			title: string;
			children: DocsSidebarEntry[];
	  }
	| {
			kind: "separator";
			key: string;
			title: string;
	  };

function isActivePathname(currentPathname: string, entryPathname: string) {
	if (entryPathname === "/docs") {
		return currentPathname === "/docs";
	}

	return (
		currentPathname === entryPathname ||
		currentPathname.startsWith(`${entryPathname}/`)
	);
}

function renderSidebarEntries({
	entries,
	pathname,
	depth = 0,
}: {
	entries: DocsSidebarEntry[];
	pathname: string;
	depth?: number;
}) {
	return entries.map((entry) => {
		if (entry.kind === "separator") {
			return (
				<li key={entry.key} className="sbs-docs-sidebar-separator">
					{entry.title}
				</li>
			);
		}

		if (entry.kind === "section") {
			return (
				<li key={entry.key} className="sbs-docs-sidebar-section">
					<p className="sbs-docs-sidebar-section-title">{entry.title}</p>
					<ol>
						{renderSidebarEntries({
							entries: entry.children,
							pathname,
							depth: depth + 1,
						})}
					</ol>
				</li>
			);
		}

		const isActive = isActivePathname(pathname, entry.pathname);

		return (
			<li key={entry.key}>
				<Link
					href={entry.pathname}
					aria-current={isActive ? "page" : undefined}
					className="sbs-docs-sidebar-link"
					data-depth={depth}
				>
					{entry.title}
				</Link>
			</li>
		);
	});
}

export function DocsSidebar({ entries }: { entries: DocsSidebarEntry[] }) {
	const pathname = usePathname() ?? "/docs";

	return (
		<aside className="sbs-docs-sidebar" aria-label="Docs navigation">
			<nav>
				<ol>{renderSidebarEntries({ entries, pathname })}</ol>
			</nav>
		</aside>
	);
}
