declare module "@/scripts/ensure-clerk-test-user.mjs" {
	export type ClerkUser = {
		id?: string | null;
		email_addresses?: Array<{
			email_address?: string | null;
		}>;
	};

	export type ClerkTestAccount = {
		scope: string;
		provider: string;
		authMode: string;
		email: string;
		softwareName: string;
		password?: string;
		firstName?: string;
		lastName?: string;
	};

	export type ClerkTestUserResult = {
		status: "exists" | "missing" | "blocked" | "error" | "created";
		message?: string;
		clerkUserId?: string | null;
		email?: string;
		scope?: string;
		provider?: string;
		authMode?: string;
		softwareName?: string;
		statusCode?: number;
		raw?: unknown;
	};

	export const DEFAULT_CONFIG_URL: URL;

	export function findUserByEmail(
		users: ClerkUser[],
		email: string,
	): ClerkUser | null;

	export function loadConfiguredAccount(options?: {
		configUrl?: URL;
		scope?: string;
	}): Promise<ClerkTestAccount>;

	export function checkClerkTestUser(options: {
		account: ClerkTestAccount;
		secretKey?: string;
		apiBaseUrl?: string;
		fetchImpl?: typeof fetch;
	}): Promise<ClerkTestUserResult>;

	export function ensureClerkTestUser(options: {
		account: ClerkTestAccount;
		secretKey?: string;
		apiBaseUrl?: string;
		fetchImpl?: typeof fetch;
	}): Promise<ClerkTestUserResult>;

	export function runCli(options?: {
		args?: string[];
		env?: Record<string, string | undefined>;
		fetchImpl?: typeof fetch;
	}): Promise<{
		exitCode: number;
		payload: ClerkTestUserResult;
	}>;
}

declare module "@/scripts/lib/lesson-video-pipeline.mjs" {
	export type LessonDefinition = {
		id: string;
		title: string;
	};

	export type LessonMediaEntry = {
		status: string;
		provider?: string;
		libraryId?: number | string;
		videoId?: string;
		url?: string;
	};

	export type ParsedLessonFilename = {
		fileName: string;
		sourceKey: string;
		slug: string;
		extension: string;
	};

	export type ReadyVideoItem = ParsedLessonFilename & {
		attachmentMode: "lesson" | "unattached";
		lessonId: string | null;
		lessonTitle: string | null;
	};

	export type CutStageOptions = {
		skipCut: boolean;
		detectRestarts: boolean;
		minSilence: number | null;
		minSpeech: number | null;
		padding: number | null;
		mergeGap: number | null;
		keepStart: boolean;
		pythonBin: string | null;
	};

	export type AuphonicOutputFile = {
		format: string;
		ending: string;
		download_url: string;
	};

	export function compareLessonIds(left: string, right: string): number;
	export function extractLessonDefinitions(source: string): LessonDefinition[];
	export function extractLessonMediaMap(
		source: string,
	): Record<string, LessonMediaEntry>;
	export function getVideoOutputCandidate(
		outputFiles: AuphonicOutputFile[],
	): AuphonicOutputFile | null;
	export function parseLessonFilename(
		fileName: string,
	): ParsedLessonFilename | null;
	export function renderLessonMediaModule(
		mediaMap: Record<string, LessonMediaEntry>,
	): string;
	export function validateReadyVideoFiles(options: {
		fileNames: string[];
		validLessons: LessonDefinition[];
		existingMedia: Record<string, LessonMediaEntry>;
		replaceLessonIds: Set<string>;
	}): {
		readyItems: ReadyVideoItem[];
		errors: string[];
	};
	export function buildCutOptionsFromArgv(argv: string[]): CutStageOptions;
}

declare module "@/scripts/lib/starter-repo-access.mjs" {
	export const STARTER_REPO_OWNER: string;
	export const STARTER_REPO_NAME: string;
	export const STARTER_REPO_URL: string;

	export function buildGitHubApiUrl(pathname: string): string;
	export function getGitHubRequestHeaders(
		token: string,
	): Record<string, string>;
	export function getInviteOutcome(options: {
		status: number;
		body: { id?: number | string | null; message?: string | null } | null;
		username: string;
	}):
		| { status: "invited"; invitationId?: string }
		| { status: "accepted" }
		| { status: "failed"; lastError: string };
	export function getCollaboratorSyncOutcome(
		status: number,
	): "accepted" | "pending";
}
