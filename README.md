# jking の 博客

Astro 静态个人博客，已从 Hexo 迁移 82 篇文章。源码在 [jking412/blog](https://github.com/jking412/blog)，构建产物在 [jking412/jking412.github.io 的 astro 分支](https://github.com/jking412/jking412.github.io/tree/astro)，站点地址为 [jking412.github.io](https://jking412.github.io/)。

## 本地运行

需要 Node.js 22.12 或更新版本。

```sh
npm ci
npm run dev
```

开发地址默认是 `http://localhost:4321`。

```sh
npm run check
npm run verify:content
npm run build
npm run preview
```

## 写文章

在 `src/content/blog/` 新建 Markdown 文件，例如 `my-new-post.md`：

```yaml
---
title: 新的学习笔记
description: 用一两句话说明这篇文章的内容。
date: '2026-10-05T12:00:00+08:00'
tags:
  - Astro
categories:
  - 学习笔记
draft: false
---

正文从这里开始。
```

`draft: true` 的文章不会发布。默认链接使用 `/年/月/日/文件名/`；旧文章用 `legacyPath` 保留原 Hexo 链接，通常不需要修改这个字段。文章支持 Markdown、Shiki 代码高亮与 KaTeX 数学公式。

`categories` 用于文章分类，`tags` 用于更具体的关键词。分类页会自动汇总已发布文章；可以填写多个分类，分类名称忽略大小写及首尾空格。同一文章在同一分类只计数一次。没有填写分类或分类为空的文章归入「未分类」。

## 迁移与部署

迁移脚本不改动旧博客源目录。重新迁移前查看 [迁移记录](docs/migration.md)，有本地改动时脚本会报告冲突。

```sh
npm run migrate -- D:/blog/source/_posts
npm run verify:content -- D:/blog/source/_posts
```

构建并部署：

```sh
npm run check
npm run build
npm run deploy
```

完整部署方式、跨仓库自动部署密钥和 GitHub Pages 配置见 [部署说明](docs/deployment.md)。源码仓库的 Actions 会验证和构建；配置 `PAGES_DEPLOY_TOKEN` 后，推送 `main` 会自动更新目标仓库的 `astro` 分支。

## 目录

```text
src/content/blog/  Markdown 文章
src/pages/         首页、旧日期路由、归档、分类、标签、关于、RSS
src/layouts/       全站布局
src/styles/        阅读样式
scripts/           迁移、验证、部署
public/            静态资源、爬虫配置
```

SEO 包含规范链接、Open Graph、站点地图和 RSS。文章内的外链图片继续使用旧地址，图床的可用性依赖原提供方。
