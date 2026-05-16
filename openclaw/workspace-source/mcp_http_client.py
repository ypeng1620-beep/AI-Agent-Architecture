#!/usr/bin/env python3
"""MCP client using streamable_http transport"""
import asyncio
import sys

async def main():
    from mcp.client.streamable_http import streamablehttp_client
    from mcp.client.session import ClientSession
    
    url = "http://127.0.0.1:8081/mcp"
    
    print(f"Connecting to MCP server at {url}...", file=sys.stderr)
    
    try:
        async with streamablehttp_client(url, sse_read_timeout=60) as (read_stream, write_stream, get_session_id):
            print("Connected! Creating session...", file=sys.stderr)
            
            async with ClientSession(read_stream, write_stream) as session:
                print("Initializing session...", file=sys.stderr)
                
                # Initialize
                result = await session.initialize()
                print(f"Initialized: {result}", file=sys.stderr)
                
                # List tools
                print("Listing tools...", file=sys.stderr)
                tools_result = await session.list_tools()
                print(f"Tools: {[t.name for t in tools_result.tools]}", file=sys.stderr)
                
    except Exception as e:
        print(f"Error: {type(e).__name__}: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)

if __name__ == "__main__":
    asyncio.run(main())
