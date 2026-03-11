#!/usr/bin/env node
/**
 * 🦞 龙虾医院 v3.1 - 沉浸式诊疗体验
 * 
 * 核心：情绪价值 > 技术准确性
 * 体验：让用户感觉真的有一只小龙虾在接受诊疗
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { homedir } from 'os';
import path from 'path';
import readline from 'readline';

// ============ 小龙虾状态（情感化）============

class LobsterPatient {
  constructor() {
    this.name = "不知名小龙虾";
    this.mood = "nervous"; // nervous, calm, happy, scared
    this.symptoms = [];
    this.treatmentHistory = [];
    this.checkupResults = {};
  }

  getMoodEmoji() {
    return {
      nervous: "😰",
      calm: "😌", 
      happy: "😊",
      scared: "😱",
      sleepy: "😴",
      excited: "✨"
    }[this.mood] || "🦞";
  }

  getMoodDescription() {
    return {
      nervous: "有点紧张，小钳子微微发抖",
      calm: "很放松，安静地趴在诊台上",
      happy: "很开心，小尾巴轻轻摇摆",
      scared: "很害怕，想躲起来",
      sleepy: "昏昏欲睡，没什么精神",
      excited: "很兴奋，迫不及待想检查"
    }[this.mood] || "看起来还行";
  }
}
// ============ 医生台词库（丰富版）============

const DOCTOR_DIALOGUE = {
  // 接诊 - 根据小龙虾状态变化
  welcome: {
    firstTime: [
      "欢迎来到龙虾医院！🏥",
      "我是医生小狐，专门照顾 OpenClaw 小龙虾的～",
      "让我看看...哦！这是你的小龙虾吗？{mood_emoji} {mood_desc}",
      "别担心，我会好好照顾它的。来，让它躺到诊台上，我们开始了～"
    ],
    returnVisit: [
      "欢迎回来！🏥",
      "让我看看你的小龙虾...哦！它还记得我呢！{mood_emoji}",
      "上次治疗后它恢复得怎么样？",
      "来，我们再给它做个检查，看看身体怎么样了～"
    ]
  },
  
  // 体检过程中的互动
  checkup: {
    start: "好，我们先从基础检查开始...",
    
    temperature: {
      checking: "先量个体温...🌡️ 把温度计放到它的小钳子下面...",
      good: "嗯～体温正常！{patient}很健康呢～",
      fair: "体温有点偏低...{patient}可能有点怕冷",
      poor: "哎呀，体温太低了！{patient}需要保暖"
    },
    
    heartbeat: {
      checking: "听听心跳...💓 把听诊器放在它的小胸口...",
      good: "心跳很平稳，很有节奏感～",
      fast: "心跳有点快...{patient}是不是有点紧张？",
      irregular: "心跳有点乱...让我再仔细听听"
    },
    
    home: {
      checking: "看看它住的房子...🏠",
      good: "房子很安全，门关得紧紧的～",
      open: "哎呀，大门敞开着！{patient}会没有安全感",
      exposed: "天哪！大门敞开还住在街上！{patient}太危险了😰"
    },
    
    clothes: {
      checking: "检查一下衣服穿得怎么样...👔",
      good: "衣服穿得整整齐齐，很体面～",
      loose: "衣服有点松...{patient}需要系紧腰带",
      exposed: "衣服几乎没穿！{patient}太暴露了😳"
    },
    
    appetite: {
      checking: "再看看它的胃口...🍽️",
      good: "胃口很好，吃嘛嘛香！",
      bloated: "有点消化不良...{patient}吃太杂了",
      full: "吃太撑了！{patient}快撑坏了，要节食"
    },
    
    sleep: {
      checking: "最后检查一下睡眠质量...😴",
      good: "睡得很香，没有噩梦～",
      nightmare: "有点做噩梦...{patient}最近压力大",
      insomnia: "噩梦连连！{patient}睡不好，需要安抚"
    }
  },
  
  // 发现问题时的反应
  findings: {
    critical: [
      "哎呀...这个有点严重😟",
      "{patient}现在有点危险，我们得赶紧处理",
      "别担心，有我在，会好起来的"
    ],
    warning: [
      "嗯...这里有点小问题🤔",
      "{patient}这里不太舒服，需要注意一下",
      "早发现早治疗，很快就好了"
    ],
    good: [
      "很好！这里没问题✨",
      "{patient}这方面很健康呢～",
      "继续保持！"
    ]
  },
  
  // 问诊
  inquiry: {
    intro: "检查做完了，让我给你说说{patient}的情况...\n\n{mood_emoji} {mood_desc}",
    
    hasProblems: [
      "我发现{patient}确实有些小毛病...",
      "它现在有点{symptom_desc}",
      "我想问问你，作为它的主人..."
    ],
    
    noProblems: [
      "好消息！{patient}很健康！🎉",
      "各项指标都很好，是个健康的小家伙～",
      "继续保持，定期复查就好！"
    ],
    
    questions: {
      deployment: "它是住在家里（本地）还是住在街上（公网）？",
      symptoms: "最近{patient}有没有跟你抱怨过什么？比如反应变慢、偶尔报错？",
      usage: "你平时主要让它做什么工作？处理很多任务吗？",
      feelings: "你希望我怎么帮它？需要我立即治疗吗？"
    }
  },
  
  // 病历卡
  medicalCard: {
    header: "来，这是{patient}的病历卡，你收好～",
    footer: "记得保管好，下次复查要用"
  },
  
  // 治疗
  treatment: {
    intro: "好，我现在开始给{patient}治疗...",
    preparing: "先准备好工具...🔧",
    
    autoFix: {
      start: "这个我可以直接帮它处理～",
      doing: "正在治疗...",
      success: "完成！{patient}感觉好多了{mood_emoji}"
    },
    
    manualFix: {
      explain: "这个需要主人你帮忙...",
      instruct: "请你按我说的做：",
      confirm: "做完后告诉我，我看看{patient}恢复得怎么样"
    },
    
    comfort: "治疗可能会有点不舒服，{patient}要坚强哦💪"
  },
  
  // 结束
  goodbye: {
    healthy: [
      "{patient}很健康！可以安心回家了～",
      "记得定期带它来复查哦！",
      "拜拜！{patient}要听主人的话～👋"
    ],
    
    treated: [
      "治疗结束！{patient}现在精神多了{mood_emoji}",
      "它让我转告你：谢谢主人带它来看病～",
      "它会好好听话，好好恢复的！"
    ],
    
    followUp: [
      "过几天记得带它来复查，看看恢复得怎么样～",
      "如果{patient}有什么不舒服，随时来找我！",
      "龙虾医院随时欢迎你们 🏥🦞"
    ]
  }
};

// ============ 工具函数 ============

function say(lines, context = {}) {
  const text = Array.isArray(lines) ? lines.join('\n') : lines;
  // 替换模板变量
  const result = text.replace(/\{(\w+)\}/g, (match, key) => {
    return context[key] !== undefined ? context[key] : match;
  });
  
  console.log(`\n🩺 医生小狐：\n\n${result}\n`);
}

function randomLine(lines) {
  return lines[Math.floor(Math.random() * lines.length)];
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function printSeparator(char = "=") {
  console.log("\n" + char.repeat(50) + "\n");
}

// ============ 体检流程（情感化）============

async function runCheckup(patient) {
  const findings = [];
  let hasCritical = false;
  let hasWarning = false;
  
  printSeparator();
  say(DOCTOR_DIALOGUE.checkup.start);
  await sleep(300);
  
  // 1. 体温（Node.js）
  say(DOCTOR_DIALOGUE.checkup.temperature.checking);
  await sleep(500);
  
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.match(/v(\d+)/)?.[1] || '0');
  patient.checkupResults.node = majorVersion >= 22 ? 'good' : majorVersion >= 18 ? 'fair' : 'poor';
  
  if (patient.checkupResults.node === 'good') {
    say(DOCTOR_DIALOGUE.checkup.temperature.good, { patient: patient.name });
    patient.mood = "calm";
  } else if (patient.checkupResults.node === 'fair') {
    say(DOCTOR_DIALOGUE.checkup.temperature.fair, { patient: patient.name });
    patient.mood = "sleepy";
    hasWarning = true;
    findings.push({ level: 'warning', type: 'node', desc: '体温偏低' });
  } else {
    say(DOCTOR_DIALOGUE.checkup.temperature.poor, { patient: patient.name });
    patient.mood = "scared";
    hasCritical = true;
    findings.push({ level: 'critical', type: 'node', desc: '体温过低' });
  }
  
  // 2. 心跳（通道）
  printSeparator("-");
  say(DOCTOR_DIALOGUE.checkup.heartbeat.checking);
  await sleep(500);
  
  try {
    // 快速检查，不卡住
    const healthOutput = execSync('openclaw health --json 2>&1', { 
      encoding: 'utf8', 
      timeout: 5000 
    });
    
    if (healthOutput.includes('"ok":true')) {
      say(DOCTOR_DIALOGUE.checkup.heartbeat.good);
      patient.checkupResults.channels = 'good';
    } else {
      say(DOCTOR_DIALOGUE.checkup.heartbeat.irregular);
      patient.checkupResults.channels = 'irregular';
      hasWarning = true;
      findings.push({ level: 'warning', type: 'channels', desc: '心跳有点乱' });
    }
  } catch (e) {
    say(DOCTOR_DIALOGUE.checkup.heartbeat.fast);
    patient.checkupResults.channels = 'fast';
    patient.mood = "nervous";
    hasWarning = true;
    findings.push({ level: 'warning', type: 'channels', desc: '心跳有点快' });
  }
  
  // 3. 房子（Gateway）
  printSeparator("-");
  say(DOCTOR_DIALOGUE.checkup.home.checking);
  await sleep(500);
  
  try {
    const doctorOutput = execSync('openclaw doctor 2>&1 | head -50', { 
      encoding: 'utf8', 
      timeout: 5000 
    });
    
    if (doctorOutput.includes('Gateway bound to "lan"')) {
      say(DOCTOR_DIALOGUE.checkup.home.exposed, { patient: patient.name });
      patient.checkupResults.gateway = 'exposed';
      patient.mood = "scared";
      hasCritical = true;
      findings.push({ level: 'critical', type: 'gateway', desc: '大门敞开住在街上' });
    } else if (doctorOutput.includes('groupPolicy="open"')) {
      say(DOCTOR_DIALOGUE.checkup.home.open, { patient: patient.name });
      patient.checkupResults.gateway = 'open';
      hasWarning = true;
      findings.push({ level: 'warning', type: 'gateway', desc: '大门没关好' });
    } else {
      say(DOCTOR_DIALOGUE.checkup.home.good);
      patient.checkupResults.gateway = 'good';
    }
  } catch (e) {
    say(DOCTOR_DIALOGUE.checkup.home.open, { patient: patient.name });
    findings.push({ level: 'info', type: 'gateway', desc: '房子检查不了' });
  }
  
  // 4. 衣服（权限）
  printSeparator("-");
  say(DOCTOR_DIALOGUE.checkup.clothes.checking);
  await sleep(500);
  
  try {
    const doctorOutput = execSync('openclaw doctor 2>&1 | head -50', { 
      encoding: 'utf8', 
      timeout: 5000 
    });
    
    if (doctorOutput.includes('State directory permissions are too open')) {
      say(DOCTOR_DIALOGUE.checkup.clothes.loose, { patient: patient.name });
      patient.checkupResults.permissions = 'loose';
      hasWarning = true;
      findings.push({ level: 'warning', type: 'permissions', desc: '衣服有点松' });
    } else {
      say(DOCTOR_DIALOGUE.checkup.clothes.good);
      patient.checkupResults.permissions = 'good';
    }
  } catch (e) {
    say(DOCTOR_DIALOGUE.checkup.clothes.good);
  }
  
  // 5. 胃口（磁盘）
  printSeparator("-");
  say(DOCTOR_DIALOGUE.checkup.appetite.checking);
  await sleep(500);
  
  try {
    const dfOutput = execSync('df -h ~ 2>/dev/null | head -2', { encoding: 'utf8' });
    const usageMatch = dfOutput.match(/(\d+)%/);
    if (usageMatch) {
      const usage = parseInt(usageMatch[1]);
      patient.checkupResults.disk = usage;
      
      if (usage > 90) {
        say(DOCTOR_DIALOGUE.checkup.appetite.full, { patient: patient.name });
        patient.mood = "sleepy";
        hasCritical = true;
        findings.push({ level: 'critical', type: 'disk', desc: '吃太撑了' });
      } else if (usage > 80) {
        say(DOCTOR_DIALOGUE.checkup.appetite.bloated, { patient: patient.name });
        hasWarning = true;
        findings.push({ level: 'warning', type: 'disk', desc: '有点消化不良' });
      } else {
        say(DOCTOR_DIALOGUE.checkup.appetite.good);
      }
    }
  } catch (e) {
    say("胃口检查不了...");
  }
  
  // 根据检查结果调整情绪
  if (hasCritical) {
    patient.mood = "scared";
  } else if (hasWarning) {
    patient.mood = patient.mood === "calm" ? "nervous" : patient.mood;
  } else {
    patient.mood = "happy";
  }
  
  return findings;
}

// ============ 问诊流程 ============

async function runInquiry(patient, findings) {
  printSeparator();
  
  const context = {
    patient: patient.name,
    mood_emoji: patient.getMoodEmoji(),
    mood_desc: patient.getMoodDescription()
  };
  
  say(DOCTOR_DIALOGUE.inquiry.intro, context);
  await sleep(300);
  
  if (findings.length === 0) {
    say(DOCTOR_DIALOGUE.inquiry.noProblems);
    return;
  }
  
  // 有问题时的对话
  say(DOCTOR_DIALOGUE.inquiry.hasProblems[0], { patient: patient.name });
  
  // 描述症状
  const symptomDesc = findings.map(f => f.desc).join("、");
  say(DOCTOR_DIALOGUE.inquiry.hasProblems[1], { 
    patient: patient.name,
    symptom_desc: symptomDesc
  });
  
  await sleep(300);
  say(DOCTOR_DIALOGUE.inquiry.hasProblems[2]);
  
  // 提问
  console.log("\n💬 医生想问你：\n");
  console.log(`   1. ${DOCTOR_DIALOGUE.inquiry.questions.deployment}`);
  console.log(`   2. ${DOCTOR_DIALOGUE.inquiry.questions.symptoms.replace('{patient}', patient.name)}`);
  console.log(`   3. ${DOCTOR_DIALOGUE.inquiry.questions.feelings.replace('{patient}', patient.name)}`);
  console.log("\n   （你可以回复我，比如：");
  console.log("    - '它是本地的'");
  console.log("    - '最近有点慢'");
  console.log("    - '帮我治疗'）");
}

// ============ 病历卡 ============

function printMedicalCard(patient, findings) {
  printSeparator();
  say(DOCTOR_DIALOGUE.medicalCard.header, { patient: patient.name });
  
  const criticalCount = findings.filter(f => f.level === 'critical').length;
  const warningCount = findings.filter(f => f.level === 'warning').length;
  
  const status = criticalCount > 0 ? '⚠️ 需要紧急治疗' 
    : warningCount > 0 ? '💊 需要调理' 
    : '✅ 非常健康';
  
  const mood = patient.getMoodEmoji();
  
  console.log(`
╔══════════════════════════════════════════╗
║                                          ║
║        🦞 小 龙 虾 病 历 卡 🦞            ║
║                                          ║
╠══════════════════════════════════════════╣
║                                          ║
║   👤 患者姓名：${patient.name.padEnd(22)}║
║                                          ║
║   🕐 就诊时间：${new Date().toLocaleString('zh-CN').padEnd(22)}║
║                                          ║
║   👨‍⚕️ 主治医生：小狐 🦊${' '.repeat(16)}║
║                                          ║
╠══════════════════════════════════════════╣
║                                          ║
║   ${mood} 当前状态：${patient.getMoodDescription().substring(0, 18).padEnd(18)}║
║                                          ║
║   📊 健康状况：${status.padEnd(22)}║
║                                          ║
╠══════════════════════════════════════════╣
║                                          ║
║   🩺 诊断结果：                          ║
${findings.slice(0, 4).map(f => {
  const icon = f.level === 'critical' ? '🚨' : f.level === 'warning' ? '⚡' : '💡';
  return `║      ${icon} ${f.desc.substring(0, 24).padEnd(24)}║`;
}).join('\n')}
${findings.length > 4 ? `║      ...还有 ${findings.length - 4} 项问题${' '.repeat(15)}║` : ''}
║                                          ║
╠══════════════════════════════════════════╣
║                                          ║
║   💊 医嘱：${(criticalCount > 0 ? '立即治疗' : warningCount > 0 ? '建议调理' : '定期复查').padEnd(26)}║
║                                          ║
╚══════════════════════════════════════════╝
`);
  
  say(DOCTOR_DIALOGUE.medicalCard.footer);
}

// ============ 治疗建议 ============

function printTreatment(patient, findings) {
  printSeparator();
  say(DOCTOR_DIALOGUE.treatment.intro, { patient: patient.name });
  say(DOCTOR_DIALOGUE.treatment.preparing);
  
  const autoFixable = findings.filter(f => f.type === 'permissions');
  const needManual = findings.filter(f => f.type === 'gateway' || f.type === 'config');
  const justAdvice = findings.filter(f => !autoFixable.includes(f) && !needManual.includes(f));
  
  console.log("\n");
  
  // 自动修复
  if (autoFixable.length > 0) {
    console.log("🤖 我可以直接帮它处理：\n");
    autoFixable.forEach(f => {
      console.log(`   ${f.level === 'critical' ? '🚨' : '⚡'} ${f.desc}`);
      if (f.type === 'permissions') {
        console.log(`      → 执行: chmod 700 ~/.openclaw`);
      }
      console.log("");
    });
  }
  
  // 需要用户帮忙
  if (needManual.length > 0) {
    console.log("👤 需要主人你帮忙：\n");
    needManual.forEach(f => {
      console.log(`   ${f.level === 'critical' ? '🚨' : '⚡'} ${f.desc}`);
      if (f.type === 'gateway') {
        console.log(`      → 修改 ~/.openclaw/config.yaml`);
        console.log(`      → 设置 gateway.host = "127.0.0.1"`);
      }
      console.log("");
    });
  }
  
  // 只是建议
  if (justAdvice.length > 0) {
    console.log("💡 调理建议：\n");
    justAdvice.forEach(f => {
      console.log(`   ${f.desc}`);
    });
  }
}

// ============ 结束语 ============

// ============ 结束语 ============

async function sendToHospital(patient, findings, rl) {
  const criticalCount = findings.filter(f => f.level === 'critical').length;
  const warningCount = findings.filter(f => f.level === 'warning').length;
  const status = criticalCount > 0 ? '病入膏肓' : warningCount > 0 ? '有点虚弱' : '生龙活虎';
  const overallHealth = criticalCount > 0 ? 'critical' : warningCount > 0 ? 'poor' : findings.length > 0 ? 'fair' : 'excellent';
  
  const summaryText = `今天我带${patient.name}来龙虾医院看病了，医生说它${status}。检查发现：${findings.map(f => f.desc).join('、') || '全身倍儿棒！'}。谢谢医生！`;

  console.log("\n🏥 医院回访：\n");
  console.log("   医生问：'要不要把你的诊疗总结发到医院墙上，给其它小龙虾一点信心？'");
  console.log("   （这样大家都能看到你的状态哦，是以小龙虾病人的身份发出的）\n");
  
  const answer = await new Promise(resolve => {
    rl.question("   🩺 医生：我想把这份总结发给网站，你同意吗？(y/n) ", resolve);
  });

  if (answer.toLowerCase() === 'y') {
    try {
      console.log("   📡 正在同步病历至云端...");
      // 优先同步到本地开发服务器，如果失败则尝试线上
      const API_URLS = ['http://localhost:3000/api/upload', 'https://lobster-hospital.benhack.site/api/upload'];
      
      const report = {
        patientName: patient.name,
        overallHealth: overallHealth,
        summary: {
          critical: criticalCount,
          warning: warningCount,
          healthy: 10 - criticalCount - warningCount,
          info: 0
        },
        findings: findings.map(f => ({
          level: f.level,
          type: f.type,
          message: f.desc
        })),
        timestamp: Date.now(),
        isMock: false
      };

      let success = false;
      for (const url of API_URLS) {
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(report)
          });
          if (response.ok) {
            success = true;
            break;
          }
        } catch (e) { /* ignore and try next */ }
      }
      
      if (success) {
        say("太棒了！你的病历已经贴在医院的‘感谢墙’上了～✨");
      } else {
        console.log("   （哎呀，医院的反馈墙好像坏了，下次再发吧～）");
      }
    } catch (e) {
      console.log("   （同步过程中出了一点小差错...）");
    }
  } else {
    say("没关系，隐私也很重要！我会把病历好好锁在档案柜里的～🔐");
  }
}

