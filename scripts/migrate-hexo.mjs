import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, stringify } from 'yaml';

export const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const hash = (value) => createHash('sha256').update(value).digest('hex');
const posix = (value) => value.replaceAll('\\', '/');

export async function markdownFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const location = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await markdownFiles(location));
    else if (/\.md$/i.test(entry.name)) files.push(location);
  }
  return files.sort((left, right) => left.localeCompare(right, 'en'));
}

export function splitPost(raw, filename) {
  const normalized = raw.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  if (!match) throw new Error(`Missing YAML frontmatter: ${filename}`);
  return { metadata: parse(match[1]), body: normalized.slice(match[0].length) };
}

export function normalizeDate(value, filename) {
  const match = String(value ?? '').trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?(Z|[+-]\d{2}:?\d{2})?$/);
  if (!match) throw new Error(`Unsupported post date in ${filename}: ${value}`);
  const [, year, month, day, hour = '00', minute = '00', second = '00', zone = '+08:00'] = match;
  const padded = [month, day, hour].map((part) => part.padStart(2, '0'));
  const offset = zone === 'Z' ? zone : zone.replace(/^([+-]\d{2})(\d{2})$/, '$1:$2');
  const result = `${year}-${padded[0]}-${padded[1]}T${padded[2]}:${minute}:${second}${offset}`;
  if (Number.isNaN(Date.parse(result))) throw new Error(`Invalid post date: ${filename}`);
  return result;
}

function strings(value) {
  if (value == null) return [];
  return [...new Set((Array.isArray(value) ? value.flat(Infinity) : [value]).map(String).map((item) => item.trim()).filter(Boolean))];
}

