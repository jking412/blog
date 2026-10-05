---
title: hexo环境配置记录
description: 该博客用于记录如何快速恢复博客环境 配置node 安装node环境 https://nodejs.cn/download/ 安装最新版node，解压后配置环境变量，进入node的bin目录后链接npm和node到/usr/local/bin 然后配置lib/nodemodules到环境变量，node
date: 2025-03-09T10:32:45+08:00
tags: []
categories: []
legacyPath: /2025/03/09/hexo环境配置记录/
---



该博客用于记录如何快速恢复博客环境

# 配置node

### 安装node环境

https://nodejs.cn/download/

安装最新版node，解压后配置环境变量，进入node的bin目录后链接npm和node到`/usr/local/bin`

```bash
ln -s $(pwd)/node /usr/local/bin/node
ln -s $(pwd)/npm /usr/local/bin/npm
```

然后配置`lib/node_modules`到环境变量，`node -g`安装的应用会安装到这里

```bash
echo "export \"PATH=\$PATH:$(pwd)\"" >> ~/.bashrc
source ~/.bashrc
```

如果没有梯子可以安装一下cnpm

```bash
npm install -g cnpm -registry=https://registry.npm.taobao.org
```

#  配置Github SSH

非常简单，本地生成公钥私钥之后将公钥放在Github SSH中即可

```bash
ssh-keygen -t rsa -C "xxx@xxx.com"
```

然后找到`id_rsa.pub`放到Github的ssh配置中

![image-20250309112054425](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20250309112054425.png)

# 配置PicGo

安装PicGo

```bash
npm install -g picgo
```

配置阿里云图床，在`~/.picgo/config.json`里填入对应信息就可，华东一填入`oss-cn-hangzhou`

```json
{
  "picBed": {
    "uploader": "aliyun",
    "current": "aliyun",
    "aliyun": {
      "accessKeyId": "",
      "accessKeySecret": "",
      "bucket": "",
      "area": "oss-cn-hangzhou",
      "path": "",
      "customUrl": "",
      "options": ""
    }
  },
  "picgoPlugins": {}
}

```

修改`插入图片时`为`上传图片`，设置`上传服务`是`PicGo-Core`，这里typora可能会报错找不到PicGo-Core，我们根据报错将PicGo链接到目标目录即可

![image-20250309111834795](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20250309111834795.png)

# 安装hexo

```bash
npm install -g hexo-cli
```

我们从github仓库中下载之前的blog，获取main分支

```bash
git clone -b main https://github.com/jking412/jking412.github.io.git
```

![image-20250309112249369](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20250309112249369.png)

进入文件夹

```bash
cd jking412.github.io
npm install
cp -r butterfly themes
hexo clean
hexo g
hexo s
```

即可配置好本地hexo环境
