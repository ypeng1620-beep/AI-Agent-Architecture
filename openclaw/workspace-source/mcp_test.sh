#!/bin/bash
curl -s -X POST 'http://127.0.0.1:8081/mcp/' \
  -H 'Content-Type: application/json' \
  -H 'Accept: text/event-stream' \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}' \
  --max-time 10
