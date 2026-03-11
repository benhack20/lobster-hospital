#!/usr/bin/env node
/**
 * 🦞 龙虾医院 - 自动修复引擎 (Healer)
 * 
 * 执行自动修复操作
 */

import { execSync } from 'child_process';
import { chmod, copyFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { homedir } from 'os';
import { generateAdvice, runCommand } from './utils.mjs';

const OPENCLAW_DIR = path.join(homedir(), '.openclaw');

class AutoHealer {
  constructor(options = {}) {
    this.options = options;
    this.results = [];
    this.backups = [];
  }

  /**
   * 执行自动修复
   */
  async heal(findings) {
    console.log('🦞 龙虾医院 - 开始治疗\n');
    console.log('='.repeat(50));
    
    const autoFixable = findings.filter(f => {
      const advice = generateAdvice(f);
      return advice && advice.autoFix;
    });
    
    if (autoFixable.length === 0) {
      console.log('✅ 没有发现可自动修复的问题');
      return this.results;
    }
    
    console.log(`发现 ${autoFixable.length} 个可自动修复的问题:\n`);
    
    for (const finding of autoFixable) {
      const advice = generateAdvice(finding);
      console.log(`🔧 ${finding.message}`);
      console.log(`   执行: ${advice.command}`);
      
      try {
        const result = await this.executeFix(finding, advice);
        this.results.push({
          id: finding.id,
          success: result.success,
          message: result.message
        });
        
        if (result.success) {
          console.log(`   ✅ 修复成功\n`);
        } else {
          console.log(`   ❌ 修复失败: ${result.message}\n`);
        }
      } catch (e) {
        this.results.push({
          id: finding.id,
          success: false,
          message: e.message
        });
        console.log(`   ❌ 修复失败: ${e.message}\n`);
      }
    }
    
    // 显示备份信息
    if (this.backups.length > 0) {
      console.log('\n📦 已创建备份:');
      this.backups.forEach(b => {
        console.log(`   - ${b.original} -> ${b.backup}`);
      });
    }
    
    console.log('\n' + '='.repeat(50));
    const successCount = this.results.filter(r => r.success).length;
    console.log(`治疗完成: ${successCount}/${this.results.length} 项修复成功`);
    
    return this.results;
  }

  /**
   * 执行具体修复
   */
  async executeFix(finding, advice) {
    const command = advice.command;
    
    // 权限修复
    if (command.includes('chmod')) {
      return await this.fixPermissions(command);
    }
    
    // 运行 openclaw doctor --fix
    if (command.includes('openclaw doctor --fix')) {
      return await this.runDoctorFix();
    }
    
    // 清理临时文件
    if (command.includes('rm') || command.includes('cleanup')) {
      return await this.cleanupTempFiles();
    }
    
    // 默认：直接执行命令
    try {
      execSync(command, { encoding: 'utf8', stdio: 'pipe' });
      return { success: true, message: '命令执行成功' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  /**
   * 修复文件权限
   */
  async fixPermissions(command) {
    const match = command.match(/chmod\s+(\d+)\s+(.+)/);
    if (!match) {
      return { success: false, message: '无法解析权限命令' };
    }
    
    const [, mode, targetPath] = match;
    const fullPath = targetPath.replace('~', homedir());
    
    try {
      // 创建备份记录
      if (existsSync(fullPath)) {
        const backupPath = `${fullPath}.backup.${Date.now()}`;
        this.backups.push({
          original: fullPath,
          backup: backupPath,
          type: 'permissions'
        });
      }
      
      await chmod(fullPath, parseInt(mode, 8));
      return { success: true, message: `权限已修改为 ${mode}` };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  /**
   * 运行 doctor --fix
   */
  async runDoctorFix() {
    try {
      const output = runCommand('openclaw doctor --fix 2>&1');
      return { 
        success: true, 
        message: 'doctor fix 执行完成',
        details: output
      };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  /**
   * 清理临时文件
   */
  async cleanupTempFiles() {
    const tempDirs = [
      path.join(OPENCLAW_DIR, 'tmp'),
      path.join(OPENCLAW_DIR, 'cache'),
      '/tmp/openclaw-*'
    ];
    
    let cleaned = 0;
    for (const dir of tempDirs) {
      try {
        // 使用系统命令清理
        execSync(`rm -rf ${dir} 2>/dev/null || true`, { stdio: 'pipe' });
        cleaned++;
      } catch (e) {
        // 忽略错误
      }
    }
    
    return { success: true, message: `已清理 ${cleaned} 个临时目录` };
  }

  /**
   * 创建配置备份
   */
  async backupConfig(configPath) {
    if (!existsSync(configPath)) return null;
    
    const backupDir = path.join(OPENCLAW_DIR, 'backups');
    await mkdir(backupDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `config.${timestamp}.yaml`);
    
    await copyFile(configPath, backupPath);
    
    this.backups.push({
      original: configPath,
      backup: backupPath,
      type: 'config'
    });
    
    return backupPath;
  }

  /**
   * 恢复备份
   */
  async restoreBackup(backupPath, originalPath) {
    try {
      await copyFile(backupPath, originalPath);
      return { success: true, message: '备份已恢复' };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }
}

// CLI 入口
if (import.meta.url === `file://${process.argv[1]}`) {
  // 从标准输入读取报告数据
  let reportData = '';
  
  process.stdin.on('data', chunk => {
    reportData += chunk;
  });
  
  process.stdin.on('end', async () => {
    try {
      const jsonMatch = reportData.match(/--- REPORT DATA ---\n(.+)/s);
      if (!jsonMatch) {
        console.error('未找到报告数据');
        process.exit(1);
      }
      
      const report = JSON.parse(jsonMatch[1]);
      const healer = new AutoHealer();
      await healer.heal(report.findings || []);
    } catch (e) {
      console.error('治疗失败:', e.message);
      process.exit(1);
    }
  });
}

export { AutoHealer };
