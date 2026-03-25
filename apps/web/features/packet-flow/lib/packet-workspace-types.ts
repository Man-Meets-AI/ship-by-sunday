import type { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";

export type PacketWorkspaceState = FunctionReturnType<
	typeof api.packet.getPacketWorkspaceState
>;
