import { getDebugToolsEnv } from "@/lib/env/server";

export function areDebugToolsEnabled() {
  const debugToolsEnv = getDebugToolsEnv();

  return (
    process.env.NODE_ENV !== "production" &&
    debugToolsEnv.ENABLE_DEBUG_TOOLS === "true"
  );
}
