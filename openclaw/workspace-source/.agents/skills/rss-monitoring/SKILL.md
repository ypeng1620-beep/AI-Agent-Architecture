---
name: rss-monitoring
description: --- title: RSS Monitoring description: Monitor RSS/Atom feeds for new articles using pure Python std...
---
---
title: RSS Monitoring
description: Monitor RSS/Atom feeds for new articles using pure Python stdlib — no external dependencies, no Go required.
triggers: [rss, feed, blog, monitor, 订阅, 监控]
---

# RSS Monitoring

Monitor RSS/Atom feeds for new articles using pure Python stdlib. No `pip`, no `Go`, no external dependencies.

## Quick Start

```bash
python3 ~/.hermes/scripts/rss_watch.py add "博客名" "https://example.com/feed.xml"
python3 ~/.hermes/scripts/rss_watch.py scan   # check for updates
python3 ~/.hermes/scripts/rss_watch.py list   # show tracked blogs
```

## Script Location

`~/.hermes/scripts/rss_watch.py` — pure Python stdlib, no dependencies.

## Usage

| Command | Description |
|---------|-------------|
| `add "Name" "URL"` | Add a blog/RSS feed to track |
| `scan` | Check all feeds for new articles |
| `list` | Show all tracked blogs |

## Known RSS Feeds

| Source | URL |
|--------|-----|
| OpenAI Blog | https://openai.com/news.rss |
| Anthropic News | https://www.anthropic.com/news/rss.xml |

Note: Some feeds may return HTML instead of XML due to network restrictions or anti-bot measures.

## Pitfalls

- **Network unreachable**: WSL may have DNS/connection issues to some domains
- **HTML instead of XML**: Some "RSS" URLs are actually HTML pages — verify with `curl -s "URL" | head`
- **No pip**: If pip is missing, use `python3 -m pip` or install via system package manager
- **Go timeout**: blogwatcher CLI requires Go to compile — if Go install times out, use this stdlib alternative

## Cron Integration

Add to daily skill search cron job:

```bash
python3 ~/.hermes/scripts/rss_watch.py scan >> ~/.hermes/logs/rss-scan.log 2>&1
```
