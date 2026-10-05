---
title: Codeforces Round 779 (Div. 2)(Permutationforces)
description: A. Marin and Photoshoot 题意： 给定一个由0和1组成的序列，现在可以往这个序列中添加1，是的这个序列满足如下要求： 对于任意长度大于等于2的区间，要求这个区间中1的个数大于等于0的个数。 思路： 添加1，使得序列中不存在如下情况： 00或者010 即保证两个0之间的距离大于等
date: 2022-04-12T18:33:55+08:00
tags:
  - Codeforces
categories:
  - 题解
legacyPath: /2022/04/12/Codeforces-Round-779-Div-2-Permutationforces/
---

![请添加图片描述](https://img-blog.csdnimg.cn/10dbb89dba6041cbbd91a9c0776d5a27.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAdGltZXJfY2F0Y2g=,size_20,color_FFFFFF,t_70,g_se,x_16)

## A. Marin and Photoshoot

**题意：**

>给定一个由0和1组成的序列，现在可以往这个序列中添加1，是的这个序列满足如下要求：
>对于任意长度大于等于2的区间，要求这个区间中1的个数大于等于0的个数。

**思路：**

>添加1，使得序列中不存在如下情况：
>00或者010
>即保证两个0之间的距离大于等于2。

**时间复杂度：**

>$O(n)$

**AC代码：**
![在这里插入图片描述](https://img-blog.csdnimg.cn/6789fdb575c8426c9b1f9489886e1a9c.png)

```cpp
#include<bits/stdc++.h>

typedef long long ll;

const int N = 2e5+10,M = N * 4,INF = 0x3f3f3f3f,mod = 1e9+7;

void solve()
{
    int n;
    std::string s;
    std::cin>>n>>s;
    int res = 0,last = -1;
    for(int i = 0 ; i < n ; i++)
    {
        if(s[i]=='0')
        {
            if(last==-1)last = i;
            else
            {
                if(i-last<=2)res += 3 - (i - last);
                last = i;
            }
        }
    }
    std::cout<<res<<'\n';
}

int main()
{
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);
    std::cout.tie(nullptr);
    int T;
    std::cin>>T;
    while(T--)
    {
        solve();
    }
    return 0;
}
```

## B. Marin and Anti-coprime Permutation

**题意：**

>要求构造一个长度为n的全排列，满足如下要求：
>$gcd(1*p_{1},2*p_{2},\dots n-1*p_{n-1},n*p_{n}) > 1$
>询问有几种方案满足上述要求。

**思路：**

>选取任意的k，那么存在k的因子的数必然k的倍数。
>因此不难推知n个数里面包含k的因子的数有$\left \lceil \frac{n}{k} \right \rceil$个，那么加上要乘的数，所以包含k的因子的个数应该是$2*\left \lceil \frac{n}{k} \right \rceil$个。
>我们我保证$2*\left \lceil \frac{n}{k} \right \rceil \geq n$，因此只能取k=2。
>那么就让所有的数相乘后为偶数，即让奇数乘偶数位，偶数乘奇数位即可。
>1.若n为偶数,结果为$(\frac{n}{2})!*(\frac{n}{2})!$
>2.若n为奇数，结果为0。

**时间复杂度：**

>$O(n)$

**AC代码：**
![在这里插入图片描述](https://img-blog.csdnimg.cn/e8aefd71c06b4a2e8496785850636429.png)

```cpp
#include<bits/stdc++.h>

typedef long long ll;

const int N = 2e5+10,M = N * 4,INF = 0x3f3f3f3f,mod = 998244353 ;

void solve()
{
    int n;
    std::cin>>n;
    ll res = 1;
    if(n&1)
    {
        std::cout<<0<<'\n';
        return;
    }
    for(int i = 1 ; i <= n/2 ; i++)
        res = (i*res) % mod;
    std::cout<<res*res%mod<<'\n';
}

int main()
{
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);
    std::cout.tie(nullptr);
    int T;
    std::cin>>T;
    while(T--)
    {
        solve();
    }
    return 0;
}
```

## C. Shinju and the Lost Permutation

**题意：**

>给定一个全排列：
>$p_{1},p_{2}\dots p_{n-1},p_{n}$
>再由这个全排列可以得到另一个数组a
>$a_{1},a_{2}\dots a_{n-1},a_{n},a_{i}=max\ (p_{j}(1\leq j\leq i))$
>定义 c 为数组a中不同数的个数，并称 c 是数组 a 的幂。
>那么我们把这个数组p全体向右移动一个单位，这样又可以确定一个数组a，进而确定 c 的值。
>我们让$c_{i}$表示全排列向右移动$i$次的值。
>现给定数组$c_{i}$，询问能否存在全排列，使得移动$i$次的值等于$c_{i}$。


**思路：**

>产生的数组 c 要满足如下要求：
>1.移动过程中，我们考虑当最大数移动到第一个位置时，此时的 c 必然是 1，且只有这种情况 c 为 1。
>2.将1中的全排列向右移动一个单位，此时 c 必然是 2。
>3.那么在之后的移动过程中，c 每次最多可以增加 1(要注意，最大数以后的数必然只能为 c 提供 1 的 贡献)，或者可以减小若干。
>因此，我们只需要判断 c 是否满足如下情况：
>1.c = 1 应该有且只有一个。
>2.从1的位置开始判断，每次最多只会增加1，或者减小若干。

**时间复杂度：**

>$O(n)$

**AC代码：**
![在这里插入图片描述](https://img-blog.csdnimg.cn/54f6b69552224331bec1551c07d57cb8.png)

```cpp
#include<bits/stdc++.h>

typedef long long ll;

const int N = 1e5+10,M = N * 4,INF = 0x3f3f3f3f,mod = 998244353 ;

int a[N];

void solve()
{
    int n;
    std::cin>>n;
    int index = -1,cnt = 0;
    for(int i = 1 ; i <= n ; i++)
    {
        std::cin>>a[i];
        if(a[i] == 1)index = i,cnt++;
    }
    if(index==-1||cnt>1)
    {
        std::cout<<"NO\n";
        return;
    }
    for(int i = 1 ; i < n ; i++)
    {
        int x = index + 1;
        if(x==n+1)x = 1;
        if(a[x] - a[index] >= 2)
        {
            std::cout<<"NO\n";
            return;
        }
        index++;
        if(index==n+1)index = 1;
    }
    std::cout<<"YES\n";
}

int main()
{
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);
    std::cout.tie(nullptr);
    int T;
    std::cin>>T;
    while(T--)
    {
        solve();
    }
    return 0;
}
```

## D1. 388535 (Easy Version)

**题意：**

>给定从L(L = 0)到R的一个全排列和一个整数 x 。现在对这个全排列的每个数都执行如下操作：
>$a_{i} = a_{i}\bigoplus x(1\leq i \leq n)$
>给出操作完后的数组，询问是否存在 x 。

**思路：**

>因为全排列是从0开始，我们可以发现在每一位数字上0的个数必然大于等于1的个数，因此我们我们只要保证这一条件即可构造出答案 x ：
>对于第 $i$ 位，我们构造如下：
>1.若$cnt_{1} > cnt_{0}$，该位取1
>2.若$cnt_{1} \leq cnt_{0}$，该位取0

>举例：
>0~7
>0000
>0001
>0010
>0011
>0100
>0101
>0110
>0111
>每一位上显然有$cnt_{1} \leq cnt_{0}$。

**时间复杂度：**

>$O(nlogn)$

**AC代码：**
![在这里插入图片描述](https://img-blog.csdnimg.cn/e436b793be9a49fc856e7a078975da5e.png)

```cpp
#include<bits/stdc++.h>

typedef long long ll;

const int N = 1e5+10,M = N * 4,INF = 0x3f3f3f3f,mod = 998244353 ;

int a[20][2];

void solve()
{
    int l,r;
    std::cin>>l>>r;
    memset(a,0,sizeof a);
    for(int i = 1 ; i <= r - l + 1 ; i++)
    {
        int x;
        std::cin>>x;
        for(int j = 0 ; j <= 17 ; j++)a[j][x>>j&1]++;
    }
    int res = 0;
    for(int i = 0 ; i <= 17 ; i++)
    {
        if(a[i][1] > a[i][0])res += 1 << i;
    }
    std::cout<<res<<'\n';
}

int main()
{
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);
    std::cout.tie(nullptr);
    int T;
    std::cin>>T;
    while(T--)
    {
        solve();
    }
    return 0;
}
```

