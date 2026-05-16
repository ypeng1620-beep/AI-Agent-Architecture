#!/usr/bin/env node
/**
 * Gateway 健康检查与自动重启脚本
 * 功能：
 * 1. 定时检查 Gateway 端口状态
 * 2. 自动重启无响应的 Gateway
 * 3. 记录运行状态
 */

const net = require('net');
const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const GATEWAY_PORT = 18789;
const CHECK_INTERVAL = 60000; // 1分钟检查一次
const LOG_FILE = path.join(__dirname, 'gateway-health.log');

function log(msg) {
    const time = new Date().toISOString();
    const logMsg = `[${time}] ${msg}\n`;
    fs.appendFileSync(LOG_FILE, logMsg);
    console.log(logMsg.trim());
}

function checkPort() {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(2000);
        
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

async function restartGateway() {
    log('Attempting to restart Gateway...');
    
    return new Promise((resolve) => {
        try {
            // 强制关闭可能存在的进程
            exec('powershell -Command "Get-NetTCPConnection -LocalPort 18789 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"', 
                { windowsHide: true },
                () => {
                    setTimeout(() => {
                        spawn('npx', ['openclaw', 'gateway', 'start'], {
                            stdio: 'ignore',
                            detached: true,
                            windowsHide: true
                        });
                        
                        setTimeout(async () => {
                            const isUp = await checkPort();
                            if (isUp) {
                                log('Gateway restarted successfully');
                                resolve(true);
                            } else {
                                log('Gateway restart may have failed');
                                resolve(false);
                            }
                        }, 5000);
                    }, 2000);
                }
            );
        } catch (e) {
            log(`Restart error: ${e.message}`);
            resolve(false);
        }
    });
}

async function healthCheck() {
    log('Starting health check...');
    
    const isHealthy = await checkPort();
    
    if (isHealthy) {
        log('Gateway is healthy');
        return true;
    }
    
    log('Gateway is down, attempting restart...');
    return await restartGateway();
}

// 立即执行一次
healthCheck();

// 设置定时检查
setInterval(healthCheck, CHECK_INTERVAL);

log('Gateway health monitor started');
