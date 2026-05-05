import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export type CourseQueryCtx = QueryCtx;
export type CourseMutationCtx = MutationCtx;
export type CourseReadCtx = QueryCtx | MutationCtx;

export type LessonStateDoc = Doc<"lessonStates">;
