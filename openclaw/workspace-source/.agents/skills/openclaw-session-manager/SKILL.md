---
name: openclaw-session-manager
version: 1.0.0
description: "Manage OpenClaw AI agent sessions - list, find, and compact sessions to reduce token usage. Use when the user asks to: (1) compress/compact a session, (2) list or find sessions, (3) check session token usage, (4) manage Discord/Telegram channel sessions, (5) work with openclaw gateway commands. Triggers: 压缩 session, compact session, openclaw session, gateway call, 清理上下文, session token."
author: litangjuan
license: MIT-0
tags:
  - openclaw
  - session-management
  - discord
  - telegram
  - ai-agent
metadata:
  openclaw:
    homepage: https://github.com/litangjuan/openclaw-session-manager
    minVersion: 1.0.0
---

# OpenClaw Session Manager

## Overview

OpenClaw is an open-source AI agent system that integrates multi-channel communication (Discord, Telegram, etc.) with large language models. Sessions store conversation history and context. Over time, sessions accumulate tokens and may need to be compacted to reduce token usage and improve performance.

This skill helps manage OpenClaw sessions, primarily through the Gateway RPC interface.

## Prerequisites

Gateway service must be running. Check status:
```bash
openclaw gateway status
```

If not running, start it:
```bash
openclaw gateway start   # Background service
openclaw gateway run     # Foreground (for debugging)
```

## Session Key Format

Session keys follow this pattern:
```
agent:<agent-id>:<channel-type>:<channel-subtype>:<channel-id>
```

Common examples:
- **Discord channel**: `agent:main:discord:channel:1480369833789882398`
- **Discord DM**: `agent:main:discord:user:123456789012345678`
- **Telegram**: `agent:main:telegram:user:123456789`
- **Cron job**: `agent:main:cron:766877d4-d234-4e60-8ff6-431c8368dd11`

## Core Operations

### List All Sessions

```bash
openclaw sessions --json
```

For human-readable output:
```bash
openclaw sessions
```

Filter by recent activity (last 2 hours):
```bash
openclaw sessions --active 120
```

### Find a Specific Session

When looking for a specific channel's session, use grep:
```bash
openclaw sessions --json | grep -i "<channel-id-or-name>"
```

### Compact a Session

The primary method via Gateway RPC:
```bash
openclaw gateway call sessions.compact --params '{"key": "<session-key>"}'
```

Example:
```bash
openclaw gateway call sessions.compact --params '{"key": "agent:main:discord:channel:1480369833789882398"}'
```

Successful response:
```json
{
  "ok": true,
  "key": "agent:main:discord:channel:1480369833789882398",
  "compacted": true,
  "archived": "/path/to/backup.jsonl.bak",
  "kept": 400
}
```

### Session Cleanup (Maintenance)

Run session store maintenance:
```bash
openclaw sessions cleanup --dry-run   # Preview changes
openclaw sessions cleanup --enforce   # Apply changes
```

## Workflow: Compact a Discord Channel Session

1. **Identify the channel ID** - Check scripts or ask user for Discord channel ID
2. **List sessions to find the key**:
   ```bash
   openclaw sessions --json
   ```
3. **Find the matching session key** (format: `agent:main:discord:channel:<id>`)
4. **Verify gateway is running**:
   ```bash
   openclaw gateway status
   ```
5. **Execute compact**:
   ```bash
   openclaw gateway call sessions.compact --params '{"key": "<session-key>"}'
   ```

## Other Useful Gateway Commands

```bash
# Check gateway health
openclaw gateway call health

# Check gateway status
openclaw gateway call status

# Restart gateway service
openclaw gateway restart
```

## For More Commands

See [references/commands.md](references/commands.md) for a comprehensive list of OpenClaw CLI commands.
