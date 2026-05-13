import { NotesWorkbench } from "@/components/app/notes-workbench";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeader } from "@/components/layout/section-header";

export default function NotesPage() {
  return (
    <PageShell>
      <SectionHeader
        eyebrow="Sample workflow"
        title="Notes demo"
        description="Use this page as the reference slice for new product features: a protected route, workspace-scoped data, tracked actions, and plan-aware limits working together in one place."
      />
      <NotesWorkbench />
    </PageShell>
  );
}
