import { ConvexError, v } from "convex/values";

import { COURSE_SLUG } from "../../features/course/lesson/model/registry";
import {
	toGitHubUsernameLower,
	validateGitHubUsername,
} from "../../lib/github-username";
import { requireGrantedProductAccess } from "../access/model";
import type {
	CourseMutationCtx,
	CourseQueryCtx,
	CourseReadCtx,
	StarterRepoAccessDoc,
} from "./types";
import {
	starterRepoAccessOperatorItemValidator,
	starterRepoAccessProvisioningStatusValidator,
	starterRepoAccessPublicValidator,
} from "./validators";

const EDITABLE_STARTER_REPO_STATUSES = new Set(["requested", "failed"]);

function toStarterRepoAccessPublic(
	record: StarterRepoAccessDoc | null | undefined,
) {
	if (!record) {
		return null;
	}

	return {
		githubUsername: record.githubUsername,
		status: record.status,
		requestedAt: record.requestedAt,
		updatedAt: record.updatedAt,
		invitedAt: record.invitedAt,
		acceptedAt: record.acceptedAt,
		lastError: record.lastError,
	};
}

function toStarterRepoAccessOperatorItem(
	record: StarterRepoAccessDoc | null | undefined,
) {
	if (!record) {
		return null;
	}

	return {
		clerkUserId: record.clerkUserId,
		courseSlug: record.courseSlug,
		githubUsername: record.githubUsername,
		status: record.status,
		requestedAt: record.requestedAt,
		updatedAt: record.updatedAt,
		invitedAt: record.invitedAt,
		acceptedAt: record.acceptedAt,
		invitationId: record.invitationId,
		lastError: record.lastError,
	};
}

export async function getStarterRepoAccessByCourse(
	ctx: CourseReadCtx,
	clerkUserId: string,
	courseSlug: string = COURSE_SLUG,
) {
	return ctx.db
		.query("starterRepoAccess")
		.withIndex("by_clerk_user_id_and_course_slug", (q) =>
			q.eq("clerkUserId", clerkUserId).eq("courseSlug", courseSlug),
		)
		.unique();
}

export const getStarterRepoAccessArgs = {};
export const getStarterRepoAccessReturns = v.union(
	starterRepoAccessPublicValidator,
	v.null(),
);

export async function getStarterRepoAccessHandler(ctx: CourseQueryCtx) {
	const clerkUserId = await requireGrantedProductAccess(ctx);
	const record = await getStarterRepoAccessByCourse(ctx, clerkUserId);

	return toStarterRepoAccessPublic(record);
}

export const requestStarterRepoAccessArgs = {
	githubUsername: v.string(),
};
export const requestStarterRepoAccessReturns = v.union(
	starterRepoAccessPublicValidator,
	v.null(),
);

export async function requestStarterRepoAccessHandler(
	ctx: CourseMutationCtx,
	args: {
		githubUsername: string;
	},
) {
	const clerkUserId = await requireGrantedProductAccess(ctx);
	const { normalized, error } = validateGitHubUsername(args.githubUsername);

	if (error) {
		throw new ConvexError(error);
	}

	const courseSlug = COURSE_SLUG;
	const now = Date.now();
	const githubUsernameLower = toGitHubUsernameLower(normalized);
	const existingRecord = await getStarterRepoAccessByCourse(
		ctx,
		clerkUserId,
		courseSlug,
	);

	if (!existingRecord) {
		await ctx.db.insert("starterRepoAccess", {
			clerkUserId,
			courseSlug,
			githubUsername: normalized,
			githubUsernameLower,
			status: "requested",
			requestedAt: now,
			updatedAt: now,
		});

		return {
			githubUsername: normalized,
			status: "requested" as const,
			requestedAt: now,
			updatedAt: now,
		};
	}

	if (!EDITABLE_STARTER_REPO_STATUSES.has(existingRecord.status)) {
		throw new ConvexError(
			"Starter repo access is already locked for this account. Use support if the GitHub username needs to change.",
		);
	}

	await ctx.db.patch(existingRecord._id, {
		githubUsername: normalized,
		githubUsernameLower,
		status: "requested",
		requestedAt: now,
		updatedAt: now,
		invitedAt: undefined,
		acceptedAt: undefined,
		invitationId: undefined,
		lastError: undefined,
	});

	return {
		githubUsername: normalized,
		status: "requested" as const,
		requestedAt: now,
		updatedAt: now,
	};
}

export const listStarterRepoAccessQueueArgs = {
	statuses: v.optional(v.array(starterRepoAccessProvisioningStatusValidator)),
	courseSlug: v.optional(v.string()),
};
export const listStarterRepoAccessQueueReturns = v.array(
	starterRepoAccessOperatorItemValidator,
);

