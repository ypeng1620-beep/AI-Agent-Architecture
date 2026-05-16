#!/usr/bin/env python3
"""Test OpenSpace MCP connection via SSE client"""
import asyncio
import json
import urllib.request
import urllib.error

async def call_mcp_tools_list():
    """Call MCP tools/list endpoint using SSE"""
    data = json.dumps({
        'jsonrpc': '2.0',
        'method': 'tools/list',
        'id': 1
    }).encode()
    
    req = urllib.request.Request(
        'http://127.0.0.1:8081/mcp/',
        data=data,
        headers={
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream'
        }
    )
    
    try:
        resp = urllib.request.urlopen(req, timeout=10)
        print(f"Status: {resp.status}")
        print(f"Headers: {dict(resp.headers)}")
        chunk = resp.read(1024)
        print(f"Chunk: {chunk}")
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code} {e.reason}")
        print(f"Headers: {dict(e.headers)}")
        print(f"Body: {e.read().decode()[:500]}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    asyncio.run(call_mcp_tools_list())
