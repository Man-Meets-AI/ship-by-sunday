import { vi } from "vitest";

type FakeDocument = Record<string, unknown> & {
	_id: string;
	_creationTime: number;
};

type FakeTables = Record<string, FakeDocument[]>;

const orderFieldByIndex: Record<string, string> = {
	by_clerk_user_id_and_status_and_updated_at: "updatedAt",
	by_clerk_user_id_and_updated_at: "updatedAt",
	by_project_id_and_status_and_updated_at: "updatedAt",
	by_project_id_and_updated_at: "updatedAt",
	by_runner_id_and_status_and_updated_at: "updatedAt",
	by_pairing_token: "_creationTime",
	by_runner_credential_hash: "_creationTime",
	by_project_id_and_status_and_started_at: "startedAt",
	by_project_id_and_started_at: "startedAt",
	by_runner_id_and_started_at: "startedAt",
	by_project_id_and_status_and_rank: "rank",
	by_project_id_and_rank: "rank",
	by_project_id_and_finding_id: "findingId",
	by_doctor_pass_run_id_and_rank: "rank",
	by_project_id_and_status_and_created_at: "createdAt",
	by_project_id_and_created_at: "createdAt",
	by_runner_id_and_created_at: "createdAt",
	by_event_id: "eventId",
	by_project_id_and_event_type_and_created_at: "createdAt",
	by_doctor_pass_run_id_and_created_at: "createdAt",
	by_workflow_run_id_and_created_at: "createdAt",
	by_clerk_user_id: "clerkUserId",
};

class FakeIndexBuilder {
	readonly filters: Array<{ fieldName: string; value: unknown }> = [];

	eq(fieldName: string, value: unknown) {
		this.filters.push({ fieldName, value });
		return this;
	}
}

class FakeQueryResult {
	private direction: "asc" | "desc" = "asc";

	constructor(
		private readonly documents: FakeDocument[],
		private readonly filters: Array<{ fieldName: string; value: unknown }>,
		private readonly orderField: string,
	) {}

	order(direction: "asc" | "desc") {
		this.direction = direction;
		return this;
	}

	async take(count: number) {
		return this.matchingDocuments().slice(0, count);
	}

	async collect() {
		return this.matchingDocuments();
	}

	async unique() {
		const documents = this.matchingDocuments();
		if (documents.length > 1) {
			throw new Error("Expected unique fake query result");
		}

		return documents[0] ?? null;
	}

	private matchingDocuments() {
		const matching = this.documents.filter((document) =>
			this.filters.every(
				(filter) => document[filter.fieldName] === filter.value,
			),
		);

		return [...matching].sort((left, right) => {
			const leftValue = left[this.orderField];
			const rightValue = right[this.orderField];
			const leftNumber = typeof leftValue === "number" ? leftValue : 0;
			const rightNumber = typeof rightValue === "number" ? rightValue : 0;
			return this.direction === "desc"
				? rightNumber - leftNumber
				: leftNumber - rightNumber;
		});
	}
}

function createSeededTables({
	clerkUserId,
	hasAccess,
	fulfillmentTrack,
	tables,
}: {
	clerkUserId: string;
	hasAccess: boolean;
	fulfillmentTrack: "existing_codebase_doctor" | "generated_codebase";
	tables: FakeTables;
}) {
	const seededTables: FakeTables = {
		productAccessGrants: hasAccess
			? [
					{
						_id: "product_access_1",
						_creationTime: 1,
						clerkUserId,
						status: "granted",
						source: "manual",
						buyerStartingPoint:
							fulfillmentTrack === "existing_codebase_doctor"
								? "existing_codebase"
								: "no_codebase",
						checkoutCtaId: "unspecified",
						fulfillmentTrack,
						grantedAt: 1,
						updatedAt: 1,
					},
				]
			: [],
		workspaceProjects: [],
		workspaceRunnerBindings: [],
		workspaceRepositoryBindings: [],
		doctorPassRuns: [],
		codebaseFindings: [],
		workflowRuns: [],
		workspaceRunnerEvents: [],
		projectDefinitions: [],
		codebaseWorkflowStates: [],
		...tables,
	};

	return seededTables;
}

export function createWorkspaceTestCtx({
	clerkUserId = "user_workspace_123",
	hasAccess = true,
	fulfillmentTrack = "existing_codebase_doctor",
	tables = {},
}: {
	clerkUserId?: string;
	hasAccess?: boolean;
	fulfillmentTrack?: "existing_codebase_doctor" | "generated_codebase";
	tables?: FakeTables;
} = {}) {
	const seededTables = createSeededTables({
		clerkUserId,
		hasAccess,
		fulfillmentTrack,
		tables,
	});
	let nextId = 1;
	let nextCreationTime = 1000;

	function findDocument(documentId: string) {
		for (const documents of Object.values(seededTables)) {
			const document = documents.find(
				(candidate) => candidate._id === documentId,
			);
			if (document) {
				return document;
			}
		}

		return null;
	}

	const db = {
		query: vi.fn((tableName: string) => ({
			withIndex: vi.fn(
				(
					indexName: string,
					buildQuery: (query: FakeIndexBuilder) => FakeIndexBuilder,
				) => {
					const indexBuilder = new FakeIndexBuilder();
					buildQuery(indexBuilder);
					return new FakeQueryResult(
						seededTables[tableName] ?? [],
						indexBuilder.filters,
						orderFieldByIndex[indexName] ?? "_creationTime",
					);
				},
			),
		})),
		get: vi.fn(async (documentId: string) => findDocument(documentId)),
		insert: vi.fn(
			async (tableName: string, document: Record<string, unknown>) => {
				const documentId = `${tableName}_${nextId}`;
				nextId += 1;
				const storedDocument = {
					_id: documentId,
					_creationTime: nextCreationTime,
					...document,
				};
				nextCreationTime += 1;
				seededTables[tableName] = seededTables[tableName] ?? [];
				seededTables[tableName].push(storedDocument);
				return documentId;
			},
		),
		patch: vi.fn(async (documentId: string, patch: Record<string, unknown>) => {
			const document = findDocument(documentId);
			if (!document) {
				throw new Error(`Missing document ${documentId}`);
			}

			for (const [fieldName, value] of Object.entries(patch)) {
				if (value === undefined) {
					delete document[fieldName];
					continue;
				}

				document[fieldName] = value;
			}
		}),
		delete: vi.fn(async (documentId: string) => {
			for (const [tableName, documents] of Object.entries(seededTables)) {
				seededTables[tableName] = documents.filter(
					(document) => document._id !== documentId,
				);
			}
		}),
	};

	return {
		ctx: {
			auth: {
				getUserIdentity: vi.fn().mockResolvedValue({ subject: clerkUserId }),
			},
			db,
		},
		db,
		tables: seededTables,
	};
}
