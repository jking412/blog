---
title: 『mysql』mysql快速入门
description: 一、基本概念 数据库术语 - 数据库（database）-保存有组织的数据的容器 - 数据表（table）-某种特定数据类型的结构化清单 - 模式（schema）-关于数据库和数据表的特性信息 - 列（column）：表中的一个字段 - 行（row）表中的一个记录 - 主键（primary key）
date: 2022-10-15T06:57:38+08:00
tags:
  - mysql
categories: []
legacyPath: /2022/10/15/mysql快速入门/
---

# 一、基本概念

![](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/20200115160512.png)

## 数据库术语

- `数据库（database）`-保存有组织的数据的容器
- `数据表（table）`-某种特定数据类型的结构化清单
- `模式（schema）`-关于数据库和数据表的特性信息
- `列（column）`：表中的一个字段
- `行（row）`表中的一个记录
- `主键（primary key）`：一个特殊的列，可以唯一的标识数据表中的一行数据

## SQL语法

SQL即Structed Query Language，在此基础上每个数据库都有对自己SQL的实现

## SQL语法结构

![](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/sql-syntax.png)

## SQL语法要点

- SQL不区分大小写
- SQL之间必须要以分号隔开
- SQL处理时所有中间的空格都会被忽略，SQL可以写成一行，也可以写成多行
- SQL的三种注释方法

```sql
# 注释1
-- 注释2
/* 注释3 */
```

## SQL分类

### 数据定义语言（DDL）

> 什么是DDL

数据定义语言（Data Definition Language）是SQL语言集中负责数据结构定义和数据对象定义的语言。

> 核心功能

定义数据库对象

> 核心指令

- `CREATE`
- `ALTER`
- `DROP`

### 数据操纵语言（DML）

> 什么是DML

数据操纵语言（Data Manipulation Language）用于操作数据库，对数据其中的对象操作和访问的编程语句。

> 核心功能

访问数据，主要功能在于读写数据库

> 核心指令

- `INSERT`
- `UPDATE`
- `DELETE`
- `SELECT`

### 事务控制语言（TCL）

> 什么是TCL

事务控制语言（Transaction Control Language）是用于控制事务的语言。

>核心功能

事务控制

> 核心指令

- `COMMIT`-提交事务
- `ROLLBACK`-事务回滚

### 数据控制语言（DCL）

> 什么是DCL

数据控制语言（Data Control ）用于控制数据访问权限

> 核心功能

控制数据访问权

> 核心指令

- `GRANT`
- `REVOKE`

不同数据库管理系统之间的安全实体有所不同

# 二、快速开始

## 登录mysql

首先登录我们的mysql

```shell
$ mysql -u root -p
```

然后输入密码

## 使用mysql增删改查

```sql
# 创建数据库
CREATE DATABASE mysql_practice;
#  使用这个数据库
USE mysql_practice;
# 创建数据表
CREATE TABLE users(
	id int,
    username varchar(255)
);
# 我们先插入一条数据
INSERT INTO users VALUES (1,'Mike');
# 查出我们之前插入的数据
SELECT * FROM users;
+------+----------+
| id   | username |
+------+----------+
|    1 | Mike     |
+------+----------+
# 更新
UPDATE users SET username='john';
## 再次查询一下
+------+----------+
| id   | username |
+------+----------+
|    1 | john     |
+------+----------+
# 最后我们尝试把这个数据删除
DELETE FROM users where id=1; 
# 再查询一下，出现这样就成功了
Empty set
```

到目前为止，你已经会mysql最基本的增删改查了
