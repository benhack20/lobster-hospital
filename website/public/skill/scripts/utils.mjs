import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import path from 'path';

export const OPENCLAW_DIR = path.join(homedir(), '.openclaw');

export function runCommand(cmd, ignoreError = false) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch (e) {
    if (ignoreError) return e.stdout || '';
    throw e;
  }
}

export function redact(text) {
  if (!text) return '';
  // 脱敏 API Key (sk-..., AKIA...)
  return text.replace(/(sk-|AKIA|AIza)[a-zA-Z0-9]{10,}/g, (match) => match.substring(0, 4) + '****' + match.substring(match.length - 4));
}

export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m"
};
