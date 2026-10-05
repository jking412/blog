import { spawnSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist');
const repository = process.env.PAGES_REPOSITORY || 'https://github.com/jking412/jking412.github.io.git';
const branch = 'astro';
const token = process.env.PAGES_DEPLOY_TOKEN;
const dryRun = process.argv.includes('--dry-run');
let temporary;

function checkedPath(base, target) {
  const resolvedBase = path.resolve(base);
  const resolvedTarget = path.resolve(target);
  const relative = path.relative(resolvedBase, resolvedTarget);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Refusing cleanup outside the deployment temporary directory.');
  }
  return resolvedTarget;
}

function redact(message) {
  return token ? message.split(token).join('[REDACTED]') : message;
}

// Never put credentials in a remote URL, command argument, or persistent Git config.
if (/^https?:\/\//i.test(repository) && (new URL(repository).username || new URL(repository).password)) {
  throw new Error('PAGES_REPOSITORY must not contain credentials. Use PAGES_DEPLOY_TOKEN or your Git credential helper.');
}

try {
  if (!(await stat(path.join(output, 'index.html')).catch(() => null))?.isFile()) {
    throw new Error('dist/index.html is missing. Run npm run build before deploying.');
  }
  const workflow = await readFile(path.join(root, '.github/workflows/publish-pages.yml'), 'utf8');
  temporary = await mkdtemp(path.join(tmpdir(), 'astro-blog-deploy-'));
  const checkout = path.join(temporary, 'checkout');
  await mkdir(checkout);
  const environment = { ...process.env, GIT_TERMINAL_PROMPT: '0' };
  const authentication = [];
  const proxy = process.env.PAGES_GIT_PROXY || process.env.HTTPS_PROXY || process.env.https_proxy;
  if (proxy) authentication.push('-c', `http.proxy=${proxy}`);

  if (token) {
    const helper = path.join(temporary, 'askpass.cjs');
    await writeFile(helper, "process.stdout.write(/username/i.test(process.argv[2] || '') ? 'x-access-token' : process.env.PAGES_DEPLOY_TOKEN || '');\n");
    const launcher = path.join(temporary, process.platform === 'win32' ? 'askpass.cmd' : 'askpass.sh');
    const quote = (value) => `'${value.replaceAll("'", "'\\''")}'`;
    const command = process.platform === 'win32'
      ? `@echo off\r\n"${process.execPath}" "${helper}" %*\r\n`
      : `#!/bin/sh\nexec ${quote(process.execPath)} ${quote(helper)} "$@"\n`;
    await writeFile(launcher, command, { mode: 0o700 });
    environment.GIT_ASKPASS = launcher;
    environment.GIT_ASKPASS_REQUIRE = 'force';
    authentication.push('-c', 'credential.helper=');
  }

  function git(args, { allowedCodes = [0] } = {}) {
    const result = spawnSync('git', [...authentication, ...args], {
      cwd: checkout, env: environment, encoding: 'utf8', windowsHide: true,
    });
    if (result.error) throw result.error;
    if (!allowedCodes.includes(result.status)) {
      throw new Error(redact(`git ${args[0]} failed (${result.status}): ${result.stderr || result.stdout}`));
    }
    return { ...result, stdout: result.stdout.trim() };
  }

  git(['init', '--initial-branch', branch]);
  git(['config', 'core.autocrlf', 'false']);
  git(['config', 'user.name', 'Astro Blog Deploy']);
  git(['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
  git(['remote', 'add', 'origin', repository]);
  const existing = git(['ls-remote', '--exit-code', '--heads', 'origin', `refs/heads/${branch}`], { allowedCodes: [0, 2] });
  if (existing.status === 0) {
    git(['fetch', '--no-tags', 'origin', `refs/heads/${branch}`]);
    git(['checkout', '-B', branch, 'FETCH_HEAD']);
  }

  // This checkout is newly created beneath our own temporary directory. Only its
  // working tree is replaced; existing astro commits remain ancestors of HEAD.
  for (const entry of await readdir(checkout)) {
    if (entry !== '.git') await rm(checkedPath(checkout, path.join(checkout, entry)), { recursive: true, force: true });
  }
  await cp(output, checkout, {
    recursive: true,
    filter: (source) => !path.relative(output, source).split(path.sep).includes('.git'),
  });
  await writeFile(path.join(checkout, '.nojekyll'), '');
  await mkdir(path.join(checkout, '.github/workflows'), { recursive: true });
  await writeFile(path.join(checkout, '.github/workflows/publish-pages.yml'), workflow);
  git(['add', '--all']);
  const changes = git(['diff', '--cached', '--quiet'], { allowedCodes: [0, 1] });
  if (changes.status === 0) {
    console.log('Deployment output is unchanged; no new commit or push needed.');
  } else {
    const revision = spawnSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root, encoding: 'utf8', windowsHide: true });
    const source = revision.status === 0 ? revision.stdout.trim() : 'local build';
    git(['commit', '-m', `Deploy Astro blog (${source})`]);
    console.log(`Prepared ${git(['rev-parse', '--short', 'HEAD']).stdout} for astro (${dryRun ? 'dry run' : 'deploy'}).`);
    if (!dryRun) {
      // No force flag: concurrent branch changes reject the push and retain history.
      git(['push', 'origin', `HEAD:refs/heads/${branch}`]);
      console.log('Static site pushed to jking412.github.io / astro.');
    }
  }
} catch (error) {
  console.error(redact(error.message));
  process.exitCode = 1;
} finally {
  if (temporary) await rm(checkedPath(tmpdir(), temporary), { recursive: true, force: true });
}
