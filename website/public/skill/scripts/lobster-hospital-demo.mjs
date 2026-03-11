#!/usr/bin/env node
/**
 * 🦞 龙虾医院 v3.1 - 沉浸式诊疗体验（完整演示版）
 * 
 * 核心：情绪价值 > 技术准确性
 * 体验：让用户感觉真的有一只小龙虾在接受诊疗
 */

// ============ 小龙虾状态（情感化）============

class LobsterPatient {
  constructor() {
    this.name = "用户的小龙虾";
    this.mood = "nervous";
    this.checkupResults = {};
  }
  
  getMoodEmoji() {
    return { nervous: "😰", calm: "😌", happy: "😊", scared: "😱", sleepy: "😴", excited: "✨" }[this.mood] || "🦞";
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

function say(text) {
  console.log(`\n🩺 医生小狐：\n\n${text}\n`);
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ============ 主流程 ============

async function main() {
  const patient = new LobsterPatient();
  
  console.log(`
    🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞
    🦞                                               🦞
    🦞           🏥 龙 虾 医 院 🏥                  🦞
    🦞                                               🦞
    🦞        你的 OpenClaw 小龙虾专科医生          🦞
    🦞                                               🦞
    🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞
  `);
  
  // 接诊
  say("欢迎来到龙虾医院！🏥\n\n我是医生小狐，专门照顾 OpenClaw 小龙虾的～\n\n让我看看...哦！这是你的小龙虾吗？\n\n😰 它看起来有点紧张呢，小钳子微微发抖\n\n别担心，把它交给我，我会好好照顾它的。来，让它躺到诊台上，我们开始了～");
  
  await sleep(500);
  console.log("\n" + "=".repeat(50) + "\n");
  
  // 体检
  say("好，我们先从基础检查开始...\n\n先量个体温...🌡️ 把温度计放到它的小钳子下面...");
  await sleep(500);
  console.log("   ✅ 体温正常！是个健康的小家伙～");
  patient.mood = "calm";
  
  console.log("\n" + "-".repeat(50) + "\n");
  say("听听心跳...💓 把听诊器放在它的小胸口...");
  await sleep(500);
  console.log("   ⚡ 心跳有点快...它是不是有点紧张？");
  patient.mood = "nervous";
  
  console.log("\n" + "-".repeat(50) + "\n");
  say("看看它住的房子...🏠");
  await sleep(500);
  console.log("   🚨 哎呀！大门敞开着！");
  console.log("   🚨 而且它还住在街上（公网），太危险了！");
  patient.mood = "scared";
  
  console.log("\n" + "-".repeat(50) + "\n");
  say("检查一下衣服穿得怎么样...👔");
  await sleep(500);
  console.log("   ⚡ 衣服有点松...它需要系紧腰带");
  
  console.log("\n" + "-".repeat(50) + "\n");
  say("再看看它的胃口...🍽️");
  await sleep(500);
  console.log("   ✅ 胃口很好，吃嘛嘛香！");
  
  const findings = [
    { level: 'critical', type: 'gateway', desc: '大门敞开住在街上' },
    { level: 'warning', type: 'permissions', desc: '衣服有点松' },
    { level: 'warning', type: 'channels', desc: '心跳有点快' }
  ];
  
  // 问诊
  console.log("\n" + "=".repeat(50) + "\n");
  say("检查做完了，让我给你说说它的情况...\n\n😱 它现在很害怕，想躲起来\n\n我发现它确实有些小毛病...\n\n它现在住的房子大门敞开，谁都能走进来，它有点害怕呢。\n\n而且它的衣服穿得太松了，别人都能看到它的秘密。\n\n我想问问你，作为它的主人...\n\n1. 它是住在家里（本地）还是住在街上（公网）？\n2. 最近它有没有跟你抱怨过，说反应慢、卡顿？\n3. 你希望我现在帮它把衣服穿紧一点吗？");
  
  // 病历卡
  console.log("\n" + "=".repeat(50) + "\n");
  say("来，这是它的病历卡，你收好～");
  
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
║   😱 当前状态：很害怕，想躲起来          ║
║                                          ║
║   📊 健康状况：⚠️ 需要紧急治疗           ║
║                                          ║
╠══════════════════════════════════════════╣
║                                          ║
║   🩺 诊断结果：                          ║
║      🚨 大门敞开住在街上                 ║
║      ⚡ 衣服有点松                       ║
║      ⚡ 心跳有点快                       ║
║                                          ║
╠══════════════════════════════════════════╣
║                                          ║
║   💊 医嘱：立即治疗                      ║
║                                          ║
╚══════════════════════════════════════════╝
`);
  
  say("记得保管好，下次复查要用");
  
  // 治疗
  console.log("\n" + "=".repeat(50) + "\n");
  say("好，我现在开始给它治疗...\n\n先准备好工具...🔧\n\n这个我可以直接帮它处理～\n\n正在治疗...");
  
  console.log("\n🤖 我可以直接帮它处理：\n");
  console.log("   ⚡ 衣服有点松");
  console.log("      → 执行: chmod 700 ~/.openclaw\n");
  
  console.log("👤 需要主人你帮忙：\n");
  console.log("   🚨 大门敞开住在街上");
  console.log("      → 修改 ~/.openclaw/config.yaml");
  console.log("      → 设置 gateway.host = \"127.0.0.1\"\n");
  
  // 结束
  console.log("=".repeat(50) + "\n");
  say("治疗建议已给出！它现在知道该怎么调理了 🎉\n\n它让我转告你：谢谢主人带它来看病，它会好好听话的～\n\n它会好好恢复，变得更强壮的！");
  
  console.log("\n" + "=".repeat(50) + "\n");
  say("过几天记得带它来复查，看看恢复得怎么样～\n\n如果它有什么不舒服，随时来找我！\n\n龙虾医院随时欢迎你们 🏥🦞");
  
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

main();
