---
title: "Worker Generate Tutorials Normalized Direction"
summary: "Normalized implementation direction for the Worker, Tutorials, and Generate Codebase IA migration."
docType: "normalized_pass"
status: "active"
read_when:
  - "Deciding what the new product surfaces are called."
  - "Checking how to classify old workspace names during the hard switch."
---

# Worker Generate Tutorials Normalized Direction

The new product IA has three customer-facing surfaces.

`Generate Codebase` is the tool that turns product inputs into the generated Codebase artifact. Its canonical route family is `/generate-codebase`. The current `/codebase` route is an old product route that should be removed or rewritten during the hard switch.

`Tutorials` is the learning and watch surface. Its canonical route family is `/tutorials`. It owns video browsing and lesson viewing. Current `/lesson/[lessonKey]` routes are old product routes that should be removed or rewritten during the hard switch.

`Worker` is the existing-repo operation surface. Its canonical route family is `/workers`. It owns setup, doctor pass, findings, loops, runs, privacy, runner pairing, and approved local-worker operations. The product label is `Worker`, not `Workspace` and not `Worker Space`.

## Boundary Rules

Product-facing copy, navigation, routes, docs, tests, and generated customer instructions should converge on `Worker`, `Tutorials`, and `Generate Codebase`.

Old route and runtime names should not remain supported aliases. A child ExecPlan may use transitional scaffolding only inside the same milestone that removes or rewires the old name.

Do not rename package-manager workspace language, monorepo workspace language, or external tool terminology unless it is actually part of the product surface. Do rename Ship by Sunday-owned Worker concepts, including route names, labels, app navigation, local runner command language, docs, tests, and owned API/event identifiers.

## Access Direction

The old `fulfillmentTrack` scalar should no longer be the authority that decides whether a customer can open a surface. The new model needs paid access plus capabilities, such as `canUseGenerateCodebase`, `canUseTutorials`, and `canUseWorker`, plus a default surface for resume behavior.

The old literals `generated_codebase` and `existing_codebase_doctor` can remain as checkout history and migration inputs during the first slice. They should not remain the only authorization boundary after access widening.

## Navigation Direction

Command-K and the shared header should expose top-level commands:

- Open Generate Codebase
- Open Tutorials
- Open Worker

Surface-specific navigation stays scoped. Generate Codebase keeps generation and review steps. Tutorials keeps lesson/video navigation. Worker keeps setup, doctor pass, findings, loops, runs, and privacy.
