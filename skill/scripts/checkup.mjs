#!/usr/bin/env node
/**
 * 🦞 龙虾医院 - 体检核心引擎 (Checkup Engine)
 * 
 * 执行全面的系统体检，收集各项指标数据
 */

import { execSync } from 'child_process';
import { readFileSync, statSync, readdirSync } from 'fs';
import { homedir } from 'os';
import path from 'path';
import { loadConfig, runCommand, formatBytes, colorStatus } from './utils.mjs';

const OPENCLAW_DIR = path.join(homedir(), '.openclaw');
const CONFIG_PATH = path.join(OPENCLAW_DIR, 'config.yaml');

class LobsterDoctor {
  constructor(options = {}) {
    this.options = options;
    this.report = {
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      summary: { critical: 0, warning: 0, info: 0, healthy: 0 },
      modules: {}
    };
    this.findings = [];
  }

  async runFullCheckup() {
    console.log('🦞 龙虾医院 - 全面体检开始\n');
    console.log('=' .repeat(50));
    
    // 一、望 - 基础体征
    await this.checkEnvironment();
    await this.checkOpenClawVersion();
    
    // 二、闻 - 核心系统
    await this.checkDoctorOutput();
    await this.checkHealthStatus();
    await this.checkSecurityAudit();
    
    // 三、问 - 通道健康
    await this.checkChannels();
    
    // 四、切 - 深度诊断
    await this.checkLogs();
    await this.checkFilePermissions();
    await this.checkDiskSpace();
    
    // 生成摘要
    this.generateSummary();
    
    console.log('\n' + '='.repeat(50));
    console.log('体检完成！');
    
    return this.report;
  }

  async checkEnvironment() {
    console.log('\n📊 [望] 基础体征检查...');
    
    const env = {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      cwd: process.cwd(),
      memory: {
        total: formatBytes(process.memoryUsage().heapTotal),
        used: formatBytes(process.memoryUsage().heapUsed),
        rss: formatBytes(process.memoryUsage().rss)
      }
    };
    
    // Node.js 版本检查
    const nodeVersion = process.version.match(/v(\d+)\./)?.[1];
    if (parseInt(nodeVersion) < 18) {
      this.addFinding('critical', 'environment.node_version', 
        `Node.js 版本过低: ${process.version}，建议升级到 v18+`);
    } else if (parseInt(nodeVersion) < 22) {
      this.addFinding('warning', 'environment.node_version', 
        `Node.js 版本 ${process.version}，建议升级到 v22+ 以获得更好稳定性`);
    } else {
      this.addFinding('healthy', 'environment.node_version', 
        `Node.js 版本 ${process.version} ✓`);
    }
    
    this.report.modules.environment = env;
  }

  async checkOpenClawVersion() {
    try {
      const version = runCommand('openclaw --version').trim();
      this.report.modules.openclaw = { version };
      this.addFinding('info', 'openclaw.version', `OpenClaw 版本: ${version}`);
    } catch (e) {
      this.addFinding('critical', 'openclaw.version', 
        '无法获取 OpenClaw 版本，请检查安装');
    }
  }

