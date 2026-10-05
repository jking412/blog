---
title: (八)在gin和gorm中使用zap
description: 开始前的准备 gin整合zap 还记得我们在gin中自定义中间件的函数吗，我们将自定义中间件并整合zap来代替原来的中间件 bootstrap/route.go 接下来的内容涉及到的内容很多，只需要理解大概即可，所以这一部分的讲解只会介绍大概的思路。 logger中间件 app/http/middl
date: 2022-08-28T20:41:16+08:00
tags:
  - go
categories: []
legacyPath: /2022/08/28/go-api-practice-8/
---

# 开始前的准备

# gin整合zap

还记得我们在`gin`中自定义中间件的函数吗，我们将自定义中间件并整合zap来代替原来的中间件

`bootstrap/route.go`

```go
func registerGlobalMiddleware(router *gin.Engine) {
   router.Use(
      middlewares.Recovery(),
      middlewares.Logger(),
   )
}
```

接下来的内容涉及到的内容很多，只需要理解大概即可，所以这一部分的讲解只会介绍大概的思路。

> logger中间件

`app/http/middlewares/logger.go`

```go
package middlewares

import (
   "bytes"
   "github.com/gin-gonic/gin"
   "github.com/spf13/cast"
   "go-api-practice/helpers"
   "go-api-practice/pkg/logger"
   "go.uber.org/zap"
   "io"
   "time"
)

type responseBodyWriter struct {
   gin.ResponseWriter
   body *bytes.Buffer
}

func (w responseBodyWriter) Write(b []byte) (int, error) {
   w.body.Write(b)
   return w.ResponseWriter.Write(b)
}

// Logger 记录请求日志
func Logger() gin.HandlerFunc {
   return func(c *gin.Context) {

      // 获取 response 内容
      w := &responseBodyWriter{body: &bytes.Buffer{}, ResponseWriter: c.Writer}
      c.Writer = w

      // 获取请求数据
      var requestBody []byte
      if c.Request.Body != nil {
         // c.Request.Body 是一个 buffer 对象，只能读取一次
         requestBody, _ = io.ReadAll(c.Request.Body)
         // 读取后，重新赋值 c.Request.Body ，以供后续的其他操作
         c.Request.Body = io.NopCloser(bytes.NewBuffer(requestBody))
      }

      // 设置开始时间
      start := time.Now()
      c.Next()

      // 开始记录日志的逻辑
      cost := time.Since(start)
      responStatus := c.Writer.Status()

      logFields := []zap.Field{
         zap.Int("status", responStatus),
         zap.String("request", c.Request.Method+" "+c.Request.URL.String()),
         zap.String("query", c.Request.URL.RawQuery),
         zap.String("ip", c.ClientIP()),
         zap.String("user-agent", c.Request.UserAgent()),
         zap.String("errors", c.Errors.ByType(gin.ErrorTypePrivate).String()),
         zap.String("time", helpers.MicrosecondsStr(cost)),
      }
      if c.Request.Method == "POST" || c.Request.Method == "PUT" || c.Request.Method == "DELETE" {
         // 请求的内容
         logFields = append(logFields, zap.String("Request Body", string(requestBody)))

         // 响应的内容
         logFields = append(logFields, zap.String("Response Body", w.body.String()))
      }

      if responStatus > 400 && responStatus <= 499 {
         // 除了 StatusBadRequest 以外，warning 提示一下，常见的有 403 404，开发时都要注意
         logger.Warn("HTTP Warning "+cast.ToString(responStatus), logFields...)
      } else if responStatus >= 500 && responStatus <= 599 {
         // 除了内部错误，记录 error
         logger.Error("HTTP Error "+cast.ToString(responStatus), logFields...)
      } else {
         logger.Debug("HTTP Access Log", logFields...)
      }
   }
}
```

函数思路如下：

1. 读取request.body
2. 把请求参数封装到`zap.Field`
3. 根据响应码来打印不同的日志

> recovery中间件

```go
package middlewares

import (
   "github.com/gin-gonic/gin"
   "go-api-practice/pkg/logger"
   "go.uber.org/zap"
   "net"
   "net/http"
   "net/http/httputil"
   "os"
   "strings"
   "time"
)

// Recovery 使用 zap.Error() 来记录 Panic 和 call stack
func Recovery() gin.HandlerFunc {

   return func(c *gin.Context) {
      defer func() {
         if err := recover(); err != nil {

            // 获取用户的请求信息
            httpRequest, _ := httputil.DumpRequest(c.Request, true)

            // 链接中断，客户端中断连接为正常行为，不需要记录堆栈信息
            var brokenPipe bool
            if ne, ok := err.(*net.OpError); ok {
               if se, ok := ne.Err.(*os.SyscallError); ok {
                  errStr := strings.ToLower(se.Error())
                  if strings.Contains(errStr, "broken pipe") || strings.Contains(errStr, "connection reset by peer") {
                     brokenPipe = true
                  }
               }
            }
            // 链接中断的情况
            if brokenPipe {
               logger.Error(c.Request.URL.Path,
                  zap.Time("time", time.Now()),
                  zap.Any("error", err),
                  zap.String("request", string(httpRequest)),
               )
               c.Error(err.(error))
               c.Abort()
               // 链接已断开，无法写状态码
               return
            }

            // 如果不是链接中断，就开始记录堆栈信息
            logger.Error("recovery from panic",
               zap.Time("time", time.Now()),               // 记录时间
               zap.Any("error", err),                      // 记录错误信息
               zap.String("request", string(httpRequest)), // 请求信息
               zap.Stack("stacktrace"),                    // 调用堆栈信息
            )

            // 返回 500 状态码
            c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
               "message": "服务器内部错误，请稍后再试",
            })
         }
      }()
      c.Next()
   }
}
```

