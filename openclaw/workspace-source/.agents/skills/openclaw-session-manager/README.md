# OpenClaw Session Manager Skill

A Claude Code skill for managing OpenClaw AI agent sessions - list, find, and compact sessions to reduce token usage.

## Features

- List all active OpenClaw sessions
- Find specific sessions by channel ID or name
- Compact sessions to reduce token usage
- Support for Discord, Telegram, and other channel types
- Gateway RPC interface management

## Installation

### For Claude Code

Copy the skill to your Claude skills directory:

```bash
# Download the skill
git clone https://github.com/litangjuan/openclaw-session-manager.git

# Copy to Claude skills directory
cp -r openclaw-session-manager ~/.claude/skills/
```

Or install from the packaged `.skill` file:

```bash
# Download the .skill file and extract
unzip openclaw-session-manager.skill -d ~/.claude/skills/openclaw-session-manager
```

### For ClawHub

This skill is compatible with ClawHub (OpenClaw's skill marketplace). The metadata in SKILL.md follows the ClawHub skill format specification.

## Usage

Once installed, the skill automatically triggers when you ask Claude to:
- Compact or compress a session
- List or find sessions
- Check session token usage
- Manage Discord/Telegram channel sessions
- Work with openclaw gateway commands

### Example Prompts

- "Compact the Discord session for the iran channel"
- "List all OpenClaw sessions"
- "Find the session for Telegram user 123456789"
- "清理上下文" (Chinese: clean up context)

## Session Key Format

OpenClaw session keys follow this pattern:
```
agent:<agent-id>:<channel-type>:<channel-subtype>:<channel-id>
```

Common examples:
- **Discord channel**: `agent:main:discord:channel:1480369833789882398`
- **Discord DM**: `agent:main:discord:user:123456789012345678`
- **Telegram user**: `agent:main:telegram:user:123456789`
- **Telegram group**: `agent:main:telegram:group:123456789`
- **Cron job**: `agent:main:cron:766877d4-d234-4e60-8ff6-431c8368dd11`

## Prerequisites

- OpenClaw CLI installed
- Gateway service running (`openclaw gateway start`)

## Core Commands

```bash
# List all sessions
openclaw sessions --json

# Find specific session
openclaw sessions --json | grep -i "<channel-id>"

# Compact a session
openclaw gateway call sessions.compact --params '{"key": "<session-key>"}'

# Check gateway status
openclaw gateway status
```

## License

MIT-0

## Links

- [OpenClaw GitHub](https://github.com/openclaw/openclaw)
- [ClawHub Skill Format](https://github.com/openclaw/clawhub/blob/main/docs/skill-format.md)
