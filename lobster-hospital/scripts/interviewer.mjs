#!/usr/bin/env node
/**
 * 🦞 龙虾医院 - 问诊对话系统 (Interviewer)
 * 
 * 基于体检结果进行智能问诊
 */

import { generateAdvice } from './utils.mjs';

class Interviewer {
  constructor(report) {
    this.report = report;
    this.findings = report.findings || [];
    this.questions = [];
    this.responses = [];
  }

  /**
   * 生成问诊问题
   */
  generateQuestions() {
    const critical = this.findings.filter(f => f.level === 'critical');
    const warnings = this.findings.filter(f => f.level === 'warning');
    
    // 基于危急问题生成针对性问题
    critical.forEach(finding => {
      const question = this.createQuestionForFinding(finding);
      if (question) this.questions.push(question);
    });
    
    // 基于警告生成一般性问题
    if (warnings.length > 0) {
      this.questions.push({
        id: 'general.symptoms',
        type: 'open',
        text: '最近在使用 OpenClaw 时，有没有遇到什么让你困扰的问题？比如响应变慢、偶尔报错、或者某些功能不正常？',
        context: 'general'
      });
    }
    
    // 特定场景问题
    const hasGatewayIssue = this.findings.some(f => 
      f.id.includes('gateway') || f.id.includes('exposure')
    );
    if (hasGatewayIssue) {
      this.questions.push({
        id: 'security.deployment',
        type: 'choice',
        text: '这个 OpenClaw 实例是部署在什么环境？',
        options: ['本地个人电脑', '家庭内网服务器', '云服务器（有公网IP）', 'Docker/VPS'],
        context: 'security'
      });
    }
    
    const hasModelIssue = this.findings.some(f => 
      f.id.includes('model') || f.message.includes('401') || f.message.includes('429')
    );
    if (hasModelIssue) {
      this.questions.push({
        id: 'model.usage',
        type: 'open',
        text: '最近模型的使用还正常吗？API Key 的额度还充足吗？',
        context: 'model'
      });
    }
    
    const hasLatencyIssue = this.findings.some(f => 
      f.id.includes('latency') || f.message.includes('延迟')
    );
    if (hasLatencyIssue) {
      this.questions.push({
        id: 'performance.scenario',
        type: 'open',
        text: '主要在什么场景下感觉比较慢？是图片处理、长文本生成，还是日常对话？',
        context: 'performance'
      });
    }
    
    // 如果没有发现问题，询问满意度
    if (this.findings.length === 0 || this.findings.every(f => f.level === 'healthy')) {
      this.questions.push({
        id: 'satisfaction.general',
        type: 'choice',
        text: '太好了！体检结果显示一切正常。你对目前 OpenClaw 的使用体验满意吗？',
        options: ['非常满意', '基本满意', '有些小问题', '不太满意'],
        context: 'satisfaction'
      });
    }
    
    return this.questions;
  }

  /**
   * 为具体发现项创建问题
   */
  createQuestionForFinding(finding) {
    const questionMap = {
      'doctor.gateway_exposure': {
        id: 'security.public_access',
        type: 'confirm',
        text: '🚨 我发现 Gateway 绑定了 0.0.0.0，这意味着它可能暴露在公网。你确认这是必要的吗？如果是公网部署，建议设置强密码保护。',
        context: 'security'
      },
      'doctor.feishu_open_policy': {
        id: 'channel.feishu_groups',
        type: 'confirm',
        text: '⚠️ Feishu 群聊目前设置为开放模式，任何群成员都可以触发我。这在公开群组可能存在风险，需要我帮你设置为白名单模式吗？',
        context: 'channel'
      },
      'permissions.凭证目录': {
        id: 'security.credentials',
        type: 'confirm',
        text: '🔐 凭证目录的权限设置比较宽松，其他系统用户可能可以访问。这通常发生在多用户服务器上，需要我帮你收紧权限吗？',
        context: 'security'
      },
      'disk.space': {
        id: 'maintenance.disk',
        type: 'confirm',
        text: '💾 磁盘空间使用率较高，可能会影响性能。需要我帮你清理一些临时文件吗？',
        context: 'maintenance'
      }
    };
    
    return questionMap[finding.id] || {
      id: `general.${finding.id}`,
      type: 'confirm',
      text: `关于"${finding.message}"这个问题，你希望怎么处理？`,
      context: 'general'
    };
  }

