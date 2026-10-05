---
title: (七)集成zap
description: "开始前的准备 这一部分内容我们需要上面两个包的内容，zap是一个功能强大而且完善的日志包，lumberjack则是一个日志分割的包。 这一部分的内容由于较到了较为全面的个性化配置，所以新内容会比较多，难度上会稍大，但是慢慢来，我们尽可能地梳理这里面的内容:smirk: 开始编码 配置文件 配置的方法"
date: 2022-08-28T20:41:09+08:00
tags:
  - go
categories: []
legacyPath: /2022/08/28/go-api-practice-7/
---

# 开始前的准备

```shell
$ go get go.uber.org/zap
$ go get gopkg.in/natefinch/lumberjack.v2
```

这一部分内容我们需要上面两个包的内容，`zap`是一个功能强大而且完善的日志包，lumberjack则是一个日志分割的包。

这一部分的内容由于较到了较为全面的个性化配置，所以新内容会比较多，难度上会稍大，但是慢慢来，我们尽可能地梳理这里面的内容:smirk:

# 开始编码

## 配置文件

配置的方法与前面的方法类似

`config/log.go`

```go
func init() {
   config.Add("log", func() map[string]interface{} {
      return map[string]interface{}{

         // 日志级别，必须是以下这些选项：
         // "debug" —— 信息量大，一般调试时打开。系统模块详细运行的日志，例如 HTTP 请求、数据库请求、发送邮件、发送短信
         // "info" —— 业务级别的运行日志，如用户登录、用户退出、订单撤销。
         // "warn" —— 感兴趣、需要引起关注的信息。 例如，调试时候打印调试信息（命令行输出会有高亮）。
         // "error" —— 记录错误信息。Panic 或者 Error。如数据库连接错误、HTTP 端口被占用等。一般生产环境使用的等级。
         // 以上级别从低到高，level 值设置的级别越高，记录到日志的信息就越少
         // 开发时推荐使用 "debug" 或者 "info" ，生产环境下使用 "error"
         "level": config.Env("LOG_LEVEL", "debug"),

         // 日志的类型，可选：
         // "single" 独立的文件
         // "daily" 按照日期每日一个
         "type": config.Env("LOG_TYPE", "single"),

         /* ------------------ 滚动日志配置 ------------------ */
         // 日志文件路径
         "filename": config.Env("LOG_NAME", "storage/logs/logs.log"),
         // 每个日志文件保存的最大尺寸 单位：M
         "max_size": config.Env("LOG_MAX_SIZE", 64),
         // 最多保存日志文件数，0 为不限，MaxAge 到了还是会删
         "max_backup": config.Env("LOG_MAX_BACKUP", 5),
         // 最多保存多少天，7 表示一周前的日志会被删除，0 表示不删
         "max_age": config.Env("LOG_MAX_AGE", 30),
         // 是否压缩，压缩日志不方便查看，我们设置为 false（压缩可节省空间）
         "compress": config.Env("LOG_COMPRESS", false),
      }
   })
}
```

`.env`

```properties
.
.
.
LOG_TYPE=daily
LOG_LEVEL=debug
```

## zap工具包

`pkg/app/app.go`

```go
func IsLocal() bool {
   return config.Get("app.env") == "local"
}

func IsProduction() bool {
   return config.Get("app.env") == "production"
}

func IsTesting() bool {
   return config.Get("app.env") == "testing"
}
```

区别本地和生成环境

`helpers/helpers.go`

```go
func MicrosecondsStr(elapsed time.Duration) string {
   return fmt.Sprintf("%.3fms", float64(elapsed.Nanoseconds())/1e6)
}
```

把时间转换成纳秒，可以对程序的运行时间有比较精细的查看

`pkg/logger/logger.go`

