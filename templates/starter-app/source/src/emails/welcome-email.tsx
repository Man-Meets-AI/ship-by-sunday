import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

export function WelcomeEmail({
  name,
  workspaceName,
}: {
  name?: string | null;
  workspaceName: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>Your starter workspace is ready</Preview>
      <Body
        style={{
          backgroundColor: "#f4f1ea",
          color: "#18181b",
          fontFamily:
            '"Instrument Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
          padding: "24px 0",
        }}
      >
        <Container
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "24px",
            margin: "0 auto",
            maxWidth: "560px",
            padding: "40px",
          }}
        >
          <Section>
            <Heading style={{ fontSize: "28px", marginBottom: "16px" }}>
              Welcome{name ? `, ${name}` : ""}
            </Heading>
            <Text style={{ fontSize: "16px", lineHeight: "28px" }}>
              Your workspace <strong>{workspaceName}</strong> is ready.
            </Text>
            <Text style={{ fontSize: "16px", lineHeight: "28px" }}>
              You&apos;re landing in a real product shell with authenticated routes,
              a working notes workflow, billing that syncs back into Convex, and
              shared analytics conventions that the next feature can build on.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
