#!/usr/bin/env python3
"""Pre-push security scanner: checks repository files for hardcoded API keys, tokens, credentials, or private paths."""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BINARY_EXTS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".ico", ".woff", ".woff2", ".zip"}

PATTERNS = [
    ("OpenAI / DeepSeek / sk- API Key", re.compile(r"\bsk-[A-Za-z0-9_-]{16,}\b")),
    ("Anthropic API Key", re.compile(r"\bsk-ant-[A-Za-z0-9_-]{12,}\b")),
    ("Google / Gemini AIza Key", re.compile(r"\bAIza[0-9A-Za-z_-]{25,}\b")),
    ("GitHub Personal Access Token", re.compile(r"\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}\b|\bgithub_pat_[A-Za-z0-9_]{20,}\b")),
    ("AWS Access Key ID", re.compile(r"\bAKIA[0-9A-Z]{16}\b")),
    ("Bearer / Basic Auth Header", re.compile(r"Authorization\s*:\s*['\"]?(?:Bearer|Basic)\s+[A-Za-z0-9._-]+", re.I)),
    ("Hardcoded Secret Assignment", re.compile(r"(?:api[_-]?key|secret[_-]?key|access[_-]?token|password|passwd|private[_-]?key)\s*[:=]\s*['\"][^'\"]{6,}['\"]", re.I)),
    ("Private Local Path", re.compile(r"(?:/Users/[A-Za-z0-9._-]+|/home/[A-Za-z0-9._-]+|C:\\\\Users\\\\[A-Za-z0-9._-]+)")),
]


def main() -> int:
    issues = []
    scanned = 0
    for path in sorted(ROOT.rglob("*")):
        if path.is_dir() or ".git" in path.parts or path.name == "security_audit.py":
            continue
        if path.suffix.lower() in BINARY_EXTS:
            continue
        scanned += 1
        content = path.read_text(encoding="utf-8", errors="replace")
        for label, regex in PATTERNS:
            for m in regex.finditer(content):
                line = content[: m.start()].count("\n") + 1
                issues.append((path.relative_to(ROOT).as_posix(), line, label, m.group(0)[:60]))

    print(f"[Security Audit] Scanned {scanned} text/source files in {ROOT.name}/")
    if issues:
        print(f"[FAIL] Found {len(issues)} potential secret/privacy issue(s):")
        for rel, ln, label, snippet in issues:
            print(f"  - {rel}:{ln} [{label}] -> {snippet}")
        return 1

    print("[PASS] Zero API keys, tokens, passwords, or private paths detected.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
