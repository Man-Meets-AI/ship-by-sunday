import { actionGeneric as action } from "convex/server";
import { v } from "convex/values";

import { sendTransactionalEmail } from "../src/lib/email/send";
import { getServerEmailEnv } from "../src/lib/env/server";
import { buildWelcomeEmail } from "../src/lib/email/welcome";

export const sendWelcomeEmail = action({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    workspaceName: v.string(),
  },
  handler: async (_ctx, args) => {
    if (!getServerEmailEnv()) {
      return { skipped: true as const };
    }

    const email = buildWelcomeEmail({
      name: args.name,
      workspaceName: args.workspaceName,
    });

    await sendTransactionalEmail({
      to: args.email,
      subject: email.subject,
      react: email.react,
    });

    return { skipped: false as const };
  },
});
