# Context Bank

Lightweight context storage for AI agents.

## Features

- ✅ **Multi-session support** - Manage multiple conversation contexts
- ✅ **Context compression** - Reduce context size while keeping key info
- ✅ **File persistence** - Save/load contexts to JSON files
- ✅ **Zero dependencies** - Pure Node.js, no external packages
- ✅ **Framework agnostic** - Works with any AI agent (Claude, GPT, etc.)

## Installation

```bash
npm install context-bank
```

## Quick Start

```javascript
import { createContextBank } from 'context-bank';

async function main() {
  // Create a new context bank
  const bank = await createContextBank();
  
  // Create a session
  bank.create('my-chat');
  
  // Add messages
  bank.addMessage('system', 'You are a helpful assistant.');
  bank.addMessage('user', 'What is 2+2?');
  bank.addMessage('assistant', '2+2 equals 4.');
  
  // Get context for AI
  const context = bank.getContext(10);
  console.log(context);
  // [
  //   { role: 'system', content: 'You are a helpful assistant.' },
  //   { role: 'user', content: 'What is 2+2?' },
  //   { role: 'assistant', content: '2+2 equals 4.' }
  // ]
  
  // Save to file
  await bank.save();
}

main();
```

## API

| Method | Description |
|--------|-------------|
| `create(name)` | Create a new session |
| `switch(sessionId)` | Switch to another session |
| `addMessage(role, content)` | Add a message (role: user/assistant/system) |
| `getMessages(limit)` | Get last N messages |
| `getContext(limit)` | Get messages in AI format |
| `compress(ratio)` | Compress context (0.5 = keep 50%) |
| `save(filepath)` | Save to file |
| `list()` | List all sessions |
| `stats()` | Get statistics |

## Use Cases

### Claude Code / OpenClaw

```javascript
import { createContextBank } from 'context-bank';

const bank = await createContextBank();

// After each message
bank.addMessage('user', userMessage);
bank.addMessage('assistant', assistantMessage);

// Before sending to AI
const context = bank.getContext(20);

// Periodically save
await bank.save();
```

### OpenAI GPT

```javascript
const bank = await createContextBank();
bank.create('gpt-chat');

// Build context
bank.addMessage('user', userMessage);
const messages = bank.getContext(10);

// Send to GPT
const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: messages
});
```

## License

MIT
