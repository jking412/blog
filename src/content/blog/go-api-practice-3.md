---
title: (三)集成viper
description: 开始前的准备 - viper viper是一个相当常用的配置管理包，功能相当强大。但是如果之前没有接触过这个包，第一次学习可能感到疑惑，你可以根据自己的情况去先学习viper的用法或者保持一定的疑惑。 - cast ​ 一个非常方便的类型转换包 编码 编写viper工具包 pkg/config/co
date: 2022-08-22T09:38:36+08:00
tags:
  - go
categories: []
legacyPath: /2022/08/22/go-api-practice-3/
---





# 开始前的准备

- viper

```shell
$ go get github.com/spf13/viper
```

viper是一个相当常用的配置管理包，功能相当强大。但是如果之前没有接触过这个包，第一次学习可能感到疑惑，你可以根据自己的情况去先学习viper的用法或者保持一定的疑惑。

- cast

```shell
$ go get github.com/spf13/cast
```

​	一个非常方便的类型转换包

# 编码

### 编写viper工具包

`pkg/config/config.go`

```go
package config

import (
   "github.com/spf13/cast"
   viperlib "github.com/spf13/viper"
   "go-api-practice/helpers"
   "os"
)

var viper *viperlib.Viper

type ConfigFunc func() map[string]interface{}

var ConfigFuncs map[string]ConfigFunc

func init() {
   viper = viperlib.New()

   viper.SetConfigType("env")

   viper.AddConfigPath(".")

   viper.SetEnvPrefix("appenv")

   viper.AutomaticEnv()

   ConfigFuncs = make(map[string]ConfigFunc)
}

func InitConfig(env string) {
   loadEnv(env)
   loadConfig()
}

func loadConfig() {
   for name, fn := range ConfigFuncs {
      viper.Set(name, fn())
   }
}

func loadEnv(envSuffix string) {
   envPath := ".env"
   if len(envSuffix) > 0 {
      filePath := envPath + envSuffix
      if _, err := os.Stat(filePath); err != nil {
         envPath = filePath
      }
   }

   viper.SetConfigName(envPath)
   if err := viper.ReadInConfig(); err != nil {
      panic(err)
   }

   viper.WatchConfig()
}
func Env(envName string, defaultValue ...interface{}) interface{} {
   if len(defaultValue) > 0 {
      return internalGet(envName, defaultValue[0])
   }
   return internalGet(envName)
}

func Add(name string, configFn ConfigFunc) {
   ConfigFuncs[name] = configFn
}

func Get(path string, defaultValue ...interface{}) string {
   return GetString(path, defaultValue...)
}

func internalGet(path string, defaultValue ...interface{}) interface{} {
   if !viper.IsSet(path) || helpers.Empty(viper.Get(path)) {
      if len(defaultValue) > 0 {
         return defaultValue[0]
      }
      return nil
   }
   return viper.Get(path)
}

func GetString(path string, defaultValue ...interface{}) string {
   return cast.ToString(internalGet(path, defaultValue...))
}
func GetInt(path string, defaultValue ...interface{}) int {
   return cast.ToInt(internalGet(path, defaultValue...))
}
func GetBool(path string, defaultValue ...interface{}) bool {
   return cast.ToBool(internalGet(path, defaultValue...))
}
```

这里内容有点复杂，我一点点慢慢讲

> viper实例

```go
viper = viperlib.New()
```

这里我们用`New()`方法去初始化一个`viper实例`，这样初始化的`viper`会有一些默认的配置，我们在使用的要注意，特别的，不要写成一下这种形式。

```go
viper := viperlib.New()
```

```go
func New() *Viper {
   v := new(Viper)
   v.keyDelim = "."
   v.configName = "config"
	.
    .
    .
   return v
}
```

如果你看过viper的入门教程，那么你就会明白这些配置的作用，如果你现在还不能理解，我会在下面用到的时候在加以说明

> 设置配置文件类型和位置

```go
viper.SetConfigType("env")
viper.AddConfigPath(".")
```

这两行不难理解，配置文件类型为`env`，路径为当前目录`.(相对于main.go)`

> 自动读取环境变量

```go
viper.SetEnvPrefix("appenv")//设置了配置文件的前缀
viper.AutomaticEnv()//自动读取环境变量
```

对于程序员来说，我想配置环境变量并不陌生，借助于goland工具，我们可以快速配置环境变量，我们以此来举个例子

![](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20220822101005029.png)

![](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20220822101100635.png)

可以这样测试

`main.go`

```go
fmt.Println(config.Get("id"))//在main函数中加上
```

我们就可以看到打印值是`1`

> ConfigFunc

```go
type ConfigFunc func() map[string]interface{}//定义了一个类型，这个类型是一个函数，返回值是map[string]interface{}

var ConfigFuncs map[string]ConfigFunc//建立了一个从字符串向ConfigFunc映射的map
```

这里比较考验Go的基础，看不懂的去回顾一下`type`的用法

> 初始化配置(读取配置)

