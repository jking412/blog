---
title: (十)统一返回格式
description: 新建response包封装返回内容 然后，我们再把前面的返回内容改成新的函数，这一部分就作为课后内容由你们自己完成(不修改也不会影响正常使用)
date: 2022-09-08T13:27:13+08:00
tags:
  - go
categories: []
legacyPath: /2022/09/08/go-api-practice-10/
---

# 新建response包封装返回内容

```go
package response

import (
   "github.com/gin-gonic/gin"
   "go-api-practice/pkg/logger"
   "gorm.io/gorm"
   "net/http"
)

func JSON(c *gin.Context, data interface{}) {
   c.JSON(http.StatusOK, data)
}

func Success(c *gin.Context) {
   JSON(c, gin.H{
      "success": true,
      "message": "success",
   })
}

func Data(c *gin.Context, data interface{}) {
   JSON(c, gin.H{
      "success": true,
      "data":    data,
   })
}

func Created(c *gin.Context, data interface{}) {
   c.JSON(http.StatusCreated, gin.H{
      "success": true,
      "data":    data,
   })
}

func CreatedJSON(c *gin.Context, data interface{}) {
   c.JSON(http.StatusCreated, data)
}

func Abort404(c *gin.Context, msg ...string) {
   c.AbortWithStatusJSON(http.StatusNotFound, gin.H{
      "message": defaultMessage("Not Found", msg...),
   })
}

func Abort403(c *gin.Context, msg ...string) {
   c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
      "message": defaultMessage("Forbidden", msg...),
   })
}

func Abort500(c *gin.Context, msg ...string) {
   c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
      "message": defaultMessage("Internal Server Error", msg...),
   })
}

func BadRequest(c *gin.Context, err error, msg ...string) {
   logger.LogIf(err)
   c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{
      "message": defaultMessage("Bad Request", msg...),
      "error":   err.Error(),
   })
}

func Error(c *gin.Context, err error, msg ...string) {
   logger.LogIf(err)

   if err == gorm.ErrRecordNotFound {
      Abort404(c)
      return
   }
   c.AbortWithStatusJSON(http.StatusUnprocessableEntity, gin.H{
      "message": defaultMessage("Internal Server Error", msg...),
      "error":   err.Error(),
   })
}

func ValidationError(c *gin.Context, errors map[string][]string) {
   c.AbortWithStatusJSON(http.StatusUnprocessableEntity, gin.H{
      "message": "Validation Error",
      "errors":  errors,
   })
}

func Unauthorized(c *gin.Context, msg ...string) {
   c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
      "message": defaultMessage("Unauthorized", msg...),
   })
}

func defaultMessage(defaultMsg string, msg ...string) (message string) {
   if len(msg) == 0 {
      message = defaultMsg
   } else {
      message = msg[0]
   }
   return
}
```

然后，我们再把前面的返回内容改成新的函数，这一部分就作为课后内容由你们自己完成(不修改也不会影响正常使用)

