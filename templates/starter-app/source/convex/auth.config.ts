import { getConvexAuthEnv } from "../src/lib/env/server";

const convexAuthEnv = getConvexAuthEnv();

const authConfig = {
  providers: [
    {
      domain: convexAuthEnv.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};

export default authConfig;
