import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import {
	observedErrorDocumentValidator,
	observedErrorWriteResultValidator,
	recordObservedErrorArgs,
} from "./observability/validators";
import {
	deliverObservedErrorAlertHandler,
	getObservedErrorForAlertArgs,
	getObservedErrorForAlertHandler,
	markObservedErrorAlertDeliveredHandler,
	markObservedErrorAlertFailedHandler,
	recordObservedErrorHandler,
} from "./observability/model";

export const recordObservedError = internalMutation({
	args: recordObservedErrorArgs,
	returns: observedErrorWriteResultValidator,
	handler: recordObservedErrorHandler,
});

export const getObservedErrorForAlert = internalQuery({
	args: getObservedErrorForAlertArgs,
	returns: v.union(observedErrorDocumentValidator, v.null()),
	handler: getObservedErrorForAlertHandler,
});

export const markObservedErrorAlertDelivered = internalMutation({
	args: {
		eventId: getObservedErrorForAlertArgs.eventId,
		telegramMessageId: v.number(),
	},
	returns: v.null(),
	handler: markObservedErrorAlertDeliveredHandler,
});

export const markObservedErrorAlertFailed = internalMutation({
	args: {
		eventId: getObservedErrorForAlertArgs.eventId,
		message: recordObservedErrorArgs.message,
	},
	returns: v.null(),
	handler: markObservedErrorAlertFailedHandler,
});

export const deliverObservedErrorAlert = internalAction({
	args: {
		eventId: getObservedErrorForAlertArgs.eventId,
	},
	returns: v.null(),
	handler: deliverObservedErrorAlertHandler,
});
