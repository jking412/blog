---
title: Git小白成长记
description: Git 是现在最火的版本控制工具，开发合作时几乎人人都离不开它。但用着用着，什么工作区、暂存区、本地仓库、远程仓库就容易搞混；git checkout、git reset、git revert 这些命令也常常傻傻分不清。别担心，今天这篇文章就来帮你把 Git 理个明明白白，一次性搞懂它的运行逻辑和常
date: 2025-04-26T07:21:28+08:00
tags:
  - git
categories: []
legacyPath: /2025/04/26/Git小白成长记/
---

Git 是现在最火的版本控制工具，开发合作时几乎人人都离不开它。但用着用着，什么工作区、暂存区、本地仓库、远程仓库就容易搞混；`git checkout`、`git reset`、`git revert` 这些命令也常常傻傻分不清。别担心，今天这篇文章就来帮你把 Git 理个明明白白，一次性搞懂它的运行逻辑和常用命令！

# 🚧 Git 的四个核心区域，一次说清！

在使用 Git 时，最容易混淆的就是它那几个「区」：工作区、暂存区、本地仓库、远程仓库。别急，我们一个个来认识它们。

![image-20250426082223309](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20250426082223309.png)

------

## 🗂️ 1. 工作区（Working Directory）

这是你**每天打开编辑器写代码的地方**，也就是项目文件所在的真实目录。

📍 特点：

- 你看到的源代码文件就存在这里；
- 任何新增、修改、删除的文件都会首先出现在工作区；
- 还没被 Git 跟踪或提交。

🧠 可以理解为：你的“写字台”，你在上面涂涂改改，但 Git 还不知道你要保存哪些。

------

## 🗃️ 2. 暂存区（Staging Area / Index）

暂存区是一个中转站，**告诉 Git 哪些改动你准备好了，要提交**。

📍 特点：

- 通过 `git add` 把工作区的改动放进来；
- 是提交之前的“打包清单”；
- 没有 `add` 的改动不会被提交。

🧠 就像你整理好文件，先放进了“待归档盒子”，准备打包。

------

## 📦 3. 本地仓库（Local Repository）

本地仓库就是 Git 真正保存你提交记录的地方。

📍 特点：

- 通过 `git commit` 把暂存区的内容提交进来；
- 保存在 `.git` 文件夹中；
- 可以随时回退、查看历史记录。

🧠 它是你电脑上的“版本时光机”。

------

## 🌐 4. 远程仓库（Remote Repository）

远程仓库是你和其他人协作的地方，通常在 GitHub、GitLab、Gitee 等平台上。

📍 特点：

- 通过 `git push` 把本地仓库的提交上传；
- 通过 `git pull` 拉取远程的最新更新；
- 多人协作的核心所在。

🧠 就像是“云端备份中心”，你可以和小伙伴一起同步代码。



# 🚀Git 核心命令全面理解

在掌握了 Git 的四大区域后，接下来我们要通过五个非常重要的命令：**merge**、**rebase**、**reset**、**revert** 和 **checkout**，彻底揭开 Git 版本控制的本质，其中merge和rebase为一组，是涉及分支合并的命令，reset、revert和checkout为一组，是涉及commit操作的命令。

------

## 1. `git merge` — 合并分支 🔀

`git merge` 用于将两个分支的历史结合在一起，产生一次新的合并提交（merge commit）。

### ✏️ 使用场景：

- 当你在开发分支上完成了功能，想要把它合并到主分支时。

可以看到，merge有一个显著特征，就是`合并分支，然后产生了一个新的提交（commit），这与rebase存在很大的区别`。

![image-20250426214021207](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20250426214021207.png)

### 🛠️ 典型命令：

```bash
git checkout main
git merge feature-branch
```

这会把 `feature-branch` 的修改合并到 `main`。

### ⚡ 特点：

- **保留分支历史**。
- 可能出现冲突，需要手动解决。

------

## 2. `git rebase` — 变基操作 🌱

`git rebase` 的作用是把一系列提交“搬家”，重新应用到另一条分支线的后面。简单来说，就是**让提交历史看起来像一条直线**。

### ✏️ 使用场景：

- 想让提交历史更清晰简洁。
- 需要在合并代码前清理提交记录。

rebase命令“人如其名“，变基命令通过将`feature分支直接移动到main分支后面实现合并，在此过程中不会产生新的提交记录`，虽然merge和rebase的处理逻辑不同，但本质上两个命令都完成了对分支的合并，这是值得注意的。

![image-20250426214133974](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20250426214133974.png)

### 🛠️ 典型命令：

```bash
git checkout feature-branch
git rebase main
```

这表示：把 `feature-branch` 的提交放到 `main` 最新提交之后。

### ⚡ 特点：

- **历史更干净**。
- 改变提交历史（⚠️ 不建议在公共分支上做 rebase）。

------

## 3. `git reset` — 回退操作 ⏪

`git reset` 用来移动当前分支的指针（HEAD）到一个指定的提交，并且根据参数（`--soft`、`--mixed`、`--hard`）决定如何处理暂存区和工作区。

### ✏️ 使用场景：

- 想撤销最近的提交或取消暂存某些文件。
- 清除错误提交，重新整理提交记录。

