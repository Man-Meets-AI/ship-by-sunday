import { Alert, AlertDescription } from "@/components/ui/alert";

import {
	FEATURE_LANGUAGE_PATTERN,
	getTextValue,
} from "./define-outcome-support-helpers";
import { OUTCOME_STATEMENT_BODY_FIELD_ID } from "@/lib/course/lesson/workbench/modes/define-outcome-constants";

export function DefineOutcomeQualityAlerts({
	fieldValues,
}: {
	fieldValues: Record<string, unknown>;
}) {
	const statement = getTextValue(fieldValues, OUTCOME_STATEMENT_BODY_FIELD_ID);
	const looksFeatureHeavy =
		statement.length > 0 && FEATURE_LANGUAGE_PATTERN.test(statement);

	return (
		<div className="space-y-3">
			<Alert>
				<AlertDescription>
					If someone hears it and has no question, the statement may be too flat
					or unclear.
				</AlertDescription>
			</Alert>
			{looksFeatureHeavy ? (
				<Alert>
					<AlertDescription>
						This draft still reads feature-heavy. Rewrite it as what changes for
						the person after the product works.
					</AlertDescription>
				</Alert>
			) : null}
		</div>
	);
}
