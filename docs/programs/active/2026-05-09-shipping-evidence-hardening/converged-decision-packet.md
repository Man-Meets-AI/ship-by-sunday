---
title: Shipping Evidence Hardening Decision Packet
summary: Converged decision packet for turning test infrastructure research into a multi-slice Program.
docType: decision
status: active
read_when:
  - Checking the Program's initiative-level decisions.
  - Reviewing why the first slice starts with CI and workspace coverage.
---

# Shipping Evidence Hardening Decision Packet

The Program should harden shipping evidence rather than chase undifferentiated test count.

The first decision is to treat the merge gate as the foundation. Package tests and package typechecks already exist, but they are not required by CI. A fast source gate that represents all shipped workspaces is the lowest-risk first slice because it improves confidence without depending on provider credentials or hosted environments.

The second decision is to keep environment-sensitive proof out of every PR. Hosted Stripe, Clerk, Convex, Vercel, and production preflight should run when the affected domain or release stage requires them. Putting all hosted proof in every PR would slow down ordinary work and increase flake without solving the main source-gate omission.

The third decision is to make proof summaries machine-truthful before relying on them for release tags. A successful workflow conclusion is not enough when a deploy can intentionally skip or when an alias may not point at the expected deployment.

The fourth decision is to include generated customer repos in scope. The product ships a Codebase snapshot. Its advertised commands and CI examples are part of the customer contract.
