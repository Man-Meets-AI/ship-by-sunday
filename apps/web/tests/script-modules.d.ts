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
	export const MEDIA_FILE_PATH: string;
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

declare module "@/scripts/lib/clerk-convex-dev-auth-guardrail.mjs" {
	export type ClerkConvexDevAuthCheck = {
		label: string;
		passed: boolean;
		detail: string;
	};

	export function formatCheck(check: ClerkConvexDevAuthCheck): string;
	export function parseEnvFile(fileContents: string): Record<string, string>;
	export function getHostedConvexDevContext(
		envEntries: Record<string, string | undefined>,
	): {
		convexUrl: string;
		deploymentName: string;
	} | null;
	export function getClerkKeyMode(
		key: string | null | undefined,
	): "missing" | "test" | "live" | "unknown";
	export function getClerkFrontendApiMode(
		frontendApiUrl: string | null | undefined,
	): "missing" | "test" | "live" | "invalid";
	export function summarizeClerkKey(key: string | null | undefined): string;
	export function buildClerkConvexDevAuthReport(args: {
		convexUrl: string | null | undefined;
		deploymentName: string | null | undefined;
		hostedFrontendApiUrl: string | null | undefined;
		localFrontendApiUrl: string | null | undefined;
		localPublishableKey: string | null | undefined;
		localSecretKey: string | null | undefined;
	}): {
		checks: ClerkConvexDevAuthCheck[];
		hasFailure: boolean;
	};
	export function buildClerkConvexDevFixSteps(args: {
		deploymentName?: string | null;
	}): string[];
	export function buildStartupSuccessMessage(args: {
		deploymentName: string;
		localFrontendApiUrl: string | null | undefined;
		localPublishableKey: string | null | undefined;
	}): string;
}
