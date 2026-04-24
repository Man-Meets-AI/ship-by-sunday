# Dependency Graph

This graph records the intended order for child ExecPlans in this Program.

## Graph

1. CI/CD harness retirement and working-path codification must start first. It depends on local workflow files and current GitHub Actions remote evidence.
2. Release intake control-plane repair depends on the rejected Dub-style plan being retired or clearly superseded so it does not compete with the working CI/CD path.
3. Runtime footgun removal can start after or beside release/intake repair, but it should not depend on route-contract decisions.
4. Product route contract reconciliation should happen before blueprint and workbench structural refactors, because it decides the real product surfaces.
5. Blueprint and workbench splitting depends on the route contract being clear enough that refactors preserve the right behavior.
6. Observability data-contract hardening depends on runtime transport hardening, because transport fixes change what reaches the ledger.
7. Design and dependency cleanup should follow the higher-risk correctness work, although dead-code scans can be prepared earlier.

## Critical Path

The fastest useful path is:

CI/CD harness retirement and working-path codification -> release and intake control plane -> runtime footguns -> product route contract -> blueprint and workbench split -> observability data contracts -> design and dependency cleanup.

## Parallel Path

Runtime footguns and release intake repair can run in parallel after the CI/CD correction if write sets stay separate. Design dependency scans can run as read-only preparation while higher-priority implementation slices are active, but actual removals should wait for build-backed proof.
