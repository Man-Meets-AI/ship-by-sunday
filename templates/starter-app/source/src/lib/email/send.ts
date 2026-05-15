"server-only";

import { render } from "@react-email/render";
import { Resend } from "resend";

import { getServerEmailEnv } from "../env/server";

export async function sendTransactionalEmail(args: {
  to: string;
  subject: string;
  react: React.ReactElement;
}) {
  const emailEnv = getServerEmailEnv();

  if (!emailEnv) {
    throw new Error("Transactional email environment variables are not configured.");
  }

  const html = await render(args.react);
  const resend = new Resend(emailEnv.RESEND_API_KEY);

  return resend.emails.send({
    from: emailEnv.RESEND_FROM_EMAIL,
    to: args.to,
    subject: args.subject,
    html,
  });
}
