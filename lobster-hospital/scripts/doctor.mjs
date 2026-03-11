import { execSync } from 'child_process';
import os from 'os';

function runCli(cmd) {
  try {
    const stdout = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
    // Try to find the first '{' for JSON
    const jsonStart = stdout.indexOf('{');
    if (jsonStart !== -1) {
      return JSON.parse(stdout.substring(jsonStart));
    }
    return { error: 'No JSON found in output', raw: stdout };
  } catch (err) {
    return { error: err.message, stderr: err.stderr?.toString() };
  }
}

const report = {
  timestamp: new Date().toISOString(),
  environment: {
    node: process.version,
    os: os.type() + ' ' + os.release(),
    arch: os.arch(),
    platform: process.platform,
  },
  doctor: null,
  health: null,
  security: null,
};

console.log('--- Diagnosis Report Start ---');

// Check OpenClaw version
try {
  report.environment.openclaw = execSync('openclaw --version', { encoding: 'utf8' }).trim();
} catch (e) {
  report.environment.openclaw = 'unknown';
}

console.log('1. Running openclaw doctor...');
report.doctor = runCli('openclaw doctor --json');

console.log('2. Running openclaw health...');
report.health = runCli('openclaw health --json');

console.log('3. Running openclaw security audit...');
report.security = runCli('openclaw security audit --json');

console.log(JSON.stringify(report, null, 2));
console.log('--- Diagnosis Report End ---');
