---
title: Codeforces Round 780 (Div. 3)
description: A. Vasya and Coins 题意： 小明有$a$枚1元硬币和$b$枚2元硬币，输出小明无法支付的最小金额。 思路： 1. 没有1元硬币： 答案为1 2. 有1元硬币： 答案为$a+2b+1$ 时间复杂度： $O(1)$ AC代码： B. Vlad and Candies 题意： 有n种糖果
date: 2022-04-12T18:34:26+08:00
tags:
  - Codeforces
categories:
  - 题解
legacyPath: /2022/04/12/Codeforces-Round-780-Div-3/
---



## A. Vasya and Coins

**题意：**

>小明有$a$枚1元硬币和$b$枚2元硬币，输出小明无法支付的最小金额。

**思路：**

>1. 没有1元硬币：
>
>>答案为1
>
>2. 有1元硬币：
>
>>答案为$a+2*b+1$ 

**时间复杂度：**

>$O(1)$

**AC代码：**
![在这里插入图片描述](https://img-blog.csdnimg.cn/bc0d0d82bbfc435e99dd480b21eb9bd2.png)

```cpp
在这里插入代码片#include<bits/stdc++.h>

typedef long long ll;

const int N = 20,M = 2e4+10,INF = 0x3f3f3f3f,mod = 1e9+7;

void solve()
{
    int a,b;
    std::cin>>a>>b;
    if(!a)
    {
        std::cout<<1<<'\n';
        return;
    }
    std::cout<<a+b*2+1<<'\n';
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

## B. Vlad and Candies

**题意：**

>有n种糖果，每个糖果有$a_{i}$份。
>
>>每次都吃掉份数最多的糖果，但是小明不希望连续两次吃一样的糖果，他是否可以按照这个要求吃掉所有糖果。

**思路：**

>只需要考虑最大值和次大值即可。
>
>>$最大值 - 次大值 > 1:NO$
>>$最大值 - 次大值 \leq 1:YES$

**时间复杂度：**

>$O(n)$

**AC代码：**
![在这里插入图片描述](https://img-blog.csdnimg.cn/9ea9e5afcc554493a150aa81f7b8dc78.png)

```cpp
#include<bits/stdc++.h>

typedef long long ll;

const int N = 20,M = 2e4+10,INF = 0x3f3f3f3f,mod = 1e9+7;

void solve()
{
    int max1 = 0,max2 = 0;
    int n;
    std::cin>>n;
    for(int i = 1 ; i <= n ; i++)
    {
        int x;
        std::cin>>x;
        if(x > max1)std::swap(max1,x);
        if(x > max2)std::swap(max2,x);
    }
    std::cout<<(max1-max2 > 1 ?"NO":"YES")<<'\n';
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

## C. Get an Even String

**题意：**

>给定一个字符串S，要求你删除最少的字母，让字符串S满足如下要求：
>
>>1. 长度为偶数
>>2. $a_{i}=a_{i+1}(i为奇数)$ 

**思路：**

>很显然，我们要把相同的字母匹配起来。
>我们考虑如下贪心策略:
>
>> 形如测试案例：bmefbmuyw
>>
>> 1. 删除字母最少，就是保留字母最多
>> 2. 我们把上述字符串中，最近的匹配字母取出，组成区间
>> 3. 有$[1,5],[2,6]$
>> 4. 即在这些区间中，找到尽可能多的不相交区间。
>> 5. 而选择的标准就是右端点越小，那么选择一定是越好的，因为右端点越小，后面可供选择的区间一定会更多。
>
>所以实际操作过程中，每当存在一对可以匹配的字母，我们就匹配他们，并把他们中间的字母全部删除(让右端点尽可能小)。

**时间复杂度：**

>使用了map去存字母，所以时间复杂度增加$logn$
>$O(nlogn)$

**AC代码：**
![在这里插入图片描述](https://img-blog.csdnimg.cn/8f6c88fb9ac54dd5bf990f59c7c7dc74.png)

```cpp
#include<bits/stdc++.h>

typedef long long ll;

const int N = 20,M = 2e4+10,INF = 0x3f3f3f3f,mod = 1e9+7;

void solve()
{
    std::map<char,bool> mp;
    std::string s;
    std::cin>>s;
    int res = 0;
    for(int i = 0 ; i < s.size() ; i++)
    {
        if(mp.count(s[i]))
        {
            res += 2;
            mp.clear();
        }
        else mp[s[i]] = true;
    }
    std::cout<<s.size() - res << '\n';
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

## D. Maximum Product Strikes Back

**题意：**

>给定长度为n的数组，而且其中的每一个元素$|a_{i}|\leq 2$。
>要求从右和从左删除一定个数的元素，使得剩下元素相乘之积最大:
>
>>选择$x$和$y$
>>求$max\prod_{i=x}^{n-y}a_{i}$

**思路：**

>因为空数组是1，所以0是必然被删除的，所以0把整个数组划分成了若干个区间，我们对每个这样的区间求取最大值,对每个区间，我们做这样的处理：
>
>>1. 区间的值应该保持为正数
>>2. 我们记录区间中负数的个数和2的个数
>>3. 2的个数决定乘积大小，负数个数决定乘积是否为负。
>>4. 在乘积已经是正数的基础上，那么区间的数留下的越多肯定是越好的。
>>5. 区间内负数个数为偶数：
>>
>>>直接把当前区间乘积最为备选答案，与此时的答案相比。
>
>>6. 区间内负数个数为奇数：
>>
>>>分别从左和从右寻找第一个负数，取两者更优的情况。

**时间复杂度：**

>$O(n)$

**AC代码：**
![在这里插入图片描述](https://img-blog.csdnimg.cn/5208dfa82708426c904e25f7540c3cfd.png)

```cpp
#include<bits/stdc++.h>

typedef long long ll;

const int N = 2e5+10,M = 2e4+10,INF = 0x3f3f3f3f,mod = 1e9+7;

int a[N];

void solve()
{
    int n;
    int cnt_two = 0,cnt_negative = 0,ans = 0,last = 0;
    std::pair<int,int> res;
    std::cin>>n;
    for(int i = 1 ; i <= n ; i++)std::cin>>a[i];
    for(int i = 1 ; i <= n + 1; i++)
    {
        if(a[i] == 0||i == n + 1)
        {
            int t = 0;
            if(cnt_negative&1)
            {
                for(int j = last + 1 ; j < i ; j++)
                {
                    if(a[j] == 2||a[j] == -2)t++;
                    if(a[j] < 0)
                    {
                        if(cnt_two - t > ans)
                        {
                            ans = cnt_two - t;
                            res = {j, n + 1 - i};
                        }
                        break;
                    }
                }
                t = 0;
                for(int j = i - 1; j > last ; j--)
                {
                    if(a[j] == 2||a[j] == -2)t++;
                    if(a[j] < 0)
                    {
                        if(cnt_two - t > ans)
                        {
                            ans = cnt_two - t;
                            res = {last,n + 1 - j};
                        }
                        break;
                    }
                }
            }
            else
            {
                if(cnt_two > ans)
                {
                    ans = cnt_two;
                    res = {last,n + 1 - i};
                }
            }
            last = i;
            cnt_negative = cnt_two = 0;
        }
        else
        {
            if(a[i] == 2)cnt_two++;
            else if(a[i]==-2)cnt_two++,cnt_negative++;
            else if(a[i]==-1)cnt_negative++;
        }
    }
    if(ans == 0)std::cout<<n<<" "<<0<<'\n';
    else std::cout<<res.first<<" "<<res.second<<'\n';
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

## E. Matrix and Shifts

**题意：**

>有一个$n*n$的矩阵，里面的每个元素都是0和1，可以任意执行以下4种操作(无需任何代价)：
>
>>1. 全体上移一行(第一行到最后一行)
>>1. 全体下移一行(最后行到第一行)
>>1. 全体左移一行(最左边一行到最右边一行)
>>1. 全体右移一行(最右边一行到最左边一行)
>
>操作完后，我们可以花费一个代价，执行这样的操作：
>
>>把某个元素从0变成1，或者从1变成0。
>
>要求变完以后，只有对角线元素是1，其余均是0。
>输出最小代价。

**思路：**

>我们只要让尽可能多的1落在对角线上就可以了。
>即以如下方式遍历矩阵：
>
>>![请添加图片描述](https://img-blog.csdnimg.cn/d2e71003700a4bc292dfc8863a9ae50a.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAdGltZXJfY2F0Y2g=,size_20,color_FFFFFF,t_70,g_se,x_16)
>>![请添加图片描述](https://img-blog.csdnimg.cn/e4f7a24946154fb7a828022a888efec7.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAdGltZXJfY2F0Y2g=,size_20,color_FFFFFF,t_70,g_se,x_16)
>>![请添加图片描述](https://img-blog.csdnimg.cn/a09800fbeac7420097bd92f9680fd7e2.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAdGltZXJfY2F0Y2g=,size_20,color_FFFFFF,t_70,g_se,x_16)
>>![请添加图片描述](https://img-blog.csdnimg.cn/f75ea7bd70b34ee686f81f1750b310c9.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAdGltZXJfY2F0Y2g=,size_20,color_FFFFFF,t_70,g_se,x_16)
>
>记录下 1 最多的数量 $max$。
>那么最后要修改的数量就是：
>
>1. 在对角线上的 0 元素($n-max$)
>2. 不在对角线上的 1 元素($cnt-max$)
>
>记录矩阵中 1 的个数为$cnt$：
>所以最终答案为$(n-max)+(cnt-max)$

**时间复杂度：**

>$O(n^{2})$

**AC代码：**
![在这里插入图片描述](https://img-blog.csdnimg.cn/f3c5de4c7aaa4860be2a12ef2ae468ce.png)

```cpp
#include<bits/stdc++.h>

typedef long long ll;

const int N = 2e3+10,M = 2e4+10,INF = 0x3f3f3f3f,mod = 1e9+7;

int a[N][N];

void solve()
{
    int n,cnt = 0,max = 0;
    std::cin>>n;
    for(int i = 1 ; i <= n ; i++)
    {
        std::string s;
        std::cin>>s;
        for(int j = 1 ; j <= n ; j++)
        {
            a[i][j] = s[j-1] - '0';
            cnt += (a[i][j] == 1);
        }
    }
    for(int j = 1 ; j <= n ; j++)
    {
        int y = j,temp = 0;
        for(int i = 1 ; i <= n ; i++)
        {
            if(a[i][y] == 1)temp++;
            y++;
            if(y==n+1)y = 1;
        }
        max = std::max(max,temp);
    }
    std::cout<<cnt - max + (n - max)<<'\n';
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

## F1. Promising String (easy version)

**题意：**

>给定一个由'+'和‘-’组成的字符串S，定义有希望的字符串如下：
>
>>字符串可以进行如下操作：
>>
>>>相邻的两个'-'可以合并为'+'
>
>>可以通过上述操作，使得字符串中'+'和‘-’的数量相同。
>
>输出字符串S中所有满足条件的子串的个数。

**思路：**

>因为数据量只有3000，所以我们直接暴力枚举所有区间。
>检查区间合法的方法如下：
>
>>1. 记录下区间中‘+‘的数量cnt1，‘-‘的数量cnt0，以及可以合并的减号的最大对数cnt。
>>2. 假设合并的减号对数为$x$:
>>
>>>$cnt_{0}-2*x=cnt_{1}+x$ 
>>>$cnt_{0}-cnt_{1}=3*x$
>
>>那么只需要满足$x$为整数，而且$x \leq cnt$，区间就是合法的。

**时间复杂度：**

>$O(n^{2})$

**AC代码：**

![在这里插入图片描述](https://img-blog.csdnimg.cn/2d95a67192e148e68097926876261354.png)

```cpp
#include<bits/stdc++.h>

typedef long long ll;

const int N = 2e3+10,M = 2e4+10,INF = 0x3f3f3f3f,mod = 1e9+7;

void solve()
{
    int n;
    std::cin>>n;
    std::string s;
    std::cin>>s;
    bool tag = false;
    int cnt1,cnt0,cnt,res = 0;
    for(int i = 0 ; i < n ; i++)
    {
        cnt = 0,cnt1 = 0,cnt0 = 0;
        for(int j = i ; j < n ; j++)
        {
            if(s[j] == '+')cnt1++,tag = false;
            else
            {
                if(tag)
                {
                    cnt++;
                    cnt0++;
                    tag = false;
                }
                else
                {
                    cnt0++;
                    tag = true;
                }
            }
            if(cnt0==cnt1)res++;
            else
            {
                if(cnt0 > cnt1 && (cnt0 - cnt1) % 3 == 0)
                {
                    if(cnt >= (cnt0 - cnt1)/3 )res++;
                }
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
