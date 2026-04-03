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
import type * as blueprint from "../blueprint.js";
import type * as blueprint_projectDefinition from "../blueprint/projectDefinition.js";
import type * as blueprint_stageReadiness from "../blueprint/stageReadiness.js";
import type * as blueprint_types from "../blueprint/types.js";
import type * as blueprint_validators from "../blueprint/validators.js";
import type * as blueprint_workflowState from "../blueprint/workflowState.js";
import type * as checkoutClaims from "../checkoutClaims.js";
import type * as checkoutClaimsActions from "../checkoutClaimsActions.js";
import type * as codex from "../codex.js";
import type * as codexValidators from "../codexValidators.js";
import type * as course from "../course.js";
import type * as course_artifacts from "../course/artifacts.js";
import type * as course_bonusMission from "../course/bonusMission.js";
import type * as course_bonusRoute from "../course/bonusRoute.js";
import type * as course_lessonState from "../course/lessonState.js";
import type * as course_mission from "../course/mission.js";
import type * as course_shared from "../course/shared.js";
import type * as course_starterRepoAccess from "../course/starterRepoAccess.js";
import type * as course_types from "../course/types.js";
import type * as course_validators from "../course/validators.js";
import type * as env from "../env.js";
import type * as http from "../http.js";
import type * as observability from "../observability.js";
import type * as observability_model from "../observability/model.js";
import type * as observability_validators from "../observability/validators.js";
import type * as stripeWebhook from "../stripeWebhook.js";
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
  blueprint: typeof blueprint;
  "blueprint/projectDefinition": typeof blueprint_projectDefinition;
  "blueprint/stageReadiness": typeof blueprint_stageReadiness;
  "blueprint/types": typeof blueprint_types;
  "blueprint/validators": typeof blueprint_validators;
  "blueprint/workflowState": typeof blueprint_workflowState;
  checkoutClaims: typeof checkoutClaims;
  checkoutClaimsActions: typeof checkoutClaimsActions;
  codex: typeof codex;
  codexValidators: typeof codexValidators;
  course: typeof course;
  "course/artifacts": typeof course_artifacts;
  "course/bonusMission": typeof course_bonusMission;
  "course/bonusRoute": typeof course_bonusRoute;
  "course/lessonState": typeof course_lessonState;
  "course/mission": typeof course_mission;
  "course/shared": typeof course_shared;
  "course/starterRepoAccess": typeof course_starterRepoAccess;
  "course/types": typeof course_types;
  "course/validators": typeof course_validators;
  env: typeof env;
  http: typeof http;
  observability: typeof observability;
  "observability/model": typeof observability_model;
  "observability/validators": typeof observability_validators;
  stripeWebhook: typeof stripeWebhook;
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
