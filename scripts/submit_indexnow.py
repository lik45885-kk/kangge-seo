#!/usr/bin/env python3
"""Notify IndexNow of canonical GitHub Pages URLs after a successful Pages build.

The IndexNow key is hosted inside /kangge-seo/; this scopes the valid URLs to
that project path. IndexNow acknowledgment is NOT a crawling/indexing promise.
"""
from __future__ import annotations

import json
import os
from pathlib import Path
import re
import subprocess
import sys
import time
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from urllib.parse import urlparse
from xml.etree import ElementTree

BASE = "https://lik45885-kk.github.io/kangge-seo/"
KEY = "41af5f9e5fff42743a5862107a404fcba98b33f2"
KEY_URL = BASE + KEY + ".txt"
SITEMAP = Path("sitemap.xml")
HOST = urlparse(BASE).netloc


def all_urls():
    root = ElementTree.parse(SITEMAP).getroot()
    return [elem.text.strip() for elem in root.iter()
            if elem.tag.endswith("loc") and elem.text]


def changes():
    try:
        p = subprocess.run(["git", "diff-tree", "--no-commit-id", "--name-only", "-r", "HEAD"],
                           capture_output=True, text=True, check=True)
        return {line.strip() for line in p.stdout.splitlines() if line.strip()}
    except (OSError, subprocess.CalledProcessError):
        return set()


def canonical_for_file(file_path):
    if not file_path.endswith(".html") or not Path(file_path).is_file():
        return None
    html = Path(file_path).read_text(encoding="utf-8")
    match = re.search(r'<link rel="canonical" href="([^"]+)"', html)
    return match.group(1) if match else None


def wait_for_public_key():
    for attempt in range(6):
        try:
            with urlopen(Request(KEY_URL, headers={"User-Agent": "Kangge-IndexNow/1.0"}),
                         timeout=20) as response:
                contents = response.read(512).decode("utf-8").strip()
                if response.status == 200 and contents == KEY:
                    return
        except (HTTPError, URLError, TimeoutError) as error:
            print("Key verification attempt", attempt + 1, ":", str(error), flush=True)
        time.sleep(12)
    raise RuntimeError("Public IndexNow key file not confirmed. No submission sent.")


def main():
    urls = set(all_urls())
    changeset = changes()
    manual = os.environ.get("GITHUB_EVENT_NAME") == "workflow_dispatch"
    if manual or "sitemap.xml" in changeset or ".github/workflows/indexnow.yml" in changeset:
        targets = urls
    else:
        targets = {url for file_path in changeset
                   if (url := canonical_for_file(file_path)) and url in urls}
    targets = sorted(targets)
    if not targets:
        print("No canonical HTML content URL changed; nothing submitted.")
        return
    if not all(urlparse(url).netloc == HOST and url.startswith(BASE) for url in targets):
        raise RuntimeError("Refusing to submit outside the project path")

    wait_for_public_key()

    data = json.dumps({
        "host": HOST, "key": KEY, "keyLocation": KEY_URL, "urlList": targets,
    }, ensure_ascii=False).encode("utf-8")
    request = Request(
        "https://api.indexnow.org/indexnow", data=data,
        headers={"Content-Type": "application/json; charset=utf-8",
                 "User-Agent": "Kangge-IndexNow/1.0"}, method="POST")
    try:
        with urlopen(request, timeout=30) as response:
            code = response.status
            body = response.read(700).decode("utf-8", "replace")
    except HTTPError as error:
        code = error.code
        body = error.read(700).decode("utf-8", "replace")

    print("IndexNow response:", code, "URLs:", len(targets))
    for url in targets:
        print("  notified:", url)
    if body:
        print("Response text:", body[:500])
    if code == 200:
        print("URL notification accepted; crawling and indexing are not guaranteed.")
    elif code == 202:
        print("URLs received; key ownership verification is still pending.")
    else:
        raise RuntimeError("IndexNow API rejected or failed the submission")


if __name__ == "__main__":
    main()
