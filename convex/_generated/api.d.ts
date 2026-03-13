/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as codex from "../codex.js";
import type * as course from "../course.js";
import type * as course_artifacts from "../course/artifacts.js";
import type * as course_entitlements from "../course/entitlements.js";
import type * as course_lessonState from "../course/lessonState.js";
import type * as course_mission from "../course/mission.js";
import type * as course_shared from "../course/shared.js";
import type * as course_types from "../course/types.js";
import type * as course_validators from "../course/validators.js";
import type * as env from "../env.js";
import type * as uploads from "../uploads.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  codex: typeof codex;
  course: typeof course;
  "course/artifacts": typeof course_artifacts;
  "course/entitlements": typeof course_entitlements;
  "course/lessonState": typeof course_lessonState;
  "course/mission": typeof course_mission;
  "course/shared": typeof course_shared;
  "course/types": typeof course_types;
  "course/validators": typeof course_validators;
  env: typeof env;
  uploads: typeof uploads;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