使用reset的过程中必须了解工作区、暂存区和本地仓库的变化情况，但reset时不管使用哪个参数，本地仓库的提交一定是会被移除的。在实际情况中，使用reset往往是为了彻底的回到某个状态，所以往往搭配`--hard`参数使用。

![image-20250426220217412](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20250426220217412.png)

如果我们使用reset之后想要本地仓库恢复到reset之前的文件内容`（这里仅仅指恢复文件内容，而不是恢复提交记录）`,分情况你可以使用如下方法：

- soft：因为soft命令在工作目录和暂存区中都保有文件内容，所以直接`git commit`就可以恢复本地仓库的文件内容
- mixed：mixed在工作目录中保有文件内容，可以先`git add`然后`git commit`恢复本地仓库的文件内容
- hard：通过对soft和mixed的分析，我们知道无论是使用soft还是mixed，在工作区中原来的文件内容依然是存在且未被修改的，但是hard修改了从工作区到本地仓库的全部内容，所以说hard参数是危险的。因此我们是不是就此永远丢失了数据呢，显然并不会，Git实际上还留了一手，在我们使用这些命令时，Git本地额外保存了一个`reflog`，通过`reflog`，我们可以找回reset之前的内容。

### 🛠️ 常见命令：

```bash
git reset --soft HEAD~1   # 回退一个提交，但保留改动
git reset --mixed HEAD~1  # 回退并取消暂存，但保留工作区
git reset --hard HEAD~1   # 全面回退（提交+暂存区+工作区）
```

### ⚡ 特点：

- **本地修改风险大，慎用 `--hard`！**
- 只影响本地仓库，不自动影响远程分支。

------

## 4. `git revert` — 撤销提交但保留历史 🔄

`git revert` 用于生成一条新的提交，这条提交**会抵消指定提交的更改**。和 `reset` 不同，它不会修改历史记录，而是通过新增提交来“反转”旧提交的效果。

### ✏️ 使用场景：

- 在公共分支上需要撤销某次提交，但不能破坏历史记录。

关于revert，你需要知道的是，revert是通过`新建一个commit来撤销之前commit的内容`，在commit 6中，反转了commit 3的内容，从而实现撤销。

![image-20250426221746181](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20250426221746181.png)

### 🛠️ 典型命令：

```bash
git revert <commit-id>
```

### ⚡ 特点：

- **安全撤销**，不会引起历史断裂。
- 适合多人协作项目。

------

## 5. `git checkout` — 切换与恢复 🧳

`git checkout` 是一个超级常用的命令，可以用来：

- **切换分支**
- **还原文件**
- **检出特定版本的内容**

### ✏️ 使用场景：

- 切换到其他分支开发新功能。
- 恢复单个文件到历史版本。

在具体介绍之前，我需要提及一个概念——HEAD指针，在Git中，HEAD指针永远指向我们正在操作的commit，在上面关于reset和revert的命令图片中，我省略了HEAD，下面是一个完整图片。

![image-20250426221331988](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20250426221331988.png)

![image-20250426221852532](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20250426221852532.png)



为什么要提及HEAD的概念呢，因为你可以这样理解，`git checkout就是git reset --hard`，区别是`git reset --hard会同时移动head和main，但是git checkout只移动head`。正因如此，我们只移动了head，所以checkout后可以随时回到原来的commit，而对于`git reset --hard`而言，因为永久移动了head和main，不再有任何指针指向原来的commit，我们也就无法再回到原来的commit了。

![image-20250426222348728](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20250426222348728.png)

此外，值得注意的是，在上面的内容中，我提到了`checkout`的本质与`reset --hard`是存在相似之处的，在checkout之后我们会丢失所有原来的文件内容，只是因为checkout保留了main指针，所以我们可以回到main所指向的commit，但是`工作目录和暂存区的内容并不会保存`，所在在checkout之前，我们需要保存好工作目录和暂存区的内容，你可以通过直接commit提交当前内容或者使用git stash的方式保存工作目录和暂存区的内容。

### 🛠️ 典型命令：

```bash
git checkout HEAD~2 file.txt  # 把 file.txt 还原到两次提交前的版本
```

### ⚡ 特点：

- 结合 `stash` 使用，可以灵活管理修改。
- 小心使用，不要覆盖了工作区的改动。

------

# 🏁 小结

| 命令       | 作用                       | 关键词             |
| ---------- | -------------------------- | ------------------ |
| `merge`    | 合并分支，保留完整历史     | 合并、冲突处理     |
| `rebase`   | 变基操作，整理提交         | 整洁、线性历史     |
| `reset`    | 回退提交或取消暂存         | 指针移动、风险操作 |
| `revert`   | 撤销某次提交并生成新的提交 | 安全撤销、多人协作 |
| `checkout` | 切换分支或恢复文件         | 分支管理、文件恢复 |

掌握了这五大命令之后，你就真正理解了 Git 的“时间线操作艺术”！🎨✨
接下来，你可以结合实际案例，进一步演练这些命令，体验 Git 的强大与灵活。

最后，在这里，我推荐你一个练习Git的好平台：

- [Learn Git Branching](https://learngitbranching.js.org/?locale=zh_CN)

希望对你有所帮助
