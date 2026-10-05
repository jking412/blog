---
title: CodeTON Round 1 (Div. 1 + Div. 2, Rated, Prizes)
description: A. Good Pairs 题意： 给定一个长度为n的序列： $a{1},a{2},\dots,a{n-1},a{n}$ 现在要找到一对下标$(i,j)$满足： $a{i}-a{k}+a{j}-a{k}=a{i}-a{j}$ 对所有的$k(1\leq k\leq n)$成立 思路： 显然只要$a{i
date: 2022-04-12T18:33:21+08:00
tags:
  - Codeforces
categories:
  - 题解
legacyPath: /2022/04/12/CodeTON-Round-1-Div-1-Div-2-Rated-Prizes/
---

![在这里插入图片描述](https://img-blog.csdnimg.cn/91f06a1f167d48afbbd9ea07cfff4316.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAdGltZXJfY2F0Y2g=,size_20,color_FFFFFF,t_70,g_se,x_16#pic_center)


# A. Good Pairs

**题意：**

>给定一个长度为n的序列：
>$a_{1},a_{2},\dots,a_{n-1},a_{n}$
>现在要找到一对下标$(i,j)$满足：
>$|a_{i}-a_{k}|+|a_{j}-a_{k}|=|a_{i}-a_{j}|$
>对所有的$k(1\leq k\leq n)$成立

**思路：**

>显然只要$a_{i}和a_{j}$是最大值是最小值即可。

**时间复杂度：**

>$O(n)$

**AC代码:**
![在这里插入图片描述](https://img-blog.csdnimg.cn/e5423e37a0db45089f0223d4c30ba540.png)

```cpp
#include<bits/stdc++.h>

typedef long long ll;

const int N = 2e5+10,M = N * 2,INF = 0x3f3f3f3f,mod = 1e9+7;

int a[N];

void solve()
{
    int n;
    std::cin>>n;
    for(int i = 1 ; i <= n ; i++)std::cin>>a[i];
    std::cout<<std::max_element(a+1,a+1+n) - a<<" "<<std::min_element(a+1,a+1+n)-a<<'\n';
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

# B. Subtract Operation

**题意：**

>给定一个长度为n的序列：
>$a_{1},a_{2},a_{3}\dots a_{n-1},a_{n}$。
>现在可以从中选择一个$a_{i}$，
>将其删除，并让其余所有数减$a{i}$：
>$a_{1}-a_{i},a_{2}-a_{i},a_{3}-a_{i}\dots a_{n-1}-a_{i},a_{n}-a_{i}$。
>执行这样的操作若干次，直至序列中只剩下一个数。
>是否存在某种操作顺序，可以使最后剩下的数等于k。

**思路：**

>假设最后留下的数是$a_{i}$，最后一次删除的数是$a_{j}$（原序列中的$a_{i}$和$a_{j}$），那么最后留下来的数为$a_{i}-a_{j}$。

>证明如下：
>设第$i$次删除了$a_{i}$，得到：
>$[a_{1}-a_{i}],[a_{2}-a_{i}]\dots [a_{j}-a_{i}]\dots [a_{n-1}-a_{i}],[a_{n}-a_{i}]$。
>设第$i+1$次删除了$a_{j}-a_{i}$，得到：
>$[a_{1}-a_{i}-(a_{j}-a_{i})],[a_{2}-a_{i}-(a_{j}-a_{i})],\dots [a_{n-1}-a_{i}-(a_{j}-a_{i})],[a_{n}-a_{i}-(a_{j}-a_{i}])$。
>$->$
>$[a_{1}-a_{j}],[a_{2}-a_{j}]\dots [a_{n-1}-a_{j}],[a_{n}-a_{j}]$。

>因此，整个序列减小的数只与最后一次删除有关。
>最终留下的数即$a_{i}-a_{j}$。
>那么我们只需要寻找是否存在这样的一对数，满足$a_{i}-a_{j}==k$即可。
>这里在排序后二分就可以完成查找。

**时间复杂度：**

>$O(nlogn)$

**AC代码：**
![在这里插入图片描述](https://img-blog.csdnimg.cn/c755ce0da0ce443da5316a4f1e8f6eeb.png)

```cpp
#include<bits/stdc++.h>

typedef long long ll;

const int N = 2e5+10,M = N * 2,INF = 0x3f3f3f3f,mod = 1e9+7;

int a[N];

void solve()
{
    int n,k;
    std::cin>>n>>k;
    for(int i = 1 ; i <= n ; i++)std::cin>>a[i];
    std::sort(a+1,a+1+n);
    for(int i = 1 ; i <= n ; i++)
    {
        int index = std::lower_bound(a+1,a+n+1,a[i]+k) - a;
        if(index <= n && a[index] - a[i] == k)
        {
            std::cout << "YES\n";
            return;
        }
    }
    std::cout<<"NO\n";
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

# C. Make Equal With Mod

**题意：**

>给定一个序列：
>$a_{1},a_{2},a_{3}\dots a_{n-1},a_{n}$。
>选择一个数$x(x\geq 2)$，对所有数取模：
>$a_{1}\%x,a_{2}\%x,a_{3}\%x\dots a_{n-1}\%x,a_{n}\%x$。
>在若干次操作后是否可能使所有数相等。

**思路：**

>第一种情况，原序列没有1：
>我们考虑把所有数变成0，即每次选择最大的数$a_{i}$，令$x = a_{i}$,
>则一次操作后只有最大的数变成0，其余数均不变。
>所以该情况一定有解。

>第一种情况，原序列存在1：
>那么我们只能考虑把所有数变成1。
>每次选择最大的数$a_{i}$，令$x = a_{i} - 1$，那么取模后最大数变成1。
>若在此过程中序列中存在$a_{i} - 1$，则$a_{i} - 1$变成 0 ，那么不存在方案。
>否则存在方案。

![在这里插入图片描述](https://img-blog.csdnimg.cn/9cc71c654a4a42c9b627500fb7e12ba8.png)
**时间复杂度：**

>$O(n)$

**AC代码：**

```cpp
#include<bits/stdc++.h>

typedef long long ll;

const int N = 2e5+10,M = N * 2,INF = 0x3f3f3f3f,mod = 1e9+7;

int a[N];

void solve()
{
    int n;
    std::cin>>n;
    bool flag = false;
    for(int i = 1 ; i <= n ; i++)std::cin>>a[i];
    for(int i = 1 ; i <= n ; i++)
    {
        flag = (a[i]==1);
        if(flag)break;
    }
    if(!flag)
    {
        std::cout<<"YES\n";
    }
    else
    {
        flag = false;
        std::sort(a+1,a+1+n);
        for(int  i = 1 ; i < n ; i++)
        {
            flag = (a[i+1] - a[i] == 1);
            if(flag)break;
        }
        if(flag)
        {
            std::cout<<"NO\n";
        }
        else
        {
            std::cout<<"YES\n";
        }
    }
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

# E. Equal Tree Sums

**题意：**

>给定一个无根树，每个节点有一个权值，现在我们要对节点分配一个权值$w_{i}$，使得无论删除哪一个点，剩余的每个连通块权值之和相等。

**思路：**

>从一个点开始遍历整棵树，起点染为白色。
>在遍历的时候，与白色相邻的点染为黑色，与黑色相邻的点染为白色。
>染色完成后，设每个点的度数为$d[i]$，并令：
>1.白色点的权值为$-d[i]$
>2.黑色点的权值为$d[i]$
>赋值显然后所有整棵树的权值和为0，并且每条边对权值和的贡献为0。

>我们可以把一条边分裂成两条边，一条由黑色点指向白色点，权值为1，一条由白色点指向黑色点，权值为-1，那么一个白色点的权值就是由所有这个白色点指向黑色点的边加和而成。

>现在证明删除一个点后剩余连通块权值和相等：
>1.假设删除了一个黑点，权值为$d[i]$
>2.那么很显然此时有$d[i]$连通块
>3.现在我们根据上面的分边，为每个点重新赋值，那么每个连通块内部权值都为0
>4.对于所有与黑点相连的白色点，权值相差的只是与黑点相连的这一条边的权值，其余所有点权值不变。
>5.所以实际上每个连通块变化的和都是一样的，为$1$或$-1$。

**时间复杂度：**

>O(n+m)

**AC代码：**
![在这里插入图片描述](https://img-blog.csdnimg.cn/1a89bea36c614420917506e3f82862dc.png)

```cpp
#include<bits/stdc++.h>

typedef long long ll;

const int N = 1e5+10,M = N * 2,INF = 0x3f3f3f3f,mod = 1e9+7;

int h[N],e[M],ne[M],idx;
int w[N],d[N];
bool color[N];

void add(int a,int b)
{
    e[idx] = b,ne[idx] = h[a],h[a] = idx++;
}

void dfs(int u,int fa,bool st)
{
    color[u] = st;
    for(int i = h[u] ; ~i ; i = ne[i])
    {
        int v = e[i];
        d[u]++;
        if(v==fa)continue;
        dfs(v,u,st^1);
    }
}

void solve()
{
    int n;
    std::cin>>n;
    for(int i = 1 ; i <= n ; i++)h[i] = -1,d[i] = 0;
    idx = 0;
    for(int i = 1 ; i < n ; i++)
    {
        int a,b;
        std::cin>>a>>b;
        add(a,b),add(b,a);
    }
    dfs(1,-1,false);
    for(int i = 1 ; i <= n ; i++)color[i] == 0 ? std::cout<<-d[i]<<" ":std::cout<<d[i]<<" ";
    std::cout<<'\n';
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
