#!/usr/bin/env python3
"""Proper MCP client using streamable-http with SSE"""
import json
import sys
import urllib.request
import urllib.error
import threading
import queue

def send_mcp_request(url, method, params=None, request_id=1):
    """Send MCP JSON-RPC request and read SSE response"""
    payload = {
        "jsonrpc": "2.0",
        "method": method,
        "id": request_id
    }
    if params:
        payload["params"] = params
    
    data = json.dumps(payload).encode()
    
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Content-Type": "application/json",
            "Accept": "text/event-stream, application/json",
            "Cache-Control": "no-cache"
        },
        method="POST"
    )
    
    try:
        resp = urllib.request.urlopen(req, timeout=30)
        content_type = resp.headers.get("Content-Type", "")
        print(f"Response content-type: {content_type}", file=sys.stderr)
        print(f"Response status: {resp.status}", file=sys.stderr)
        
        # Read response body
        body = resp.read()
        print(f"Response body ({len(body)} bytes): {body[:500]}", file=sys.stderr)
        return body
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code} {e.reason}", file=sys.stderr)
        print(f"Headers: {dict(e.headers)}", file=sys.stderr)
        body = e.read()
        print(f"Body: {body[:500]}", file=sys.stderr)
        return body
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return None

if __name__ == "__main__":
    # First try to call the MCP server
    url = "http://127.0.0.1:8081/mcp"
    
    print("Testing MCP tools/list...", file=sys.stderr)
    result = send_mcp_request(url, "tools/list", request_id=1)
    
    if result:
        try:
            parsed = json.loads(result)
            print(f"Parsed result: {json.dumps(parsed, indent=2)[:1000]}")
        except json.JSONDecodeError as e:
            print(f"Could not parse as JSON: {e}")
            print(f"Raw result: {result[:500]}")
