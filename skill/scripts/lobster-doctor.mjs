#!/usr/bin/env node
/**
 * 🦞 龙虾医院 - 沉浸式诊疗体验
 * 
 * 让用户感觉真的有一只小龙虾在接受医生的看诊
 */

import { execSync } from 'child_process';
import { statSync } from 'fs';
import { homedir } from 'os';
import path from 'path';

// ============ 角色台词库 ============

const DOCTOR_LINES = {
  // 接诊
  welcome: [
    "来啦来啦～让我看看你的小龙虾 🦞",
    "嗯...它看起来有点紧张呢。别担心，把它交给我，我会给它做个全面检查。",
    "先让它在诊台上躺好，我们开始吧～"
  ],
  
  // 体检开始
  checkupStart: [
    "好，我们先量个体温...",
    "来，听听心跳...",
    "再看看它的胃口怎么样...",
    "检查一下它有没有做噩梦..."
  ],
  
  // 发现问题（温和版）
  foundIssue: {
    critical: [
      "哎呀，这个有点严重呢...",
      "你的小龙虾现在有点危险...",
      "这个问题得赶紧处理..."
    ],
    warning: [
      "这里有点小毛病...",
      "嗯...这里不太对劲...",
      "需要注意一下..."
    ],
    info: [
      "顺便说一句...",
      "还有个小事情...",
      "另外..."
    ]
  },
  
  // 拟人化描述
  metaphors: {
    nodeVersion: { good: "体温正常", bad: "体温有点低" },
    gateway: { good: "大门关得好好的", bad: "大门敞开着，谁都能进来", critical: "大门敞开还住在街上，太危险了" },
    permissions: { good: "衣服穿得整整齐齐", bad: "衣服有点松", critical: "衣服几乎没穿，太暴露了" },
    disk: { good: "胃口很好", bad: "有点消化不良", critical: "吃太撑了，快撑坏了" },
    logs: { good: "睡得很香", bad: "有点做噩梦", critical: "噩梦连连，睡不好" },
    channels: { good: "心跳平稳", bad: "心跳有点快", critical: "心跳很乱" }
  },
  
  // 问诊
  inquiry: [
    "检查完了，你的小龙虾确实有些小毛病...",
    "我想问问你，作为它的主人...",
    "它平时有没有跟你抱怨过什么？"
  ],
  
  // 治疗
  healing: {
    start: "好，我现在开始治疗...",
    success: "完成！它现在感觉好多了～",
    needHelp: "这个需要主人你帮忙...",
    autoFix: "这个我帮它搞定～"
  },
  
  // 结束
  goodbye: {
    healthy: "你的小龙虾很健康！记得定期复查哦～",
    treated: "治疗结束！你的小龙虾现在精神多了 🎉 它让我转告你：谢谢主人带它来看病～",
    followUp: "过几天记得带它来复查，看看恢复得怎么样～"
  }
};

// ============ 工具函数 ============

function say(role, lines, delay = 0) {
  const prefix = role === 'doctor' ? '🩺 医生小狐：' : '';
  const text = Array.isArray(lines) ? lines.join('\n') : lines;
  console.log(`\n${prefix}\n\n${text}\n`);
}

