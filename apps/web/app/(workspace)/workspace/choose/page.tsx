import type { Metadata } from "next";

import { WorkspaceFulfillmentChoice } from "@/app/(workspace)/_components/workspace-fulfillment-choice";

export const metadata: Metadata = {
	title: "Choose workspace path",
};

export default function Page() {
	return <WorkspaceFulfillmentChoice />;
}
