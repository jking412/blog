---
title: Go init函数分析
description: "Go的所有init函数会在main函数执行之前运行，init的执行是runtime帮助我们完成的，我们来看看init的运行机制。 init函数的编译处理 initTask是init初始化工作的关键结构体，一个包会有一个对应的initTask: 1. state: 该包的初始化函数是否被执行 - 0:"
date: 2023-10-05T14:09:26+08:00
tags: []
categories: []
legacyPath: /2023/10/05/Go-init函数分析/
---

Go的所有init函数会在main函数执行之前运行，init的执行是runtime帮助我们完成的，我们来看看init的运行机制。

# init函数的编译处理

```go
type initTask struct {
	// TODO: pack the first 3 fields more tightly?
	state uintptr // 0 = uninitialized, 1 = in progress, 2 = done
	ndeps uintptr
	nfns  uintptr
	// followed by ndeps instances of an *initTask, one per package depended on
	// followed by nfns pcs, one per init function to run
}
```

initTask是init初始化工作的关键结构体，一个包会有一个对应的initTask:
1. state: 该包的初始化函数是否被执行
    - 0: 未执行
    - 1: 正在执行
    - 2: 执行完成

2. ndeps: 该包有几个依赖的包
3. nfns: 包中的初始化函数数量

虽然每个包都有一个对应的initTask，但是Go在`编译中只会为main包生成一个initTask符号main..initTask，并将其中的init函数命名为包名.init.0，包名.init.1...，其他包的initTask的位置我们可以通过main包的initTask的位置找到，具体如何寻找的会在第二部分中说明`，我们来看一段代码

`main.go`
```go
package main

import (
	"awesomeProject/test"
	"fmt"
)

func init() {
	var a = 100
	var b = 200
	b = a
	a = b
}

func init() {
	var a = 200
	fmt.Println(a)
}

func main() {
	fmt.Println(test.A)
}
```
`test/test.go`
```go
package test

import "fmt"

var A int

func init() {
	var b = 100
	fmt.Println(b)
}

```
我们在编译以后查看符号表
```shell
$ readelf -s main | grep -E 'main|test'
```
output:
```
   658: 0000000000433180   816 FUNC    GLOBAL DEFAULT    1 runtime.main
   659: 00000000004334c0    53 FUNC    GLOBAL DEFAULT    1 runtime.main.func2
   822: 0000000000441780   500 FUNC    GLOBAL DEFAULT    1 runtime.testAtomic64
  1021: 0000000000458140    58 FUNC    GLOBAL DEFAULT    1 runtime.main.func1
  1300: 0000000000463560  1279 FUNC    GLOBAL DEFAULT    1 strconv.roundShortest
  1517: 00000000004805c0    58 FUNC    GLOBAL DEFAULT    1 main.init.0
  1518: 0000000000480600   179 FUNC    GLOBAL DEFAULT    1 main.init.1
  1519: 00000000004806c0   171 FUNC    GLOBAL DEFAULT    1 main.main
  1520: 0000000000514de0    56 OBJECT  GLOBAL DEFAULT    9 main..inittask
  1522: 0000000000558e58     8 OBJECT  GLOBAL DEFAULT   12 awesomeProject/test.A
  1716: 000000000052b148     8 OBJECT  GLOBAL DEFAULT   11 runtime.main_ini[...]
  1717: 0000000000558dec     1 OBJECT  GLOBAL DEFAULT   12 runtime.mainStarted
  1748: 0000000000558fb8     8 OBJECT  GLOBAL DEFAULT   12 runtime.test_z64
  1749: 0000000000558fb0     8 OBJECT  GLOBAL DEFAULT   12 runtime.test_x64
  1779: 000000000052b188     8 OBJECT  GLOBAL DEFAULT   11 runtime.testSigtrap
  1780: 000000000052b190     8 OBJECT  GLOBAL DEFAULT   11 runtime.testSigusr1
  1821: 0000000000514020    32 OBJECT  GLOBAL DEFAULT    9 internal/testlog[...]
  2110: 00000000004b5d20     8 OBJECT  GLOBAL DEFAULT    2 runtime.mainPC

```
可以看到`main..inittask`，`main.init.0`，`main.init.1`，go在执行所有包init函数的过程中，会以`main包中的init为起点，通过依赖关系遍历到所有的包`

# 深入init函数的执行流程

go version: 1.20

我们先来找到runtime中调用init的部分
`runtime/proc.go`
```go
//go:linkname main_inittask main..inittask
var main_inittask initTask

func main(){
  ...
  doInit(&main_inittask) // Must be before defer.
  ...
}
```

通过观察我们发现`main_inittask这个变量链接的就是main..inittask，也就是main包的inittask`

现在我们已经得到了main的inittask，接下来我们深入看看doInit是如何运行的
`runtime/proc.go`
```go
func doInit(t *initTask) {
	switch t.state {
	case 2: // fully initialized
		return
	case 1: // initialization in progress
		throw("recursive call during initialization - linker skew")
	default: // not initialized yet
		t.state = 1 // initialization in progress

		for i := uintptr(0); i < t.ndeps; i++ {
			p := add(unsafe.Pointer(t), (3+i)*goarch.PtrSize)
			t2 := *(**initTask)(p)
			doInit(t2)
		}

		if t.nfns == 0 {
			t.state = 2 // initialization done
			return
		}

		...

		firstFunc := add(unsafe.Pointer(t), (3+t.ndeps)*goarch.PtrSize)
		for i := uintptr(0); i < t.nfns; i++ {
			p := add(firstFunc, i*goarch.PtrSize)
			f := *(*func())(unsafe.Pointer(&p))
			f()
		}

		...

		t.state = 2 // initialization done
	}
}
```

在开始解读这一段代码之前，需要再次认识一次initTask结构体，你在go1.20中看到的initTask是被优化过的，实际内容如下:
```go
type initTask struct {
    state uintptr // 当前包在程序运行时的初始化状态： 0 = uninitialized, 1 = in progress, 2 = done
    ndeps uintptr // 当前包的依赖包的数量
    nfns  uintptr // 当前包的初始化函数数量
    deps  [ndeps]*initTask // 当前包的依赖包的initTask指针数组（不是slice）
    fns   [nfns]func ()    // 当前包的初始化函数指针数组（不是slice）
}
```

通过这个展开以后的initTask和doInit函数，我们可以分析出init函数执行的流程如下:
1. 先找到main包对应的initTask
2. 递归先执行依赖包的initTask，因为结构体中没有显示声明出对应的字段，所以需要自己运算出字段所在的位置

```go
// ndeps是依赖包的数量，也就是需要执行的initTask的数量
for i := uintptr(0); i < t.ndeps; i++ {
  // (3+i)*goarch.PtrSize，3是跳过initTask的前三个字段
  p := add(unsafe.Pointer(t), (3+i)*goarch.PtrSize)
  t2 := *(**initTask)(p)
  doInit(t2)
}
```

3. 最后再执行自己的包中的init函数
```go
// 跳过state，ndeps，nfns和deps
firstFunc := add(unsafe.Pointer(t), (3+t.ndeps)*goarch.PtrSize)
// 执行每个init函数
for i := uintptr(0); i < t.nfns; i++ {
  p := add(firstFunc, i*goarch.PtrSize)
  f := *(*func())(unsafe.Pointer(&p))
  f()
}
```
