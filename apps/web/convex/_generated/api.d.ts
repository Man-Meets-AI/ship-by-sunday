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
import type * as checkoutClaims from "../checkoutClaims.js";
import type * as checkoutClaimsActions from "../checkoutClaimsActions.js";
import type * as checkoutIntentValidators from "../checkoutIntentValidators.js";
import type * as checkoutOfferValidators from "../checkoutOfferValidators.js";
import type * as codebase from "../codebase.js";
import type * as codebase_projectDefinition from "../codebase/projectDefinition.js";
import type * as codebase_stageReadiness from "../codebase/stageReadiness.js";
import type * as codebase_types from "../codebase/types.js";
import type * as codebase_validators from "../codebase/validators.js";
import type * as codebase_workflowState from "../codebase/workflowState.js";
import type * as codex from "../codex.js";
import type * as codexValidators from "../codexValidators.js";
import type * as course from "../course.js";
import type * as course_artifacts from "../course/artifacts.js";
import type * as course_bonusMission from "../course/bonusMission.js";
import type * as course_bonusRoute from "../course/bonusRoute.js";
import type * as course_lessonState from "../course/lessonState.js";
import type * as course_mission from "../course/mission.js";
import type * as course_shared from "../course/shared.js";
import type * as course_types from "../course/types.js";
import type * as course_validators from "../course/validators.js";
import type * as crons from "../crons.js";
import type * as env from "../env.js";
import type * as http from "../http.js";
import type * as impersonation from "../impersonation.js";
import type * as impersonation_blockedResult from "../impersonation/blockedResult.js";
import type * as impersonation_model from "../impersonation/model.js";
import type * as impersonation_types from "../impersonation/types.js";
import type * as impersonation_validators from "../impersonation/validators.js";
import type * as observability from "../observability.js";
import type * as observability_model from "../observability/model.js";
import type * as observability_validators from "../observability/validators.js";
import type * as stripeWebhook from "../stripeWebhook.js";
import type * as stripeWebhookEvents from "../stripeWebhookEvents.js";
import type * as support from "../support.js";
import type * as support_aiDrafts from "../support/aiDrafts.js";
import type * as support_model from "../support/model.js";
import type * as support_operatorActions from "../support/operatorActions.js";
import type * as support_telegram from "../support/telegram.js";
import type * as support_types from "../support/types.js";
import type * as support_validators from "../support/validators.js";
import type * as supportAdmin from "../supportAdmin.js";
import type * as uploads from "../uploads.js";
import type * as workspace from "../workspace.js";
import type * as workspace_approved_findings_digest from "../workspace/approved_findings_digest.js";
import type * as workspace_events from "../workspace/events.js";
import type * as workspace_model from "../workspace/model.js";
import type * as workspace_types from "../workspace/types.js";
import type * as workspace_validators from "../workspace/validators.js";

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
  checkoutClaims: typeof checkoutClaims;
  checkoutClaimsActions: typeof checkoutClaimsActions;
  checkoutIntentValidators: typeof checkoutIntentValidators;
  checkoutOfferValidators: typeof checkoutOfferValidators;
  codebase: typeof codebase;
  "codebase/projectDefinition": typeof codebase_projectDefinition;
  "codebase/stageReadiness": typeof codebase_stageReadiness;
  "codebase/types": typeof codebase_types;
  "codebase/validators": typeof codebase_validators;
  "codebase/workflowState": typeof codebase_workflowState;
  codex: typeof codex;
  codexValidators: typeof codexValidators;
  course: typeof course;
  "course/artifacts": typeof course_artifacts;
  "course/bonusMission": typeof course_bonusMission;
  "course/bonusRoute": typeof course_bonusRoute;
  "course/lessonState": typeof course_lessonState;
  "course/mission": typeof course_mission;
  "course/shared": typeof course_shared;
  "course/types": typeof course_types;
  "course/validators": typeof course_validators;
  crons: typeof crons;
  env: typeof env;
  http: typeof http;
  impersonation: typeof impersonation;
  "impersonation/blockedResult": typeof impersonation_blockedResult;
  "impersonation/model": typeof impersonation_model;
  "impersonation/types": typeof impersonation_types;
  "impersonation/validators": typeof impersonation_validators;
  observability: typeof observability;
  "observability/model": typeof observability_model;
  "observability/validators": typeof observability_validators;
  stripeWebhook: typeof stripeWebhook;
  stripeWebhookEvents: typeof stripeWebhookEvents;
  support: typeof support;
  "support/aiDrafts": typeof support_aiDrafts;
  "support/model": typeof support_model;
  "support/operatorActions": typeof support_operatorActions;
  "support/telegram": typeof support_telegram;
  "support/types": typeof support_types;
  "support/validators": typeof support_validators;
  supportAdmin: typeof supportAdmin;
  uploads: typeof uploads;
  workspace: typeof workspace;
  "workspace/approved_findings_digest": typeof workspace_approved_findings_digest;
  "workspace/events": typeof workspace_events;
  "workspace/model": typeof workspace_model;
  "workspace/types": typeof workspace_types;
  "workspace/validators": typeof workspace_validators;
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
