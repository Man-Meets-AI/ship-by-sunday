---
title: 'Managed GitHub Execution'
summary: 'Operator contract for premium or concierge managed GitHub execution setup, consent, storage, audit, revocation, and proof boundaries.'
docType: 'guide'
status: 'active'
read_when:
  - 'Enabling managed GitHub execution for existing-codebase customers.'
  - 'Reviewing GitHub App permissions, repository scope, storage, or PR authority.'
  - 'Investigating why a managed GitHub request cannot become executable.'
---

# Managed GitHub Execution

Managed GitHub is the premium or concierge off-machine execution surface for the existing-codebase lane. It is not the default doctor-pass path. The default remains the local runner, where source, logs, and Codex transcripts stay on the customer machine unless the customer explicitly syncs structured findings.

The current implementation records customer consent and audit state only. It does not create a GitHub App, call GitHub APIs, store GitHub tokens, clone repositories, push branches, open pull requests, rerun CI, or upload raw source. Those actions require the provider setup below plus a later implementation slice.

## GitHub App Setup

Create a GitHub App only when managed execution is operationally enabled.

Create the app in the maintainer-owned GitHub organization or account that will operate Ship by Sunday managed work. Follow GitHub's App model rather than a broad personal access token. GitHub Apps have no permissions by default, and GitHub recommends selecting the minimum permissions required for the app. GitHub also lets installers choose all repositories or only selected repositories when repository permissions are requested.

Use these repository permissions for the first managed execution app:

- `Metadata`: read
- `Contents`: read
- `Pull requests`: write
- `Checks`: read
- `Actions`: read
- `Commit statuses`: read

Do not request `Administration`, `Workflows`, `Deployments`, `Secrets`, organization administration, or all-repository access for the first managed execution app. If a future workflow needs to edit `.github/workflows`, GitHub documents that the `Workflows` repository permission is required for that Git access; that must be a separate approval and implementation slice.

The customer installation scope must be `Only select repositories`. The selected repository must match the repository named in the workspace managed GitHub consent packet.

## Environment Ownership

The GitHub App is maintainer-owned. Customer repositories remain customer-owned. Local, preview, and production environments must be separate:

- Local: no managed GitHub provider values are required by the current implementation.
- Preview: provider values are required only for a future preview integration that calls GitHub.
- Production: provider values are required only after managed execution is operationally enabled and reviewed.

## Values And Storage

When a future implementation enables GitHub API calls, store these values outside source control:

- GitHub App ID: Vercel env or Convex env for the owning environment.
- GitHub App private key: Vercel secret or Convex env secret for the owning environment.
- GitHub webhook secret: Vercel env or Convex env secret for the owning environment.
- Installation id per customer repository: Convex, linked to the workspace project and repository binding.

Never store customer personal access tokens, customer repository secrets, raw source files, full terminal logs, or Codex transcripts in Convex or source control.

## Consent Contract

Before any managed GitHub action, the customer must see and accept:

- repository access: one selected GitHub repository only
- installation scope: selected repository only with the permissions listed above
- storage policy: ephemeral clone during delivery or until revocation; hosted state stores structured metadata, proof status, and PR references only
- PR authority: branch creation, PR creation, and CI reruns require separate customer approval; merge authority is never granted
- audit log: request and revocation are recorded in workspace audit events
- revocation: revocation stops managed GitHub eligibility until a new consent packet is requested
- raw-source visibility: assigned concierge operators may inspect source only after consent; raw-source sharing and transcript storage stay disabled by default
- proof boundary: proof and CI commands are customer-approved only; synced artifacts stay to proof metadata and PR references

The current app stores this consent in Convex but keeps the status as a request. An operator follow-up is still required before any off-machine execution can happen.

## Verification

Before treating managed GitHub as executable, verify all of this:

- the GitHub App is installed only on the customer-selected repository
- the app permissions match the first managed execution permission list
- the workspace consent packet names the same repository owner and name
- the customer has not revoked the request in `/workspace/privacy`
- audit events show the request and any later revocation
- a separate workflow approval names the branch, PR, CI, raw-source, and proof action being taken

Failure looks like one of these states:

- no consent packet: the privacy page can request concierge review, but managed execution is not allowed
- revoked consent: the customer must request a new packet before any managed GitHub work
- missing installation id: operator follow-up is blocked; the app cannot call GitHub
- wrong repository selection: do not proceed because the GitHub installation does not match customer consent
- missing permission: GitHub API calls return insufficient-permission errors; do not broaden permissions without a new approval
- raw-source or PR approval missing: do not clone, push, open a PR, rerun CI, or share source

## References

- GitHub Docs: [Choosing permissions for a GitHub App](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/choosing-permissions-for-a-github-app)
- GitHub Docs: [Installing your own GitHub App](https://docs.github.com/en/apps/using-github-apps/installing-your-own-github-app)