```go
func InitConfig(env string) {
   loadEnv(env)
   loadConfig()
}

func loadConfig() {
   for name, fn := range ConfigFuncs {
      viper.Set(name, fn())
   }
}//这里待会用到再细说

func loadEnv(envSuffix string) {//读入配置文件的后缀
   envPath := ".env"
   if len(envSuffix) > 0 {
      filePath := envPath + envSuffix
      if _, err := os.Stat(filePath); err != nil {
         envPath = filePath
      }
   }

   viper.SetConfigName(envPath)//配置文件名
   if err := viper.ReadInConfig(); err != nil {//读取文件
      panic(err)
   }

   viper.WatchConfig()//不需要重新启动项目就可以更改并读取配置文件
}
```

主要讲一下`loadEnv`，这里的后缀可以让我们根据运行环境的不同读取不同的配置文件，默认情况下是`.env`，通过后缀我们可以读取`.env.test`，`.env.prod`，`.env.dev`等

此外，如果你注意到了前面的`viper.New()`，你就会发现下面的配置

```go
v.configName = "config"
```

也就是说我们必须要手动设置一次`configName`

```go
viper.SetConfigName(envPath)
```

否则默认的就是`config.env(当然，如果你愿意这么做的话)`

```go
func Env(envName string, defaultValue ...interface{}) interface{} {
   if len(defaultValue) > 0 {
      return internalGet(envName, defaultValue[0])
   }
   return internalGet(envName)
}

func Add(name string, configFn ConfigFunc) {
   ConfigFuncs[name] = configFn
}

//返回值是字符串的情况最为常见，我们为此多进行了一次封装
func Get(path string, defaultValue ...interface{}) string {
   return GetString(path, defaultValue...)
}


//这里封装了一个私有的Get()
//helpers包还没有完成
func internalGet(path string, defaultValue ...interface{}) interface{} {
   if !viper.IsSet(path) || helpers.Empty(viper.Get(path)) {
      if len(defaultValue) > 0 {
         return defaultValue[0]
      }
      return nil
   }
   return viper.Get(path)
}

//因为viper.Get()返回的是一个interface{}，为了方便使用，我们搭配cast转换成我们想要的类型
func GetString(path string, defaultValue ...interface{}) string {
   return cast.ToString(internalGet(path, defaultValue...))
}
func GetInt(path string, defaultValue ...interface{}) int {
   return cast.ToInt(internalGet(path, defaultValue...))
}
func GetBool(path string, defaultValue ...interface{}) bool {
   return cast.ToBool(internalGet(path, defaultValue...))
}
```

这里的`Env`和其它函数我都会在使用的时候统一讲解，现在留个印象即可，现在我们已经完成了viper工具类，下面我们完成`helpers`的小插曲，把最重要的`config`内容留到最后

### helpers工具包

`helpers/helpers.go`

```go
package helpers

import "reflect"

func Empty(val interface{}) bool {
   if val == nil {
      return true
   }
   v := reflect.ValueOf(val)

   switch v.Kind() {
   case reflect.String, reflect.Array:
      return v.Len() == 0
   case reflect.Map, reflect.Slice:
      return v.Len() == 0 || v.IsNil()
   case reflect.Bool:
      return !v.Bool()
   case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
      return v.Int() == 0
   case reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64:
      return v.Uint() == 0
   case reflect.Float32, reflect.Float64:
      return v.Float() == 0
   case reflect.Interface, reflect.Ptr:
      return v.IsNil()
   }
   return reflect.DeepEqual(val, reflect.Zero(v.Type()).Interface())
}
```

因为`viper.Get()`返回的是一个`interface{}`，所以我们特别的来处理一下它的判空

其中`reflect.DeepEqual()`就可以完全完成这个工作了

```go
reflect.DeepEqual(val, reflect.Zero(v.Type()).Interface())
```

但是由于其中用了很多反射操作，速度比较慢，所以我们尽可能地处理一些自己可以处理的空类型判断，来加快程序的运行速度

### 完成config包和对配置过程加载的全解析

先贴上全部的代码，要注意，之前的`config`工具包是在`pkg`下的，现在我们要在根目录下新建一个`config`包

`config/app.go`

```go
package config

import "go-api-practice/pkg/config"

func init() {
   config.Add("app", func() map[string]interface{} {
      return map[string]interface{}{

         // 应用名称
         "name": config.Env("APP_NAME", "go-api-pratice"),

         // 当前环境，用以区分多环境，一般为 local, stage, production, test
         "env": config.Env("APP_ENV", "production"),

         // 是否进入调试模式
         "debug": config.Env("APP_DEBUG", false),

         // 应用服务端口
         "port": config.Env("APP_PORT", "3000"),

         // 加密会话、JWT 加密
         "key": config.Env("APP_KEY", "33446a9dcf9ea060a0a6532b166da32f304af0de"),

         // 用以生成链接
         "url": config.Env("APP_URL", "http://localhost:3000"),

         // 设置时区，JWT 里会使用，日志记录里也会使用到
         "timezone": config.Env("TIMEZONE", "Asia/Shanghai"),
      }
   })
}
```

`config/config.go`

```
package config

func Initialize() {
   
}
```

`.env`

