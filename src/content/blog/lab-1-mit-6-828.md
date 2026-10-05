---
title: lab-1(mit-6.828)
description: Exercise 3 1. At what point does the processor start executing 32-bit code? What exactly causes the switch from 16- to 32-bit mode? 从这一行开始执行32行代码 开启保护
date: 2023-07-15T06:33:21+08:00
tags: []
categories:
  - mit-6.828
legacyPath: /2023/07/15/lab-1-mit-6-828/
---

# Exercise 3

1. At what point does the processor start executing 32-bit code? What exactly causes the switch from 16- to 32-bit mode?

从这一行开始执行32行代码

![image-20230715070948942](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/linux/image-20230715070948942.png)

开启保护模式，开启32位模式

![image-20230715071443430](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/linux/image-20230715071443430.png)

2. What is the *last* instruction of the boot loader executed, and what is the *first* instruction of the kernel it just loaded?

bootloader执行的最后一行代码

![image-20230715071644168](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/linux/image-20230715071644168.png)

kernel的第一条指令

![image-20230715071742600](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/linux/image-20230715071742600.png)

3. *Where* is the first instruction of the kernel?

同上

4. How does the boot loader decide how many sectors it must read in order to fetch the entire kernel from disk? Where does it find this information?

bootloader首先读取除了启动扇区（第0扇区）之外的前8个扇区

![image-20230715073251117](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/linux/image-20230715073251117.png)

这次读取的大小已经足够了，足够读入内核的ELF header到内存中，有了ELF header之后，可以通过ELF header的信息获取Program header，Program header记录了要读入部分的信息，根据这个信息，bootloader将整个内核装载进入内核

![image-20230715073638805](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/linux/image-20230715073638805.png)



# Exercise 7

目前，还没有开启分页，无法访问`0xf0100000`

![image-20230715075107352](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/linux/image-20230715075107352.png)

接下来，我们开启分页，可以看到这两个地址实际映射的内存是一样的

![image-20230715075330528](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/linux/image-20230715075330528.png)

# Exercise 8

这个部分参照其他16进制的实现，我们可以得到以下代码

![image-20230715080543059](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/linux/image-20230715080543059.png)

following question:

1. Explain the interface between `printf.c` and `console.c`. Specifically, what function does `console.c` export? How is this function used by `printf.c`?

`console.c`导出了 `putch` 这个函数

![image-20230715081240430](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/linux/image-20230715081240430.png)

`printf.c`中通过函数指针的方式调用这个函数

![image-20230715081507658](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/linux/image-20230715081507658.png)

2. Explain the following from`console.c`

```c
1      if (crt_pos >= CRT_SIZE) {
2              int i;
3              memmove(crt_buf, crt_buf + CRT_COLS, (CRT_SIZE - CRT_COLS) * sizeof(uint16_t));
4              for (i = CRT_SIZE - CRT_COLS; i < CRT_SIZE; i++)
5                      crt_buf[i] = 0x0700 | ' ';
6              crt_pos -= CRT_COLS;
7      }
```

简单来说，这里的代码的作用是当需要显示的内容超过屏幕时，将整体的内容上移一行

## Challenge

## 控制命令

我们常用的`printf`函数输出来的颜色是终端的配色。如果想要输出不同的颜色进行区分，就需要用到`printf`的控制命令：`\033[m`。

控制命令以`\033[`开头，以`m`结尾，而中间则是属性码，属性代码之间使用`;`分隔，如`\033[1;34;42m`。而属性代码的含义见下面的表格。

## printf属性代码

这里列举了三类属性代码，当然这只是一部分。

### 通用格式控制

| 属性代码 | 功能         |
| -------- | ------------ |
| 0        | 重置所有属性 |
| 1        | 高亮/加粗    |
| 2        | 暗淡         |
| 4        | 下划线       |
| 5        | 闪烁         |
| 7        | 反转         |
| 8        | 隐藏         |

### 前景色

| 属性代码 | 颜色 |
| -------- | ---- |
| 30       | 黑色 |
| 31       | 红色 |
| 32       | 绿色 |
| 33       | 黄色 |
| 34       | 蓝色 |
| 35       | 品红 |
| 36       | 青色 |

### 背景色

| 属性代码 | 颜色 |
| -------- | ---- |
| 40       | 黑色 |
| 41       | 红色 |
| 42       | 绿色 |
| 43       | 黄色 |
| 44       | 蓝色 |
| 45       | 品红 |
| 46       | 青色 |

根据如上ANSI转义序列的标准，我实现了部分颜色，修改部分的代码如下

`printfmt.c`中的`vprintfmt`函数修改如下

