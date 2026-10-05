---
title: Go切片扩容
description: 以下的内容为Go1.20.2版本的扩容方式 Go数组的扩容机制简单来说分为两种情况 - 一种是原来的容量小于256，此时会将原来的容量翻倍作为新的容量 - 一种是容量大于等于256，会按照以下方式扩容直至可以满足需求 $$ newcap+=(newcap+3∗256)/4 $$ 这是大致的分配方式，
date: 2023-09-09T16:20:42+08:00
tags: []
categories: []
legacyPath: /2023/09/09/Go切片扩容/
---

以下的内容为Go1.20.2版本的扩容方式

Go数组的扩容机制简单来说分为两种情况

- 一种是原来的容量小于256，此时会将原来的容量翻倍作为新的容量

- 一种是容量大于等于256，会按照以下方式扩容直至可以满足需求
  $$
  newcap+=(newcap+3∗256)/4
  $$
  

这是大致的分配方式，实际上情况还要更复杂一些，接下来通过切片扩容的代码来分析一些细节

```Go
newcap := oldCap
doublecap := newcap + newcap
if newLen > doublecap {
    newcap = newLen
} else {
    const threshold = 256
    if oldCap < threshold {
        newcap = doublecap
    } else {
        // Check 0 < newcap to detect overflow
        // and prevent an infinite loop.
        for 0 < newcap && newcap < newLen {
            // Transition from growing 2x for small slices
            // to growing 1.25x for large slices. This formula
            // gives a smooth-ish transition between the two.
            newcap += (newcap + 3*threshold) / 4
        }
        // Set newcap to the requested cap when
        // the newcap calculation overflowed.
        if newcap <= 0 {
            newcap = newLen
        }
    }
}
```

暂时得到的容量结果

| 情况                                    | newcap                                       |      |
| --------------------------------------- | -------------------------------------------- | ---- |
| 容量翻倍后不能满足需求                  | newcap = newLen                              |      |
| 容量翻倍可以满足需求，原容量小于256     | newcap = 2 * oldcap                          |      |
| 容量翻倍可以满足需求，原容量大于等于256 | newcap += (newcap + 3*256) / 4直至大于newLen |      |

我们暂时得到了一个newcap，但实际上最后扩容的过程中还要对这个newcap做一步最后的处理

```GO
lenmem = uintptr(oldLen) * et.size
newlenmem = uintptr(newLen) * et.size
capmem, overflow = math.MulUintptr(et.size, uintptr(newcap))
capmem = roundupsize(capmem)
newcap = int(capmem / et.size)
capmem = uintptr(newcap) * et.size

```

核心在这个roundupsize函数，至于下面的魔法数组如何得到就不深入探究了

```GO
var class_to_size = [_NumSizeClasses]uint16{0, 8, 16, 24, 32, 48, 64, 80, 96, 112, 128, 144, 160, 176, 192, 208, 224, 240, 256, 288, 320, 352, 384, 416, 448, 480, 512, 576, 640, 704, 768, 896, 1024, 1152, 1280, 1408, 1536, 1792, 2048, 2304, 2688, 3072, 3200, 3456, 4096, 4864, 5376, 6144, 6528, 6784, 6912, 8192, 9472, 9728, 10240, 10880, 12288, 13568, 14336, 16384, 18432, 19072, 20480, 21760, 24576, 27264, 28672, 32768}
var size_to_class8 = [smallSizeMax/smallSizeDiv + 1]uint8{0, 1, 2, 3, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17, 18, 18, 19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 22, 22, 22, 22, 23, 23, 23, 23, 24, 24, 24, 24, 25, 25, 25, 25, 26, 26, 26, 26, 27, 27, 27, 27, 27, 27, 27, 27, 28, 28, 28, 28, 28, 28, 28, 28, 29, 29, 29, 29, 29, 29, 29, 29, 30, 30, 30, 30, 30, 30, 30, 30, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 31, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32}

func roundupsize(size uintptr) uintptr {
	if size < _MaxSmallSize {
		if size <= smallSizeMax-8 {
			return uintptr(class_to_size[size_to_class8[divRoundUp(size, smallSizeDiv)]])
		} else {
			return uintptr(class_to_size[size_to_class128[divRoundUp(size-smallSizeMax, largeSizeDiv)]])
		}
	}
	if size+_PageSize < size {
		return size
	}
	return alignUp(size, _PageSize)
}

```

我们来看一段示例代码说明这个函数是如何工作的

```GO
package main

import "fmt"

func main() {
	s := []int{1,2}
	s = append(s,4,5,6)
	fmt.Printf("len=%d, cap=%d",len(s),cap(s))
}
```

| 切片 | len  | cap  |
| ---- | ---- | ---- |
| s    | 2    | 2    |


现在我们将容量翻倍得到4，但是现在需求的长度是5，所以翻倍不能满足要求，最后newcap直接更新为5。

这个数组要40个字节的空间，传入参数size为40，然后我们计算通过roundupsize得到最终结果

| 处理过程                       | 结果       |
| ------------------------------ | ---------- |
| divRoundUp(size, smallSizeDiv) | 40 / 8 = 5 |
| size_to_class8[5]              | 5          |
| class_to_size[5]               | 48         |


我们可以分析出最后得到的cap空间大小是48字节，也就是cap为6，所以扩容的结果最后为6

我们得到整个扩容过程

1. 看看翻倍原容量能否满足需求
   1. 不能，则先得到初步容量为需求的长度
   2. 能
      1. 原容量小于256，初步容量为原容量翻倍
      2. 原容量大于等于256，按照公式扩容直至满足需求
2. 最后将容量roundupsize