```go
package logger

import (
   "encoding/json"
   "fmt"
   "go-api-practice/pkg/app"
   "go.uber.org/zap"
   "go.uber.org/zap/zapcore"
   "gopkg.in/natefinch/lumberjack.v2"
   "os"
   "strings"
   "time"
)

var Logger *zap.Logger

func InitLogger(filename string, maxSize, maxBackups, maxAge int, compress bool, logType string, level string) {
   writeSyncer := getLoggerWriter(filename, maxSize, maxBackups, maxAge, compress, logType)

   logLevel := new(zapcore.Level)

   if err := logLevel.UnmarshalText([]byte(level)); err != nil {
      fmt.Println("日志级别设置错误")
   }

   core := zapcore.NewCore(getEncoder(), writeSyncer, logLevel)

   Logger = zap.New(core,
      zap.AddCaller(),
      zap.AddCallerSkip(1),
      zap.AddStacktrace(zap.ErrorLevel))

   zap.ReplaceGlobals(Logger)
}

func getEncoder() zapcore.Encoder {
   encoderConfig := zapcore.EncoderConfig{
      TimeKey:        "time",
      LevelKey:       "level",
      NameKey:        "logger",
      CallerKey:      "caller",
      FunctionKey:    zapcore.OmitKey,
      MessageKey:     "message",
      StacktraceKey:  "stacktrace",
      LineEnding:     zapcore.DefaultLineEnding,
      EncodeLevel:    zapcore.CapitalLevelEncoder,
      EncodeTime:     customTimeEncoder,
      EncodeDuration: zapcore.SecondsDurationEncoder,
      EncodeCaller:   zapcore.ShortCallerEncoder,
   }

   if app.IsLocal() {
      encoderConfig.EncodeLevel = zapcore.CapitalLevelEncoder
      return zapcore.NewConsoleEncoder(encoderConfig)
   }

   return zapcore.NewJSONEncoder(encoderConfig)
}

func customTimeEncoder(t time.Time, enc zapcore.PrimitiveArrayEncoder) {
   enc.AppendString(t.Format("2006-01-02 15:04:05"))
}

func getLoggerWriter(filename string, maxSize, maxBackups, maxAge int, compress bool, logType string) zapcore.WriteSyncer {
   if logType == "daily" {
      logname := time.Now().Format("2006-01-02.log")
      filename = strings.ReplaceAll(filename, "logs.log", logname)
   }

   lumberJackLogger := &lumberjack.Logger{
      Filename:   filename,
      MaxSize:    maxSize,
      MaxBackups: maxBackups,
      MaxAge:     maxAge,
      Compress:   compress,
   }

   if app.IsLocal() {
      return zapcore.NewMultiWriteSyncer(zapcore.AddSync(os.Stdout), zapcore.AddSync(lumberJackLogger))
   } else {
      return zapcore.AddSync(lumberJackLogger)
   }
}

// Dump 调试专用，不会中断程序，会在终端打印出 warning 消息。
// 第一个参数会使用 json.Marshal 进行渲染，第二个参数消息（可选）
//         logger.Dump(user.User{Name:"test"})
//         logger.Dump(user.User{Name:"test"}, "用户信息")
func Dump(value interface{}, msg ...string) {
   valueString := jsonString(value)
   // 判断第二个参数是否传参 msg
   if len(msg) > 0 {
      Logger.Warn("Dump", zap.String(msg[0], valueString))
   } else {
      Logger.Warn("Dump", zap.String("data", valueString))
   }
}

// LogIf 当 err != nil 时记录 error 等级的日志
func LogIf(err error) {
   if err != nil {
      Logger.Error("Error Occurred:", zap.Error(err))
   }
}

// LogWarnIf 当 err != nil 时记录 warning 等级的日志
func LogWarnIf(err error) {
   if err != nil {
      Logger.Warn("Error Occurred:", zap.Error(err))
   }
}

// LogInfoIf 当 err != nil 时记录 info 等级的日志
func LogInfoIf(err error) {
   if err != nil {
      Logger.Info("Error Occurred:", zap.Error(err))
   }
}

// Debug 调试日志，详尽的程序日志
// 调用示例：
//        logger.Debug("Database", zap.String("sql", sql))
func Debug(moduleName string, fields ...zap.Field) {
   Logger.Debug(moduleName, fields...)
}

// Info 告知类日志
func Info(moduleName string, fields ...zap.Field) {
   Logger.Info(moduleName, fields...)
}

// Warn 警告类
func Warn(moduleName string, fields ...zap.Field) {
   Logger.Warn(moduleName, fields...)
}

// Error 错误时记录，不应该中断程序，查看日志时重点关注
func Error(moduleName string, fields ...zap.Field) {
   Logger.Error(moduleName, fields...)
}

// Fatal 级别同 Error(), 写完 log 后调用 os.Exit(1) 退出程序
func Fatal(moduleName string, fields ...zap.Field) {
   Logger.Fatal(moduleName, fields...)
}

// DebugString 记录一条字符串类型的 debug 日志，调用示例：
//         logger.DebugString("SMS", "短信内容", string(result.RawResponse))
func DebugString(moduleName, name, msg string) {
   Logger.Debug(moduleName, zap.String(name, msg))
}

func InfoString(moduleName, name, msg string) {
   Logger.Info(moduleName, zap.String(name, msg))
}

func WarnString(moduleName, name, msg string) {
   Logger.Warn(moduleName, zap.String(name, msg))
}

func ErrorString(moduleName, name, msg string) {
   Logger.Error(moduleName, zap.String(name, msg))
}

func FatalString(moduleName, name, msg string) {
   Logger.Fatal(moduleName, zap.String(name, msg))
}

// DebugJSON 记录对象类型的 debug 日志，使用 json.Marshal 进行编码。调用示例：
//         logger.DebugJSON("Auth", "读取登录用户", auth.CurrentUser())
func DebugJSON(moduleName, name string, value interface{}) {
   Logger.Debug(moduleName, zap.String(name, jsonString(value)))
}

func InfoJSON(moduleName, name string, value interface{}) {
   Logger.Info(moduleName, zap.String(name, jsonString(value)))
}

func WarnJSON(moduleName, name string, value interface{}) {
   Logger.Warn(moduleName, zap.String(name, jsonString(value)))
}

func ErrorJSON(moduleName, name string, value interface{}) {
   Logger.Error(moduleName, zap.String(name, jsonString(value)))
}

func FatalJSON(moduleName, name string, value interface{}) {
   Logger.Fatal(moduleName, zap.String(name, jsonString(value)))
}

func jsonString(value interface{}) string {
   b, err := json.Marshal(value)
   if err != nil {
      Logger.Error("Logger", zap.String("JSON marshal error", err.Error()))
   }
   return string(b)
}
```

