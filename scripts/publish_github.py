#!/usr/bin/env python3
"""Publish repository to GitHub, push main branch, and enable GitHub Pages."""

import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

REPO_NAME = "en-garde-3d"
REPO_DESC = "全剑种 3D 击剑竞技与三语战术教学模拟（花剑 Fleuret · 重剑 Épée · 佩剑 Sabre）"


def find_token() -> str:
    env_token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    if env_token and env_token.strip():
        return env_token.strip()

    candidate_files = [
        Path.home() / ".env",
        Path(__file__).resolve().parent.parent / ".env",
    ]
    for env_file in candidate_files:
        if env_file.exists():
            for line in env_file.read_text(encoding="utf-8-sig", errors="replace").splitlines():
                line = line.strip().lstrip("\ufeff")
                if line.startswith("GITHUB_TOKEN=") or line.startswith("GH_TOKEN="):
                    val = line.split("=", 1)[1].strip().strip('"').strip("'")
                    if val:
                        return val
    return ""


def github_api_request(url: str, token: str, method: str = "GET", data: dict = None):
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "User-Agent": "EnGarde3D-Publisher",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode("utf-8")
            return resp.status, json.loads(content) if content else {}
    except urllib.error.HTTPError as err:
        error_body = err.read().decode("utf-8", errors="replace")
        try:
            parsed = json.loads(error_body)
        except Exception:
            parsed = {"raw": error_body}
        return err.code, parsed


def locate_git_exe() -> str:
    # 1. Check if git is directly in PATH
    try:
        res = subprocess.run(["git", "--version"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if res.returncode == 0:
            return "git"
    except Exception:
        pass

    # 2. Check PortableGit
    portable_git = Path.home() / "AppData" / "Local" / "Programs" / "WorkBuddy" / "resources" / "vendor" / "PortableGit" / "cmd" / "git.exe"
    if portable_git.exists():
        return str(portable_git)

    return "git"


def main():
    token = find_token()
    if not token:
        print("[ERROR] GitHub Token 未找到。请先配置 GITHUB_TOKEN 环境变量或 ~/.env 文件。")
        sys.exit(1)

    # 1. Authenticate user
    print("[1/5] 验证 GitHub 身份凭证...")
    status, user_info = github_api_request("https://api.github.com/user", token)
    if status != 200:
        print(f"[ERROR] 身份验证失败 (HTTP {status}): {user_info.get('message', 'Unknown error')}")
        sys.exit(1)

    username = user_info.get("login")
    print(f"      已成功登录: {username}")

    # 2. Check or create repository
    print(f"[2/5] 检查/创建远程公开仓库 '{REPO_NAME}'...")
    repo_url = f"https://api.github.com/repos/{username}/{REPO_NAME}"
    status, repo_info = github_api_request(repo_url, token)

    pages_home = f"https://{username}.github.io/{REPO_NAME}/"
    if status == 404:
        print(f"      仓库不存在，正在创建公开仓库 '{REPO_NAME}'...")
        create_payload = {
            "name": REPO_NAME,
            "description": REPO_DESC,
            "homepage": pages_home,
            "private": False,
            "has_issues": True,
            "has_projects": True,
            "has_wiki": True,
        }
        create_status, create_resp = github_api_request("https://api.github.com/user/repos", token, method="POST", data=create_payload)
        if create_status not in (200, 201):
            print(f"[ERROR] 创建仓库失败 (HTTP {create_status}): {create_resp.get('message', 'Unknown error')}")
            sys.exit(1)
        print(f"      公开仓库创建成功: {create_resp.get('html_url')}")
    elif status == 200:
        print(f"      远程仓库已存在: {repo_info.get('html_url')}")
    else:
        print(f"[ERROR] 查询仓库异常 (HTTP {status}): {repo_info.get('message')}")
        sys.exit(1)

    # 3. Push code to GitHub
    print("[3/5] 推送 main 分支代码至远程仓库...")
    git_bin = locate_git_exe()
    repo_root = Path(__file__).resolve().parent.parent

    # Auth remote URL for pushing
    auth_remote = f"https://{username}:{token}@github.com/{username}/{REPO_NAME}.git"
    clean_remote = f"https://github.com/{username}/{REPO_NAME}.git"

    # Temporarily set auth remote
    subprocess.run([git_bin, "remote", "set-url", "origin", auth_remote], cwd=repo_root, check=True)
    push_success = False
    try:
        env = os.environ.copy()
        env["GIT_TERMINAL_PROMPT"] = "0"
        push_res = subprocess.run(
            [git_bin, "-c", "credential.helper=", "push", "-u", "origin", "main"],
            cwd=repo_root,
            capture_output=True,
            text=True,
            env=env,
        )
        if push_res.returncode == 0:
            print("      代码推送成功！")
            push_success = True
        else:
            safe_err = (push_res.stderr or "").replace(token, "***")
            print(f"[ERROR] git push 失败:\n{safe_err}")
    finally:
        # Always restore clean remote without embedded token
        subprocess.run([git_bin, "remote", "set-url", "origin", clean_remote], cwd=repo_root, check=True)

    if not push_success:
        sys.exit(1)

    # 4. Enable GitHub Pages
    print("[4/5] 开启 main 分支根目录的 GitHub Pages...")
    pages_api = f"https://api.github.com/repos/{username}/{REPO_NAME}/pages"
    pages_payload = {
        "source": {
            "branch": "main",
            "path": "/",
        }
    }

    # Pages may return 201 (created), 409 (already enabled), or 400 (if still syncing commits, wait a moment)
    for attempt in range(5):
        p_status, p_resp = github_api_request(pages_api, token, method="POST", data=pages_payload)
        if p_status in (200, 201):
            print(f"      GitHub Pages 已成功开启！")
            break
        elif p_status == 409:
            print("      GitHub Pages 此前已开启。")
            break
        else:
            # Maybe branch index is warming up on GitHub side
            if attempt < 4:
                time.sleep(3)
            else:
                print(f"      Pages 配置提示 (HTTP {p_status}): {p_resp.get('message')}")

    # 5. Output playable link
    print("[5/5] 部署流程完成！")
    print("-" * 60)
    print(f"  项目开源地址: {clean_remote}")
    print(f"  在线试玩网址: {pages_home}")
    print("-" * 60)


if __name__ == "__main__":
    main()
