---
title: 从github page到github action
description: Github Pages和Github Actions github pages是github给我们提供了托管静态网站的强大功能，让我们可以快速部署自己的一些应用。 github actions是github的一个CI/CD平台，可以帮助我们自动化测试，构建和部署项目，也拥有着十分强大的功能。 看似
date: 2022-11-22T20:12:12+08:00
tags:
  - github action
categories: []
legacyPath: /2022/11/22/从github-page到github-action/
---

# Github Pages和Github Actions

github pages是github给我们提供了托管静态网站的强大功能，让我们可以快速部署自己的一些应用。

github actions是github的一个CI/CD平台，可以帮助我们自动化测试，构建和部署项目，也拥有着十分强大的功能。

看似两者之间没有直接的联系，但是实际上，它们之间的关系比我们想的亲密多了，下面我们就从github pages开始一步一步讲述它们之间的联系。

如果对`Github Actions`还没有基本的认识，建议可以先去了解相关内容或者阅读我的博客

传送门：[github-action简明教程](/2022/11/08/github-action%E7%AE%80%E6%98%8E%E6%95%99%E7%A8%8B/)

# 再认识Github Pages

我们先回到一个熟悉的界面，下面是github pages的配置界面

![](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221122201939789.png)

我们再来看看配置github pages的方式

![image-20221122202036990](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221122202036990.png)

发现是有两种的，这个时候我们就发现了一个选项——`Github Actions`，从这里就看出了一些端倪，我们由两种方式去部署github pages，其中一个就是借由`Github Actions`，下面开始逐个介绍这两种方法。

`Deploy from a branch`是一个更加常用的方式，我们先从这个方法介绍。

## Deploy from a branch

这种方法的使用很简单，先往`github`的仓库上推送一个简单的`index.html`文件

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    Hello World
</body>
</html>
```

![image-20221122204820985](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221122204820985.png)

这样就可以了(请先忽略另一个文件夹)，然后在`github pages`的配置页按下`Save`（`如果你之前已经配置过github pages，那么可以跳过这一步`）

![image-20221122203701291](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221122203701291.png)

然后我们查看`github actions`，我们会发现竟然有任务正在运行！

![image-20221122204016665](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221122204016665.png)

所以我们会发现`github pages`部署的过程也是走了一个工作流，那么具体内容就不介绍了，接着我们访问`https://<github id>.github.io/<repository name>/`

![image-20221122204717686](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221122204717686.png)

## Github Actions

那么接下来我们尝试用自己的工作流去部署，我们选择`Github Actions`

![image-20221122205018718](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221122205018718.png)

`Github Actions`已经给出了两个我们可能需要的`workflows`模板，这里我们直接使用`Static HTML`，点击`Configure`

![image-20221122205147452](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221122205147452.png)

这里我们能看到我们将要创建的工作流文件，有兴趣的可以仔细阅读一下，这里我们不需要修改它的配置，直接点击右上角绿色的`Start commit`提交改变就可以了

![image-20221122205302916](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221122205302916.png)

再来看`Github Actions`，我们会发现自己创建工作流已经运行起来了，这里提一下，工作流运行的名字如果没有配置，默认是这一次`commit`的信息作为名字，等待部署成功就可以了，效果这里就不查看了，现在就配置好了一个`Github Actions`的工作流，之后我们的每一次提交都会触发这个工作流，让它帮助我们构建`github pages`

# 巧用Github Actions市场

到了现在这一步，你可能会惊叹于Github Actions强大的功能（其实目前还没怎么表现出来，乐:sweat_smile:），但是你也可能感到害怕，原因是`Github Actions`的配置文件实在是太长了，我能写出这么复杂的工作流文件吗。

大家其实大可不必担心，一方面，github给我们提供了很多场景下的`工作流文件模板`，另一方面，我之前提过，我们可以再步骤中使用别人已经写好的`actions`，大大简化我们编写的难度，下面我们来看看我们如何查看自己想要的工作流文件。

## 工作流文件模板

我们点开Actions，如果我们之前没有创建过工作流，那么你已经可以发现下面有很多的工作流文件可以供你选择，如果你已经创建了工作流，我们点击左侧的`New workflow`

![image-20221122210259207](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221122210259207.png)

这里有大量的模板可以选择，`Suggested for this repository`是github根据你仓库中语言的种类占比给你推荐最可能用到的工作流文件。