代码分成两部分，第一部分是zap的初始化，后一部分是对zap方法的封装来用于多种场景

### zap的初始化

内容有点多:innocent:，慢慢解析`initLogger()`

> 函数参数

```text
filename:日志文件生成的位置
maxSize:每个日志文件的最大大小
maxBackups:保存日志文件的最大数量
maxAge:保存每个日志文件的最长时间
compress:是否压缩日志文件,会变成压缩文件
logType:有"daily"和"single"两个选项，"daily"表示每天生成一个日志文件,"single"表示全部日志集中在一个文件中
level:打印的日志文件级别
```

> getLoggerWriter

```go
if logType == "daily" {
   logname := time.Now().Format("2006-01-02.log")
   filename = strings.ReplaceAll(filename, "logs.log", logname)
}
```

原来默认生成的日志是一个日志文件`logs.log`，如果我们设置日志的种类是`daily`，那么就重新设置文件的位置和名称

```go
lumberJackLogger := &lumberjack.Logger{
   Filename:   filename,
   MaxSize:    maxSize,
   MaxBackups: maxBackups,
   MaxAge:     maxAge,
   Compress:   compress,
}
```

初始化`lumberjack`

> zap.AddSync

```go
if app.IsLocal() {
   return zapcore.NewMultiWriteSyncer(zapcore.AddSync(os.Stdout), zapcore.AddSync(lumberJackLogger))
} else {
   return zapcore.AddSync(lumberJackLogger)
}
```

添加日志的输出流，如果是在本地，我们要求在本地和日志文件中同时打印，生成环境只需要打印在日志文件中就可以了

> 获取日志等级

```go
logLevel := new(zapcore.Level)

if err := logLevel.UnmarshalText([]byte(level)); err != nil {
   fmt.Println("日志级别设置错误")
}
```

我们来看看这个方法可以解析哪些等级

```go
func (l *Level) UnmarshalText(text []byte) error {
   if l == nil {
      return errUnmarshalNilLevel
   }
   if !l.unmarshalText(text) && !l.unmarshalText(bytes.ToLower(text)) {
      return fmt.Errorf("unrecognized level: %q", text)
   }
   return nil
}

func (l *Level) unmarshalText(text []byte) bool {
	switch string(text) {
	case "debug", "DEBUG":
		*l = DebugLevel
	case "info", "INFO", "": // make the zero value useful
		*l = InfoLevel
	case "warn", "WARN":
		*l = WarnLevel
	case "error", "ERROR":
		*l = ErrorLevel
	case "dpanic", "DPANIC":
		*l = DPanicLevel
	case "panic", "PANIC":
		*l = PanicLevel
	case "fatal", "FATAL":
		*l = FatalLevel
	default:
		return false
	}
	return true
}
```

