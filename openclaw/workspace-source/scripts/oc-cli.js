#!/usr/bin/env node
/**
 * OpenClaw CLI Wrapper
 * 功能：自动管理 Gateway 进程，避免连接超时和进程残留
 * 
 * 使用方式：替换 npx openclaw 为 node oc-cli.js
 */

const { spawn, execSync } = require('child_process');
const net = require('net');

const GATEWAY_PORT = 18789;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function checkGatewayPort() {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(1000);
        socket.on('connect', () => {
            socket.destroy();
            resolve(true);
        });
        socket.on('timeout', () => {
            socket.destroy();
            resolve(false);
        });
        socket.on('error', () => {
            resolve(false);
        });
        socket.connect(GATEWAY_PORT, '127.0.0.1');
    });
}

async function ensureGateway() {
    console.log('[OC-CLI] Checking Gateway...');
    
    for (let i = 0; i < MAX_RETRIES; i++) {
        const isHealthy = await checkGatewayPort();
        if (isHealthy) {
            console.log('[OC-CLI] Gateway is healthy');
            return true;
        }
        
        console.log('[OC-CLI] Gateway not responding, attempting to start...');
        
        try {
            execSync('npx openclaw gateway start', { 
                stdio: 'ignore',
                windowsHide: true 
            });
            await sleep(3000);
        } catch (e) {
            // Gateway 启动可能静默失败，继续重试
        }
    }
    
    console.log('[OC-CLI] WARNING: Gateway may not be running');
    return false;
}

async function main() {
    // 跳过某些不需要 Gateway 的命令
    const skipGatewayCheck = ['gateway', 'setup', 'install', 'uninstall', 'update', 'doctor'];
    
    const args = process.argv.slice(2);
    const command = args[0] || '';
    
    // 检查是否需要 Gateway
    const needsGateway = !skipGatewayCheck.some(cmd => command.startsWith(cmd));
    
    if (needsGateway) {
        await ensureGateway();
    }
    
    // 执行原始命令
    const child = spawn('npx', ['openclaw', ...args], {
        stdio: 'inherit',
        shell: true,
        windowsHide: true
    });
    
    child.on('exit', (code) => {
        process.exit(code || 0);
    });
}

main().catch(console.error);
