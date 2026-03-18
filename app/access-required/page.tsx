import { AccessRequiredPage } from "@/features/course/access/components/access-required-page";
import { redirectAuthorizedAccessRequiredVisitor } from "@/features/course/access/server/course-access";

export default async function Page() {
	await redirectAuthorizedAccessRequiredVisitor();

	return <AccessRequiredPage />;
}