function randomLine(lines) {
  return lines[Math.floor(Math.random() * lines.length)];
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ============ 体检检查 ============

async function runCheckup() {
  const findings = [];
  const health = {
    node: 'unknown',
    gateway: 'unknown',
    permissions: 'unknown',
    disk: 'unknown',
    channels: 'unknown'
  };
  
  // 1. 检查 Node.js（体温）
  say('doctor', "好，我们先量个体温...");
  await sleep(500);
  
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.match(/v(\d+)/)?.[1] || '0');
  health.node = majorVersion >= 22 ? 'good' : majorVersion >= 18 ? 'fair' : 'poor';
  
  const tempDesc = health.node === 'good' 
    ? "体温正常，是个健康的小家伙！" 
    : health.node === 'fair'
    ? "体温有点偏低，建议多穿点衣服（升级 Node.js）"
    : "体温太低了，需要保暖（强烈建议升级 Node.js）";
  
  console.log(`   🌡️ ${tempDesc} (${nodeVersion})`);
  
  if (health.node !== 'good') {
    findings.push({ level: 'warning', type: 'node', message: tempDesc });
  }
  
  // 2. 检查 Gateway（大门）
  say('doctor', "来，看看它住的房子...");
  await sleep(500);
  
  try {
    const doctorOutput = execSync('openclaw doctor 2>&1', { encoding: 'utf8', timeout: 10000 });
    
    if (doctorOutput.includes('Gateway bound to "lan"')) {
      health.gateway = 'critical';
      findings.push({ 
        level: 'critical', 
        type: 'gateway', 
        message: "大门敞开还住在街上（公网暴露），太危险了！" 
      });
      console.log("   🏠 ⚠️ 大门敞开，谁都能进来！");
    } else if (doctorOutput.includes('groupPolicy="open"')) {
      health.gateway = 'warning';
      findings.push({ 
        level: 'warning', 
        type: 'gateway', 
        message: "大门敞开（Feishu 开放模式）" 
      });
      console.log("   🏠 ⚠️ 大门没关好（Feishu 开放）");
    } else {
      health.gateway = 'good';
      console.log("   🏠 ✅ 大门关得好好的");
    }
    
    // 检查权限（衣服）
    say('doctor', "检查一下衣服穿得怎么样...");
    await sleep(500);
    
    if (doctorOutput.includes('State directory permissions are too open')) {
      health.permissions = 'warning';
      findings.push({ 
        level: 'warning', 
        type: 'permissions', 
        message: "衣服穿得有点松（目录权限过宽）" 
      });
      console.log("   👔 ⚠️ 衣服有点松");
    } else {
      health.permissions = 'good';
      console.log("   👔 ✅ 衣服穿得整整齐齐");
    }
    
  } catch (e) {
    console.log("   ⚠️ 检查被中断了...");
  }
  
  // 3. 检查磁盘（胃口）
  say('doctor', "再看看它的胃口...");
  await sleep(500);
  
  try {
    const dfOutput = execSync('df -h ~ 2>/dev/null || df -h $HOME', { encoding: 'utf8' });
    const usageMatch = dfOutput.match(/(\d+)%/);
    if (usageMatch) {
      const usage = parseInt(usageMatch[1]);
      if (usage > 90) {
        health.disk = 'critical';
        findings.push({ level: 'critical', type: 'disk', message: "吃太撑了，快撑坏了（磁盘快满）" });
        console.log(`   🍽️ 🚨 吃太撑了！${usage}% 快撑坏了`);
      } else if (usage > 80) {
        health.disk = 'warning';
        findings.push({ level: 'warning', type: 'disk', message: "有点消化不良（磁盘较满）" });
        console.log(`   🍽️ ⚠️ 有点消化不良 ${usage}%`);
      } else {
        health.disk = 'good';
        console.log(`   🍽️ ✅ 胃口很好 ${usage}%`);
      }
    }
  } catch (e) {
    console.log("   ⚠️ 胃口检查不了...");
  }
  
  return { findings, health };
}

// ============ 问诊 ============

async function runInquiry(findings) {
  const criticalCount = findings.filter(f => f.level === 'critical').length;
  const warningCount = findings.filter(f => f.level === 'warning').length;
  
  if (criticalCount > 0) {
    say('doctor', randomLine(DOCTOR_LINES.foundIssue.critical));
  } else if (warningCount > 0) {
    say('doctor', randomLine(DOCTOR_LINES.foundIssue.warning));
  } else {
    say('doctor', "好消息！你的小龙虾很健康～");
    return;
  }
  
  say('doctor', "检查完了，你的小龙虾确实有些小毛病...\n\n让我给你说说：\n");
  
  findings.forEach((f, i) => {
    const icon = f.level === 'critical' ? '🚨' : f.level === 'warning' ? '⚠️' : '💡';
    console.log(`   ${i + 1}. ${icon} ${f.message}`);
  });
  
  console.log("\n");
  say('doctor', "我想问问你，作为它的主人...\n\n最近它有没有跟你抱怨过什么？比如反应变慢、偶尔报错、或者某些功能不正常？");
}

// ============ 生成病历卡 ============

