---
summary: Define and implement a durable release operating system for Ship by Sunday: clean up stale release docs, set GitHub repository metadata, formalize semantic versioning and hotfix rules, require changelog-backed releases, and cut the first GitHub release from `main` after fresh production billing proof.
read_when: Open this when changing GitHub repository metadata, release policy, semantic versioning, changelog workflow, hotfix process, or when preparing the first tagged release from `main`.
plan_status: not_done
---

# Formalize Release and Versioning Operations

This document is a living execution plan. Update it as discoveries are made, as milestones complete, and as release decisions change so another agent can resume from this file alone.

This ExecPlan must be maintained in accordance with `docs/codex/PLANS.md`.

## Purpose / Big Picture

Ship by Sunday now has a real `feature -> dev -> main` ship path, green integrated staging proof on `dev`, green PR checks on `main`, and successful production deploys through Vercel and Convex. What it still lacks is an explicit release operating system. The GitHub repository metadata is thin, there are no tags or GitHub Releases, `CHANGELOG.md` is not yet tied to a formal release rule, and the root `AGENTS.md` still teaches an older short-lived-branch-to-`main` model that contradicts the live process. After this work, a maintainer should be able to answer three questions from the repo alone: when a release is allowed, how to version it, and what to do differently for a hotfix. The change is working when the docs stop contradicting each other, the first release tag exists on `main`, the GitHub Releases page has a real `v0.1.0` release tied to the changelog, and the hotfix and billing-proof rules are written down clearly enough that a fresh operator can follow them without chat history.

## Progress

- [x] 2026-04-01 EDT: Audited the existing release, versioning, changelog, and hotfix guidance across `README.md`, `AGENTS.md`, `docs/release-workflow.md`, `qa/README.md`, `qa/AGENTS.md`, `CHANGELOG.md`, and GitHub repository metadata. Confirmed the branch flow is already mostly aligned and the remaining gaps are release/versioning policy, first-release artifacts, and fresh production billing proof.
- [ ] 2026-04-01 EDT: Extend the authoritative release docs with semantic-versioning, changelog-backed release, and hotfix rules.
- [ ] 2026-04-01 EDT: Write the semantic-versioning, changelog, GitHub Release, and hotfix SOP in the repo’s durable docs.
- [ ] 2026-04-01 EDT: Run one fresh production billing proof for the current `main` release using the repo’s live no-cost verification method.
- [ ] 2026-04-01 EDT: Cut the first Git tag and GitHub Release from `main`, backed by the current changelog and the verified ship evidence.

## Surprises & Discoveries

The repository already contains most of the modern release process, and the main branch-flow docs are in better shape than expected. `README.md`, `qa/README.md`, `qa/AGENTS.md`, and `docs/release-workflow.md` all now describe the `feature -> dev -> main` path, the `bun run precommit` local gate, and the staging-versus-production QA split. The main remaining documentation gap is not branch flow. It is the lack of a durable release/versioning/changelog policy tied to Git tags and GitHub Releases.

GitHub metadata is partly already corrected. The repository now has a production homepage URL and a real description, but it still has no tags, no GitHub Releases, and no repository topics. The only metadata gap that obviously remains is topics, and those should stay optional unless the repo adopts a canonical topic list.

The changelog already contains the right raw material for a first release, especially the `2026-03-31`, `2026-03-30`, `2026-03-29`, `2026-03-28`, `2026-03-27`, `2026-03-26`, and `2026-03-25` sections, but there is no formal rule yet that says a release must map to a changelog section. That gap is why the first release should be treated as both a tag and a process proof.

The production billing question is narrower than “is the site up.” The repo’s accepted production billing proof is a fresh live no-cost Checkout Session using a restricted `100% off` promotion code. Existing durable evidence lives in `qa/runs/2026-03-25-prod-billing-integration-webhook-fix.md` and `qa/runs/2026-03-25-prod-billing-integration-automatic-rerun.md`, but that evidence predates the current release. For a strict release operating system, a fresh proof is still required when checkout, auth, webhook, or access-grant behavior changed.

## Decision Log

