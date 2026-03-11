/**
 * 🦞 龙虾医院 - 工具函数库
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

/**
 * 执行命令并返回输出
 */
export function runCommand(cmd, timeout = 30000) {
  try {
    return execSync(cmd, { 
      encoding: 'utf8', 
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout 
    });
  } catch (e) {
    // 即使命令返回非零退出码，也尝试返回 stdout
    if (e.stdout) return e.stdout.toString();
    throw e;
  }
}

/**
 * 格式化字节大小
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 格式化持续时间
 */
export function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

/**
 * 颜色状态输出
 */
export function colorStatus(status) {
  const colors = {
    'critical': '\x1b[31m',  // 红
    'warning': '\x1b[33m',   // 黄
    'info': '\x1b[36m',      // 青
    'healthy': '\x1b[32m',   // 绿
    'reset': '\x1b[0m'
  };
  
  const icons = {
    'critical': '🚨',
    'warning': '⚠️',
    'info': '💡',
    'healthy': '✅'
  };
  
  return `${colors[status] || ''}${icons[status] || ''}${colors.reset}`;
}

/**
 * 加载配置文件
 */
export function loadConfig(path) {
  try {
    const content = readFileSync(path, 'utf8');
    // 简单的 YAML 解析（只处理顶层键值）
    const config = {};
    content.split('\n').forEach(line => {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        config[match[1]] = match[2].trim();
      }
    });
    return config;
  } catch (e) {
    return null;
  }
}

/**
 * 安全地解析 JSON
 */
export function safeJsonParse(str, defaultValue = null) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return defaultValue;
  }
}

/**
 * 从混合输出中提取 JSON
 */
export function extractJson(output) {
  // 尝试找到 JSON 对象的开始
  let depth = 0;
  let start = -1;
  
  for (let i = 0; i < output.length; i++) {
    if (output[i] === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (output[i] === '}') {
      depth--;
      if (depth === 0 && start !== -1) {
        try {
          return JSON.parse(output.substring(start, i + 1));
        } catch (e) {
          // 继续寻找
        }
      }
    }
  }
  
  return null;
}

/**
 * 生成进度条
 */
export function progressBar(percent, width = 20) {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

/**
 * 文本截断
 */
export function truncate(str, maxLen) {
  if (str.length <= maxLen) return str;
  return str.substring(0, maxLen - 3) + '...';
}

/**
 * 睡眠函数
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 按严重程度排序发现项
 */
export function sortFindingsBySeverity(findings) {
  const severityOrder = { 'critical': 0, 'warning': 1, 'info': 2, 'healthy': 3 };
  return [...findings].sort((a, b) => {
    const diff = severityOrder[a.level] - severityOrder[b.level];
    return diff !== 0 ? diff : b.timestamp - a.timestamp;
  });
}

/**
 * 生成诊断建议
 */
export function generateAdvice(finding) {
  const adviceMap = {
    'doctor.state_permissions': {
      autoFix: true,
      command: 'chmod 700 ~/.openclaw',
      description: '修复状态目录权限'
    },
    'doctor.gateway_exposure': {
      autoFix: false,
      manual: '修改 ~/.openclaw/config.yaml，将 gateway.host 改为 "127.0.0.1" 或设置强密码',
      description: '限制网关暴露'
    },
    'doctor.feishu_open_policy': {
      autoFix: false,
      manual: '修改 config.yaml: channels.feishu.groupPolicy = "allowlist"',
      description: '设置 Feishu 群聊白名单'
    },
    'permissions.OpenClaw 主目录': {
      autoFix: true,
      command: 'chmod 700 ~/.openclaw',
      description: '修复主目录权限'
    },
    'permissions.凭证目录': {
      autoFix: true,
      command: 'chmod 700 ~/.openclaw/credentials',
      description: '修复凭证目录权限'
    }
  };
  
  return adviceMap[finding.id] || {
    autoFix: false,
    manual: finding.remediation || '请参考官方文档',
    description: '需要手动处理'
  };
}
