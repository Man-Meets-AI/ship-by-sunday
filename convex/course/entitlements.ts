import { ConvexError, v } from "convex/values";

import { COURSE_SLUG } from "../../features/course/lesson/model/registry";
import { requireConvexEnv } from "../env";
import type {
	CourseEntitlementSource,
	CourseMutationCtx,
	CourseQueryCtx,
	CourseReadCtx,
} from "./types";
import {
	entitlementDebugReturnValidator,
	entitlementGrantResultValidator,
	entitlementSourceValidator,
	viewerAccessReturnValidator,
} from "./validators";

export const viewerAccessArgs = {};
export const viewerAccessReturns = viewerAccessReturnValidator;

type EntitlementUpsertInput = {
	clerkUserId: string;
	courseSlug?: string;
	source: CourseEntitlementSource;
	stripeCustomerId?: string;
	stripeCheckoutSessionId?: string;
	stripePaymentIntentId?: string;
};

async function requireViewer(ctx: CourseReadCtx) {
	const identity = await ctx.auth.getUserIdentity();

	if (!identity) {
		throw new ConvexError("Unauthorized");
	}

	return identity.subject;
}

export async function getEntitlementByCourse(
	ctx: CourseReadCtx,
	clerkUserId: string,
	courseSlug: string = COURSE_SLUG,
) {
	return ctx.db
		.query("courseEntitlements")
		.withIndex("by_clerk_user_id_and_course_slug", (q) =>
			q.eq("clerkUserId", clerkUserId).eq("courseSlug", courseSlug),
		)
		.unique();
}

export async function requireActiveEntitlement(ctx: CourseReadCtx) {
	const clerkUserId = await requireViewer(ctx);
	const entitlement = await getEntitlementByCourse(ctx, clerkUserId);

	if (!entitlement || entitlement.status !== "active") {
		throw new ConvexError("Access required");
	}

	return clerkUserId;
}

async function upsertCourseEntitlement(
	ctx: CourseMutationCtx,
	input: EntitlementUpsertInput,
) {
	const courseSlug = input.courseSlug ?? COURSE_SLUG;
	const now = Date.now();
	const existingEntitlement = await getEntitlementByCourse(
		ctx,
		input.clerkUserId,
		courseSlug,
	);

	if (existingEntitlement) {
		await ctx.db.patch(existingEntitlement._id, {
			status: "active",
			source: input.source,
			stripeCustomerId: input.stripeCustomerId,
			stripeCheckoutSessionId: input.stripeCheckoutSessionId,
			stripePaymentIntentId: input.stripePaymentIntentId,
			updatedAt: now,
			revokedAt: undefined,
		});

		return { courseSlug, granted: "patched" as const };
	}

	await ctx.db.insert("courseEntitlements", {
		clerkUserId: input.clerkUserId,
		courseSlug,
		status: "active",
		source: input.source,
		stripeCustomerId: input.stripeCustomerId,
		stripeCheckoutSessionId: input.stripeCheckoutSessionId,
		stripePaymentIntentId: input.stripePaymentIntentId,
		grantedAt: now,
		updatedAt: now,
	});

	return { courseSlug, granted: "inserted" as const };
}

export async function viewerAccessHandler(ctx: CourseQueryCtx) {
	const identity = await ctx.auth.getUserIdentity();

	if (!identity) {
		return {
			clerkUserId: null,
			courseSlug: COURSE_SLUG,
			hasAccess: false,
			status: "signed_out" as const,
		};
	}

	const entitlement = await getEntitlementByCourse(ctx, identity.subject);

	return {
		clerkUserId: identity.subject,
		courseSlug: COURSE_SLUG,
		hasAccess: entitlement?.status === "active",
		status: entitlement?.status ?? ("none" as const),
	};
}

export const grantEntitlementArgs = {
	clerkUserId: v.string(),
	courseSlug: v.optional(v.string()),
	source: v.optional(entitlementSourceValidator),
	stripeCustomerId: v.optional(v.string()),
	stripeCheckoutSessionId: v.optional(v.string()),
	stripePaymentIntentId: v.optional(v.string()),
};
export const grantEntitlementReturns = entitlementGrantResultValidator;

export async function grantEntitlementHandler(
	ctx: CourseMutationCtx,
	args: {
		clerkUserId: string;
		courseSlug?: string;
		source?: CourseEntitlementSource;
		stripeCustomerId?: string;
		stripeCheckoutSessionId?: string;
		stripePaymentIntentId?: string;
	},
) {
	return upsertCourseEntitlement(ctx, {
		...args,
		source: args.source ?? "manual",
	});
}

export const grantEntitlementFromStripeArgs = {
	webhookSecret: v.string(),
	clerkUserId: v.string(),
	courseSlug: v.optional(v.string()),
	stripeCustomerId: v.optional(v.string()),
	stripeCheckoutSessionId: v.optional(v.string()),
	stripePaymentIntentId: v.optional(v.string()),
};
export const grantEntitlementFromStripeReturns =
	entitlementGrantResultValidator;

export async function grantEntitlementFromStripeHandler(
	ctx: CourseMutationCtx,
	args: {
		webhookSecret: string;
		clerkUserId: string;
		courseSlug?: string;
		stripeCustomerId?: string;
		stripeCheckoutSessionId?: string;
		stripePaymentIntentId?: string;
	},
) {
	if (args.webhookSecret !== requireConvexEnv("STRIPE_WEBHOOK_SECRET")) {
		throw new ConvexError("Invalid webhook secret");
	}

	return upsertCourseEntitlement(ctx, {
		clerkUserId: args.clerkUserId,
		courseSlug: args.courseSlug,
		source: "stripe_webhook",
		stripeCustomerId: args.stripeCustomerId,
		stripeCheckoutSessionId: args.stripeCheckoutSessionId,
		stripePaymentIntentId: args.stripePaymentIntentId,
	});
}

export const getEntitlementDebugArgs = {
	clerkUserId: v.optional(v.string()),
	courseSlug: v.optional(v.string()),
	stripeCheckoutSessionId: v.optional(v.string()),
};
export const getEntitlementDebugReturns = entitlementDebugReturnValidator;

export async function getEntitlementDebugHandler(
	ctx: CourseQueryCtx,
	args: {
		clerkUserId?: string;
		courseSlug?: string;
		stripeCheckoutSessionId?: string;
	},
) {
	if (args.stripeCheckoutSessionId) {
		const entitlement = await ctx.db
			.query("courseEntitlements")
			.withIndex("by_stripe_checkout_session_id", (q) =>
				q.eq("stripeCheckoutSessionId", args.stripeCheckoutSessionId!),
			)
			.unique();

		return entitlement ?? null;
	}

	if (!args.clerkUserId) {
		return null;
	}

	const entitlement = await getEntitlementByCourse(
		ctx,
		args.clerkUserId,
		args.courseSlug ?? COURSE_SLUG,
	);

	return entitlement ?? null;
}
