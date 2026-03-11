#!/usr/bin/env node
/**
 * 🦞 龙虾医院 - 报告生成器 (Reporter)
 * 
 * 将体检数据转换为美观的报告
 */

import { sortFindingsBySeverity, colorStatus, progressBar, generateAdvice } from './utils.mjs';

class ReportGenerator {
  constructor(report) {
    this.report = report;
    this.findings = sortFindingsBySeverity(report.findings || []);
  }

  /**
   * 生成终端报告
   */
  generateTerminalReport() {
    const lines = [];
    
    // 标题
    lines.push('');
    lines.push('╔══════════════════════════════════════════════════════════════╗');
    lines.push('║                    🦞 龙 虾 医 院 体 检 报 告                  ║');
    lines.push('╚══════════════════════════════════════════════════════════════╝');
    lines.push('');
    
    // 总体评分
    const health = this.report.overallHealth;
    const healthDisplay = {
      'excellent': { icon: '💚', text: '健康状态优秀', color: '\x1b[32m' },
      'fair': { icon: '💛', text: '健康状态良好', color: '\x1b[33m' },
      'poor': { icon: '🧡', text: '健康状态一般', color: '\x1b[33m' },
      'critical': { icon: '❤️', text: '健康状态危急', color: '\x1b[31m' }
    }[health] || { icon: '❓', text: '未知', color: '\x1b[0m' };
    
    lines.push(`${healthDisplay.color}${healthDisplay.icon} 总体评估: ${healthDisplay.text}\x1b[0m`);
    lines.push('');
    
    // 统计摘要
    const { critical, warning, info, healthy } = this.report.summary;
    lines.push('📊 问题统计:');
    lines.push(`   ${critical > 0 ? '🚨' : '⭕'} 危急: ${critical} 项`);
    lines.push(`   ${warning > 0 ? '⚠️' : '⭕'} 警告: ${warning} 项`);
    lines.push(`   ${info > 0 ? '💡' : '⭕'} 信息: ${info} 项`);
    lines.push(`   ${healthy > 0 ? '✅' : '⭕'} 健康: ${healthy} 项`);
    lines.push('');
    
    // 详细发现
    if (this.findings.length > 0) {
      lines.push('📋 详细诊断:');
      lines.push('─'.repeat(60));
      
      this.findings.forEach((finding, idx) => {
        const icon = colorStatus(finding.level);
        const levelText = {
          'critical': '[危急]',
          'warning': '[警告]',
          'info': '[信息]',
          'healthy': '[健康]'
        }[finding.level];
        
        lines.push(`${idx + 1}. ${icon} ${levelText}`);
        lines.push(`   ${finding.message}`);
        
        // 如果有修复建议
        const advice = generateAdvice(finding);
        if (advice && finding.level !== 'healthy') {
          if (advice.autoFix) {
            lines.push(`   💊 可自动修复: ${advice.command}`);
          } else if (advice.manual) {
            lines.push(`   📝 建议操作: ${advice.manual}`);
          }
        }
        lines.push('');
      });
    }
    
    // 系统信息
    lines.push('🔧 系统信息:');
    lines.push('─'.repeat(60));
    if (this.report.modules.environment) {
      lines.push(`   Node.js: ${this.report.modules.environment.node}`);
      lines.push(`   平台: ${this.report.modules.environment.platform} (${this.report.modules.environment.arch})`);
    }
    if (this.report.modules.openclaw) {
      lines.push(`   OpenClaw: ${this.report.modules.openclaw.version}`);
    }
    if (this.report.modules.disk) {
      lines.push(`   磁盘使用: ${progressBar(this.report.modules.disk.usagePercent)} ${this.report.modules.disk.usagePercent}%`);
    }
    lines.push('');
    
    // 页脚
    lines.push('─'.repeat(60));
    lines.push(`体检时间: ${new Date(this.report.timestamp).toLocaleString('zh-CN')}`);
    lines.push('💡 提示: 运行 "openclaw doctor --fix" 可自动修复部分问题');
    lines.push('');
    
    return lines.join('\n');
  }