```c
#define RESET 0
#define BOLD 1

#define FBLACK 30
#define FRED  31
#define FGREEN  32
#define FYELLOW  33
#define FBLUE 34
#define FDEFAULT 39
#define BBLACK 40
#define BRED  41
#define BGREEN 42
#define BYELLOW 43
#define BBLUE 44
#define BDEFAULT 49

#define ESC '\033'
#define START '['
#define END 'm'
#define DELIMITER ';'


// default black background, white foreground
static int color = 0x0700;

int
parse_str2int(const char *s, int start, int end){
	int result = 0;
	for(int i = start ; i < end ; i++){
		result *= 10;
		result += s[i] - '0';
	}
	return result;
}

void set_color(int r){
	// cprintf("r : %d\n", r);
	if(r / 10 == 3){
		color &= 0xf0ff;
	}else if(r / 10 == 4){
		color &= 0x0fff;
	}

	switch (r){
	case RESET:
		color = 0x0700;
		break;
	case BOLD:
		color |= 0x0800;
		break;
	case FBLACK:
		color |= 0x0000;
		break;
	case FBLUE:
		color |= 0x0100;
		break;
	case FGREEN:
		color |= 0x0200;
		break;
	case FRED:
		color |= 0x0400;
		break;
	case FYELLOW:
		color |= 0x0600;
		break;
	case FDEFAULT:
		color |= 0x0700;
		break;
	case BBLACK:
		color |= 0x0000;
		break;
	case BBLUE:
		color |= 0x1000;
		break;
	case BGREEN:
		color |= 0x2000;
		break;
	case BRED:
		color |= 0x4000;
		break;
	case BYELLOW:
		color |= 0x6000;
		break;
	case BDEFAULT:
		color |= 0x7000;
		break;
	default:
		break;
	}
	// cprintf("color : %x\n", color);
}

void
vprintfmt(void (*putch)(int, void*), void *putdat, const char *fmt, va_list ap)
{
	register const char *p;
	register int ch, err;
	unsigned long long num;
	int base, lflag, width, precision, altflag;
	char padc;

	while (1) {
		while ((ch = *(unsigned char *) fmt++) != '%') {
			if (ch == '\0')
				return;
			if (ch == ESC) {
				if(*fmt++ != START)
					continue;
				const char * str = fmt;
				int startidx = 0;
				while ((ch = *(unsigned char *) fmt++) != END){	
					if(ch == '\0')
						return;
				}
				
				int endidx = fmt - str - 1;
				int s = startidx;
				int e = endidx;

				for(int i = startidx ; i < endidx ; i++){
					if(str[i] == DELIMITER){
						e = i;
						int result = parse_str2int(str, s, e);
						s = i + 1;
						set_color(result);
					}					
				}
				int result = parse_str2int(str, s, endidx);
				set_color(result);
				putch(color, putdat);
				continue;
			}
			putch(ch, putdat);
		}

		// Process a %-escape sequence
		padc = ' ';
		width = -1;
		precision = -1;
		lflag = 0;
		altflag = 0;
	reswitch:
		switch (ch = *(unsigned char *) fmt++) {

		// flag to pad on the right
		case '-':
			padc = '-';
			goto reswitch;

		// flag to pad with 0's instead of spaces
		case '0':
			padc = '0';
			goto reswitch;

		// width field
		case '1':
		case '2':
		case '3':
		case '4':
		case '5':
		case '6':
		case '7':
		case '8':
		case '9':
			for (precision = 0; ; ++fmt) {
				precision = precision * 10 + ch - '0';
				ch = *fmt;
				if (ch < '0' || ch > '9')
					break;
			}
			goto process_precision;

		case '*':
			precision = va_arg(ap, int);
			goto process_precision;

		case '.':
			if (width < 0)
				width = 0;
			goto reswitch;

		case '#':
			altflag = 1;
			goto reswitch;

		process_precision:
			if (width < 0)
				width = precision, precision = -1;
			goto reswitch;

		// long flag (doubled for long long)
		case 'l':
			lflag++;
			goto reswitch;

		// character
		case 'c':
			putch(va_arg(ap, int), putdat);
			break;

		// error message
		case 'e':
			err = va_arg(ap, int);
			if (err < 0)
				err = -err;
			if (err >= MAXERROR || (p = error_string[err]) == NULL)
				printfmt(putch, putdat, "error %d", err);
			else
				printfmt(putch, putdat, "%s", p);
			break;

		// string
		case 's':
			if ((p = va_arg(ap, char *)) == NULL)
				p = "(null)";
			if (width > 0 && padc != '-')
				for (width -= strnlen(p, precision); width > 0; width--)
					putch(padc, putdat);
			for (; (ch = *p++) != '\0' && (precision < 0 || --precision >= 0); width--)
				if (altflag && (ch < ' ' || ch > '~'))
					putch('?', putdat);
				else
					putch(ch, putdat);
			for (; width > 0; width--)
				putch(' ', putdat);
			break;

		// (signed) decimal
		case 'd':
			num = getint(&ap, lflag);
			if ((long long) num < 0) {
				putch('-', putdat);
				num = -(long long) num;
			}
			base = 10;
			goto number;

		// unsigned decimal
		case 'u':
			num = getuint(&ap, lflag);
			base = 10;
			goto number;

		// (unsigned) octal
		case 'o':
			// Replace this with your code.
			num = getuint(&ap, lflag);
			base = 8;
			break;

		// pointer
		case 'p':
			putch('0', putdat);
			putch('x', putdat);
			num = (unsigned long long)
				(uintptr_t) va_arg(ap, void *);
			base = 16;
			goto number;

		// (unsigned) hexadecimal
		case 'x':
			num = getuint(&ap, lflag);
			base = 16;
		number:
			printnum(putch, putdat, num, base, width, padc);
			break;

		// escaped '%' character
		case '%':
			putch(ch, putdat);
			break;

		// unrecognized escape sequence - just print it literally
		default:
			putch('%', putdat);
			for (fmt--; fmt[-1] != '%'; fmt--)
				/* do nothing */;
			break;
		}
	}
}
```