  async checkDoctorOutput() {
    console.log('\n🔍 [闻] 运行 openclaw doctor...');
    
    try {
      const output = runCommand('openclaw doctor 2>&1');
      
      // 解析关键信息
      const findings = [];
      
      // 检查状态目录权限
      if (output.includes('State directory permissions are too open')) {
        findings.push({
          level: 'warning',
          id: 'doctor.state_permissions',
          message: '状态目录权限过宽，建议 chmod 700 ~/.openclaw'
        });
      }
      
      // 检查会话完整性
      const sessionMatch = output.match(/(\d+)\/(\d+) recent sessions are missing transcripts/);
      if (sessionMatch && parseInt(sessionMatch[1]) > 0) {
        findings.push({
          level: 'info',
          id: 'doctor.session_integrity',
          message: `${sessionMatch[1]}/${sessionMatch[2]} 会话缺少记录`
        });
      }
      
      // 检查安全警告
      if (output.includes('Gateway bound to "lan"')) {
        findings.push({
          level: 'critical',
          id: 'doctor.gateway_exposure',
          message: 'Gateway 绑定到 0.0.0.0，存在公网暴露风险'
        });
      }
      
      // 检查 Feishu 配置
      if (output.includes('groupPolicy="open"')) {
        findings.push({
          level: 'critical',
          id: 'doctor.feishu_open_policy',
          message: 'Feishu 群聊策略为开放模式，建议设置为 allowlist'
        });
      }
      
      findings.forEach(f => this.addFinding(f.level, f.id, f.message));
      
      // 提取技能状态
      const skillsMatch = output.match(/Eligible:\s*(\d+)[\s\S]*?Missing requirements:\s*(\d+)/);
      if (skillsMatch) {
        this.report.modules.skills = {
          eligible: parseInt(skillsMatch[1]),
          missingRequirements: parseInt(skillsMatch[2])
        };
      }
      
    } catch (e) {
      this.addFinding('warning', 'doctor.execution', 
        `doctor 命令执行异常: ${e.message}`);
    }
  }

  async checkHealthStatus() {
    console.log('💓 [闻] 检查健康状态...');
    
    try {
      const output = runCommand('openclaw health --json 2>&1');
      const jsonStart = output.indexOf('{');
      if (jsonStart === -1) throw new Error('No JSON found');
      
      const health = JSON.parse(output.substring(jsonStart));
      this.report.modules.health = health;
      
      // 分析通道状态
      if (health.channels) {
        Object.entries(health.channels).forEach(([name, status]) => {
          if (!status.configured) {
            this.addFinding('info', `health.channel.${name}`, 
              `${name} 通道未配置`);
          } else if (!status.running && status.configured) {
            this.addFinding('warning', `health.channel.${name}`, 
              `${name} 通道已配置但未运行`);
          } else {
            this.addFinding('healthy', `health.channel.${name}`, 
              `${name} 通道运行正常 ✓`);
          }
        });
      }
      
    } catch (e) {
      this.addFinding('warning', 'health.parsing', 
        `健康检查数据解析失败: ${e.message}`);
    }
  }

  async checkSecurityAudit() {
    console.log('🛡️ [闻] 安全审计...');
    
    try {
      const output = runCommand('openclaw security audit --json 2>&1');
      const jsonStart = output.indexOf('"summary"');
      if (jsonStart === -1) throw new Error('No JSON found');
      
      // 找到完整的 JSON 对象
      const jsonStr = '{' + output.substring(output.indexOf('{', output.indexOf('summary')));
      const security = JSON.parse(jsonStr);
      this.report.modules.security = security;
      
      // 处理发现项
      if (security.findings) {
        security.findings.forEach(finding => {
          const levelMap = {
            'critical': 'critical',
            'warn': 'warning',
            'info': 'info'
          };
          this.addFinding(
            levelMap[finding.severity] || 'info',
            finding.checkId,
            `[${finding.title}] ${finding.detail}`,
            finding.remediation
          );
        });
      }
      
    } catch (e) {
      this.addFinding('warning', 'security.parsing', 
        `安全审计数据解析失败: ${e.message}`);
    }
  }

  async checkChannels() {
    console.log('\n📡 [问] 通道健康检查...');
    
    // 基于 health 数据进一步分析
    const health = this.report.modules.health;
    if (!health || !health.channels) return;
    
    Object.entries(health.channels).forEach(([name, status]) => {
      if (status.probe && status.lastProbeAt) {
        const lastProbe = Date.now() - status.lastProbeAt;
        const minutesAgo = Math.floor(lastProbe / 60000);
        
        if (minutesAgo > 60) {
          this.addFinding('warning', `channel.${name}.probe`, 
            `${name} 通道上次探测在 ${minutesAgo} 分钟前`);
        }
      }
    });
  }

