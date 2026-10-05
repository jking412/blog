import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts, postUrl, siteTitle, siteDescription } from '../lib/posts';

export async function GET(context: APIContext) {
  return rss({
    title: siteTitle,
    description: siteDescription,
    site: context.site!,
    items: (await getPosts()).map(post => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: postUrl(post),
    })),
    customData: '<language>zh-CN</language>',
  });
}
