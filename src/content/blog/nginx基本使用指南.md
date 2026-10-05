---
title: nginx基本使用指南
description: nginx是什么 nginx是一个由C语言编写的轻量级web服务器，占用内存小，并发能力强，性能非常优越，是当下非常流行的web服务器。除此以外，nginx还支持相当多的功能，包括但不限于 1. 反向代理 2. 负载均衡 3. 动静分离 这些也是nginx常见的应用场景，今天我们就来全面的介绍一下n
date: 2022-11-24T19:07:56+08:00
tags:
  - nginx
categories: []
legacyPath: /2022/11/24/nginx基本使用指南/
---

# nginx是什么

nginx是一个由C语言编写的轻量级`web服务器`，`占用内存小`，`并发能力强`，性能非常优越，是当下非常流行的web服务器。除此以外，nginx还支持相当多的功能，包括但不限于

1. 反向代理
2. 负载均衡
3. 动静分离

这些也是nginx常见的应用场景，今天我们就来全面的介绍一下nginx的应用

# 环境准备

操作系统采用`centos7`

nginx的安装相当简单，在centos中我们可以直接用yum安装

 ```shell
 $ yum install nginx
 ```

在安装的众多文件中，有两个文件是要注意的

- `/etc/nginx`：存放nginx的配置文件
- `/usr/share/nginx/html`：nginx默认的web根

接下来启动nginx试试

```shell
$ systemctl start nginx
# 再来测试看看，能正确返回内容即可
$ curl localhost
```

在浏览器中访问服务器ip，出现下图页面即成功

![image-20221124193645099](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/image-20221124193645099.png)

这里列出一下常用命令

```shell
nginx -s reload  # 向主进程发送信号，重新加载配置文件，热重启
nginx -s reopen	 # 重启 Nginx
nginx -s stop    # 快速关闭
nginx -s quit    # 等待工作进程处理完成后关闭
nginx -T         # 查看当前 Nginx 最终的配置
nginx -t -c <配置路径>    # 检查配置是否有问题，如果已经在配置目录，则不需要-c
systemctl start nginx    # 启动 Nginx
systemctl stop nginx     # 停止 Nginx
systemctl restart nginx  # 重启 Nginx
systemctl reload nginx   # 重新加载 Nginx，用于修改配置后
systemctl enable nginx   # 设置开机启动 Nginx
systemctl disable nginx  # 关闭开机启动 Nginx
systemctl status nginx   # 查看 Nginx 运行状态
```

# nginx配置文件

我们先来看看nginx的主配置文件

```shell
$ cd /etc/nginx
$ cat 
```

```
# For more information on configuration, see:
#   * Official English Documentation: http://nginx.org/en/docs/
#   * Official Russian Documentation: http://nginx.org/ru/docs/

user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;

# Load dynamic modules. See /usr/share/doc/nginx/README.dynamic.
include /usr/share/nginx/modules/*.conf;

events {
    worker_connections 1024;
}

http {
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile            on;
    tcp_nopush          on;
    tcp_nodelay         on;
    keepalive_timeout   65;
    types_hash_max_size 4096;

    include             /etc/nginx/mime.types;
    default_type        application/octet-stream;

    # Load modular configuration files from the /etc/nginx/conf.d directory.
    # See http://nginx.org/en/docs/ngx_core_module.html#include
    # for more information.
    include /etc/nginx/conf.d/*.conf;

    server {
        listen       80;
        listen       [::]:80;
        server_name  _;
        root         /usr/share/nginx/html;

        # Load configuration files for the default server block.
        include /etc/nginx/default.d/*.conf;

        error_page 404 /404.html;
        location = /404.html {
        }

        error_page 500 502 503 504 /50x.html;
        location = /50x.html {
        }
    }

# Settings for a TLS enabled server.
#
#    server {
#        listen       443 ssl http2;
#        listen       [::]:443 ssl http2;
#        server_name  _;
#        root         /usr/share/nginx/html;
#
#        ssl_certificate "/etc/pki/nginx/server.crt";
#        ssl_certificate_key "/etc/pki/nginx/private/server.key";
#        ssl_session_cache shared:SSL:1m;
#        ssl_session_timeout  10m;
#        ssl_ciphers HIGH:!aNULL:!MD5;
#        ssl_prefer_server_ciphers on;
#
#        # Load configuration files for the default server block.
#        include /etc/nginx/default.d/*.conf;
#
#        error_page 404 /404.html;
#            location = /40x.html {
#        }
#
#        error_page 500 502 503 504 /50x.html;
#            location = /50x.html {
#        }
#    }

}
```