export async function listStarterRepoAccessQueueHandler(
	ctx: CourseQueryCtx,
	args: {
		statuses?: Array<StarterRepoAccessDoc["status"]>;
		courseSlug?: string;
	},
) {
	const statuses =
		args.statuses && args.statuses.length > 0
			? args.statuses
			: (["requested", "failed", "invited", "accepted"] as const);
	const courseSlug = args.courseSlug ?? COURSE_SLUG;
	const recordsById = new Map<string, StarterRepoAccessDoc>();

	for (const status of statuses) {
		const records = await ctx.db
			.query("starterRepoAccess")
			.withIndex("by_status", (q) => q.eq("status", status))
			.collect();

		for (const record of records) {
			if (record.courseSlug !== courseSlug) {
				continue;
			}

			recordsById.set(record._id, record);
		}
	}

	return [...recordsById.values()]
		.sort((left, right) => left.requestedAt - right.requestedAt)
		.map((record) => toStarterRepoAccessOperatorItem(record))
		.filter(
			(
				record,
			): record is NonNullable<
				ReturnType<typeof toStarterRepoAccessOperatorItem>
			> => Boolean(record),
		);
}

export const recordStarterRepoProvisioningResultArgs = {
	clerkUserId: v.string(),
	courseSlug: v.optional(v.string()),
	status: v.union(
		v.literal("invited"),
		v.literal("accepted"),
		v.literal("failed"),
	),
	invitationId: v.optional(v.string()),
	lastError: v.optional(v.string()),
};
export const recordStarterRepoProvisioningResultReturns = v.union(
	starterRepoAccessOperatorItemValidator,
	v.null(),
);

export async function recordStarterRepoProvisioningResultHandler(
	ctx: CourseMutationCtx,
	args: {
		clerkUserId: string;
		courseSlug?: string;
		status: "invited" | "accepted" | "failed";
		invitationId?: string;
		lastError?: string;
	},
) {
	const courseSlug = args.courseSlug ?? COURSE_SLUG;
	const record = await getStarterRepoAccessByCourse(
		ctx,
		args.clerkUserId,
		courseSlug,
	);

	if (!record) {
		throw new ConvexError("Starter repo access request not found.");
	}

	const now = Date.now();

	if (args.status === "invited") {
		await ctx.db.patch(record._id, {
			status: "invited",
			updatedAt: now,
			invitedAt: now,
			invitationId: args.invitationId,
			lastError: undefined,
		});
	} else if (args.status === "accepted") {
		await ctx.db.patch(record._id, {
			status: "accepted",
			updatedAt: now,
			invitedAt: record.invitedAt ?? now,
			acceptedAt: now,
			lastError: undefined,
		});
	} else {
		await ctx.db.patch(record._id, {
			status: "failed",
			updatedAt: now,
			invitedAt: undefined,
			acceptedAt: undefined,
			invitationId: undefined,
			lastError: args.lastError ?? "GitHub rejected the starter repo invite.",
		});
	}

	const updatedRecord = await getStarterRepoAccessByCourse(
		ctx,
		args.clerkUserId,
		courseSlug,
	);

	return toStarterRepoAccessOperatorItem(updatedRecord);
}

export const resetStarterRepoAccessArgs = {
	clerkUserId: v.string(),
	courseSlug: v.optional(v.string()),
};
export const resetStarterRepoAccessReturns = v.union(
	starterRepoAccessOperatorItemValidator,
	v.null(),
);

export async function resetStarterRepoAccessHandler(
	ctx: CourseMutationCtx,
	args: {
		clerkUserId: string;
		courseSlug?: string;
	},
) {
	const courseSlug = args.courseSlug ?? COURSE_SLUG;
	const record = await getStarterRepoAccessByCourse(
		ctx,
		args.clerkUserId,
		courseSlug,
	);

	if (!record) {
		throw new ConvexError("Starter repo access request not found.");
	}

	if (record.status !== "invited" && record.status !== "failed") {
		throw new ConvexError(
			"Only invited or failed starter repo records can be reset.",
		);
	}

	const now = Date.now();

	await ctx.db.patch(record._id, {
		status: "requested",
		requestedAt: now,
		updatedAt: now,
		invitedAt: undefined,
		acceptedAt: undefined,
		invitationId: undefined,
		lastError: undefined,
	});

	const updatedRecord = await getStarterRepoAccessByCourse(
		ctx,
		args.clerkUserId,
		courseSlug,
	);

	return toStarterRepoAccessOperatorItem(updatedRecord);
}
