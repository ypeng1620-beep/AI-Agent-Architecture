#!/usr/bin/env python3
import asyncio
import sys
from mcp.client.streamable_http import streamablehttp_client
from mcp.client.session import ClientSession

async def main():
    url = "http://127.0.0.1:8081/mcp"
    
    async with streamablehttp_client(url, sse_read_timeout=600, timeout=600) as (read, write, get_id):
        async with ClientSession(read, write) as session:
            await session.initialize()
            print("Session initialized!", file=sys.stderr)
            
            weather_path = r"C:\Users\ypeng\AppData\Roaming\npm\node_modules\openclaw\skills\weather\SKILL.md"
            task = f"""Improve the weather skill documentation at: {weather_path}

Read the current file and enhance it with:
1. Add more Chinese city examples (Beijing, Shanghai, Guangzhou, Shenzhen, Chengdu, etc.)
2. Add error handling section
3. Improve format codes table with more examples

Write the improved version back to the same file. Preserve YAML frontmatter."""
            
            print("Calling execute_task...", file=sys.stderr)
            r = await session.call_tool(
                "execute_task",
                {
                    "task": task,
                    "workspace_dir": r"C:\Users\ypeng\.openclaw\workspace",
                    "max_iterations": 5
                }
            )
            
            if r.content:
                text = r.content[0].text
                print(f"Result ({len(text)} chars): {text[:1000]}", file=sys.stderr)
            else:
                print("No content in result", file=sys.stderr)

if __name__ == "__main__":
    asyncio.run(main())
