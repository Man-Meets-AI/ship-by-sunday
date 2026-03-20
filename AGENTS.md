## Tools
- We use bun for JavaScript.
- We use shadcn ui for components and keep it vanilla besides the colors and typography.
- We use uv for Python.
- We use ruff and black for linting and formatting python.
- We use Oxlint and Oxformat for linting and formatting javascript.

## Core Principles
- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **Component Boundaries**: Never create a component longer than 150 lines. If a component exceeds that limit, split it into smaller components automatically.
- **UI / Logic Separation**: Always separate UI from logic. Keep presentation components focused on rendering and move stateful or behavioral logic into dedicated hooks, helpers, or controller components.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Feature-Based Folder Structure**: Organize code by feature, not by file type. Each feature gets its own folder containing its components, hooks, utils, and types. When proposing or refactoring structure, show a before/after directory tree.
  - **Small features** — flat folder, everything co-located:
    ```
    user/
      UserProfile.tsx
      UserAvatar.tsx
      useUser.ts
      formatUser.ts
      types.ts
    ```
  - **Large features** — add sub-folders (`components/`, `hooks/`, `content/`, `lib/`, `model/`, `utils/`, `shared/`) inside the feature folder when it grows beyond ~8-10 files:
    ```
    lesson/
      components/
        lesson-page.tsx
        lesson-page-footer.tsx
        lesson-video-player.tsx
        lesson-page-skeleton.tsx
      hooks/
        use-lesson-state.ts
        use-lesson-completion.ts
        use-lesson-page-data.ts
      content/
        build.ts
      model/
      lib/
      utils/
    ```
  - Never fall back to top-level `components/`, `hooks/`, `utils/` buckets that mix unrelated features together.

## TypeScript Style
- **Skimmable Code**: Write straightforward TypeScript that is easy to understand in one pass. Prefer early returns, shallow control flow, and fewer lines over clever abstractions.
- **Minimize State**: Reduce the number of possible states in the code. Narrow types early, keep argument counts low, and remove optional fields or parameters unless absence is a real supported case.
- **Prefer Discriminated Unions**: Model multi-state data with discriminated unions instead of booleans, loosely related optionals, or ad hoc flags.
- **Exhaustive by Default**: Handle every variant exhaustively. Fail fast on unknown cases with assertions rather than silently accepting impossible states.
- **Assert at Boundaries**: When loading external data or requiring a value to exist, assert immediately and keep the rest of the code strongly typed. Do not hide bad data with fallback defaults or catch-and-continue behavior.
- **Trust the Types**: Inside typed code, do not add defensive checks for states the types already rule out.
- **Opinionated APIs**: Do not pass overrides, config bags, or optional arguments unless they are strictly necessary. Prefer specific required inputs and narrow function signatures.
- **Minimal Diff**: Remove any change that is not required for the task.

## PR Review Workflow
- When asked to review a branch or PR against `main`, always use a multi-agent review workflow.
- Use this prompt as the default review instruction: `Review this branch against main. Have pr_explorer map the affected code paths, reviewer find real risks, and docs_researcher verify the framework APIs that the patch relies on.`
- `pr_explorer` should map the changed files and the affected execution paths before findings are written.
- `reviewer` should focus on real bugs, regressions, missing tests, security issues, and incorrect assumptions, not style nitpicks.
- `docs_researcher` should verify any framework, library, or platform API behavior the patch depends on before conclusions are finalized.
