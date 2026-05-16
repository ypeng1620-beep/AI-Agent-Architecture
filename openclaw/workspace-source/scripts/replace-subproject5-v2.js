const fs = require('fs');

const filePath = 'D:/日记仓库/openclaw/AI Agent可控性一体化插件 OpenClaw分步执行清单（超详细版）/具体步骤/OpenClaw分步执行清单（超详细版）.md';
const content = fs.readFileSync(filePath, 'utf8');

const startIdx = content.indexOf('小项目5：强制约束引擎开发（解决约束失效）');
const endIdx = content.indexOf('小项目6：');

const oldSection = content.substring(startIdx, endIdx);

const newSection = `小项目5：Agent Guard Proxy（护卫代理）（解决约束失效）
 
项目目标
 
在OpenClaw Agent与用户之间建立独立的Proxy层，所有指令和输出都经过Proxy检查，做到：
- Agent输出违规 → 用户完全看不到
- 自动触发修正 / 重试 / 熔断
- Agent完全无法绕过约束检查
 
核心定位
 
从"前置拦截"（架构不支持）改为"手术刀级精准过滤"：
- 所有进出流量经过Proxy
- 违规输出直接丢弃、销毁
- 用户只看到合规结果
 
执行流程
 
用户发指令 → Guard Proxy → OpenClaw Agent → Guard Proxy → 用户
                  ↑                              ↑
              转发任务                      检查输出
                                          违规→丢弃
 
执行步骤
 
1. Guard Proxy 核心架构搭建
- 操作内容：开发独立的 Guard Proxy 服务（Node.js/Python），建立任务转发机制，接收用户指令后转发给 OpenClaw Agent，接收 Agent 结果后决定是否放行。
- 执行标准：Proxy 作为独立进程运行，不修改 OpenClaw 内核，支持所有 OpenClaw 支持的模型。
- 输出产物：guard_proxy 主服务代码。
2. 指令转发模块开发
- 操作内容：开发指令转发模块，接收用户输入，按固定格式转发给 OpenClaw isolated session，接收 Agent 原始输出。
- 执行标准：转发成功率100%，不丢失任何指令内容。
- 输出产物：dispatcher.py（转发模块）。
3. 强制约束检查模块（核心）
- 操作内容：在 Agent 输出返回用户前，执行5层检查：
  ① 违禁词检查
  ② 格式合规检查
  ③ 内容越界检查
  ④ 重复无效修改检查
  ⑤ 超出最大轮次检查
- 执行标准：100%识别违规内容，不误判、不漏判。
- 输出产物：constraint_checker.py（约束检查模块）。
4. 阻断与丢弃机制
- 操作内容：检测到违规后，立即丢弃违规输出，不返回给用户，不保存，不留任何痕迹。
- 执行标准：违规输出100%被阻断，用户完全看不到。
- 输出产物：blocker.py（阻断模块）。
5. 自动修正与强制重试
- 操作内容：违规后自动生成：
  ① 错误原因
  ② 违反的规则
  ③ 修正要求
  ④ 重新生成指令
  然后强制送回 OpenClaw Agent 重新生成。
- 执行标准：自动重试，不需要人工干预，重试次数可配置。
- 输出产物：retry_controller.py（重试控制器）。
6. 熔断机制
- 操作内容：连续违规 ≥3 次 → 直接终止任务，输出熔断提示，避免死循环。
- 执行标准：熔断触发后任务立即终止，输出终止原因。
- 输出产物：fuse.py（熔断模块）。
 
部署方式（路径A：轻量先行）
 
1. Guard Proxy 作为独立服务运行在本地（端口如 18790）
2. 新增的、需要强制约束的任务走 Proxy
3. 现有的定时/推送任务维持原样
4. 稳定后逐步迁移更多任务
 
最终效果
 
✅ Agent 输出违规 → 用户完全看不到
✅ 违规自动触发修正
✅ 连续违规 → 熔断终止
✅ Agent 完全无法绕过
✅ 不修改 OpenClaw 内核
✅ 兼容未来升级
✅ 独立进程，不影响现有系统
 
单项目验收标准
 
Guard Proxy 独立运行，所有指令和输出经过Proxy过滤，违规输出100%被阻断且用户完全看不到，自动修正重试机制正常工作，熔断机制在连续违规时正确触发。
 
`;

const newContent = content.substring(0, startIdx) + newSection + content.substring(endIdx);

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Updated successfully!');
console.log('Old length:', content.length, '-> New length:', newContent.length);
console.log('Delta:', newContent.length - content.length);