结构还是比较清晰的，基本语法如下

- 每条指令由`;`结尾
- 每个指令块由`{}`区分
- `#`注释

从上面的配置文件我相信你多少可以看出一些nginx的配置内容，但是这个文件还是过于复杂了，我们先从简单开始编写配置文件。

这里只介绍一条指令

`include` :可以引入其它的nginx配置文件，我们可以看到nginx主配置文件已经引入了`/etc/nginx/conf.d/*.conf`文件，所以我们下面将会在`conf.d`文件夹下新建配置文件，这样既可以保持主配置文件的整洁性，也有利于划分模块。

# nginx作为web服务器

先允许一下其它用户修改nginx配置文件

```shell
$ cd /etc/nginx
$ sudo chmod o+x conf.d
```

在`conf.d`文件夹下我们新建`static.conf`文件

文件内容如下

```nginx
server{
  
    listen 8000;
    server_name localhost;
    
    location / {
        root /home/admin/www;
        index index.html;
    }
  
}
```

## listen

该指令用户声明监听的位置，格式为有如下几种：

- `127.0.0.1`——只声明ip，默认监听80
- `80`——声明端口
- `127.0.0.1:80`——声明具体的ip和端口

## server name

用于区分请求的虚拟主机，也就是请求中的`Host`字段，例如：

- `localhost:8000`的Host是`localhost`

- `nginx:8000`的Host是`nginx`

当nginx有多个server监听一个端口的时候可以用主机名区分，当主机名在`server_name`中没有匹配时，nginx会默认匹配第一个`server`，所以在只有一个server的使用server_name可以任意取

## location

location用于匹配uri，声明匹配的路径和模式

## 测试

与此同时我们创建好`/home/admin/www`目录，并且在目录下新建`index.html`，文件内容意思一下即可

```html
Static Server Success!
```

最后重启nginx

```shell
# 检查配置文件正确性
$ sudo nginx -t
$ sudo nginx -s reload
# 测试一下能否看到 Static Server Success!
$ curl localhost:8000
```

> 要注意，web根目录`/home/admin/www`中的所有文件夹都应该对其它用户有执行权限，否则nginx将产生403错误
>
> 可以使用`chmod o+x -R admin`来解决



# 反向代理

## 了解正向代理和反向代理

先了解一下正向代理和反向代理

- 正向代理

![](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/forward-proxy-flow.svg)

给客户端做代理就是正向代理

- 反向代理

![](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/reverse-proxy-flow.svg)



反之，给服务器做代理就是反向代理

## 开始一个简单的服务

既然是反向代理，我们需要一个简单的http服务，这里用Go写一个

```go
package main

import "net/http"

func main() {
	http.HandleFunc("/hello", func(w http.ResponseWriter, req *http.Request) {
		w.Write([]byte("hello"))
	})

	http.HandleFunc("/", func(w http.ResponseWriter, req *http.Request) {
		w.Write([]byte(req.RequestURI))
	})

	http.ListenAndServe(":3000", nil)
}

```

看不懂也没有关系，这个服务就是监听了`3000`端口，访问`localhost:3000/hello`时返回`hello`，其余所有请求都会被匹配到第二个处理器，会打印出请求的`URI`

这里就使用nginx反向代理，让我们在`8001`端口发送的请求可以转发给`3000`端口

新建文件`reverse_proxy.conf`，配置如下

```nginx
server {
  
  listen 8001;
  
  server_name localhost;
  
  location / {
    proxy_pass http://localhost:3000;
  }

}
```