  /**
   * 医生口吻格式化问题
   */
  formatAsDoctor(question, index) {
    const intros = [
      '🩺 医生小狐：',
      '🦞 让我问问你：',
      '💭 接下来想了解一下：',
      '📝 还有一个问题：'
    ];
    
    const intro = intros[Math.min(index, intros.length - 1)];
    return `${intro}\n\n${question.text}`;
  }

  /**
   * 根据回答生成建议
   */
  generateRecommendation(question, answer) {
    const recommendations = [];
    
    switch (question.id) {
      case 'security.public_access':
        if (answer === 'yes' || answer.includes('公网')) {
          recommendations.push({
            type: 'urgent',
            text: '建议立即修改 config.yaml，设置强密码：\n```yaml\ngateway:\n  auth:\n    enabled: true\n    password: your-strong-password\n```'
          });
        }
        break;
        
      case 'channel.feishu_groups':
        if (answer === 'yes' || answer.includes('设置')) {
          recommendations.push({
            type: 'action',
            text: '请在 config.yaml 中添加白名单配置：\n```yaml\nchannels:\n  feishu:\n    groupPolicy: allowlist\n    groupAllowFrom:\n      - your-open-id-here\n```'
          });
        }
        break;
        
      case 'security.credentials':
        if (answer === 'yes') {
          recommendations.push({
            type: 'auto',
            text: '已准备自动修复凭证目录权限',
            command: 'chmod 700 ~/.openclaw/credentials'
          });
        }
        break;
        
      case 'maintenance.disk':
        if (answer === 'yes') {
          recommendations.push({
            type: 'auto',
            text: '已准备清理临时文件',
            command: 'openclaw doctor --fix'
          });
        }
        break;
    }
    
    return recommendations;
  }

  /**
   * 生成问诊总结
   */
  generateSummary() {
    const lines = [];
    
    lines.push('🦞 龙虾医院问诊记录');
    lines.push('='.repeat(40));
    lines.push('');
    
    if (this.responses.length === 0) {
      lines.push('本次体检未发现需要特别询问的问题。');
    } else {
      lines.push('根据问诊，我了解到以下情况：');
      lines.push('');
      
      this.responses.forEach((resp, idx) => {
        lines.push(`${idx + 1}. ${resp.question}`);
        lines.push(`   你的回答: ${resp.answer}`);
        if (resp.recommendations && resp.recommendations.length > 0) {
          lines.push('   我的建议:');
          resp.recommendations.forEach(rec => {
            lines.push(`   - ${rec.text}`);
          });
        }
        lines.push('');
      });
    }
    
    lines.push('='.repeat(40));
    lines.push('💡 如需执行自动修复，请告诉我"开始治疗"');
    
    return lines.join('\n');
  }

  /**
   * 记录回答
   */
  recordResponse(question, answer, recommendations = []) {
    this.responses.push({
      question: question.text,
      answer,
      recommendations,
      timestamp: Date.now()
    });
  }
}

// CLI 入口
if (import.meta.url === `file://${process.argv[1]}`) {
  // 从标准输入读取报告数据
  let reportData = '';
  
  process.stdin.on('data', chunk => {
    reportData += chunk;
  });
  
  process.stdin.on('end', () => {
    try {
      const jsonMatch = reportData.match(/--- REPORT DATA ---\n(.+)/s);
      if (!jsonMatch) {
        console.error('未找到报告数据');
        process.exit(1);
      }
      
      const report = JSON.parse(jsonMatch[1]);
      const interviewer = new Interviewer(report);
      const questions = interviewer.generateQuestions();
      
      console.log('🦞 龙虾医院 - 智能问诊\n');
      console.log('='.repeat(50));
      console.log('');
      
      if (questions.length === 0) {
        console.log('✅ 体检结果良好，暂无需要询问的问题');
      } else {
        console.log(`基于体检结果，我有 ${questions.length} 个问题想问你：\n`);
        
        questions.forEach((q, idx) => {
          console.log(interviewer.formatAsDoctor(q, idx));
          console.log('');
          if (q.options) {
            console.log('选项:');
            q.options.forEach((opt, i) => {
              console.log(`  ${i + 1}. ${opt}`);
            });
          }
          console.log('');
          console.log('-'.repeat(50));
          console.log('');
        });
      }
      
      // 输出序列化的问诊数据供后续使用
      console.log('--- INTERVIEW DATA ---');
      console.log(JSON.stringify({ questions }));
      
    } catch (e) {
      console.error('问诊生成失败:', e.message);
      process.exit(1);
    }
  });
}

export { Interviewer };