  async checkLogs() {
    console.log('\n📜 [切] 日志分析...');
    
    try {
      const logsDir = path.join(OPENCLAW_DIR, 'logs');
      const files = readdirSync(logsDir).filter(f => f.endsWith('.log'));
      
      // 统计近期错误
      let errorCount = 0;
      let warningCount = 0;
      
      files.slice(-3).forEach(file => {
        try {
          const content = readFileSync(path.join(logsDir, file), 'utf8');
          const errors = content.match(/error|Error|ERROR/g) || [];
          const warnings = content.match(/warn|Warn|WARNING/g) || [];
          errorCount += errors.length;
          warningCount += warnings.length;
        } catch (e) {}
      });
      
      this.report.modules.logs = { errorCount, warningCount, files: files.length };
      
      if (errorCount > 50) {
        this.addFinding('warning', 'logs.error_rate', 
          `近期日志包含 ${errorCount} 个错误，建议检查详细日志`);
      }
      
    } catch (e) {
      this.addFinding('info', 'logs.analysis', '日志分析跳过');
    }
  }

  async checkFilePermissions() {
    console.log('🔐 [切] 权限检查...');
    
    const criticalPaths = [
      { path: OPENCLAW_DIR, name: 'OpenClaw 主目录', mode: 0o700 },
      { path: path.join(OPENCLAW_DIR, 'credentials'), name: '凭证目录', mode: 0o700 },
      { path: path.join(OPENCLAW_DIR, 'config.yaml'), name: '配置文件', mode: 0o600 }
    ];
    
    criticalPaths.forEach(({ path: p, name, mode }) => {
      try {
        const stats = statSync(p);
        const currentMode = stats.mode & 0o777;
        
        if (currentMode > mode) {
          this.addFinding('warning', `permissions.${name}`, 
            `${name} 权限过宽 (${currentMode.toString(8)})，建议改为 ${mode.toString(8)}`);
        }
      } catch (e) {
        this.addFinding('info', `permissions.${name}`, `${name} 不存在或无法访问`);
      }
    });
  }

  async checkDiskSpace() {
    console.log('💾 [切] 磁盘空间检查...');
    
    try {
      const output = runCommand('df -h ~ 2>/dev/null || df -h $HOME');
      const lines = output.trim().split('\n');
      if (lines.length >= 2) {
        const usageMatch = lines[1].match(/(\d+)%/);
        if (usageMatch) {
          const usage = parseInt(usageMatch[1]);
          this.report.modules.disk = { usagePercent: usage };
          
          if (usage > 90) {
            this.addFinding('critical', 'disk.space', 
              `磁盘使用率 ${usage}%，即将耗尽！`);
          } else if (usage > 80) {
            this.addFinding('warning', 'disk.space', 
              `磁盘使用率 ${usage}%，建议清理`);
          } else {
            this.addFinding('healthy', 'disk.space', 
              `磁盘使用率 ${usage}% ✓`);
          }
        }
      }
    } catch (e) {
      this.addFinding('info', 'disk.check', '磁盘检查跳过');
    }
  }

  addFinding(level, id, message, remediation = null) {
    const finding = { level, id, message, remediation, timestamp: Date.now() };
    this.findings.push(finding);
    this.report.summary[level === 'healthy' ? 'healthy' : level]++;
  }

  generateSummary() {
    this.report.findings = this.findings;
    this.report.overallHealth = this.calculateOverallHealth();
  }

  calculateOverallHealth() {
    const { critical, warning } = this.report.summary;
    if (critical > 0) return 'critical';
    if (warning > 3) return 'poor';
    if (warning > 0) return 'fair';
    return 'excellent';
  }
}

// CLI 入口
const options = {
  urgent: process.argv.includes('--urgent'),
  module: process.argv.find(a => a.startsWith('--module='))?.split('=')[1],
  json: process.argv.includes('--json')
};

const doctor = new LobsterDoctor(options);
doctor.runFullCheckup().then(report => {
  if (options.json) {
    console.log('\n--- JSON REPORT ---');
    console.log(JSON.stringify(report, null, 2));
  }
  
  // 保存报告供后续使用
  console.log('\n--- REPORT DATA ---');
  console.log(JSON.stringify(report)); process.exit(0);
}).catch(err => {
  console.error('体检失败:', err.message);
  process.exit(1);
});