![image-20221122210502053](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221122210502053.png)

我们可以根据自己的需求从中选择，这会大大降低我们编写的难度

## actions市场

接下来介绍一下怎么给自己的`步骤（step）`找到合适的actions，让我们避免书写重复的脚本，我们点击github导航栏中的`Marketplace`

![image-20221122210729497](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221122210729497.png)

接下来点击`Actions`，我们看到很多已经被编写好的`actions`

![image-20221122210826365](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221122210826365.png)

我们随便点开一个，大多数的`actions`都会给出用法，示例和参数的说明等信息，根据这些信息，你可以快速上手别人的脚本

![image-20221122211029409](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221122211029409.png)



# Github Actions集成Go项目的一个简单案例

我们先来简单的写一个Go的Web服务和一个对应的测试文件，这个服务将监听8080端口，访问`/hello`路由将返回`hello world`，测试文件将测试这个Web服务和路由是否正常。

```go
package main

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func HelloWorld(c *gin.Context) {
	c.String(http.StatusOK, "hello world")
}

func main() {
	r := gin.Default()

	r.GET("/hello", HelloWorld)

	r.Run(":8080")
}
```

```go
package main

import (
   "github.com/stretchr/testify/assert"
   "io/ioutil"
   "net/http"
   "testing"
   "time"
)

func TestMain(m *testing.M) {
   go main()
   time.Sleep(2 * time.Second)
   m.Run()
}

func TestAdd(t *testing.T) {
   assertion := assert.New(t)
   resp, err := http.Get("http://localhost:8080/hello")
   assertion.Nil(err)
   assertion.Equal(http.StatusOK, resp.StatusCode)
   data, _ := ioutil.ReadAll(resp.Body)
   assertion.Equal("hello world", string(data))
}
```

完整的目录如图示

![image-20221108230538412](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221108230538412.png)

先把代码上传到github

![image-20221122211754888](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221122211754888.png)



接下来我们去创建工作流，我们发现github已经给我们推荐了两个工作流模板，我们直接选第二个（如果你没有发先你想要的工作流模板也可以自己手动搜索，大部分情况下你的需求都可以被满足）

![image-20221122211849893](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221122211849893.png)

阅读工作流文件，发现我们的这个工作流文件已经差不多满足了我们的需求，我们根据自己的需求做出小小的修改，主要是添加下载依赖的步骤

![image-20221122212141857](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221122212141857.png)

```yaml
# 工作流名称
name: Go package
# 任务名称
run-name: Go Build && Test
# 触发事件
on: [push]

# 工作
jobs:
  # 工作的名字叫做build
  build:
    # 运行在ubuntu上
    runs-on: ubuntu-latest
    steps:
      # 使用actions，将文件传到服务器上，use声明使用的actions
      - uses: actions/checkout@v3
      # 配置go语言环境	
      - name: Set up Go
        uses: actions/setup-go@v3
        # 配置actions的参数，这里是go的版本
        with:
          go-version: 1.18
      # 下载依赖
      - name: Install dependencies
        run: go mod download
      # 编译项目
      - name: Build
        run: go build -v .
     # 运行测试 
      - name: Test
        run: go test -v .
```

最后我们上传我们的本地仓库，查看Action，等待片刻，执行完的情况是这样的，我们可以看到工作流都被执行了

![image-20221122212941261](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221122212941261.png)

关于Go语言工作流的细节就不介绍了，下面我们测试一下测试出错的情况，我们修改`main.go`，将返回的内容由`hello world`改为`Hello World`，我们再次提交至Github

```go
func HelloWorld(c *gin.Context) {
   c.String(http.StatusOK, "Hello World")
}
```

再次查看，我们发现我们的工作流执行失败了，这显然是由于我们的Test步骤没有通过导致的

![image-20221108231224859](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221108231224859.png)

我们点开我们的工作流查看细节

![image-20221108231406042](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221108231406042.png)

发现确实是我们修改了返回值为`Hello World`导致的错误，这是一种错误，此外我们可以修改Go代码制造语法错误，使代码无法编译，这里就不再测试了。

到目前为止，我们成功使用了Github Actions完成Go项目的持续集成，如果想要进一步了解相关内容可以阅读官方文档

传送门：[GitHub Actions文档 - GitHub Docs](https://docs.github.com/cn/actions)

