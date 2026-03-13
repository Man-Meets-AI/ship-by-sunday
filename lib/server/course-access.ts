import "server-only";

import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";

import { api } from "@/convex/_generated/api";
import { COURSE_SLUG } from "@/lib/course/registry";
import { getConvexServerSession } from "@/lib/server/convex-auth";

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
		redirect("/access-required");
	}

	return access;
}

export async function redirectAuthorizedAccessRequiredVisitor() {
	const access = await getServerViewerAccess();
	if (access.hasAccess) {
		redirect("/mission");
	}

	if (access.status === "signed_out" || access.status === "missing_token") {
		redirect(`/sign-in?redirect_url=${encodeURIComponent("/access-required")}`);
	}

	return access;
}
