import { TOP_NINE_SCHEMA_VERSION } from "./types";

export function createTopNineOutputSchema() {
	return {
		type: "object",
		additionalProperties: false,
		required: ["schemaVersion", "summary", "findings"],
		properties: {
			schemaVersion: {
				type: "string",
				const: TOP_NINE_SCHEMA_VERSION,
			},
			summary: { type: "string" },
			findings: {
				type: "array",
				items: {
					type: "object",
					additionalProperties: false,
					required: [
						"findingId",
						"rank",
						"status",
						"title",
						"category",
						"severity",
						"confidence",
						"buyerImpact",
						"blastRadius",
						"proofPath",
						"proofability",
						"permissionRequired",
						"recommendedWorkflowId",
						"whyThisNow",
						"evidenceRefs",
						"blockedReason",
						"syncSensitivity",
						"localReportRef",
					],
					properties: {
						findingId: { type: "string" },
						rank: { type: "number" },
						status: {
							type: "string",
							enum: ["ready", "blocked", "needs_approval", "running", "done"],
						},
						title: { type: "string" },
						category: {
							type: "string",
							enum: [
								"source_truth",
								"setup",
								"proof",
								"revenue_path",
								"observability",
								"ux_conversion",
								"broken_app",
								"performance",
								"security",
								"testing",
								"other",
							],
						},
						severity: {
							type: "string",
							enum: ["critical", "high", "medium", "low"],
						},
						confidence: { type: "number" },
						buyerImpact: { type: "string" },
						blastRadius: {
							type: "string",
							enum: ["none", "low", "medium", "high"],
						},
						proofPath: { type: "string" },
						proofability: {
							type: "string",
							enum: ["clear", "partial", "blocked"],
						},
						permissionRequired: {
							type: "string",
							enum: [
								"read_only",
								"docs_write",
								"workspace_write",
								"network",
								"provider_access",
								"managed_github",
							],
						},
						recommendedWorkflowId: { type: "string" },
						whyThisNow: { type: "string" },
						evidenceRefs: {
							type: "array",
							items: createEvidenceRefSchema(),
						},
						blockedReason: {
							type: ["string", "null"],
						},
						syncSensitivity: {
							type: "string",
							enum: ["low", "medium", "high"],
						},
						localReportRef: { type: "string" },
					},
				},
			},
		},
	};
}

function createEvidenceRefSchema() {
	return {
		anyOf: [
			{
				type: "object",
				additionalProperties: false,
				required: [
					"kind",
					"repoRelativePath",
					"lineStart",
					"lineEnd",
					"summary",
				],
				properties: {
					kind: { type: "string", const: "file" },
					repoRelativePath: { type: "string" },
					lineStart: { type: ["number", "null"] },
					lineEnd: { type: ["number", "null"] },
					summary: { type: ["string", "null"] },
				},
			},
			{
				type: "object",
				additionalProperties: false,
				required: ["kind", "commandName", "summary"],
				properties: {
					kind: { type: "string", const: "command" },
					commandName: { type: "string" },
					summary: { type: ["string", "null"] },
				},
			},
			{
				type: "object",
				additionalProperties: false,
				required: ["kind", "artifactId", "localReportRef", "summary"],
				properties: {
					kind: { type: "string", const: "artifact" },
					artifactId: { type: "string" },
					localReportRef: { type: ["string", "null"] },
					summary: { type: ["string", "null"] },
				},
			},
			{
				type: "object",
				additionalProperties: false,
				required: ["kind", "packageName", "summary"],
				properties: {
					kind: { type: "string", const: "package" },
					packageName: { type: "string" },
					summary: { type: ["string", "null"] },
				},
			},
		],
	};
}
