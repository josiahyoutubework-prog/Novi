// Runs the API (Express + SQLite) and the web dev server (Vite) together.
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function start(name, command, args, cwd, env) {
  const p = spawn(command, args, { cwd, stdio: 'pipe', shell: process.platform === 'win32', env: { ...process.env, ...env } });
  const tag = `[${name}] `;
  p.stdout.on('data', (d) => process.stdout.write(tag + d.toString().replace(/\n(?!$)/g, '\n' + tag)));
  p.stderr.on('data', (d) => process.stderr.write(tag + d.toString().replace(/\n(?!$)/g, '\n' + tag)));
  p.on('exit', (code) => { console.log(`${tag}exited with code ${code}`); process.exit(code ?? 0); });
  return p;
}

// Force the API to 4000 even if the harness injected PORT for the web server.
start('api', 'node', ['index.js'], path.join(root, 'server'), { PORT: '4000' });
start('web', npm, ['run', 'dev'], path.join(root, 'web'), { PORT: '5173' });

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));
