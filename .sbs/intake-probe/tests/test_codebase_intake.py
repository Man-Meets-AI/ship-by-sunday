from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path


INTAKE_ROOT = Path(__file__).resolve().parents[1]
SCANNER = INTAKE_ROOT / "codebase-intake.py"


def write_text(path: Path, contents: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(contents, encoding="utf-8")


def run_intake(repo_root: Path, markdown_path: Path, json_path: Path) -> dict[str, object]:
    subprocess.run(
        [
            sys.executable,
            str(SCANNER),
            "--quiet",
            "--jobs",
            "1",
            "--markdown-output",
            str(markdown_path),
            "--json-output",
            str(json_path),
        ],
        cwd=repo_root,
        check=True,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    return json.loads(json_path.read_text(encoding="utf-8"))


def collect_ids(value: object) -> list[str]:
    ids: list[str] = []
    if isinstance(value, dict):
        candidate = value.get("id")
        if isinstance(candidate, str):
            ids.append(candidate)
        for child_value in value.values():
            ids.extend(collect_ids(child_value))
    elif isinstance(value, list):
        for item in value:
            ids.extend(collect_ids(item))
    return ids


def create_fixture_repo(repo_root: Path) -> None:
    write_text(
        repo_root / "package.json",
        json.dumps(
            {
                "scripts": {
                    "build": "next build",
                    "lint": "eslint .",
                    "typecheck": "tsc --noEmit",
                },
                "dependencies": {"next": "latest", "react": "latest"},
                "devDependencies": {"typescript": "latest"},
            },
            indent=2,
        ),
    )
    write_text(repo_root / "tsconfig.json", '{"compilerOptions":{"strict":true}}\n')
    write_text(repo_root / "AGENTS.md", "# Agent instructions\n")
    write_text(repo_root / "src/index.ts", "export const answer = 42;\n")
    write_text(repo_root / "src/index.test.ts", "import './index';\n")

    write_text(repo_root / ".env", "SECRET_KEY=do-not-read\n")
    write_text(repo_root / "package-lock.json", '{"lockfileVersion": 3}\n')
    write_text(repo_root / "node_modules/dep/index.js", "module.exports = 1;\n")
    write_text(repo_root / "dist/generated.js", "console.log('generated');\n")
    write_text(repo_root / ".codex/config.toml", "model = 'test'\n")
    write_text(repo_root / ".cursor/rules.md", "cursor private context\n")
    write_text(repo_root / ".claude/settings.json", "{}\n")
    write_text(repo_root / "codebase-intake.py", "# scanner copy should be excluded\n")
    write_text(repo_root / "codebase-intake.README.md", "# scanner readme should be excluded\n")
    write_text(repo_root / "codebase-intake.EXAMPLE.md", "# scanner example should be excluded\n")


def test_json_output_is_sync_safe_and_uses_stable_evidence_ids(tmp_path: Path) -> None:
    repo_root = tmp_path / "repo"
    repo_root.mkdir()
    create_fixture_repo(repo_root)

    first_payload = run_intake(
        repo_root,
        tmp_path / "first" / "codebase-intake.md",
        tmp_path / "first" / "codebase-intake.json",
    )
    second_payload = run_intake(
        repo_root,
        tmp_path / "second" / "codebase-intake.md",
        tmp_path / "second" / "codebase-intake.json",
    )

    assert first_payload["schemaVersion"] == "codebase-intake.v1"
    assert first_payload["repo"]["rootName"] == "repo"
    assert first_payload["commands"]["packageScripts"]["package.json"] == [
        "build",
        "lint",
        "typecheck",
    ]
    assert collect_ids(first_payload) == collect_ids(second_payload)

    encoded_payload = json.dumps(first_payload, sort_keys=True)
    excluded_fragments = [
        ".env",
        "SECRET_KEY",
        "package-lock.json",
        "node_modules",
        "dist/generated.js",
        ".codex",
        ".cursor",
        ".claude",
        "codebase-intake.py",
        "codebase-intake.README.md",
        "codebase-intake.EXAMPLE.md",
        str(repo_root),
    ]
    for fragment in excluded_fragments:
        assert fragment not in encoded_payload


def test_markdown_output_path_preserves_default_report_shape(tmp_path: Path) -> None:
    repo_root = tmp_path / "repo"
    repo_root.mkdir()
    create_fixture_repo(repo_root)
    markdown_path = tmp_path / "custom" / "intake.md"
    json_path = tmp_path / "custom" / "intake.json"

    run_intake(repo_root, markdown_path, json_path)

    markdown = markdown_path.read_text(encoding="utf-8")
    assert markdown.startswith("# Codebase Intake Report")
    assert "## Detected Stack" in markdown
    assert json_path.exists()
