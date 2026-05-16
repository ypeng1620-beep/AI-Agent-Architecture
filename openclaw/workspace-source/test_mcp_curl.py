#!/usr/bin/env python3
import subprocess

# Call without trailing slash - this is where the server actually listens
result = subprocess.run(
    ['curl', '-s', '-X', 'POST', 'http://127.0.0.1:8081/mcp',
     '-H', 'Content-Type: application/json',
     '-H', 'Accept: text/event-stream',
     '-d', '{"jsonrpc":"2.0","method":"tools/list","id":1}',
     '-w', '\nHTTP_CODE:%{http_code}',
     '--max-time', '10'],
    capture_output=True,
    text=True
)

print("STDOUT:", result.stdout[:1000] if result.stdout else "(empty)")
print("STDERR:", result.stderr[:500] if result.stderr else "(empty)")
print("RC:", result.returncode)