Decision: treat `docs/release-workflow.md` plus the top-level repository docs as the durable operator source of truth for releases, and remove stale contradictions from `AGENTS.md` instead of preserving multiple parallel branch models.  
Rationale: the repo already has one real release process now. Keeping old guidance beside it makes future mistakes more likely than missing guidance would.  
Date: 2026-04-01

Decision: start semantic versioning at `v0.1.0` and keep the project in pre-1.0 rules for now.  
Rationale: the product is live and release-worthy, but the release process, staging automation, and starter/runtime contract are still settling. Pre-1.0 semantic versioning gives room for meaningful change without claiming a stable `1.0.0` contract too early.  
Date: 2026-04-01

Decision: require GitHub Releases to be cut from `main` only, and require a matching `CHANGELOG.md` section before the release is created.  
Rationale: the release artifact should represent the exact production branch state, and the changelog should stay the single durable human-facing record of what changed.  
Date: 2026-04-01

Decision: require fresh production billing proof only when the commercial path changed.  
Rationale: production billing proof is meaningful and sometimes side-effectful. It should be mandatory for checkout, auth, webhook, entitlement, and access-handoff changes, but not for unrelated docs or presentation changes.  
Date: 2026-04-01

Decision: hotfixes branch from `main`, receive a patch version immediately after merge, and then merge or cherry-pick back into `dev` before normal feature work continues.  
Rationale: this preserves the integrity of the production branch while preventing `dev` from drifting away from what is actually live.  
Date: 2026-04-01

Decision: keep the repo-level fast local gate as `bun run precommit` and do not add Husky as part of this release SOP.  
Rationale: the current repository policy already uses a script-level fast gate and deliberately avoided adding Husky. The SOP should document reality, not introduce a new hook system as part of release policy work.  
Date: 2026-04-01

Decision: extend `docs/release-workflow.md` as the primary durable release SOP instead of creating a new standalone release policy document by default.  
Rationale: the release workflow document already owns production promotion, deploy, and billing-proof guidance. Adding the versioning and hotfix policy there reduces fragmentation instead of creating another process doc.  
Date: 2026-04-01

Decision: derive the first GitHub Release notes from the dated `CHANGELOG.md` entries instead of restructuring the changelog into a version-indexed format first.  
Rationale: the current changelog already contains the right historical slices. The first release should use that source material directly rather than turning release-note cleanup into a separate migration.  
Date: 2026-04-01

Decision: treat repository topics as optional for the first release and avoid blocking `v0.1.0` on topic curation.  
Rationale: the repo has no agreed canonical topic list today. Topics can improve discoverability later, but they are not a prerequisite for a correct release operating system.  
Date: 2026-04-01

## Outcomes & Retrospective

This section is incomplete because the release operating system is not implemented yet. At completion, it must compare the current partially documented process against the final documented and tagged release policy, list the exact files and GitHub metadata changed, record whether `v0.1.0` was created successfully, and note whether a fresh production billing proof was attached to that release. It should also capture any remaining drift risk, such as branch-specific staging host assumptions, CI credentials that still deserve cleanup after the first release, or any deferred GitHub metadata such as repository topics.

## Context and Orientation

The release process currently spans several different surfaces. `README.md` is the human entrypoint for the repository and now describes the `feature -> dev -> main` ship path, the `bun run precommit` local gate, and the public homepage contract. `docs/release-workflow.md` is the operator runbook for the GitHub branch model, Vercel production deploy, Convex production deploy, and post-deploy QA. `qa/README.md` defines which QA packs run where, and it already says that `default_ship` is the standard integrated staging proof on `dev` while production billing verification should use a fresh live no-cost Checkout proof when the commercial path changed. `CHANGELOG.md` is the durable record of user-facing changes but is not yet explicitly tied to Git tags or GitHub Releases. The root `AGENTS.md` no longer appears to be the main contradiction; the real remaining gap is missing release/versioning/changelog policy and the absence of release artifacts.

The GitHub-side metadata is part of the release surface too. The repository’s “About” section controls the public description and homepage URL shown on GitHub. The “Releases” section is empty today because there are no Git tags and no GitHub Releases. Those surfaces matter because they are what a maintainer or outsider sees before reading code.

