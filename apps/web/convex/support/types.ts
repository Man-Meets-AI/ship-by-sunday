import type { SupportOperatorActionType } from "./operatorActions";
import type { supportDeliveryFailureClassValues } from "./validators";

export type SupportDeliveryFailureClass =
	(typeof supportDeliveryFailureClassValues)[number];

export type { SupportOperatorActionType };
