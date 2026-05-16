#!/usr/bin/env python3
"""Run OpenSpace skill evolution directly"""
import asyncio
import sys
import os

# Set UTF-8 encoding for stdout/stderr
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

# Disable colorama to avoid GBK issues
os.environ['TERM'] = 'dumb'

async def evolve_skill():
    import openspace
    
    config = openspace.OpenSpaceConfig(
        # No backend_scope = all backends, but MCP has websockets issue
        # Let's try with empty list to use only system tools
        log_to_file=True,
        log_level='ERROR',
        log_file_path=r'D:\OpenClaw\workspace\ai-projects\OpenSpace\logs\openspace\evolve_error.log',
        enable_recording=False
    )
    
    os_instance = openspace.OpenSpace(config)
    await os_instance.initialize()
    
    print("OpenSpace initialized!", file=sys.stderr)
    print(f"Backends: {os_instance.list_backends()}", file=sys.stderr)
    
    # Check if we can run a task
    task = """Read the file at: C:\\Users\\ypeng\\AppData\\Roaming\\npm\\node_modules\\openclaw\\skills\\weather\\SKILL.md

Return a summary of what the file contains."""
    
    result = await os_instance.execute(
        task=task,
        workspace_dir=r'C:\Users\ypeng\.openclaw\workspace',
        max_iterations=3
    )
    
    print(f"Result type: {type(result)}")
    if isinstance(result, dict):
        for k, v in result.items():
            v_str = str(v)
            if len(v_str) > 300:
                print(f"{k}: {v_str[:300]}...")
            else:
                print(f"{k}: {v_str}")
    else:
        print(result)
    
    await os_instance.cleanup()

if __name__ == '__main__':
    asyncio.run(evolve_skill())