In this plan, “release” means a Git tag plus a GitHub Release created from `main`. “Production proof” means both deployment health and the relevant QA evidence. “Production billing proof” means a fresh live Checkout verification that uses a restricted `100% off` promotion code so the payment flow completes without a real charge while still exercising Stripe webhook delivery and the `/checkout/success -> /start` handoff. “Hotfix” means a production repair that branches from `main`, merges to `main`, receives a patch version, and then is merged or cherry-picked back into `dev`.

The exact current branch behavior that the final docs must teach is already visible in the repo and live automation:

- `feature -> dev` is the normal implementation path
- `Dev Staging Proof` runs on `dev`
- `dev -> main` is the production promotion PR
- `CI` plus `Convex Production Deploy` run on `main`
- `bun run precommit` is the fast local gate

The main authoritative files and surfaces this plan must touch are:

- `README.md`
- `docs/release-workflow.md`
- `AGENTS.md` only if a release/versioning note is needed there after implementation review
- `CHANGELOG.md`
- GitHub repository About metadata
- Git tags and GitHub Releases

The current release candidate on `main` is the merge commit `71034dee51ff38b91c7ab2759149f861c4d64268`. There are no tags yet, and the repo-level codebase versions already report `0.1.0`, so the first release tag can be created directly from the current `main` tip as `v0.1.0` once the release policy docs and fresh production billing proof are complete.

## Plan of Work

Start by consolidating the existing process documentation before introducing any new release mechanics. The first pass should compare `README.md`, `docs/release-workflow.md`, `qa/README.md`, `qa/AGENTS.md`, and `CHANGELOG.md` against the live GitHub branch flow and recent deploy behavior. Update only the files that are actually authoritative. The key goal of this pass is not to re-explain the branch model from scratch; it is to make release/versioning/hotfix rules explicit in the same places that already own the release path.

Once the process docs agree, add the explicit release and versioning policy. The default home for that detail is `docs/release-workflow.md`, with lighter pointers in `README.md` and only minimal reinforcement in `AGENTS.md` if it is still needed. The content must answer these questions directly: when to cut a release, how to choose `v0.x.y`, how `CHANGELOG.md` maps to GitHub Releases, and what to do differently for a hotfix.

After the policy exists in docs, collect the release evidence for the current `main`. First verify production deploy health from GitHub Actions and the live site. Then run one fresh production billing proof using the existing repo-sanctioned no-cost Checkout method. Save that evidence into a new `qa/runs/` report so the release record is durable and reviewable later.

With production proof in hand, create the first release artifact set from `main`: a Git tag `v0.1.0`, a GitHub Release whose notes are derived from `CHANGELOG.md`, and any final GitHub About metadata cleanup that still remains. The release notes should summarize the shipped checkout claim flow, CLI productization, integrated staging gates, and other recent user-facing changes without trying to restate every historical change in the repo.

Finish by adding a short “what to do next time” section in the docs or SOP so future maintainers know the exact release and hotfix order without rereading the whole release history.

## Milestones

Milestone 1 formalizes the authoritative release/versioning/hotfix policy in the docs. At the end of this milestone, `docs/release-workflow.md` clearly defines when to cut a release, how pre-1.0 semantic versioning works, how `CHANGELOG.md` maps to GitHub Releases, and how hotfixes move from `main` back into `dev`. `README.md` should contain the lighter operator-facing pointer to that policy. Success looks like a fresh operator being able to decide how and when to cut `v0.1.0` without improvising.

Milestone 2 formalizes semantic versioning, GitHub Releases, and changelog policy. At the end of this milestone, the docs explicitly define `v0.1.0` as the first release, explain pre-1.0 version increments, define when a patch versus minor version should be cut, require changelog-backed releases, and define how hotfixes produce patch versions. Success looks like a maintainer being able to choose a version number and release path from the docs alone.

Milestone 3 collects fresh production evidence for the current release. At the end of this milestone, `main` deploy health is verified and there is a new production QA report showing a fresh no-cost live Checkout proof if the commercial path changed. Success looks like a durable `qa/runs/` report that proves the release is not only deployed but commercially functional.

