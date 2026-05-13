import { ConvexReactClient } from "convex/react";

import { clientEnv } from "@/lib/env/client";

export const convex = new ConvexReactClient(clientEnv.NEXT_PUBLIC_CONVEX_URL);
