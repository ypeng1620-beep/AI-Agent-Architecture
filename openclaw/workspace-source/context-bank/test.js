/**
 * Context Bank - Test Suite
 */
import { createContextBank } from './index.js';

async function runTests() {
  console.log('🧪 Context Bank Tests\n');
  
  const bank = await createContextBank({
    storagePath: './test-context.json'
  });
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Create session
  console.log('Test 1: Create session');
  try {
    const sessionId = bank.create('test-session');
    console.log('  ✅ Created:', sessionId);
    passed++;
  } catch (e) {
    console.log('  ❌', e.message);
    failed++;
  }
  
  // Test 2: Add message
  console.log('Test 2: Add message');
  try {
    bank.addMessage('system', 'You are a helpful assistant.');
    bank.addMessage('user', 'Hello, how are you?');
    bank.addMessage('assistant', 'I am doing well, thank you!');
    console.log('  ✅ Added 3 messages');
    passed++;
  } catch (e) {
    console.log('  ❌', e.message);
    failed++;
  }
  
  // Test 3: Get messages
  console.log('Test 3: Get messages');
  try {
    const msgs = bank.getMessages(10);
    console.log('  ✅ Got', msgs.length, 'messages');
    passed++;
  } catch (e) {
    console.log('  ❌', e.message);
    failed++;
  }
  
  // Test 4: Get context
  console.log('Test 4: Get context (for AI)');
  try {
    const ctx = bank.getContext(10);
    console.log('  ✅ Context:', JSON.stringify(ctx));
    passed++;
  } catch (e) {
    console.log('  ❌', e.message);
    failed++;
  }
  
  // Test 5: Create another session
  console.log('Test 5: Multiple sessions');
  try {
    const sid2 = bank.create('session-2');
    bank.addMessage('user', 'Message in session 2');
    const stats = bank.stats();
    console.log('  ✅ Sessions:', stats.sessionCount, ', Messages:', stats.totalMessages);
    passed++;
  } catch (e) {
    console.log('  ❌', e.message);
    failed++;
  }
  
  // Test 6: Compress
  console.log('Test 6: Compress context');
  try {
    // Add more messages to test compression
    for (let i = 0; i < 10; i++) {
      bank.addMessage('user', `Message ${i}`);
    }
    const before = bank.getMessageCount();
    bank.compress(0.3);
    const after = bank.getMessageCount();
    console.log('  ✅ Compressed:', before, '→', after, 'messages');
    passed++;
  } catch (e) {
    console.log('  ❌', e.message);
    failed++;
  }
  
  // Test 7: Save
  console.log('Test 7: Save to file');
  try {
    await bank.save();
    console.log('  ✅ Saved to test-context.json');
    passed++;
  } catch (e) {
    console.log('  ❌', e.message);
    failed++;
  }
  
  // Test 8: List sessions
  console.log('Test 8: List sessions');
  try {
    const list = bank.list();
    console.log('  ✅ Sessions:', list.length);
    list.forEach(s => console.log('    -', s.name, ':', s.messageCount, 'msgs'));
    passed++;
  } catch (e) {
    console.log('  ❌', e.message);
    failed++;
  }
  
  console.log('\n📊 Results:', passed, 'passed,', failed, 'failed');
  
  // Cleanup
  try {
    fs.unlinkSync('./test-context.json');
  } catch (e) {}
  
  return failed === 0;
}

import fs from 'fs';
runTests().then(success => {
  process.exit(success ? 0 : 1);
});
