---
title: "Public Product Split Cross Repo Review"
summary: "Risk review for the Man Meets AI, Starter, Workers, checkout, docs, blog, and generated-output split."
docType: "cross_repo_review"
status: "active"
read_when:
  - "Reviewing implementation risk before coding the public product split."
  - "Checking likely regressions from making `/workers` public."
---

# Public Product Split Cross Repo Review

## Findings

Risk: Public `/workers` currently conflicts with a protected app route.

Impact: Anonymous visitors will be redirected or blocked unless proxy protection and route ownership are changed. Protected Worker subroutes still need auth and capability checks.

Risk: Tutorials are currently a top-level paid app surface.

Impact: Removing Tutorials as a product card can strand customers if the videos are not reachable through Starter or an internal route after the IA change.

Risk: Split checkout can accidentally bypass app-owned access grants.

Impact: Static Stripe links or direct Checkout Sessions without app-owned metadata can produce paid customers who do not receive the correct capabilities. The first implementation must use real app-backed Starter and Workers offers.

Risk: Existing grants default broadly for legacy compatibility.

Impact: New split pricing can appear to work in tests while old broad default behavior masks missing capability mapping.

Risk: Generated repos currently inherit too much of the core app.

Impact: Worker local-runner code, protected app routes, or internal platform code can leak into Starter output, violating the product boundary and confusing customers.

Risk: Docs demotion can remove useful setup paths.

Impact: Generated-codebase customers still need support material for local setup, Clerk, Convex, Stripe, and homepage configuration. Demotion should remove promotion, not necessarily delete docs.

Risk: The older active IA Program can pull future work back toward the wrong hierarchy.

Impact: Agents may continue implementing Generate Codebase, Tutorials, and Worker as peer surfaces unless this Program is treated as the current product direction.

## Required Review Focus

Route review should verify public and protected boundaries by exact path, not by route labels alone.

Checkout review should verify Stripe metadata, purchase intent records, webhook fulfillment, and final access capabilities for both Starter and Workers.

Generated-output review should inspect actual produced repo files and confirm Worker local-runner code is absent.

Docs review should inspect navigation, sitemap, robots, headers, footers, and generated-codebase entry points.

Browser review should cover desktop and mobile for `/`, `/starter`, `/workers`, and paid `/home` after the first slice.
