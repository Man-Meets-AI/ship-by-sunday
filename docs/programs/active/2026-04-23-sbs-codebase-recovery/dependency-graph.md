# Dependency Graph

This graph records the intended order for child ExecPlans in this Program.

## Graph

1. CI/CD harness retirement and working-path codification must start first. It depends on local workflow files and current GitHub Actions remote evidence.
2. Release intake control-plane repair depends on the rejected Dub-style plan being retired or clearly superseded so it does not compete with the working CI/CD path. It is now deferred to a dedicated Program because the control-plane repair is larger than this recovery sequence should absorb next.
3. Runtime footgun removal can start after CI/CD correction and does not need to wait for release/intake repair while that lane is deferred. It has now graduated to `docs/programs/completed/2026-04-24-sbs-runtime-boundary-hardening/` because it split into several child lanes.
4. Product route contract reconciliation is complete. It now defines Blueprint and Review as canonical, old staged URLs as protected redirects, and Execute/Mission as compatibility entrypoints.
5. Blueprint and workbench splitting depends on the completed route contract so refactors preserve the right behavior. It is complete.
6. Observability data-contract hardening depends on runtime transport hardening, because transport fixes change what reaches the ledger. It is complete.
7. Design and dependency cleanup followed the higher-risk correctness work. It is complete.

## Critical Path

The fastest useful path is:

CI/CD harness retirement and working-path codification -> completed product route contract -> completed blueprint and workbench split -> completed observability data contracts -> completed design and dependency cleanup.

Release and intake control-plane repair is intentionally outside this immediate path until the dedicated release/intake Program owns it.

Runtime footgun removal is intentionally outside this immediate path because `docs/programs/completed/2026-04-24-sbs-runtime-boundary-hardening/` owns it.

## Parallel Path

There is no remaining parallel path inside this Program. Release and intake control-plane repair is deferred to a dedicated Program.
