/** @vitest-environment jsdom */

import { render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";

import { getLessonById } from "@/lib/course/lesson/model";
import {
	ROUTE_ACCESS_CODEX_PROMPT_DEFAULT,
	ROUTE_ACCESS_FIELD_IDS,
} from "@/lib/course/lesson/workbench/modes/route-access-orientation/route-access-orientation-constants";
import { WorkbenchRenderer } from "@/app/(workspace)/_components/course/lesson/workbench/renderer";

function StatefulWorkbench({
	lesson,
}: {
	lesson: NonNullable<ReturnType<typeof getLessonById>>;
}) {
	const [values, setValues] = useState<Record<string, unknown>>({});
	return (
		<WorkbenchRenderer
			lesson={lesson}
			lessonContent={lesson.content}
			fieldValues={values}
			onFieldChange={(id, v) => setValues((prev) => ({ ...prev, [id]: v }))}
			pinnedArtifacts={[]}
			layoutMode="focus"
			fieldValuesReady
		/>
	);
}

describe("route access orientation workbench (lesson 3.6)", () => {
	it("uses route_access_orientation and surfaces route map, Codex prompt, and Clerk", async () => {
		const lesson = getLessonById("3.6");
		expect(lesson).toBeTruthy();
		if (!lesson) {
			throw new Error("Expected lesson 3.6.");
		}

		expect(lesson.workbench).toBe("route_access_orientation");
		expect(lesson.workbenchFields?.length).toBeGreaterThan(0);

		render(<StatefulWorkbench lesson={lesson} />);

		expect(screen.getByText(/Orientation, not an auth rewrite/i)).toBeTruthy();
		expect(screen.getByText(/Compact route map/i)).toBeTruthy();
		await waitFor(() => {
			const ta = document.getElementById(
				ROUTE_ACCESS_FIELD_IDS.codexPrompt,
			) as HTMLTextAreaElement | null;
			expect(ta?.value).toContain(
				ROUTE_ACCESS_CODEX_PROMPT_DEFAULT.slice(0, 40),
			);
		});
		expect(screen.getByText(/Clerk/i)).toBeTruthy();
		expect(screen.getByRole("tab", { name: /public pages/i })).toBeTruthy();
		expect(screen.getByRole("tab", { name: /protected pages/i })).toBeTruthy();
	});
});
