import "server-only";

import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";

import { routeConfig } from "@/config/product";
import { api } from "@/convex/_generated/api";
import { COURSE_SLUG } from "@/features/course/lesson/model/registry";
import { getConvexServerSession } from "@/platform/auth/convex-auth";

type ViewerAccess = {
	clerkUserId: string | null;
	courseSlug: string;
	hasAccess: boolean;
	status: string;
};

type ResumeDestination = {
	destination: string;
	lessonId: string | null;
};

export async function getServerViewerAccess(): Promise<ViewerAccess> {
	const session = await getConvexServerSession();
	if (!session.userId || !session.token) {
		return {
			clerkUserId: session.userId,
			courseSlug: COURSE_SLUG,
			hasAccess: false,
			status: session.userId ? "missing_token" : "signed_out",
		};
	}

	return (await fetchQuery(
		api.course.viewerAccess,
		{},
		{
			token: session.token,
		},
	)) as ViewerAccess;
}

export async function getServerResumeDestination() {
	const access = await getServerViewerAccess();
	if (!access.hasAccess) {
		return null;
	}

	const session = await getConvexServerSession();
	if (!session.token) {
		return null;
	}

	return (await fetchQuery(
		api.course.getResumeDestination,
		{},
		{
			token: session.token,
		},
	)) as ResumeDestination;
}

export async function redirectEntitledHomeVisitor({
	allowMarketing,
}: {
	allowMarketing: boolean;
}) {
	if (allowMarketing) {
		return;
	}

	const resumeDestination = await getServerResumeDestination();
	if (resumeDestination?.destination) {
		redirect(resumeDestination.destination);
	}
}

export async function requireCourseAccess() {
	const access = await getServerViewerAccess();
	if (!access.hasAccess) {
		redirect(routeConfig.accessRequired);
	}

	return access;
}

export async function redirectAuthorizedAccessRequiredVisitor() {
	const access = await getServerViewerAccess();
	if (access.hasAccess) {
		redirect(routeConfig.mission);
	}

	return access;
}
