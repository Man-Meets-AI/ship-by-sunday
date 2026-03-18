import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

globalThis.React = React;

import { PathChoiceCard } from "@/features/course/lesson/workbench/modes/build-kickoff/path-choice-card";

describe("PathChoiceCard", () => {
	it("keeps the template path locked before starter repo access is accepted", () => {
		const markup = renderToStaticMarkup(
			<PathChoiceCard
				currentPath={null}
				invalid={false}
				templateRepoUrl={null}
				templateLockedReason="Accept the GitHub invite for the private starter repo before choosing the template path."
				onChoosePath={() => undefined}
			/>,
		);

		expect(markup).toContain("Choose template");
		expect(markup).toContain(
			"Accept the GitHub invite for the private starter repo before choosing the template path.",
		);
		expect(markup).not.toContain("Open template");
	});

	it("enables the template path once starter repo access is accepted", () => {
		const markup = renderToStaticMarkup(
			<PathChoiceCard
				currentPath="Use template"
				invalid={false}
				templateRepoUrl="https://github.com/ParkerRex/ship-by-sunday-starter"
				templateLockedReason={null}
				onChoosePath={() => undefined}
			/>,
		);

		expect(markup).toContain("Open template");
		expect(markup).not.toContain(
			"Accept the GitHub invite for the private starter repo before choosing the template path.",
		);
	});
});