这里已经有了详解的注释，不做解释了

# gorm整合zap

`pkg/logger/gorm_logger.go`

```go
package logger

import (
   "context"
   "errors"
   "go-api-practice/helpers"
   "go.uber.org/zap"
   "gorm.io/gorm"
   gormlogger "gorm.io/gorm/logger"
   "path/filepath"
   "runtime"
   "strings"
   "time"
)

type GormLogger struct {
   ZapLogger     *zap.Logger
   SlowThreshold time.Duration
}

func NewGormLogger() GormLogger {
   return GormLogger{
      ZapLogger:     Logger,
      SlowThreshold: 200 * time.Millisecond,
   }
}

// LogMode 实现 gormlogger.Interface 的 LogMode 方法
func (l GormLogger) LogMode(level gormlogger.LogLevel) gormlogger.Interface {
   return GormLogger{
      ZapLogger:     l.ZapLogger,
      SlowThreshold: l.SlowThreshold,
   }
}

// Info 实现 gormlogger.Interface 的 Info 方法
func (l GormLogger) Info(ctx context.Context, str string, args ...interface{}) {
   l.logger().Sugar().Debugf(str, args...)
}

// Warn 实现 gormlogger.Interface 的 Warn 方法
func (l GormLogger) Warn(ctx context.Context, str string, args ...interface{}) {
   l.logger().Sugar().Warnf(str, args...)
}

// Error 实现 gormlogger.Interface 的 Error 方法
func (l GormLogger) Error(ctx context.Context, str string, args ...interface{}) {
   l.logger().Sugar().Errorf(str, args...)
}

// Trace 实现 gormlogger.Interface 的 Trace 方法
func (l GormLogger) Trace(ctx context.Context, begin time.Time, fc func() (string, int64), err error) {

   // 获取运行时间
   elapsed := time.Since(begin)
   // 获取 SQL 请求和返回条数
   sql, rows := fc()

   // 通用字段
   logFields := []zap.Field{
      zap.String("sql", sql),
      zap.String("time", helpers.MicrosecondsStr(elapsed)),
      zap.Int64("rows", rows),
   }

   // Gorm 错误
   if err != nil {
      // 记录未找到的错误使用 warning 等级
      if errors.Is(err, gorm.ErrRecordNotFound) {
         l.logger().Warn("Database ErrRecordNotFound", logFields...)
      } else {
         // 其他错误使用 error 等级
         logFields = append(logFields, zap.Error(err))
         l.logger().Error("Database Error", logFields...)
      }
   }

   // 慢查询日志
   if l.SlowThreshold != 0 && elapsed > l.SlowThreshold {
      l.logger().Warn("Database Slow Log", logFields...)
   }

   // 记录所有 SQL 请求
   l.logger().Debug("Database Query", logFields...)
}

// logger 内用的辅助方法，确保 Zap 内置信息 Caller 的准确性（如 paginator/paginator.go:148）
func (l GormLogger) logger() *zap.Logger {

   // 跳过 gorm 内置的调用
   var (
      gormPackage    = filepath.Join("gorm.io", "gorm")
      zapgormPackage = filepath.Join("moul.io", "zapgorm2")
   )

   // 减去一次封装，以及一次在 logger 初始化里添加 zap.AddCallerSkip(1)
   clone := l.ZapLogger.WithOptions(zap.AddCallerSkip(-2))

   for i := 2; i < 15; i++ {
      _, file, _, ok := runtime.Caller(i)
      switch {
      case !ok:
      case strings.HasSuffix(file, "_test.go"):
      case strings.Contains(file, gormPackage):
      case strings.Contains(file, zapgormPackage):
      default:
         // 返回一个附带跳过行号的新的 zap logger
         return clone.WithOptions(zap.AddCallerSkip(i))
      }
   }
   return l.ZapLogger
}
```

这里已经有了详解的注释，不做解释了，这一部分内容能看懂多少看多少就行了，不必要在刚开始学习时拘泥于细节，等以后有了更多的经验再来搞懂也不迟

