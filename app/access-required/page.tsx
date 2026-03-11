import { AccessRequiredPage } from "@/components/access-required-page";
import { redirectAuthorizedAccessRequiredVisitor } from "@/lib/server/course-access";
import { getInitialProductTheme } from "@/lib/server/product-theme";

export default async function Page() {
	await redirectAuthorizedAccessRequiredVisitor();
	const initialTheme = await getInitialProductTheme();

	return <AccessRequiredPage initialTheme={initialTheme} />;
}
