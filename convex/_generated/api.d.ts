/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as access from "../access.js";
import type * as access_model from "../access/model.js";
import type * as access_types from "../access/types.js";
import type * as access_validators from "../access/validators.js";
import type * as codex from "../codex.js";
import type * as course from "../course.js";
import type * as course_artifacts from "../course/artifacts.js";
import type * as course_lessonState from "../course/lessonState.js";
import type * as course_mission from "../course/mission.js";
import type * as course_shared from "../course/shared.js";
import type * as course_starterRepoAccess from "../course/starterRepoAccess.js";
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
  access: typeof access;
  "access/model": typeof access_model;
  "access/types": typeof access_types;
  "access/validators": typeof access_validators;
  codex: typeof codex;
  course: typeof course;
  "course/artifacts": typeof course_artifacts;
  "course/lessonState": typeof course_lessonState;
  "course/mission": typeof course_mission;
  "course/shared": typeof course_shared;
  "course/starterRepoAccess": typeof course_starterRepoAccess;
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
