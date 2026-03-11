import { runCommand, OPENCLAW_DIR, redact, colors } from './utils.mjs';
import { readFileSync, existsSync, readdirSync } from 'fs';
import path from 'path';

// 模块化的查体引擎
const module = process.argv.find(a => a.startsWith('--module='))?.split('=')[1] || 'all';

async function run() {
  const results = {};

  if (module === 'security' || module === 'all') {
    results.security = checkSecurity();
  }
  
  if (module === 'logs' || module === 'all') {
    results.logs = checkLogs();
  }

  console.log(JSON.stringify(results, null, 2));
}

function checkSecurity() {
  const findings = [];
  // 1. 网关暴露检查
  try {
    const auditOutput = runCommand('openclaw security audit --json', true);
    if (auditOutput && auditOutput.includes('{')) {
      const audit = JSON.parse(auditOutput);
      if (audit.findings) findings.push(...audit.findings);
    }
  } catch (e) {}

  // 2. 补丁版本检查
  try {
    const ocVer = runCommand('openclaw --version', true).trim();
    if (ocVer < '2026.2.25') {
      findings.push({ severity: 'critical', title: '版本过期', detail: '存在高危漏洞 ClawJacked 风险' });
    }
  } catch (e) {}

  return findings;
}

function checkLogs() {
  const logPath = path.join(OPENCLAW_DIR, 'logs', 'openclaw.log');
  let errors = 0;
  if (existsSync(logPath)) {
    const tail = runCommand(`tail -n 100 ${logPath}`, true);
    errors = (tail.match(/error|Error|ERROR/g) || []).length;
  }
  return { recentErrors: errors };
}

run();
