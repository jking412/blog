# 部署

源码保存在 [jking412/blog](https://github.com/jking412/blog) 的 `main`，Astro 构建产物保存在 [jking412/jking412.github.io](https://github.com/jking412/jking412.github.io) 的 `astro`。部署脚本只推送 `astro`，不会修改目标仓库的 `main` 或 `master`。

首次部署已于 2026-10-05 完成。目标仓库的 GitHub Pages 当前已配置为从 `astro` 分支的 `/` 根目录发布，线上首页验证为 Astro 站点。后续本机发布可直接运行以下命令；源码仓库的跨仓库自动发布需要另行配置下文的 `PAGES_DEPLOY_TOKEN`。

## 本地发布

需要 Node.js 24 和 Git。先安装依赖、检查，再生成静态文件：

```sh
npm ci
npm run check
npm run build
node scripts/deploy.mjs --dry-run
node scripts/deploy.mjs
```

`--dry-run` 会读取远端 `astro` 并在临时目录准备完整提交，但不推送。正常发布沿用本机 Git credential helper，无需把 token 写到仓库。也可以通过环境变量 `PAGES_DEPLOY_TOKEN` 传入凭据；token 只由临时 askpass 从环境读取，不嵌入 remote URL、命令参数或文件内容，临时目录在结束后清理。请勿把 token 写进 `.env`、命令历史或提交。

首次发布为 `astro` 建立独立根提交；后续提交接在远端 `astro` 最新提交后，保留该分支历史。静态目录完整替换，仅保留 `.git`，再加入 `.nojekyll` 和 Pages 工作流。如果远端在准备期间发生改变，普通 Git push 会拒绝覆盖，请重新执行部署。输出相同则不创建提交。

`PAGES_REPOSITORY` 可覆盖目标仓库地址用于本地测试；默认地址为 `https://github.com/jking412/jking412.github.io.git`。目标分支固定为 `astro`。静态目录须有 `dist/index.html`，部署不会在源码工作区删除任何文件。需要网络代理时，通过 `PAGES_GIT_PROXY` 或 `HTTPS_PROXY` 环境变量传入；脚本的临时 Git 仓库不会继承源码仓库的本地 `http.proxy` 配置。

## 持续部署

源码仓库的 `.github/workflows/build-and-deploy.yml` 在 `main` push、pull request 和手工触发时运行安装、检查与构建；只有 `main` 的 push 或手工触发会发布。未配置凭据时，检查和构建照常通过，并明确提示跳过部署。

在 **源码仓库** Settings → Secrets and variables → Actions 添加 `PAGES_DEPLOY_TOKEN`。推荐限制到目标 `jking412.github.io` 仓库的 fine-grained personal access token，授予 **Contents: Read and write** 及 **Workflows: Read and write**，因为发布包含 `.github/workflows/publish-pages.yml`。如果使用 classic token，公开仓库需要 `public_repo` 和 `workflow` 范围；私有仓库需要 `repo` 和 `workflow`。普通 `GITHUB_TOKEN` 只属于当前工作流仓库，不能承担此跨仓库发布；用它推送也不会触发后续 Pages 构建。[GitHub 的 token 事件说明](https://docs.github.com/en/actions/concepts/security/github_token)、[工作流文件权限说明](https://docs.github.com/en/rest/repos/contents)。

## GitHub Pages 发布源

分支上传成功只表示产物已进入 Git 仓库；网站是否上线还取决于目标仓库 Pages 的发布源。配置前先查看目标仓库原有设置，避免意外切换正在使用的站点。

**推荐：从分支发布。** 在目标仓库 Settings → Pages → Build and deployment，将 Source 设为 **Deploy from a branch**，Branch 选择 **astro**，Folder 选择 **/ (root)**，保存。`.nojekyll` 会让 GitHub 直接发布 Astro 已构建的文件。此时发布源明确是 `astro`。[GitHub 发布源说明](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

**可选：GitHub Actions 发布。** 将 Source 设为 **GitHub Actions**，使用部署分支自带的 `publish-pages.yml`。该工作流只允许目标仓库 `astro` 分支触发，上传分支根目录并通过 `deploy-pages` 发布。若 `github-pages` environment 有分支限制，须允许 `astro`。首次上传后再配置 Source，可能需要再次 push 一个部署提交触发工作流；GitHub 的手工触发要求工作流存在于默认分支，因此仅存于非默认 `astro` 的工作流不保证能手动启动，不需要为此修改 `main` 或 `master`。[GitHub 自定义 Pages 工作流说明](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

上述两种模式择一。自带 Actions 工作流先读取目标仓库的 Pages 模式；若是从分支发布，它会明确提示并跳过 artifact 上传和部署，由 GitHub 内置分支发布完成上线。

默认站点地址为 [https://jking412.github.io/](https://jking412.github.io/)。已有自定义域名的设置应保留并与 Astro `site` 一致；`CNAME` 文件本身不能更改 Pages 的自定义域名设置。
