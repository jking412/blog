import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { markdownFiles, planMigration, projectRoot, splitPost } from './migrate-hexo.mjs';

const files = await markdownFiles(path.join(projectRoot, 'src/content/blog'));
const routes = new Set();
let imageReferences = 0;
for (const file of files) {
  const { metadata, body } = splitPost(await readFile(file, 'utf8'), file);
  assert.equal(typeof metadata.title, 'string', `${file}: title`);
  assert.equal(typeof metadata.description, 'string', `${file}: description`);
  assert.ok(!Number.isNaN(Date.parse(metadata.date)), `${file}: date`);
  assert.ok(Array.isArray(metadata.tags) && metadata.tags.every((item) => typeof item === 'string'), `${file}: tags`);
  assert.ok(Array.isArray(metadata.categories) && metadata.categories.every((item) => typeof item === 'string'), `${file}: categories`);
  assert.match(metadata.legacyPath, /^\/\d{4}\/\d{2}\/\d{2}\/[^/]+\/$/, `${file}: legacyPath`);
  assert.ok(!routes.has(metadata.legacyPath), `Duplicate route: ${metadata.legacyPath}`);
  routes.add(metadata.legacyPath);
  assert.ok(!body.includes('{% post_link'), `${file}: unresolved Hexo post link`);
  assert.ok(!body.includes('![['), `${file}: unresolved Obsidian image`);
  for (const match of body.matchAll(/!\[[^\]]*\]\((<[^>]+>|[^\s)]+)/g)) {
    imageReferences++;
    const url = match[1].replace(/^<|>$/g, '');
    if (/^(?:https?:|data:|\/\/)/i.test(url)) continue;
    const target = decodeURI(url.split(/[?#]/)[0]);
    assert.ok(target.startsWith('/images/posts/'), `${file}: unresolved local image ${target}`);
    assert.ok((await stat(path.join(projectRoot, 'public', target))).isFile(), `${file}: missing image ${target}`);
  }
}

// Optional source comparison verifies all text was retained and conversions are deterministic.
if (process.argv[2]) {
  const plan = await planMigration(process.argv[2]);
  assert.equal(files.length, plan.posts.length, 'Source and destination post counts differ');
  for (const post of plan.posts) {
    assert.equal(await readFile(post.destination, 'utf8'), post.output, `Source preservation check: ${post.basename}`);
  }
  assert.equal(plan.warnings.length, 0, `Migration warnings: ${plan.warnings.join('; ')}`);
}
console.log(`Verified ${files.length} posts, ${routes.size} unique legacy URLs and ${imageReferences} image references${process.argv[2] ? '; full source comparison passed' : ''}.`);