```properties
APP_ENV=local
APP_KEY=zBqYyQrPNaIUsnRhsGtHLivjqiMjBVLS
APP_DEBUG=true
APP_URL=http://localhost:3000
APP_LOG_LEVEL=debug
APP_PORT=3000
```

这里的配置文件名就叫做`.env`

#### 加载过程分析

我们会从`config.Add()`函数开始，按照函数执行步骤做一步一步的分析，函数细节请自己翻阅上面的代码，可能有点绕，请静下心来慢慢看

> config.Add()

这里我们添加一个映射，从`"app"`到一个`func() map[string]interface{}`函数

> loadEnv()

```go
viper.SetConfigName(envPath)
if err := viper.ReadInConfig(); err != nil {
   panic(err)
}
```

这一步viper读取了`.env(或者别的环境)`文件，并且把这些键值对都加载到了viper中，形式如下

```properties
app_env=local
...
# 把键都变成小写
# 实际上是键值对，这里表示一下
```

> loadConfig()

```go
func loadConfig() {
   for name, fn := range ConfigFuncs {
      viper.Set(name, fn())
   }
}
```

这里我们去调用所有的`ConfigFuncs`函数来设置键值对，这里的键目前只有`"app"`，目前实际的内容是这样的

```yaml
app:
	name:XXX
	env:XXX
	...
```

`app`下面的所有内容都是`fn()`的返回值，我们来分析一下这个函数的返回内容

```go
config.Add("app", func() map[string]interface{} {
   return map[string]interface{}{
       // 应用服务端口
       "port": config.Env("APP_PORT", "3000"),
       // 设置时区，JWT 里会使用，日志记录里也会使用到
       "timezone": config.Env("TIMEZONE", "Asia/Shanghai"),
       // 当前环境，用以区分多环境，一般为 local, stage, production, test
       "env": config.Env("APP_ENV", "production"),
		.
		.
		.
   }
})
```

我们就以这个`env`为例

> config.Env()

```
func Env(envName string, defaultValue ...interface{}) interface{} {
   if len(defaultValue) > 0 {
      return internalGet(envName, defaultValue[0])
   }
   return internalGet(envName)
}
```

没什么可说的，根据情况调用`internalGet()`

> internalGet()

```go
func internalGet(path string, defaultValue ...interface{}) interface{} {
   if !viper.IsSet(path) || helpers.Empty(viper.Get(path)) {
      if len(defaultValue) > 0 {
         return defaultValue[0]
      }
      return nil
   }
   return viper.Get(path)
}
```

这部分是关键，首先，方法会判断这个键是否存在，那么此时viper内部已经读入了什么呢，

没错，就是配置文件

```properties
app_env=local
...
```

这个时候的`path`是`APP_ENV(在Get时都会统一转化成小写)`，所以这个时候键存在，调用`viper.Get(path)`，值为`local`，所以返回值是`local`，那么这样一个配置就确定下来了，下面的逻辑都是相同的

```yaml
app:
	name:XXX
	env:local
	...
```

反之，加入我们在配置文件中如果没有`app_env=local`，我们会发现我们调用函数的时候传入了一个默认值`production`，所以，加入我们没有配置这一项，返回值就是`production`

```yaml
app:
	name:XXX
	env:production
	...
```

这就是全部的加载过程了，如果你了解viper，就会知道`viper.Set()`的优先级高于配置文件，但是我们最后发现在这个转换中，配置文件都被加载到了`viper.Set()`中

### 使用配置

`main.go`

```go
package main

import (
   "flag"
   "fmt"
   "github.com/gin-gonic/gin"
   "go-api-practice/bootstrap"
   btsconfig "go-api-practice/config"
   "go-api-practice/pkg/config"
)

func init() {
   btsconfig.Initialize()
}

func main() {
   var env string
   flag.StringVar(&env, "env", "", "")
   flag.Parse()
   config.InitConfig(env)

   router := gin.New()

   bootstrap.SetupRoute(router)

   err := router.Run(":" + config.Get("app.port"))
   if err != nil {
      fmt.Println(err)
   }
}
```

到这里我相信你依然可能会有几个疑惑的点，我们来一一解答

> btsconfig.Initialize()的作用

我们知道Go中的`init()`函数会在`main`函数之前被调用，而对于别的包的`init()`函数而言，它们被调用的时候就是这个包被引用的时候，如果你细心的话就会发现`app.go`的内容是写在`init()`函数中的，所以`btsconfig.Initialize()`的作用就是调用`config`包下的所有`init()`函数

> 关于flag包

作用是读取命令行参数，这里就简单的说明一下作用

```shell
$ go run main.go --env .dev
```

这样我们在运行的时候就可以读取`.env.dev`配置文件啦(结合InitConfig函数)

> 关于app.port

还记得最前面的viper初始化时的`viper.New()`吗

```go
v.keyDelim = "."
```

对于配置的多层嵌套，viper自有它的读取方法，我们使用`viper.Get()`时中间用`.`隔开



到这里，viper集成就完成了，这部分内容有些复杂，慢慢来，你可以休息一下，好好总结上面的内容然后再开启下一节。

