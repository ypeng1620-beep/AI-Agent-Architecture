#!/usr/bin/env python3
"""Test MCP server using requests with SSE"""
import requests
import json
import sys

url = "http://127.0.0.1:8081/mcp"

# Try initialize + tools/list in sequence
session = requests.Session()

# First request - initialize
init_payload = {
    "jsonrpc": "2.0",
    "method": "initialize",
    "params": {
        "protocolVersion": "2024-11-05",
        "capabilities": {},
        "clientInfo": {"name": "test", "version": "1.0.0"}
    },
    "id": 0
}

print("Sending initialize...", file=sys.stderr)
try:
    resp = session.post(url, json=init_payload, timeout=10)
    print(f"Initialize response status: {resp.status_code}", file=sys.stderr)
    print(f"Response headers: {dict(resp.headers)}", file=sys.stderr)
    print(f"Response content: {resp.text[:500]}", file=sys.stderr)
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)

# Send initialized notification
notif_payload = {
    "jsonrpc": "2.0",
    "method": "notifications/initialized",
    "params": {}
}
print("\nSending initialized notification...", file=sys.stderr)
try:
    resp = session.post(url, json=notif_payload, timeout=10)
    print(f"Notification response status: {resp.status_code}", file=sys.stderr)
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)

# Now list tools
tools_payload = {
    "jsonrpc": "2.0",
    "method": "tools/list",
    "params": {},
    "id": 1
}
print("\nSending tools/list...", file=sys.stderr)
try:
    resp = session.post(url, json=tools_payload, timeout=10)
    print(f"Tools list response status: {resp.status_code}", file=sys.stderr)
    print(f"Response: {resp.text[:1000]}", file=sys.stderr)
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
