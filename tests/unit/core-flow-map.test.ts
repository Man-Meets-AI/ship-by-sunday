import {
	CORE_FLOW_ENDING_FIELD_ID,
	CORE_FLOW_STEPS_FIELD_ID,
	getCoreFlowDraftState,
	getCoreFlowGraph,
	getCoreFlowSeedValues,
} from "@/lib/course";

describe("core flow map helpers", () => {
	it("seeds the first actor and ending from pinned artifacts", () => {
		const seed = getCoreFlowSeedValues([
			{
				artifactKey: "user_statement",
				fieldValues: {
					selected_problem_owner: "Startup operators",
				},
			},
			{
				artifactKey: "outcome_statement",
				fieldValues: {
					outcome:
						"Leave the meeting with a clean action summary in minutes.",
				},
			},
		]);

		expect(seed.flow_actors).toEqual(["Startup operators"]);
		expect(seed[CORE_FLOW_ENDING_FIELD_ID]).toBe(
			"Leave the meeting with a clean action summary in minutes.",
		);
		expect(seed[CORE_FLOW_STEPS_FIELD_ID]).toHaveLength(5);
	});

	it("builds actor, step, and ending nodes with chained edges", () => {
		const graph = getCoreFlowGraph({
			flow_actors: ["Startup operators"],
			flow_steps: [
				["Startup operators", "Paste notes"],
				["Startup operators", "Generate summary"],
				["Startup operators", "Review"],
				["Startup operators", "Share"],
				["Startup operators", "Close loop"],
			],
			flow_ending: "They leave with a clean action summary.",
		});

		expect(graph.nodes.map((node) => node.id)).toEqual([
			"actor:0",
			"step:0",
			"step:1",
			"step:2",
			"step:3",
			"step:4",
			"ending",
		]);
		expect(graph.edges[0]).toMatchObject({
			source: "actor:0",
			target: "step:0",
		});
		expect(graph.edges.at(-1)).toMatchObject({
			source: "step:4",
			target: "ending",
		});
	});

	it("tracks partial steps and saved-image state separately", () => {
		const draftState = getCoreFlowDraftState({
			flow_actors: ["Startup operators"],
			flow_steps: [
				["Startup operators", "Paste notes"],
				["", "Generate summary"],
				["Startup operators", ""],
			],
			flow_ending: "They leave with a clean action summary.",
			__core_flow_image_upload: {
				kind: "upload",
				status: "stored",
				storageId: "abc123",
			},
		});

		expect(draftState.validActorCount).toBe(1);
		expect(draftState.filledStepCount).toBe(1);
		expect(draftState.hasPartialStep).toBe(true);
		expect(draftState.hasSavedImage).toBe(true);
	});
});
