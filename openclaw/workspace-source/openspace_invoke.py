#!/usr/bin/env python3
"""Invoke OpenSpace MCP using JSON-RPC over stdio"""
import subprocess
import json
import sys

def invoke_mcp():
    """Run openspace-mcp and send JSON-RPC message"""
    # Start openspace-mcp as subprocess
    proc = subprocess.Popen(
        ['python', '-u', '-m', 'openspace', '--transport', 'stdio'],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=r'D:\OpenClaw\workspace\ai-projects\OpenSpace'
    )
    
    # Send JSON-RPC initialize
    init_msg = {
        "jsonrpc": "2.0",
        "id": 0,
        "method": "initialize",
        "params": {
            "protocolVersion": "2024-11-05",
            "capabilities": {},
            "clientInfo": {
                "name": "test-client",
                "version": "1.0.0"
            }
        }
    }
    
    # Send JSON-RPC tools/list
    list_msg = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/list",
        "params": {}
    }
    
    # Read until we get a response
    import select
    
    # Send init
    proc.stdin.write(json.dumps(init_msg).encode() + b'\n')
    proc.stdin.flush()
    
    # Wait for init response
    ready = select.select([proc.stdout], [], [], 5)
    if ready[0]:
        line = proc.stdout.readline()
        print(f"Init response: {line[:200]}")
    else:
        print("No init response within 5s")
    
    # Send tools/list
    proc.stdin.write(json.dumps(list_msg).encode() + b'\n')
    proc.stdin.flush()
    
    # Wait for tools list
    ready = select.select([proc.stdout], [], [], 5)
    if ready[0]:
        line = proc.stdout.readline()
        print(f"Tools list: {line[:500]}")
    else:
        print("No tools list within 5s")
    
    proc.terminate()
    proc.wait()

if __name__ == '__main__':
    invoke_mcp()