## proxy_pass

将接受的请求转发到指定的服务上

这里要注意以下两种`location`

- 转发的地址结尾`没有路径`

```nginx
location /api {
    proxy_pass http://localhost:3000;
  }
```

当配置如上时，请求的`URI`会被`全部追加到转发地址后面`，例如`localhost:8001/api/hello`，后面的`/api/hello`被追加到`localhost:3000`的后面，最后的转发地址是`localhost:3000/api/hello`

- 转发的地址结尾`有路径`

```nginx
location /api {
    proxy_pass http://localhost:3000/v1;
  }
```

当配置如上时，`URI会在去掉前缀以后追加到转发地址后面`

例如请求：`localhost:8001/api/hello`，转发地址为`localhost:8001/v1/hello`

---

重新加载配置文件

```shell
$ sudo nginx -t # 检查配置文件语法
$ sudo nginx -s reload
$ curl localhost:8001/hello # 返回hello即为成功
```

我们试着改变`proxy_pass`如下

```nginx
location /api {
    proxy_pass http://localhost:3000/v1;
  }
```

```shell
$ sudo nginx -t # 检查配置文件语法
$ sudo nginx -s reload
$ curl localhost:8001/api/hello # 返回结果是/v1/hello
```





# 动静分离

动静分离可以理解为把上面的两个功能结合，将静态文件的处理交给nginx，这样可以减小后端服务器的压力，提高性能。

在使用动静分离之前我们先了解以下location的匹配规则和修饰符

## location匹配规则和修饰符

location默认是最长前缀匹配，也就是说根据前缀去匹配路径，当有多个location符合时，选择最长的。

此外，location还有下面四种最常用的修饰符，优先级从高到低列出

- `=`     等于，严格匹配 ，匹配优先级最高。

- `^~`  表示普通字符匹配。使用前缀匹配。如果匹配成功，则不再匹配其它 location。优先级第二高。

- `~ `    区分大小写

- `~* ` 不区分大小写

- 无修饰符

可以发现`^~`和无修饰符匹配规则相同，但是优先级不同

---

这里我们就直接来看两个处理静态资源的例子

```nginx
location ^~ /images/ {
    root   /usr/share/nginx/html; # 静态资源目录
}

location ~ \.jpg {
    root   /usr/share/nginx/html;
}
```

第一个是普通匹配，匹配`imags`开头的请求

第二个是区分大小写的正则匹配，匹配含有`.jpg`的请求

# 缓冲和缓存

首先我们要区别开缓冲与缓存。

![](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/nginx%E7%BC%93%E5%86%B2%E4%B8%8E%E7%BC%93%E5%AD%98.png)

缓冲实际上并没有减少发送到服务端的请求数量。

## 缓冲

当客户端与服务器之间网络状况不佳时，nginx可能要花费较长的时间把响应发送给客户端，这样会导致nginx与server端的连接被占用，导致资源的浪费，所有我们可以把响应先缓冲到nginx服务器，释放连接资源。

### proxy_buffering

控制缓冲是否开启，打开为`on`，关闭为`off`

```nginx
proxy_buffering on;
```

### proxy_buffer_size

用于设置读取server端的初始响应部分的大小，这个初始响应部分一般是`response header`，大小一般配置为`4K`或者`8K`，根据操作系统选择，在linux上查看方式如下

```shell
$ getconf PAGE_SIZE
```

```nginx
proxy_buffer_size 4k;
```

### proxy_buffers

配置读取server端响应的缓冲区个数和大小，大小一般为内存页，值得注意的是这里的个数和大小是针对每个连接的

```nginx
proxy_buffers 16 4K;
```

### proxy_busy_buffers_size

配置当server端未读取完成时，允许开始给客户端发送响应的缓冲区大小，通常设置成两个内存页的大小

```nginx
proxy_busy_buffers_size 8K;
```

### proxy_max_temp_file_size

当缓冲的大小超过缓冲区允许的内存大小之后，会把响应内容写入磁盘临时文件，该参数用于配置磁盘临时文件的最大空间

