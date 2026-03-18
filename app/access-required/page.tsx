import { AccessRequiredPage } from "@/features/course/access/components/access-required-page";
import { redirectAuthorizedAccessRequiredVisitor } from "@/features/course/access/server/course-access";
import { getInitialProductTheme } from "@/features/course/shared/server/product-theme";

export default async function Page() {
	await redirectAuthorizedAccessRequiredVisitor();
	const initialTheme = await getInitialProductTheme();

	return <AccessRequiredPage initialTheme={initialTheme} />;
}