解析的等级包括了`debug`， `info`，`warn`等，解析过程中发现它会把字符串都变成小写，所以我们输入时不必关心大小写

> zapcore.NewCore()

初始化`zap.Core`

> getEncoder()

```go
func getEncoder() zapcore.Encoder {
   encoderConfig := zapcore.EncoderConfig{
      TimeKey:        "time",
      LevelKey:       "level",
      NameKey:        "logger",
      CallerKey:      "caller",
      FunctionKey:    zapcore.OmitKey,//忽悠这个字段
      MessageKey:     "message",
      StacktraceKey:  "stacktrace",
      LineEnding:     zapcore.DefaultLineEnding,//默认换行"\n"
      EncodeLevel:    zapcore.CapitalLevelEncoder,//以大写字母输出
      EncodeTime:     customTimeEncoder,//自定义打印的时间格式
      EncodeDuration: zapcore.SecondsDurationEncoder,//把时间序列化位以秒为单位的浮点数
      EncodeCaller:   zapcore.ShortCallerEncoder,//只打印调信息发生的最终目录
   }

   if app.IsLocal() {
      encoderConfig.EncodeLevel = zapcore.CapitalLevelEncoder
      return zapcore.NewConsoleEncoder(encoderConfig)
   }

   return zapcore.NewJSONEncoder(encoderConfig)
}
```

主要作用是在这里配置了要打印哪些内容以及打印的效果，像`TimeKey`，`LevelKey`等`key`字段，加入我们没有配置这些选项，那么最后打印的结果中将没有这些内容。

> zap.New()

```go
Logger = zap.New(core,
   zap.AddCaller(),//打印信息发生的位置
   zap.AddCallerSkip(1),//打印位置时从调用堆栈中回溯一级
   zap.AddStacktrace(zap.ErrorLevel))//只有在Error以上的错误时才会打印堆栈追踪

zap.ReplaceGlobals(Logger)//替换全局logger
```

> caller

在上述的解释中，`caller`讲的比较抽象，我们来举个例子说明一下，接下来我们通过删除`zap.New()`中的参数来看看这些参数的效果，我们采用Dump来测试，这个函数暂时还没有讲到,你可以理解这个函数的作用就是用户调试时打印日志的。

```go
func logInfo() {
   logger.Dump("test")
}

func main() {
   var env string
   flag.StringVar(&env, "env", "", "")
   flag.Parse()
   config.InitConfig(env)

   bootstrap.SetupLogger()

   logInfo()

   router := gin.New()

   bootstrap.SetupDB()

   bootstrap.SetupRoute(router)

   gin.SetMode(gin.ReleaseMode)

   err := router.Run(":" + config.Get("app.port"))
   if err != nil {
      fmt.Println(err)
   }
}
```

> 删除AddCaller()和AddCallerSkip()

```text
2022-08-28 09:25:46     WARN    Dump    {"data": "\"test\""}
```

> 删除AddCallerSkip()

```text
2022-08-28 09:22:45 WARN   logger/logger.go:94    Dump   {"data": "\"test\""}
```

添加了`AddCaller()`之后，那么调用这个函数的位置就被打印出来了，我们不难发现，因为打印日志调用的是`pkg`包中的函数，在实际debug过程中没有什么作用，但是我们如果跳过这一级，那么这时的日志就有所作用了

> 全部保留

```text
2022-08-28 09:21:54 WARN   go-api-practice/main.go:18 Dump   {"data": "\"test\""}
```

很明显发现添加了`AddCallerSkip(1)`的日志更具实际意义

### zap函数的封装

不难发现所有的工具类都是对zap中一组相似方法的封装，我就挑选一个来讲解

> Logger.Warn()

```go
func (log *Logger) Warn(msg string, fields ...Field)

type Field struct {
	Key       string
	Type      FieldType
	Integer   int64
	String    string
	Interface interface{}
}
```

这类函数的第一个参数就是`message`，第二个参数是`zap.Field`结构体，内容的核心就是键值对，在最后的日志打印中，zap会把`Field`字段全部序列化成JSON

其它的函数都是在利用这些打印功能做封装，我就不一一讲解了:stuck_out_tongue_closed_eyes:

