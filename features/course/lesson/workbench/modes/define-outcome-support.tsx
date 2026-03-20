import { Separator } from "@/components/ui/separator";

import { getTextValue } from "./define-outcome-support-helpers";
import { OUTCOME_STATEMENT_BODY_FIELD_ID } from "./define-outcome-constants";
import { DefineOutcomeCopyStatementButton } from "./define-outcome-copy-statement-button";
import { DefineOutcomeFutureFormatsAccordion } from "./define-outcome-future-formats-accordion";
import { DefineOutcomeGuidanceCard } from "./define-outcome-guidance-card";
import { DefineOutcomeQualityAlerts } from "./define-outcome-quality-alerts";

export function DefineOutcomeSupport({
	fieldValues,
}: {
	fieldValues: Record<string, unknown>;
}) {
	const statement = getTextValue(fieldValues, OUTCOME_STATEMENT_BODY_FIELD_ID);

	return (
		<div className="space-y-4">
			<DefineOutcomeGuidanceCard />
			<Separator />
			<DefineOutcomeQualityAlerts fieldValues={fieldValues} />
			<Separator />
			<DefineOutcomeFutureFormatsAccordion />
			<Separator />
			<div className="flex flex-wrap items-center gap-2">
				<DefineOutcomeCopyStatementButton statement={statement} />
			</div>
		</div>
	);
}
