/**
 * Context Bank - Example Usage
 * 
 * Demonstrates how to use context-bank with different AI agents
 */
import { createContextBank } from './index.js';

async function example1_basic() {
  console.log('=== Example 1: Basic Usage ===\n');
  
  const bank = await createContextBank();
  
  // Create session
  const sessionId = bank.create('demo-chat');
  console.log('Created session:', sessionId);
  
  // Add conversation
  bank.addMessage('system', 'You are a coding assistant.');
  bank.addMessage('user', 'Write a hello world in Python');
  bank.addMessage('assistant', '```python\nprint("Hello, World!")\n```');
  bank.addMessage('user', 'Make it a function');
  bank.addMessage('assistant', '```python\ndef hello():\n    print("Hello, World!")\n```');
  
  // Get context
  console.log('\nContext for AI:');
  const context = bank.getContext(10);
  console.log(JSON.stringify(context, null, 2));
  
  // Save
  await bank.save('./demo-context.json');
  console.log('\nSaved to demo-context.json');
}

async function example2_multiple_sessions() {
  console.log('\n=== Example 2: Multiple Sessions ===\n');
  
  const bank = await createContextBank();
  
  // Session 1
  bank.create('project-alpha');
  bank.addMessage('user', 'Task 1');
  bank.addMessage('assistant', 'Done 1');
  
  // Session 2
  bank.create('project-beta');
  bank.addMessage('user', 'Task A');
  bank.addMessage('assistant', 'Done A');
  
  // Switch back
  bank.switch(bank.list()[0].id);
  
  console.log('Active session:', bank.getActiveSession());
  console.log('All sessions:', bank.list());
}

async function example3_compression() {
  console.log('\n=== Example 3: Context Compression ===\n');
  
  const bank = await createContextBank();
  bank.create('long-chat');
  
  // Add 20 messages
  for (let i = 0; i < 20; i++) {
    bank.addMessage('user', `Message ${i}`);
    bank.addMessage('assistant', `Response ${i}`);
  }
  
  console.log('Before compression:', bank.getMessageCount(), 'messages');
  
  // Compress to 30%
  bank.compress(0.3);
  
  console.log('After compression (30%):', bank.getMessageCount(), 'messages');
  
  // Get remaining messages
  const context = bank.getContext();
  console.log('\nRemaining context:');
  context.forEach(m => console.log(`  ${m.role}: ${m.content.substring(30)}...`));
}

async function example4_stats() {
  console.log('\n=== Example 4: Statistics ===\n');
  
  const bank = await createContextBank();
  
  bank.create('chat-1');
  bank.addMessage('user', 'Hello');
  bank.addMessage('assistant', 'Hi');
  
  bank.create('chat-2');
  bank.addMessage('user', 'Question');
  
  console.log('Stats:', bank.stats());
}

// Run examples
async function run() {
  await example1_basic();
  await example2_multiple_sessions();
  await example3_compression();
  await example4_stats();
  
  console.log('\n=== All Examples Complete ===');
}

run();
