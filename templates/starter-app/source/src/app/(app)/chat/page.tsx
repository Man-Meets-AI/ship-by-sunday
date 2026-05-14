import { ChatWorkbench } from "@/components/app/chat-workbench";
import { PageShell } from "@/components/layout/page-shell";
import { SectionHeader } from "@/components/layout/section-header";

export default function ChatPage() {
  return (
    <PageShell>
      <SectionHeader
        eyebrow="AI Workspace"
        title="Chat with your product assistant"
        description="A protected, Convex-backed chat surface with workspace history, model selection, streaming responses, and billing-aware free limits."
      />
      <ChatWorkbench />
    </PageShell>
  );
}