`console.c`的`cga_putc`函数修改如下

```c
static int color = 0x0700;

static void
cga_putc(int c)
{
	// if no attribute given, then use black on white
	if (!(c & ~0xFF)){
		c |= color;
	}else{
		color = c;
		return;
	}

	switch (c & 0xff) {
	case '\b':
		if (crt_pos > 0) {
			crt_pos--;
			crt_buf[crt_pos] = (c & ~0xff) | ' ';
		}
		break;
	case '\n':
		crt_pos += CRT_COLS;
		/* fallthru */
	case '\r':
		crt_pos -= (crt_pos % CRT_COLS);
		break;
	case '\t':
		cons_putc(' ');
		cons_putc(' ');
		cons_putc(' ');
		cons_putc(' ');
		cons_putc(' ');
		break;
	default:
		crt_buf[crt_pos++] = c;		/* write the character */
		break;
	}

	// What is the purpose of this?
	if (crt_pos >= CRT_SIZE) {
		int i;

		memmove(crt_buf, crt_buf + CRT_COLS, (CRT_SIZE - CRT_COLS) * sizeof(uint16_t));
		for (i = CRT_SIZE - CRT_COLS; i < CRT_SIZE; i++)
			crt_buf[i] = 0x0700 | ' ';
		crt_pos -= CRT_COLS;
	}

	/* move that little blinky thing */
	outb(addr_6845, 14);
	outb(addr_6845 + 1, crt_pos >> 8);
	outb(addr_6845, 15);
	outb(addr_6845 + 1, crt_pos);
}
```

最后测试部分代码和实现效果如下

![image-20230715125445351](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/linux/image-20230715125445351.png)

打印出红色前景+绿色背景+高亮

![image-20230715125504804](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/linux/image-20230715125504804.png)

# Exercise 9

栈的结束地址是data段的开始，大小为8个页，32KB

![image-20230715154242652](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/linux/image-20230715154242652.png)

![image-20230715154459904](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/linux/image-20230715154459904.png)

# Exercise 10

下面是C语言函数调用时栈的内存图

![v2-88c6f207393b2d475335ebe11a32994b](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/linux/v2-88c6f207393b2d475335ebe11a32994b.png)

# Exercise 11

在`entry.S`中将ebp初始化为0,说明当ebp为0时栈帧就结束了，根据练习10的模型，可以遍历所有的栈帧

```c
int
mon_backtrace(int argc, char **argv, struct Trapframe *tf)
{
	// Your code here.
	uint32_t ebp,eip;
	for(ebp = read_ebp();ebp != 0 ; ebp = *((uint32_t*)ebp)){
		eip = *(uint32_t*)(ebp + 4);
		cprintf("ebp %x eip %x args ",ebp,eip);
		for(int i = 2 ; i < 7 ; i++){
			cprintf("%08x ",*((uint32_t*)(ebp + i * 4)));
		}
		cprintf("\n");
	}
	return 0;
}
```

可以得到输出如下

![image-20230715173226989](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/linux/image-20230715173226989.png)

# Exercise 12

这个练习只需要添加调试信息的打印即可

```c
int
mon_backtrace(int argc, char **argv, struct Trapframe *tf)
{
	// Your code here.
	uint32_t ebp,eip;
	for(ebp = read_ebp();ebp != 0 ; ebp = *((uint32_t*)ebp)){
		eip = *(uint32_t*)(ebp + 4);
		cprintf("ebp %x eip %x args ",ebp,eip);
		for(int i = 2 ; i < 7 ; i++){
			cprintf("%08x ",*((uint32_t*)(ebp + i * 4)));
		}
		cprintf("\n");
		struct Eipdebuginfo info;
		debuginfo_eip(eip,&info);
		cprintf("\t%s:%d: %.*s+%d\n",info.eip_file,info.eip_line,info.eip_fn_namelen,info.eip_fn_name,info.eip_fn_addr);
	}
	return 0;
}
```

