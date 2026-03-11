#!/usr/bin/env node
/**
 * 🦞 龙虾医院 - 主入口 (Main)
 * 
 * 整合体检、问诊、报告、治疗全流程
 */

import { execSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SCRIPTS = {
  checkup: join(__dirname, 'checkup.mjs'),
  reporter: join(__dirname, 'reporter.mjs'),
  interviewer: join(__dirname, 'interviewer.mjs'),
  healer: join(__dirname, 'healer.mjs')
};

function runScript(scriptPath, input = '', args = []) {
  const cmd = `node ${scriptPath} ${args.join(' ')}`;
  try {
    return execSync(cmd, {
      input,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
  } catch (e) {
    if (e.stdout) return e.stdout.toString();
    throw e;
  }
}

function printBanner() {
  console.log(`
    🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞
    🦞                                               🦞
    🦞     龙  虾  医  院  (Lobster Hospital)        🦞
    🦞                                               🦞
    🦞     "你的 OpenClaw 智能体专科医生"            🦞
    🦞                                               🦞
    🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞
  `);
}

function printUsage() {
  console.log(`
用法: node main.mjs [选项]

选项:
  --full          完整体检 + 问诊 + 报告 (默认)
  --checkup       仅执行体检
  --report        仅生成报告 (需要输入体检数据)
  --interview     仅执行问诊 (需要输入体检数据)
  --heal          仅执行治疗 (需要输入体检数据)
  --urgent        急诊模式 (只检查危急问题)
  --format=TYPE   报告格式: terminal|markdown|summary
  --json          输出 JSON 格式
  --help          显示帮助

示例:
  node main.mjs --full
  node main.mjs --checkup --json
  node main.mjs --urgent
  `);
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    printUsage();
    return;
  }
  
  const mode = args.find(a => a.startsWith('--')) || '--full';
  const isUrgent = args.includes('--urgent');
  const format = args.find(a => a.startsWith('--format='))?.split('=')[1] || 'terminal';
  const outputJson = args.includes('--json');
  
  try {
    switch (mode) {
      case '--checkup':
        printBanner();
        const checkupArgs = isUrgent ? ['--urgent'] : [];
        if (outputJson) checkupArgs.push('--json');
        const checkupOutput = runScript(SCRIPTS.checkup, '', checkupArgs);
        console.log(checkupOutput);
        break;
        
      case '--report':
        // 从标准输入读取体检数据
        let reportInput = '';
        process.stdin.on('data', chunk => reportInput += chunk);
        await new Promise(resolve => process.stdin.on('end', resolve));
        
        const reportOutput = runScript(SCRIPTS.reporter, reportInput, [`--format=${format}`]);
        console.log(reportOutput);
        break;
        
      case '--interview':
        let interviewInput = '';
        process.stdin.on('data', chunk => interviewInput += chunk);
        await new Promise(resolve => process.stdin.on('end', resolve));
        
        const interviewOutput = runScript(SCRIPTS.interviewer, interviewInput);
        console.log(interviewOutput);
        break;
        
      case '--heal':
        let healInput = '';
        process.stdin.on('data', chunk => healInput += chunk);
        await new Promise(resolve => process.stdin.on('end', resolve));
        
        const healOutput = runScript(SCRIPTS.healer, healInput);
        console.log(healOutput);
        break;
        
      case '--full':
      default:
        printBanner();
        console.log('👨‍⚕️ 医生小狐：你好！我是你的龙虾专科医生。');
        console.log('   今天由我来给自己做个全面体检。\n');
        
        // 1. 执行体检
        console.log('🔬 第一阶段：自动化体检...\n');
        const fullCheckupArgs = isUrgent ? ['--urgent'] : [];
        const fullCheckupOutput = runScript(SCRIPTS.checkup, '', fullCheckupArgs);
        
        // 提取报告数据
        const reportMatch = fullCheckupOutput.match(/--- REPORT DATA ---\n(.+)/s);
        const reportData = reportMatch ? reportMatch[1] : '{}';
        
        // 显示体检摘要
        const summaryMatch = fullCheckupOutput.match(/体检完成[\s\S]*?$/);
        if (summaryMatch) {
          console.log(summaryMatch[0]);
        }
        
        // 2. 生成报告
        console.log('\n📝 第二阶段：生成体检报告...\n');
        const fullReportOutput = runScript(SCRIPTS.reporter, fullCheckupOutput, ['--format=terminal']);
        console.log(fullReportOutput);
        
        // 3. 执行问诊
        console.log('\n💬 第三阶段：智能问诊...\n');
        const fullInterviewOutput = runScript(SCRIPTS.interviewer, fullCheckupOutput);
        console.log(fullInterviewOutput);
        
        console.log('\n' + '='.repeat(50));
        console.log('🏥 体检流程完成！');
        console.log('');
        console.log('💡 你可以：');
        console.log('   1. 回复上述问诊问题');
        console.log('   2. 说"开始治疗"执行自动修复');
        console.log('   3. 说"生成报告"获取详细报告');
        console.log('');
        break;
    }
  } catch (e) {
    console.error('❌ 执行失败:', e.message);
    process.exit(1);
  }
}

main();
