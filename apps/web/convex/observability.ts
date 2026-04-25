import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

import {
	internalAction,
	internalMutation,
	internalQuery,
} from "./_generated/server";
import {
	deliverIncidentNotificationHandler,
	getIncidentForNotificationArgs,
	getIncidentForNotificationHandler,
	listIncidentOccurrencesForEngineeringIntakeHandler,
	listIncidentsForEngineeringIntakeHandler,
	markIncidentNotificationDeliveredHandler,
	markIncidentNotificationFailedHandler,
	recordIncidentHandler,
	updateIncidentStatusHandler,
} from "./observability/model";
import {
	incidentDocumentValidator,
	incidentOccurrenceDocumentValidator,
	incidentWriteResultValidator,
	recordIncidentArgs,
	updateIncidentStatusArgs,
} from "./observability/validators";

export const recordIncident = internalMutation({
	args: recordIncidentArgs,
	returns: incidentWriteResultValidator,
	handler: recordIncidentHandler,
});

export const getIncidentForNotification = internalQuery({
	args: getIncidentForNotificationArgs,
	returns: v.union(incidentDocumentValidator, v.null()),
	handler: getIncidentForNotificationHandler,
});

export const listIncidentsForEngineeringIntake = internalQuery({
	args: {
		paginationOpts: paginationOptsValidator,
	},
	returns: v.object({
		continueCursor: v.string(),
		isDone: v.boolean(),
		page: v.array(incidentDocumentValidator),
		pageStatus: v.optional(v.union(v.string(), v.null())),
		splitCursor: v.optional(v.union(v.string(), v.null())),
	}),
	handler: listIncidentsForEngineeringIntakeHandler,
});

export const listIncidentOccurrencesForEngineeringIntake = internalQuery({
	args: {
		paginationOpts: paginationOptsValidator,
	},
	returns: v.object({
		continueCursor: v.string(),
		isDone: v.boolean(),
		page: v.array(incidentOccurrenceDocumentValidator),
		pageStatus: v.optional(v.union(v.string(), v.null())),
		splitCursor: v.optional(v.union(v.string(), v.null())),
	}),
	handler: listIncidentOccurrencesForEngineeringIntakeHandler,
});

export const markIncidentNotificationDelivered = internalMutation({
	args: {
		incidentId: getIncidentForNotificationArgs.incidentId,
		telegramMessageId: v.number(),
		telegramThreadId: v.optional(v.union(v.number(), v.null())),
	},
	returns: v.null(),
	handler: markIncidentNotificationDeliveredHandler,
});

export const markIncidentNotificationFailed = internalMutation({
	args: {
		incidentId: getIncidentForNotificationArgs.incidentId,
		message: recordIncidentArgs.title,
	},
	returns: v.null(),
	handler: markIncidentNotificationFailedHandler,
});

export const deliverIncidentNotification = internalAction({
	args: {
		incidentId: getIncidentForNotificationArgs.incidentId,
	},
	returns: v.null(),
	handler: deliverIncidentNotificationHandler,
});

export const updateIncidentStatus = internalMutation({
	args: updateIncidentStatusArgs,
	returns: v.null(),
	handler: updateIncidentStatusHandler,
});
