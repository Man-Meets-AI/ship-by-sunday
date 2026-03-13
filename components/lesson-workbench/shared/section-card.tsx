import type { WorkbenchSection } from "@/lib/course/manifest";

import { WorkbenchHeaderLabel } from "./workbench-header-label";
import {
	workbenchCardBodyClass,
	workbenchCardClass,
	workbenchCardHeaderClass,
	workbenchSupportCopyClass,
} from "./workbench-readability";

export function SectionCard({
	section,
	children,
	isComplete,
	blocked = false,
	blockedMessage,
}: {
	section: WorkbenchSection;
	children: React.ReactNode;
	isComplete: boolean;
	blocked?: boolean;
	blockedMessage?: string;
}) {
	return (
		<section
			className={`${workbenchCardClass} ${blocked ? "bg-product-surface/45" : ""}`}
		>
			<div className={workbenchCardHeaderClass}>
				<div className="flex flex-wrap items-center justify-between gap-2">
					<WorkbenchHeaderLabel as="h2">{section.title}</WorkbenchHeaderLabel>
					<WorkbenchHeaderLabel className="tracking-[0.16em]">
						{blocked ? "Locked" : isComplete ? "Ready" : "In progress"}
					</WorkbenchHeaderLabel>
				</div>
				{blocked && blockedMessage ? (
					<p className={`mt-3 ${workbenchSupportCopyClass}`}>
						{blockedMessage}
					</p>
				) : null}
				{section.instruction ? (
					<p className={`mt-3 ${workbenchSupportCopyClass}`}>
						{section.instruction}
					</p>
				) : null}
			</div>
			<div className={workbenchCardBodyClass}>
				<fieldset disabled={blocked} className={blocked ? "opacity-45" : ""}>
					{children}
				</fieldset>
			</div>
		</section>
	);
}