function generateMedicalCard(findings, health) {
  const criticalCount = findings.filter(f => f.level === 'critical').length;
  const warningCount = findings.filter(f => f.level === 'warning').length;
  
  const status = criticalCount > 0 ? '⚠️ 需要紧急治疗' 
    : warningCount > 0 ? '💊 需要调理' 
    : '✅ 非常健康';
  
  console.log(`
╔════════════════════════════════════════╗
║      🦞 小 龙 虾 病 历 卡              ║
╠════════════════════════════════════════╣
║ 患者姓名：用户的小龙虾                 ║
║ 就诊时间：${new Date().toLocaleString('zh-CN')}           ║
║ 主治医生：小狐 🦊                      ║
╠════════════════════════════════════════╣
║ 健康状况：${status.padEnd(25)}║
║                                         ║
║ 🩺 诊断结果：                          ║
${findings.slice(0, 5).map(f => `║   ${(f.level === 'critical' ? '🚨' : f.level === 'warning' ? '⚠️' : '💡') + ' ' + f.message.substring(0, 28).padEnd(28)}║`).join('\n')}
${findings.length > 5 ? `║   ...还有 ${findings.length - 5} 项问题              ║` : ''}
║                                         ║
║ 💊 建议：                              ║
║   ${(criticalCount > 0 ? '需要立即治疗' : warningCount > 0 ? '建议调理' : '定期复查即可').padEnd(33)}║
╚════════════════════════════════════════╝
`);
}

// ============ 治疗建议 ============

function generateTreatment(findings) {
  const autoFixable = findings.filter(f => 
    f.type === 'permissions' || f.type === 'disk'
  );
  
  const needManual = findings.filter(f => 
    f.type === 'gateway' || f.type === 'config'
  );
  
  say('doctor', DOCTOR_LINES.healing.start);
  
  if (autoFixable.length > 0) {
    console.log("\n🤖 我可以自动帮它处理的问题：\n");
    autoFixable.forEach(f => {
      console.log(`   ✅ ${f.message}`);
      if (f.type === 'permissions') {
        console.log(`      → 执行: chmod 700 ~/.openclaw`);
      }
    });
  }
  
  if (needManual.length > 0) {
    console.log("\n👤 需要主人你帮忙的问题：\n");
    needManual.forEach(f => {
      console.log(`   📝 ${f.message}`);
      if (f.type === 'gateway') {
        console.log(`      → 修改 ~/.openclaw/config.yaml`);
        console.log(`      → 设置 gateway.host = "127.0.0.1"`);
      }
    });
  }
  
  console.log("\n");
}

// ============ 主流程 ============

async function main() {
  // 欢迎
  console.log(`
    🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞
    🦞                                               🦞
    🦞           🏥 龙 虾 医 院 🏥                  🦞
    🦞                                               🦞
    🦞        你的 OpenClaw 小龙虾专科医生          🦞
    🦞                                               🦞
    🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞
  `);
  
  say('doctor', DOCTOR_LINES.welcome);
  
  // 体检
  console.log("\n" + "=".repeat(50) + "\n");
  const { findings, health } = await runCheckup();
  
  // 问诊
  console.log("\n" + "=".repeat(50) + "\n");
  await runInquiry(findings);
  
  // 病历卡
  console.log("\n" + "=".repeat(50) + "\n");
  generateMedicalCard(findings, health);
  
  // 治疗建议
  if (findings.length > 0) {
    console.log("=".repeat(50) + "\n");
    generateTreatment(findings);
  }
  
  // 结束
  console.log("=".repeat(50) + "\n");
  const criticalCount = findings.filter(f => f.level === 'critical').length;
  const warningCount = findings.filter(f => f.level === 'warning').length;
  
  if (criticalCount === 0 && warningCount === 0) {
    say('doctor', DOCTOR_LINES.goodbye.healthy);
  } else {
    say('doctor', DOCTOR_LINES.goodbye.treated);
  }
  
  say('doctor', DOCTOR_LINES.goodbye.followUp);
  
  console.log(`
    🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞
  `);
}

main().catch(e => {
  console.error("哎呀，出错了：", e.message);
  process.exit(1);
});
