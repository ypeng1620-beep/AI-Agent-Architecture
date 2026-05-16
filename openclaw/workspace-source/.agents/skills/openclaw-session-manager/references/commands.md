# OpenClaw CLI Commands Reference

## Gateway Commands

```bash
# Start gateway (background service)
openclaw gateway start

# Start gateway (foreground)
openclaw gateway run

# Check gateway status
openclaw gateway status

# Restart gateway
openclaw gateway restart

# Stop gateway
openclaw gateway stop

# Call gateway RPC method
openclaw gateway call <method> --params '<json>'

# Common RPC methods:
# - health, status, system-presence
# - sessions.list, sessions.compact, sessions.reset
```

## Session Commands

```bash
# List all sessions
openclaw sessions

# List sessions as JSON
openclaw sessions --json

# Filter by recent activity (minutes)
openclaw sessions --active 120

# Filter by agent
openclaw sessions --agent <agent-id>

# Aggregate across all agents
openclaw sessions --all-agents

# Run session cleanup
openclaw sessions cleanup --dry-run
openclaw sessions cleanup --enforce
```

## Channel Commands

```bash
# List connected channels
openclaw channels

# Add a channel
openclaw channels add discord
openclaw channels add telegram

# Login to a channel
openclaw channels login <channel>

# Logout from a channel
openclaw channels logout <channel>

# Check channel status
openclaw status
```

## Message Commands

```bash
# Send a message
openclaw message send --target <id> --message "text"
openclaw message send --channel discord --target <channel-id> --message "text"

# Read messages
openclaw message read --target <id>
```

## Agent Commands

```bash
# Run one agent turn
openclaw agent --to <target> --message "text"

# List agents
openclaw agents
```

## Configuration Commands

```bash
# Interactive setup wizard
openclaw configure

# Get config value
openclaw config get <key>

# Set config value
openclaw config set <key> <value>

# Show config file path
openclaw config file

# Validate config
openclaw config validate
```

## Utility Commands

```bash
# Health check
openclaw doctor

# Check system status
openclaw status

# View logs
openclaw logs

# Open dashboard
openclaw dashboard

# Search docs
openclaw docs <query>

# Update OpenClaw
openclaw update
```

## Cron Commands

```bash
# List cron jobs
openclaw cron

# Add cron job
openclaw cron add

# Remove cron job
openclaw cron remove <id>
```

## Skills Commands

```bash
# List available skills
openclaw skills

# Inspect a skill
openclaw skills inspect <skill-name>
```

## Common Session Key Patterns

| Channel Type | Key Pattern |
|-------------|-------------|
| Discord channel | `agent:main:discord:channel:<snowflake-id>` |
| Discord DM | `agent:main:discord:user:<snowflake-id>` |
| Telegram user | `agent:main:telegram:user:<numeric-id>` |
| Telegram group | `agent:main:telegram:group:<numeric-id>` |
| Cron job | `agent:main:cron:<uuid>` |
| Webhook | `agent:main:webhook:<id>` |

## Troubleshooting

```bash
# Gateway not responding
openclaw gateway restart

# Check logs
openclaw logs --verbose

# Run diagnostics
openclaw doctor
```
