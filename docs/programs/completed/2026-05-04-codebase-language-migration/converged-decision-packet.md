---
title: Converged Decision Packet
summary: Final initiative decision for the Codebase Language Migration Program.
docType: program_decision
status: active
read_when:
  - Checking why the Program treats codebase as canonical and rejects an alias-migration plan.
---

# Converged Decision Packet

The Program will finish the direct rename to `codebase` as the canonical product and internal noun, with `agent-ready codebase` as the primary external phrase.

The migration is direct and non-compatible. Current source, docs, package, generated-output, route, test, and Program surfaces should use codebase-named paths and identifiers rather than preserving an older noun family.

The first implementation slice should update docs-owned current-truth surfaces: active Program packet language, Program indexes, root docs, source docs, generated mirrors when their source is updated, and renamed path/title/frontmatter references.

App, package, Convex, and release-proof source paths remain outside this docs-owned slice unless their owning worker handles them. Any remaining issue in those surfaces should be reported as an owner-specific validation problem, not converted back into an old-name support plan.

The final state should let Ship by Sunday say plainly that it spins up an agent-ready codebase, with validation proving the renamed docs and generated mirrors agree.
