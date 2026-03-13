import { WorkbenchHeaderLabel } from "./workbench-header-label";
import {
	workbenchCardBodyClass,
	workbenchCardClass,
	workbenchCardHeaderClass,
} from "./workbench-readability";

export function WorkbenchCard({
	label,
	children,
}: {
	label?: string;
	children: React.ReactNode;
}) {
	return (
		<div className={workbenchCardClass}>
			{label ? (
				<div className={workbenchCardHeaderClass}>
					<WorkbenchHeaderLabel>{label}</WorkbenchHeaderLabel>
				</div>
			) : null}
			<div className={workbenchCardBodyClass}>{children}</div>
		</div>
	);
}