  /**
   * 生成 Markdown 报告
   */
  generateMarkdownReport() {
    const lines = [];
    
    lines.push('# 🦞 龙虾医院体检报告');
    lines.push('');
    
    // 总体状态徽章
    const health = this.report.overallHealth;
    const badge = {
      'excellent': '![健康](https://img.shields.io/badge/健康-优秀-brightgreen)',
      'fair': '![健康](https://img.shields.io/badge/健康-良好-green)',
      'poor': '![健康](https://img.shields.io/badge/健康-一般-yellow)',
      'critical': '![健康](https://img.shields.io/badge/健康-危急-red)'
    }[health] || '';
    lines.push(badge);
    lines.push('');
    
    // 摘要表格
    lines.push('## 📊 问题统计');
    lines.push('');
    lines.push('| 级别 | 数量 |');
    lines.push('|------|------|');
    const { critical, warning, info, healthy } = this.report.summary;
    lines.push(`| 🚨 危急 | ${critical} |`);
    lines.push(`| ⚠️ 警告 | ${warning} |`);
    lines.push(`| 💡 信息 | ${info} |`);
    lines.push(`| ✅ 健康 | ${healthy} |`);
    lines.push('');
    
    // 详细发现
    if (this.findings.length > 0) {
      lines.push('## 📋 详细诊断');
      lines.push('');
      
      this.findings.forEach(finding => {
        const icon = {
          'critical': '🚨',
          'warning': '⚠️',
          'info': '💡',
          'healthy': '✅'
        }[finding.level];
        
        lines.push(`### ${icon} ${finding.message}`);
        lines.push('');
        
        if (finding.level !== 'healthy') {
          const advice = generateAdvice(finding);
          if (advice) {
            lines.push('**建议处理:**');
            if (advice.autoFix) {
              lines.push(`- 可自动修复: \`${advice.command}\``);
            }
            if (advice.manual) {
              lines.push(`- 手动操作: ${advice.manual}`);
            }
            lines.push('');
          }
        }
      });
    }
    
    // 系统信息
    lines.push('## 🔧 系统信息');
    lines.push('');
    lines.push('```');
    if (this.report.modules.environment) {
      lines.push(`Node.js: ${this.report.modules.environment.node}`);
      lines.push(`平台: ${this.report.modules.environment.platform}`);
    }
    if (this.report.modules.openclaw) {
      lines.push(`OpenClaw: ${this.report.modules.openclaw.version}`);
    }
    lines.push(`体检时间: ${new Date(this.report.timestamp).toLocaleString('zh-CN')}`);
    lines.push('```');
    lines.push('');
    
    lines.push('---');
    lines.push('*由 🦞 龙虾医院生成*');
    
    return lines.join('\n');
  }

  /**
   * 生成简短摘要（用于分享）
   */
  generateSummary() {
    const { critical, warning, info, healthy } = this.report.summary;
    const health = this.report.overallHealth;
    
    const healthText = {
      'excellent': '健康状态优秀 💚',
      'fair': '健康状态良好 💛',
      'poor': '健康状态一般 🧡',
      'critical': '健康状态危急 ❤️'
    }[health];
    
    return `🦞 龙虾医院体检结果: ${healthText}\n` +
           `发现问题: 🚨${critical} ⚠️${warning} 💡${info} ✅${healthy}\n` +
           `体检时间: ${new Date(this.report.timestamp).toLocaleString('zh-CN')}`;
  }
}

// CLI 入口
if (import.meta.url === `file://${process.argv[1]}`) {
  let reportData = '';
  
  process.stdin.on('data', chunk => {
    reportData += chunk;
  });
  
  process.stdin.on('end', () => {
    try {
      // 从输入中提取 JSON 报告
      const jsonMatch = reportData.match(/--- REPORT DATA ---\n(.+)/s);
      if (!jsonMatch) {
        console.error('未找到报告数据');
        process.exit(1);
      }
      
      const report = JSON.parse(jsonMatch[1]);
      const generator = new ReportGenerator(report);
      
      const format = process.argv.find(a => a.startsWith('--format='))?.split('=')[1] || 'terminal';
      
      switch (format) {
        case 'markdown':
        case 'md':
          console.log(generator.generateMarkdownReport());
          break;
        case 'summary':
          console.log(generator.generateSummary());
          break;
        default:
          console.log(generator.generateTerminalReport());
      }
    } catch (e) {
      console.error('报告生成失败:', e.message);
      process.exit(1);
    }
  });
}

export { ReportGenerator };