function description(body, title) {
  const text = body
    .replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, ' ')
    .replace(/!\[[^\]]*\]\([^\n]*?\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^\n]*?\)/g, '$1')
    .replace(/<[^>]+>|\{%[\s\S]*?%\}|<!--.*?-->/g, ' ')
    .replace(/[#*_>`~|]/g, '')
    .replace(/\s+/g, ' ').trim();
  return [...(text || title)].slice(0, 150).join('');
}

function outsideFences(body, transform) {
  let fence = null;
  return body.split('\n').map((line) => {
    const marker = line.match(/^\s*(`{3,}|~{3,})/);
    if (marker) {
      if (!fence) fence = marker[1][0];
      else if (marker[1][0] === fence) fence = null;
      return line;
    }
    return fence ? line : transform(line);
  }).join('\n');
}

export async function planMigration(sourceDirectory) {
  const sourceRoot = path.resolve(sourceDirectory);
  const files = await markdownFiles(sourceRoot);
  const posts = [];
  const byName = new Map();
  const routeKeys = new Set();
  const warnings = [];
  const resources = new Map();
  let hexoLinks = 0;
  let remoteImages = 0;
  for (const file of files) {
    const { metadata, body } = splitPost(await readFile(file, 'utf8'), file);
    const basename = path.basename(file, path.extname(file));
    const date = normalizeDate(metadata.date, file);
    const legacyPath = `/${date.slice(0, 10).replaceAll('-', '/')}/${basename}/`;
    const routeKey = legacyPath.toLocaleLowerCase('en');
    if (routeKeys.has(routeKey)) throw new Error(`Duplicate post route: ${legacyPath}`);
    if (byName.has(basename)) throw new Error(`Ambiguous source basename: ${basename}`);
    routeKeys.add(routeKey);
    const title = String(metadata.title || basename);
    const post = { file, basename, body, metadata: { title, description: description(body, title), date, tags: strings(metadata.tags), categories: strings(metadata.categories), legacyPath } };
    if (metadata.draft !== undefined) post.metadata.draft = Boolean(metadata.draft);
    posts.push(post);
    byName.set(basename, post);
  }

  async function resource(reference, post) {
    if (/^(?:https?:|data:|mailto:|\/\/|#)/i.test(reference)) return reference;
    const clean = reference.replace(/^<|>$/g, '');
    const [filename, suffix = ''] = clean.split(/(?=[?#])/s, 2);
    let decoded;
    try { decoded = decodeURIComponent(filename); } catch { decoded = filename; }
    const root = path.dirname(sourceRoot);
    const candidates = /^[A-Za-z]:[\\/]/.test(decoded)
      ? [decoded]
      : decoded.startsWith('/')
        ? [path.resolve(root, `.${decoded}`)]
        : [path.resolve(path.dirname(post.file), decoded), path.resolve(sourceRoot, post.basename, decoded), path.resolve(root, decoded)];
    for (const candidate of candidates) {
      if (posix(candidate).split('/').includes('.obsidian')) continue;
      try {
        if (!(await stat(candidate)).isFile()) continue;
        const bytes = await readFile(candidate);
        const assetPath = `/images/posts/${hash(bytes).slice(0, 16)}-${path.basename(candidate)}`;
        resources.set(assetPath, bytes);
        return `${assetPath}${suffix}`;
      } catch (error) {
        if (error.code !== 'ENOENT' && error.code !== 'ENOTDIR') throw error;
      }
    }
    warnings.push(`${post.basename}.md: unresolved local resource ${reference}`);
    return reference;
  }

  for (const post of posts) {
    post.body = outsideFences(post.body, (line) => line.replace(/\{%\s*post_link\s+(?:'([^']+)'|"([^"]+)"|(\S+))(?:\s+([^%]*?))?\s*%\}/g, (original, single, double, plain, label) => {
      const target = byName.get(single || double || plain);
      if (!target) { warnings.push(`${post.basename}.md: unresolved Hexo link ${single || double || plain}`); return original; }
      hexoLinks++;
      const text = (label || target.metadata.title).trim().replace(/^['"]|['"]$/g, '');
      return `[${text}](${encodeURI(target.metadata.legacyPath)})`;
    }));
    // All original article bodies remain intact, apart from explicit link conversions.
    const lines = post.body.split('\n');
    let fenced = false;
    for (let index = 0; index < lines.length; index++) {
      if (/^\s*(?:`{3,}|~{3,})/.test(lines[index])) { fenced = !fenced; continue; }
      if (fenced) continue;
      const imagePattern = /!\[([^\]]*)\]\((<[^>]+>|[^\s)]+)([^)]*)\)/g;
      let result = '', cursor = 0;
      for (const match of lines[index].matchAll(imagePattern)) {
        result += lines[index].slice(cursor, match.index);
        const reference = match[2].replace(/^<|>$/g, '');
        if (/^https?:\/\//i.test(reference)) remoteImages++;
        const replacement = await resource(reference, post);
        result += replacement === reference ? match[0] : `![${match[1]}](${encodeURI(replacement)}${match[3]})`;
        cursor = match.index + match[0].length;
      }
      lines[index] = result + lines[index].slice(cursor);
    }
    post.body = lines.join('\n');
    const unknown = post.body.match(/\{%[\s\S]*?%\}/g) || [];
    unknown.forEach((tag) => warnings.push(`${post.basename}.md: unsupported Hexo tag ${tag}`));
    post.output = `---\n${stringify(post.metadata, { lineWidth: 0 })}---\n${post.body}`;
    post.destination = path.join(projectRoot, 'src', 'content', 'blog', `${post.basename}.md`);
  }
  return { posts, resources, warnings: [...new Set(warnings)], hexoLinks, remoteImages };
}

export async function migrate(sourceDirectory) {
  const plan = await planMigration(sourceDirectory);
  const writes = plan.posts.map((post) => [post.destination, Buffer.from(post.output)]);
  for (const [url, bytes] of plan.resources) writes.push([path.join(projectRoot, 'public', url.slice(1)), bytes]);
  // Preflight every target before writing anything. Re-running is safe; edited targets are protected.
  for (const [destination, bytes] of writes) {
    try {
      const existing = await readFile(destination);
      if (!existing.equals(bytes)) throw new Error(`Migration conflict: ${destination}. Existing file differs; resolve it explicitly before re-running.`);
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  for (const [destination, bytes] of writes) {
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, bytes);
  }
  console.log(JSON.stringify({ posts: plan.posts.length, localResources: plan.resources.size, convertedHexoLinks: plan.hexoLinks, remoteImageReferences: plan.remoteImages, warnings: plan.warnings }, null, 2));
  return plan;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await migrate(process.argv[2] || 'D:\\blog\\source\\_posts');
}
