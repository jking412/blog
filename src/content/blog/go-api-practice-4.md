---
title: (四)集成gorm
description: 开始前的准备 我们将使用gorm来使用数据库，项目中我们使用mysql数据库 集成gorm 配置信息 config/database.go .env 先用前面的配置配置好数据库相关的参数 连接数据库工具类 pkg/database/database.go 启动连接 和前面启动gin的思路类似，我们在
date: 2022-08-27T09:57:54+08:00
tags:
  - go
categories: []
legacyPath: /2022/08/27/go-api-practice-4/
---

# 开始前的准备

```shell
$ go get gorm.io/gorm
$ go get gorm.io/driver/mysql
```

我们将使用gorm来使用数据库，项目中我们使用mysql数据库

# 集成gorm

### 配置信息

`config/database.go`

```go
func init() {

	config.Add("database", func() map[string]interface{} {
		return map[string]interface{}{

			// 默认数据库
			"connection": config.Env("DB_CONNECTION", "mysql"),

			"mysql": map[string]interface{}{

				// 数据库连接信息
				"host":     config.Env("DB_HOST", "127.0.0.1"),
				"port":     config.Env("DB_PORT", "3306"),
				"database": config.Env("DB_DATABASE", "go_api_practice"),
				"username": config.Env("DB_USERNAME", ""),
				"password": config.Env("DB_PASSWORD", ""),
				"charset":  "utf8mb4",

				// 连接池配置
				"max_idle_connections": config.Env("DB_MAX_IDLE_CONNECTIONS", 100),
				"max_open_connections": config.Env("DB_MAX_OPEN_CONNECTIONS", 25),
				"max_life_seconds":     config.Env("DB_MAX_LIFE_SECONDS", 5*60),
			},
		}
	})
}
```

`.env`

```properties
.
.
.
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=go_api_practice
DB_USERNAME=root
DB_PASSWORD=123456
DB_DEBUG=2
```

先用前面的配置配置好数据库相关的参数

### 连接数据库工具类

`pkg/database/database.go`

```go
var DB *gorm.DB
var SQLDB *sql.DB

func Connect(dbConfig gorm.Dialector, _logger gormlogger.Interface) {
   var err error
   DB, err = gorm.Open(dbConfig, &gorm.Config{
      Logger: _logger,
   })

   if err != nil {
      fmt.Println(err.Error())
   }

   SQLDB, err = DB.DB()
   if err != nil {
      fmt.Println(err.Error())
   }

}
```

### 启动连接

和前面启动gin的思路类似，我们在`bootstrap`包中编写启动类

`bootstrap/database.go`

```go
func SetupDB() {

   var dbConfig gorm.Dialector
   switch config.Get("database.connection") {
   case "mysql":
      // 构建 DSN 信息
      dsn := fmt.Sprintf("%v:%v@tcp(%v:%v)/%v?charset=%v&parseTime=True&multiStatements=true&loc=Local",
         config.Get("database.mysql.username"),
         config.Get("database.mysql.password"),
         config.Get("database.mysql.host"),
         config.Get("database.mysql.port"),
         config.Get("database.mysql.database"),
         config.Get("database.mysql.charset"),
      )
      dbConfig = mysql.New(mysql.Config{
         DSN: dsn,
      })
   default:
      panic(errors.New("database connection not supported"))
   }

   // 连接数据库，并设置 GORM 的日志模式
   database.Connect(dbConfig, logger.Default.LogMode(logger.Info))

   // 设置最大连接数
   database.SQLDB.SetMaxOpenConns(config.GetInt("database.mysql.max_open_connections"))
   // 设置最大空闲连接数
   database.SQLDB.SetMaxIdleConns(config.GetInt("database.mysql.max_idle_connections"))
   // 设置每个链接的过期时间
   database.SQLDB.SetConnMaxLifetime(time.Duration(config.GetInt("database.mysql.max_life_seconds")) * time.Second)
}
```

使用上前面的配置信息，连接数据库，最后我们在`main`中调用这个函数即可

`main.go`

```go
func main() {
   var env string
   flag.StringVar(&env, "env", "", "")
   flag.Parse()
   config.InitConfig(env)

   router := gin.New()

   bootstrap.SetupDB()

   bootstrap.SetupRoute(router)

   err := router.Run(":" + config.Get("app.port"))
   if err != nil {
      fmt.Println(err)
   }
}
```

这一部分的内容无非是配置一些基本信息，总体上没有什么难度，下面我们来创建用户模型

# 创建用户模型

`app/models/model.go`

```go
// BaseModel 模型基类
type BaseModel struct {
   ID uint64 `gorm:"column:id;primaryKey;autoIncrement;" json:"id,omitempty"`
}

// CommonTimestampsField 时间戳
type CommonTimestampsField struct {
   CreatedAt time.Time `gorm:"column:created_at;index;" json:"created_at,omitempty"`
   UpdatedAt time.Time `gorm:"column:updated_at;index;" json:"updated_at,omitempty"`
}
```

我们先创建一些基本的字段以供将来的模型重复使用

`app/models/user/user_model.go`

```go
// User 用户模型
type User struct {
   models.BaseModel

   Name     string `json:"name,omitempty"`
   Email    string `json:"-"`
   Phone    string `json:"-"`
   Password string `json:"-"`

   models.CommonTimestampsField
}
```

这里我们创建了用户模型，我们顺便为这个模型创建一些必要的工具函数

`app/models/user/user_util.go`

```go
func IsEmailExist(email string) bool {
   var count int64
   database.DB.Model(User{}).Where("email = ?", email).Count(&count)
   return count > 0
}

func IsPhoneExist(phone string) bool {
   var count int64
   database.DB.Model(User{}).Where("phone = ?", phone).Count(&count)
   return count > 0
}
```

这样，我们就完成了现阶段的数据库集成，我们此时还没有在数据库中建立数据表，我们可以使用`gorm`中的自动迁移功能来帮助我们自动创建数据库表

> 数据库自动迁移

`bootstrap/database.go`

```go
func SetupDB() {
	.
    .
    .
   database.DB.AutoMigrate(&user.User{})
}
```

`gorm`会根据`User`结构体的字段来自动创建数据表，但是不会覆盖已经创建的字段，如果你已经自己创建了自己的数据表，你可以删除后重试。

本节的内容并不难，主要是完成了一些基本信息的创建。