```nginx
proxy_max_temp_file_size 1024m;
```

###  proxy_temp_file_write_size

配置每个连接允许写入磁盘临时文件的最大空间

 ```nginx
 proxy_temp_file_write_size 8k;
 ```

来看一个例子

```nginx
http {
    
    server {
        listen 80;
        location /cache  {
            proxy_pass http://192.168.1.135:8080;

            #默认开启，开启代理缓冲区（内存）
            proxy_buffering on;
            #设置响应头的缓冲区设为8k
            proxy_buffer_size 8k;
            #设置网页内容缓冲区个数为8，单个大小为8k
            proxy_buffers 8 8k;
            #设置当nginx还在读取被代理服务器的数据响应的同时间一次性向客户端响应的数据的最大为16k
            proxy_busy_buffers_size 16k;
            #临时文件最大为1024m
            proxy_max_temp_file_size 1024m;
            #设置一次往临时文件的大小最大为16k
            proxy_temp_file_write_size 16k;
            #设置临时文件存放目录
            proxy_temp_path /tmp/proxy_temp;

        }
    }
}

```

## 缓存

### proxy_cache_path

```nginx
proxy_cache_path  /tmp/nginx/cache levels=1:2  keys_zone=mycache:10m max_size=10g;
```

配置nginx缓存，有如下选项

- `/tmp/nginx/cache`：缓存路径

- `levels=1:2`：在默认情况下nginx缓存文件会放在一个文件夹下，但是这样会降低缓存性能，采用`1:2`的方式来设置多级目录，

  数字的含义是文件夹命名采用几位16进制，也就是第一级目录是1，采用1位16进制，有16个目录，二级目录有256个文件夹，总共有16*256个缓存文件

- `key_zone`：配置共享内存中放置缓存key字符串的空间大小，通过key可以快速判断一个request是否命中缓存，`1m`的空间可以放置大约`8000`个key

- `max_size`：缓存最大空间

- `inactive`：设置未访问文件被删除的时间，即便这个文件没有过期	

### proxy_cache_bypass

配置何时不适用缓存，通常是在客户端请求带有`no-cache`参数时

```nginx
proxy_cache_bypass $arg_nocache $arg_comment;
```

### proxy_cache_key

缓存的key值，该key值用于在内存中建立索引，其md5值是缓存文件名，格式一般设置如下

```nginx
proxy_cache_key $scheme$proxy_host$uri$is_args$args;
```

### proxy_cache_methods

缓存的请求方法

### proxy_cache_valid

设置开启缓存的状态码和缓存的时间

### proxy_cache_min_uses

设置开启缓存的最小请求次数，可以避免对低频率请求缓存

下面是一个例子

```nginx
http {
    #设置缓存路径和相关参数（必选）
    proxy_cache_path  /tmp/nginx/cache levels=1:2  keys_zone=mycache:10m max_size=10g;
    server {
        listen 80;
        location /cache  {
            proxy_pass http://192.168.1.135:8080;

            #引用缓存配置（必选）
            proxy_cache mycache;

            #对响应状态码为200 302的响应缓存100s
            proxy_cache_valid 200 302 100s;
            #对响应状态码为404的响应缓存200
            proxy_cache_valid 404 200s;

            #请求参数带有nocache或者comment时不使用缓存
            proxy_cache_bypass $arg_nocache $arg_comment;

            #忽略被代理服务器设置的"Cache-Control"头信息
            proxy_ignore_headers "Cache-Control"; 

            #对GET HEAD POST方法进行缓存 
            proxy_cache_methods GET HEAD POST;

            #当缓存过期时，当构造上游请求时，添加If-Modified-Since和If-None-Match头部，值为过期缓存中的Last-Modified值和Etag值。
            proxy_cache_revalidate on;

            #当被代理服务器返回403时，nginx可以使用历史缓存来响应客户端，该功能在一定程度上能能够为客户端提供不间断访问
            proxy_cache_use_stale http_403;
        }
    }
}

```

未完待续...
