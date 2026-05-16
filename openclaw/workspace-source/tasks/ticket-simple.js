import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.join(dir, 'tickets.json');

let tickets = [];
try {
  if (fs.existsSync(FILE)) {
    tickets = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  }
} catch (e) {
  tickets = [];
}

function save() {
  fs.writeFileSync(FILE, JSON.stringify(tickets, null, 2));
}

const cmd = process.argv[2];
const arg = process.argv.slice(3).join(' ');

if (cmd === 'list') {
  console.log(JSON.stringify(tickets.slice(-20).reverse(), null, 2));
} else if (cmd === 'stats') {
  const byStatus = {};
  for (const t of tickets) {
    byStatus[t.status] = (byStatus[t.status] || 0) + 1;
  }
  console.log(JSON.stringify({ total: tickets.length, byStatus }, null, 2));
} else if (cmd === 'create') {
  const t = { id: randomUUID(), number: tickets.length + 1, title: arg, status: 'pending', createdAt: Date.now() };
  tickets.push(t);
  save();
  console.log(JSON.stringify(t, null, 2));
} else if (cmd === 'start') {
  const t = tickets.find(x => x.id === arg);
  if (t) { t.status = 'running'; t.startedAt = Date.now(); save(); }
  console.log(JSON.stringify(t || null, null, 2));
} else if (cmd === 'complete') {
  const t = tickets.find(x => x.id === arg);
  if (t) { t.status = 'completed'; t.completedAt = Date.now(); save(); }
  console.log(JSON.stringify(t || null, null, 2));
} else {
  console.log('Usage: node ticket-simple.js <list|stats|create|start|complete> [args]');
}
