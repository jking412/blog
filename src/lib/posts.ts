import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;
export const siteTitle = 'jking の 博客';
export const siteDescription = '记录编程、Linux、操作系统与日常学习中的探索和思考。';
export const formatDate = (date: Date) => new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(date).replaceAll('/', '.');

export const getPosts = async () => (await getCollection('blog', ({ data }) => !data.draft))
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

export function postPath(post: Post): string {
  if (post.data.legacyPath) return post.data.legacyPath;
  const date = formatDate(post.data.date).replaceAll('.', '/');
  return `/${date}/${post.id}/`;
}

export const postUrl = (post: Post) => postPath(post).split('/').map(encodeURIComponent).join('/');
export const tagKey = (tag: string) => tag.toLocaleLowerCase();
export const tagUrl = (tag: string) => `/tags/${encodeURIComponent(tagKey(tag))}/`;

export function groupTags(posts: Post[]) {
  const tags = new Map<string, { name: string; key: string; posts: Post[] }>();
  for (const post of posts) {
    for (const name of new Set(post.data.tags)) {
      const key = tagKey(name);
      const group = tags.get(key) ?? { name, key, posts: [] };
      if (!group.posts.includes(post)) group.posts.push(post);
      tags.set(key, group);
    }
  }
  return [...tags.values()].sort((a, b) => b.posts.length - a.posts.length || a.name.localeCompare(b.name));
}

export const categoryKey = (category: string) => category.trim().normalize('NFC').toLocaleLowerCase();
export const categoryUrl = (category: string) => `/categories/${encodeURIComponent(categoryKey(category))}/`;

export function postCategories(post: Post): string[] {
  const categories = post.data.categories.map(category => category.trim()).filter(Boolean);
  return categories.length ? categories : ['未分类'];
}

export function groupCategories(posts: Post[]) {
  const categories = new Map<string, { name: string; key: string; posts: Post[] }>();
  for (const post of posts) {
    for (const name of postCategories(post)) {
      const key = categoryKey(name);
      const group = categories.get(key) ?? { name, key, posts: [] };
      if (!group.posts.includes(post)) group.posts.push(post);
      categories.set(key, group);
    }
  }
  return [...categories.values()].sort((a, b) => {
    if (a.key === '未分类') return 1;
    if (b.key === '未分类') return -1;
    return b.posts.length - a.posts.length || a.name.localeCompare(b.name);
  });
}
