import { WelcomeEmail } from "../../emails/welcome-email";

export function buildWelcomeEmail(args: {
  name?: string | null;
  workspaceName: string;
}) {
  return {
    react: <WelcomeEmail name={args.name} workspaceName={args.workspaceName} />,
    subject: `Your workspace ${args.workspaceName} is ready`,
  };
}
