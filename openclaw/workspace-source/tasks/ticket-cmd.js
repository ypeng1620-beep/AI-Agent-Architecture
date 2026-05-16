#!/usr/bin/env node
/**
 * 任务Ticket管理命令
 * 用法:
 *   node ticket-cmd.js list                    - 查看任务
 *   node ticket-cmd.js create "标题" --agent=c --priority=h  创建任务
 *   node ticket-cmd.js start #3               开始任务
 *   node ticket-cmd.js complete #3             完成
 *   node ticket-cmd.js fail #3 "错误"         失败
 *   node ticket-cmd.js stats                   统计
 */

import { ticketSystem } from './task-ticket-v2.js';

const args = process.argv.slice(2);
const cmd = args[0];

async function main() {
  if (!cmd) {
    console.log('用法: node ticket-cmd.js <command> [args]');
    console.log('命令: list, create, start, complete, fail, stats');
    return;
  }

  try {
    switch (cmd) {
      case 'list': {
        const tickets = await ticketSystem.run({ action: 'recent', limit: 20 });
        if (tickets.length === 0) {
          console.log('暂无任务');
          return;
        }
        console.log('\n📋 最近任务:');
        tickets.forEach(t => {
          const status = t.status === 'completed' ? '✅' : t.status === 'failed' ? '❌' : t.status === 'running' ? '🔄' : '⏳';
          console.log(`  ${status} #${t.number} ${t.title} (${t.agent})`);
        });
        break;
      }

      case 'create': {
        const title = args[1];
        if (!title) { console.log('需要标题'); return; }
        const opts = { title, agent: 'system', priority: 'normal' };
        args.slice(2).forEach(a => {
          if (a.startsWith('--agent=')) opts.agent = a.slice(8);
          if (a.startsWith('--priority=')) opts.priority = a.slice(11);
        });
        const t = await ticketSystem.run({ action: 'create', ...opts });
        console.log(`✅ 创建 #${t.number}: ${t.title}`);
        break;
      }

      case 'start':
      case 'complete':
      case 'fail': {
        const num = parseInt(args[1]?.replace('#', ''));
        if (!num) { console.log('需要任务编号'); return; }
        const tickets = await ticketSystem.run({ action: 'recent', limit: 100 });
        const t = tickets.find(x => x.number === num);
        if (!t) { console.log(`任务 #${num} 不存在`); return; }
        const result = cmd === 'complete' 
          ? await ticketSystem.run({ action: 'complete', id: t.id })
          : cmd === 'start'
            ? await ticketSystem.run({ action: 'start', id: t.id })
            : await ticketSystem.run({ action: 'fail', id: t.id, error: args.slice(2).join(' ') });
        const icon = cmd === 'complete' ? '✅' : cmd === 'start' ? '🔄' : '❌';
        console.log(`${icon} ${cmd} #${t.number}: ${t.title}`);
        break;
      }

      case 'stats': {
        const s = await ticketSystem.run({ action: 'stats' });
        console.log('\n📊 统计:');
        console.log(`  总计: ${s.total}`);
        console.log(`  今日: ${s.todayCount}`);
        Object.entries(s.byStatus).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
        console.log(`  平均耗时: ${(s.avgDuration/1000).toFixed(1)}s`);
        break;
      }

      default:
        console.log(`未知命令: ${cmd}`);
    }
  } catch (e) {
    console.error('错误:', e.message);
    process.exit(1);
  }
}

main();
