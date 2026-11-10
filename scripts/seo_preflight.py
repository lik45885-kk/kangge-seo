#!/usr/bin/env python3
"""Static SEO preflight for the GitHub Pages site. Python standard library only."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse
import sys
import json
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://lik45885-kk.github.io/kangge-seo/"
errors = []
warnings = []

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.meta = {}
        self.links = []
        self.canonical = []
        self.title = ""
        self.h1 = []
        self.schema = []
        self._capture = None
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "meta":
            key = a.get("name") or a.get("property")
            if key:
                self.meta.setdefault(key.lower(), []).append(a.get("content", ""))
        if tag == "link" and a.get("rel") == "canonical":
            self.canonical.append(a.get("href", ""))
        if tag == "a":
            self.links.append(a.get("href", ""))
        if tag in ("title", "h1"):
            self._capture = tag
    def handle_data(self, data):
        if self._capture == "title": self.title += data.strip()
        if self._capture == "h1": self.h1.append(data.strip())
    def handle_endtag(self, tag):
        if tag == self._capture: self._capture = None

def check(condition, message):
    if not condition: errors.append(message)

sitemap = ROOT / "sitemap.xml"
try:
    urls = [e.text for e in ET.parse(sitemap).iter() if e.tag.endswith("loc")]
except Exception as e:
    sys.exit("FAIL sitemap.xml: " + str(e))
check(len(urls) == len(set(urls)), "Sitemap contains duplicate URLs")
check(all(u.startswith(BASE) for u in urls), "Sitemap has URLs outside project site")
urlset = set(urls)
articles = sorted((ROOT / "resources").glob("*/index.html"))
check(len(articles) == 100, f"Expected 100 articles, found {len(articles)}")
for pagepath in [ROOT / "index.html", ROOT / "resources" / "index.html", *articles]:
    rel = pagepath.relative_to(ROOT).as_posix()
    expected = BASE if rel == "index.html" else BASE + rel.removesuffix("index.html")
    parser = Page()
    raw = pagepath.read_text(encoding="utf-8")
    parser.feed(raw)
    check(expected in urlset, f"{rel}: not in sitemap")
    check(parser.canonical == [expected], f"{rel}: canonical mismatch: {parser.canonical}")
    check(len(parser.title) >= 12, f"{rel}: missing/short title")
    check(bool("".join(parser.h1).strip()), f"{rel}: no h1")
    desc = parser.meta.get("description", [""])[0]
    check(len(desc.strip()) >= 20, f"{rel}: missing or too-short meta description")
    check(desc not in {"team", "account", "conversion", "intent"}, f"{rel}: leaked category code")
    robots = " ".join(parser.meta.get("robots", [])).lower()
    check("noindex" not in robots, f"{rel}: unintended noindex")
    if pagepath in articles:
        cleaned = re.sub(r"<script[^>]*>.*?</script>|<style[^>]*>.*?</style>", "", raw, flags=re.S)
        cleaned = re.sub(r"<[^>]+>", " ", cleaned)
        cleaned = re.sub(r"\\s+", " ", cleaned)
        if len(cleaned) < 600:
            warnings.append(f"{rel}: low visible-text length; editorial review needed ({len(cleaned)})")
    for href in parser.links:
        if href and href.startswith("http") and href.startswith(BASE):
            target = href.removeprefix(BASE)
            if target.endswith("/"): target += "index.html"
            if target and not (ROOT / target).is_file():
                warnings.append(f"{rel}: possible broken same-site link {href}")
index = (ROOT / "resources/index.html").read_text(encoding="utf-8")
cards = re.findall(r'class="resource-article-card"[^>]*href="\\./([^/]+)/', index)
check(len(cards) == 100 and len(set(cards)) == 100, f"Resource center card mismatch: {len(cards)}")
check({p.parent.name for p in articles} == set(cards), "Resource cards do not exactly match article paths")
robotstxt = (ROOT / "robots.txt").read_text(encoding="utf-8")
check("Disallow: /" not in robotstxt, "robots.txt blocks all pages")
print(f"SEO preflight: {len(articles)} articles / {len(cards)} cards / {len(urls)} sitemap URLs")
for item in warnings[:30]: print("WARN:", item)
for item in errors: print("ERROR:", item)
sys.exit(1 if errors else 0)
