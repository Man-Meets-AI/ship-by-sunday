import { BillingPanel } from "@/components/app/billing-panel";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeader } from "@/components/layout/section-header";
import { getBillingEnvIfConfigured } from "@/lib/env/server";

type BillingPageSearchParams = Promise<Record<string, string | string[] | undefined>>;

function isInvalidBillingEnvError(error: unknown) {
  return (
    error instanceof Error &&
    error.message.startsWith("Invalid billing environment variables")
  );
}

function getSingleSearchParam(
  value: string | string[] | undefined,
) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: BillingPageSearchParams;
}) {
  let billingConfigured = false;

  try {
    billingConfigured = getBillingEnvIfConfigured() !== null;
  } catch (error) {
    if (!isInvalidBillingEnvError(error)) {
      throw error;
    }
  }

  const resolvedSearchParams = await searchParams;
  const billingStatus = getSingleSearchParam(resolvedSearchParams.billing);

  return (
    <PageShell>
      <SectionHeader
        eyebrow="Billing"
        title="Billing that stays behind the scenes"
        description="Stripe handles checkout and customer management. The rest of the product reads normalized plan and entitlement state from Convex."
      />
      <BillingPanel
        billingConfigured={billingConfigured}
        billingStatus={billingStatus}
      />
    </PageShell>
  );
}
