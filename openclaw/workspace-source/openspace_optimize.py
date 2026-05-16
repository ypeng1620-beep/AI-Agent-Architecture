#!/usr/bin/env python3
"""Run OpenSpace skill optimization using all backends"""
import asyncio
import sys
import os
import json

# Set UTF-8 encoding for stdout/stderr
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

# Disable colorama to avoid GBK issues
os.environ['TERM'] = 'dumb'
os.environ['PYTHONIOENCODING'] = 'utf-8'

async def optimize_skill():
    import openspace
    
    config = openspace.OpenSpaceConfig(
        # No backend_scope = use all available backends
        log_to_file=True,
        log_level='ERROR',
        log_file_path=r'D:\OpenClaw\workspace\ai-projects\OpenSpace\logs\openspace\optimize.log',
        enable_recording=False
    )
    
    os_instance = openspace.OpenSpace(config)
    await os_instance.initialize()
    
    print("OpenSpace initialized successfully!", file=sys.stderr)
    print(f"Backends: {os_instance.list_backends()}", file=sys.stderr)
    
    # Define the optimization task
    weather_path = r'C:\Users\ypeng\AppData\Roaming\npm\node_modules\openclaw\skills\weather\SKILL.md'
    
    task = f"""You are a skill optimization expert. 

Your task is to improve the weather skill at: {weather_path}

Read the current file content, then enhance it with:
1. Add more Chinese city examples (Beijing, Shanghai, Guangzhou, Shenzhen, Chengdu, etc.)
2. Add a section on common error scenarios and solutions  
3. Improve the format codes table with more examples
4. Add a quick reference card at the end

Output: Write the improved SKILL.md to the same path. Preserve the YAML frontmatter (lines 1-12).
"""
    
    result = await os_instance.execute(
        task=task,
        workspace_dir=r'C:\Users\ypeng\.openclaw\workspace',
        max_iterations=10
    )
    
    print(f"\nResult type: {type(result)}", file=sys.stderr)
    if isinstance(result, dict):
        for k, v in result.items():
            v_str = str(v)
            if len(v_str) > 300:
                print(f"\n{k}: {v_str[:300]}...", file=sys.stderr)
            else:
                print(f"\n{k}: {v_str}", file=sys.stderr)
    else:
        print(f"\nResult: {result}", file=sys.stderr)
    
    await os_instance.cleanup()

if __name__ == '__main__':
    asyncio.run(optimize_skill())
