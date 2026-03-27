import type { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";

export type BonusMissionState = FunctionReturnType<
	typeof api.course.getBonusMissionState
>;