Milestone 4 creates the first release artifact set and GitHub metadata. At the end of this milestone, the repository About section is correct, a `v0.1.0` tag exists on `main`, the GitHub Releases page has a first release, and the release notes map cleanly to the matching changelog content. Success looks like `gh release list` returning a real release and `git tag` returning `v0.1.0`.

## Concrete Steps

Work from the repository root unless noted otherwise.

1. Audit the current authoritative release surfaces and contradictions:

   cd /Users/parkerrex/Projects/ship-by-sunday
   sed -n '1,220p' README.md
   sed -n '1,240p' docs/release-workflow.md
   sed -n '1,220p' qa/README.md
   sed -n '1,220p' qa/AGENTS.md
   sed -n '1,120p' CHANGELOG.md
   gh repo view ParkerRex/mma-shipbysunday --json description,homepageUrl,repositoryTopics,url
   gh release list --repo ParkerRex/mma-shipbysunday
   git tag --sort=creatordate

   Expected observation: the branch flow is already mostly aligned, GitHub description/homepage are already correct, repository topics are unset, and there are no tags or releases yet.

2. Update the process docs so they teach one release, versioning, and hotfix model. The minimum likely files are:

   - `README.md`
   - `docs/release-workflow.md`
   - optionally `AGENTS.md` if the release/versioning rule needs a brief reinforcement there after implementation review

   Expected observation: every authoritative file now says releases come from `main`, hotfixes branch from `main` and return to `dev`, changelog-backed releases are required, and `bun run precommit` remains the fast local gate instead of Husky.

3. Add the release/versioning/changelog policy. At minimum it must define:

   - cut releases from `main` only
   - use `v0.1.0` as the first release
   - do not bump any in-repo source version before tagging because `0.1.0` is already present
   - patch versus minor rules for pre-1.0 versions
   - changelog-backed GitHub Releases
   - fresh production billing proof when checkout/auth/webhook/access changed
   - hotfix-from-`main` plus merge-back-to-`dev`

4. Collect current production health and billing evidence:

   cd /Users/parkerrex/Projects/ship-by-sunday
   gh run list --repo ParkerRex/mma-shipbysunday --branch main --limit 5
   gh run list --repo ParkerRex/mma-shipbysunday --workflow convex-production-deploy.yml --limit 5
   curl -I https://www.man-meets-ai.com/
   curl -I https://www.man-meets-ai.com/sign-in

   If the commercial path changed in the release, run the fresh production billing proof using the existing repo method:

   - use the production Clerk and Convex env file
   - use a restricted live `100% off` promotion code
   - complete one fresh Checkout Session
   - verify `/checkout/success -> /start`
   - verify the webhook access grant
   - write the result to `qa/runs/2026-04-01-prod-billing-proof-v0.1.0.md`

   Expected observation: a fresh production QA report exists for the current `main` release at `qa/runs/2026-04-01-prod-billing-proof-v0.1.0.md`, or the docs explicitly say why billing proof was not required for this version.

5. Cut the first release from `main`:

   cd /Users/parkerrex/Projects/ship-by-sunday
   git fetch origin --prune
   git rev-parse origin/main
   git tag -a v0.1.0 origin/main -m "Ship by Sunday v0.1.0"
   git push origin v0.1.0
   gh release create v0.1.0 --repo ParkerRex/mma-shipbysunday --title "v0.1.0" --notes-file <prepared_release_notes_file>

   Expected observation:

   - `git tag` includes `v0.1.0`
   - `gh release list --repo ParkerRex/mma-shipbysunday` shows `v0.1.0`
   - the release notes summarize the current shipped starter/runtime/release process accurately

6. Update the GitHub About metadata if it still needs improvement:

   gh repo edit ParkerRex/mma-shipbysunday \
     --description "<final short description>" \
     --homepage "https://www.man-meets-ai.com"

   If repository topics are later agreed, set them too with `gh repo edit --add-topic ...`, but do not block `v0.1.0` on that curation.

## Validation and Acceptance

This plan is complete only when a fresh operator can answer all of the following correctly from the repo and GitHub surfaces alone:

- Where do normal feature releases come from?
- When do we cut a GitHub Release?
- How do we choose the next version number before `1.0.0`?
- When is a fresh production billing proof required?
- How does a hotfix move from `main` back into `dev`?
- Where do the release notes come from?