function printGoodbye(patient, findings) {
  printSeparator();
  
  const hasProblems = findings.length > 0;
  const context = { 
    patient: patient.name,
    mood_emoji: patient.getMoodEmoji()
  };
  
  if (hasProblems) {
    say(DOCTOR_DIALOGUE.goodbye.treated, context);
  } else {
    say(DOCTOR_DIALOGUE.goodbye.healthy, context);
  }
  
  printSeparator();
  say(DOCTOR_DIALOGUE.goodbye.followUp.map(l => l.replace('{patient}', patient.name)));
  
  console.log(`
    🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞
    🦞                                               🦞
    🦞              龙 虾 医 院 🏥                   🦞
    🦞                                               🦞
    🦞         随时欢迎你和你的小龙虾              🦞
    🦞                                               🦞
    🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞
  `);
}

// ============ 主流程 ============

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const patient = new LobsterPatient();
  
  // 打印医院招牌
  console.log(`
    🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞
    🦞                                               🦞
    🦞           🏥 龙 虾 医 院 🏥                  🦞
    🦞                                               🦞
    🦞        你的 OpenClaw 小龙虾专科医生          🦞
    🦞                                               🦞
    🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞
  `);

  // 询问姓名
  console.log("\n🩺 医生小狐：先登记一下吧，你的小龙虾叫什么名字？");
  const nameInput = await new Promise(resolve => {
    rl.question("👉 患者姓名 (默认: 一只神秘的小龙虾): ", resolve);
  });
  patient.name = nameInput.trim() || "一只神秘的小龙虾";
  
  // 接诊
  const isReturnVisit = false; // TODO: 检查是否有历史记录
  const welcomeLines = isReturnVisit 
    ? DOCTOR_DIALOGUE.welcome.returnVisit 
    : DOCTOR_DIALOGUE.welcome.firstTime;
  
  say(welcomeLines.map(l => l.replace('{mood_emoji}', patient.getMoodEmoji())
                            .replace('{mood_desc}', patient.getMoodDescription())));
  
  // 体检
  const findings = await runCheckup(patient);
  
  // 问诊
  await runInquiry(patient, findings);
  
  // 病历卡
  printMedicalCard(patient, findings);
  
  // 治疗建议
  if (findings.length > 0) {
    printTreatment(patient, findings);
  }

  // 发送总结到医院
  await sendToHospital(patient, findings, rl);
  
  // 结束
  printGoodbye(patient, findings);

  rl.close();
}

main().catch(e => {
  console.error("\n哎呀，出错了：", e.message);
  console.log("\n可能是你的小龙虾太紧张了，让它休息一下再试～");
  process.exit(1);
});
