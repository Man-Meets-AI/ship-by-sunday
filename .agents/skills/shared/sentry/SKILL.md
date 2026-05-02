---
name: sentry
description: Use when the user asks to inspect Sentry issues or events, summarize recent production errors, or pull basic Sentry health data via the Sentry CLI; perform read-only queries using the `sentry` command.
---

# Sentry (Read-only Observability)

## Quick start

- If not already authenticated, ask the user to run `sentry auth login` or set `SENTRY_AUTH_TOKEN` as an env var.
- The CLI auto-detects org/project from DSNs in `.env` files, source code, config defaults, and directory names. Only specify `org/project` if auto-detection fails or picks the wrong target.
- Defaults: time range `24h`, environment `production`, limit `20`.
- Always use `--json` when processing output programmatically. Use `--json --fields` to select specific fields and reduce output size.
- Use `sentry schema` to discover API endpoints quickly.
- If the CLI is not installed, give the user these steps:
  1. Install the Sentry CLI: `curl https://cli.sentry.dev/install -fsS | bash`
  2. Authenticate: `sentry auth login`
  3. Confirm authentication: `sentry auth status`
- Never ask the user to paste the full token in chat. Ask them to set it locally and confirm when ready.

## Core tasks

Use the `sentry` CLI for all queries. It handles authentication, org/project detection, pagination, and retries automatically. Use `--json` for machine-readable output.

### 1. List issues ordered by most recent

```bash
sentry issue list \
  --query "is:unresolved environment:production" \
  --period 24h \
  --limit 20 \
  --json --fields shortId,title,priority,level,status
```

If auto-detection does not resolve org/project, pass them explicitly:

```bash
sentry issue list your-org/your-project \
  --query "is:unresolved environment:production" \
  --period 24h \
  --limit 20 \
  --json
```

### 2. Resolve an issue short ID to detail

```bash
sentry issue view ABC-123 --json
```

Use the short ID format, not the numeric ID.

### 3. Issue events

```bash
sentry issue events ABC-123 --limit 20 --json
```

### 4. Event detail

```bash
sentry event view your-org/your-project/event_id --json
```

### 5. AI-powered root cause analysis

```bash
sentry issue explain ABC-123
```

### 6. AI-powered fix plan

```bash
sentry issue plan ABC-123
```

## Fallback API access

For endpoints not covered by dedicated CLI commands, use `sentry api`:

```bash
sentry api /api/0/organizations/your-org/ --method GET
```

Use `sentry schema` to discover available API endpoints:

```bash
sentry schema issues
```

## Inputs and defaults

- `org_slug`, `project_slug`: auto-detected by the CLI from DSNs, env vars, and directory names.
- `time_range`: default `24h`.
- `environment`: default `production`.
- `limit`: default `20`.
- `search_query`: optional Sentry search syntax, for example `is:unresolved` or `assigned:me`.
- `issue_short_id`: use directly with `sentry issue view`.

## Output formatting rules

- Issue list: show title, short ID, status, first seen, last seen, count, environments, and top tags; order by most recent.
- Event detail: include culprit, timestamp, environment, release, and URL.
- If no results, state explicitly.
- Redact PII in output such as emails and IPs.
- Do not print raw stack traces.
- Never echo auth tokens.
