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
