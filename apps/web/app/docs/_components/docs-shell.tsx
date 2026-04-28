import type { ReactNode } from "react";

import type { DocsNavigationEntry } from "@/app/_content/public-content-inventory";
import { DocsFooter } from "@/app/docs/_components/docs-footer";
import { DocsNavbar } from "@/app/docs/_components/docs-navbar";
import {
	DocsSidebar,
	type DocsSidebarEntry,
} from "@/app/docs/_components/docs-sidebar";

function toSidebarEntry(entry: DocsNavigationEntry): DocsSidebarEntry {
	if (entry.kind === "separator") {
		return {
			kind: "separator",
			key: entry.key,
			title: entry.title,
		};
	}

	if (entry.kind === "section") {
		return {
			kind: "section",
			key: entry.key,
			title: entry.title,
			children: entry.children.map(toSidebarEntry),
		};
	}

	return {
		kind: "page",
		key: entry.key,
		title: entry.title,
		pathname: entry.pathname,
	};
}

export function DocsShell({
	children,
	navigationEntries,
}: {
	children: ReactNode;
	navigationEntries: DocsNavigationEntry[];
}) {
	const sidebarEntries = navigationEntries.map(toSidebarEntry);

	return (
		<div className="sbs-docs-shell">
			<DocsNavbar />
			<div className="sbs-docs-content-grid">
				<DocsSidebar entries={sidebarEntries} />
				<main className="sbs-docs-main">{children}</main>
			</div>
			<DocsFooter />
		</div>
	);
}