Run these validation commands from the repository root after the docs and release work are done:

   cd /Users/parkerrex/Projects/ship-by-sunday
   git diff --check
   gh repo view ParkerRex/mma-shipbysunday --json description,homepageUrl,repositoryTopics,url
   gh release list --repo ParkerRex/mma-shipbysunday
   git tag --sort=creatordate | tail -n 10
   gh run list --repo ParkerRex/mma-shipbysunday --branch main --limit 5
   gh run list --repo ParkerRex/mma-shipbysunday --workflow convex-production-deploy.yml --limit 5
   curl -I https://www.man-meets-ai.com/
   curl -I https://www.man-meets-ai.com/sign-in

Acceptance requires:

- authoritative repo docs define one release/versioning/hotfix model without contradictory operator guidance
- the docs explicitly define semantic versioning rules for pre-1.0 releases
- the docs explicitly define changelog-backed GitHub Releases
- the docs explicitly define when production billing proof is mandatory
- a `v0.1.0` tag exists on `main`
- a matching GitHub Release exists
- the GitHub About metadata points at the current production site
- production deploy health is green
- if the commercial path changed, there is fresh production billing evidence recorded under `qa/runs/`

## Idempotence and Recovery

The documentation work is idempotent as long as edits are made against the current authoritative files and checked with `git diff --check` before commit. If a first release attempt fails after the tag is created but before the GitHub Release is published, either delete the tag and retry or publish the release against the existing tag once the notes are corrected. Do not create multiple first-release tags for the same version.

The production billing proof must be treated carefully. Use the repo’s established no-cost Checkout method so the verification exercises the real Stripe webhook path without creating a real card charge. Deactivate any temporary promotion code after use. If the fresh production billing proof fails, do not cut the release. Record the failure in a `qa/runs/` report, fix the production issue, and rerun proof before tagging.

If a hotfix release is needed while this release policy work is in progress, follow the hotfix branch rule from `main`, record the patch release in `CHANGELOG.md`, and then merge or cherry-pick the hotfix back into `dev`. Do not leave `dev` behind production.

If GitHub About metadata or release notes are edited incorrectly, they can be safely updated in place through `gh repo edit` and `gh release edit` without rewriting the git history.

## Artifacts and Notes

Useful evidence already available before this plan is implemented:

   Current production billing proof history:
   - `qa/runs/2026-03-25-prod-billing-integration-webhook-fix.md`
   - `qa/runs/2026-03-25-prod-billing-integration-automatic-rerun.md`

   Current release-process docs:
   - `README.md` already teaches `feature -> dev -> main`
   - `docs/release-workflow.md` already defines `main` as the release branch and describes no-cost production billing proof
   - `qa/README.md` already says `billing_integration` or live no-cost proof is required on production when the commercial path changed

   Current GitHub metadata gap:
   - no tags
   - no GitHub Releases
   - repository topics remain optional and unset

Prepared release note baseline for `v0.1.0` should be derived from the `2026-03-31` and adjacent `CHANGELOG.md` sections, not invented from scratch. The fresh production billing artifact should be recorded as `qa/runs/2026-04-01-prod-billing-proof-v0.1.0.md`.

## Interfaces and Dependencies

The main interfaces in this plan are:

- GitHub repository metadata edited through `gh repo edit`
- Git tags managed through `git tag` and `git push origin <tag>`
- GitHub Releases managed through `gh release create` and `gh release edit`
- the release docs in `README.md`, `AGENTS.md`, `docs/release-workflow.md`, and any added release SOP file
- `CHANGELOG.md` as the release-note source of truth
- the production verification reports under `qa/runs/`

This plan depends on:

- the existing `feature -> dev -> main` branch flow already implemented in repo docs and automation
- the current `Dev Staging Proof` workflow on `dev`
- the current `CI` and `Convex Production Deploy` workflows on `main`
- the current production host `https://www.man-meets-ai.com`
- the existing production billing-proof policy that uses a restricted live `100% off` promotion code

If production billing proof is executed, the operator also depends on valid production Clerk and Convex env values, the production Stripe setup, and a safe temporary promotion code. Those values must not be copied into git-tracked files.
