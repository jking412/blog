---
title: AtCoder Beginner Contest 245
description: A - Good morning 题意： 语法题： 给定两个起床时间。 若第一个早于等于第二个，输出${\color{Red}Takahashi }$， 反之输出${\color{Red}Aoki}$。 思路： 见代码 时间复杂度： $O(1)$ AC代码： B - Mex 题意： 给定一个长度为n
date: 2022-04-12T18:32:05+08:00
tags:
  - Atcoder
categories:
  - 题解
legacyPath: /2022/04/12/AtCoder-Beginner-Contest-245/
---

![请添加图片描述](https://img-blog.csdnimg.cn/be3f62f6376d4d898e9a15001524cbf7.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAdGltZXJfY2F0Y2g=,size_20,color_FFFFFF,t_70,g_se,x_16)


# A - Good morning

**题意：**

> 语法题：
> 给定两个起床时间。
> 若第一个早于等于第二个，输出${\color{Red}Takahashi }$，
> 反之输出${\color{Red}Aoki}$。

**思路：**

>见代码

**时间复杂度：**

> $O(1)$

**AC代码：**
![在这里插入图片描述](https://img-blog.csdnimg.cn/d0468c5126aa40d28e2c3fe5ca1d2158.png)

```cpp
#include<bits/stdc++.h>

typedef long long ll;

const int N = 1e2+10,M = N * 2,INF = 0x3f3f3f3f,mod = 1e9+7;


int main()
{
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);
    std::cout.tie(nullptr);
    int a,b,c,d;
    std::cin>>a>>b>>c>>d;
    if(a*60+b<=c*60+d)std::cout<<"Takahashi";
    else std::cout<<"Aoki";

    return 0;
}
```

# B - Mex

**题意：**

>给定一个长度为n的序列，输出这个序列中未出现的最小自然数。

**思路：**

>用一个数组统计数字出现次数，然后寻找这个序列中未出现的最小自然数。

**时间复杂度：**

>$O(n)$

**AC代码：**
![在这里插入图片描述](https://img-blog.csdnimg.cn/d8b1d4bf46df46ff816ee1c4ea000ff9.png)

```cpp
#include<bits/stdc++.h>

typedef long long ll;

const int N = 2e3+10,M = N * 2,INF = 0x3f3f3f3f,mod = 1e9+7;

int cnt[N];

int main()
{
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);
    std::cout.tie(nullptr);
    int n;
    std::cin>>n;
    for(int i = 1 ; i <= n ; i++)
    {
        int x;
        std::cin>>x;
        cnt[x]++;
    }
    for(int i = 0 ; ; i++)
    {
        if(!cnt[i])
        {
            std::cout<<i;
            return 0;
        }
    }
    return 0;
}
```

# C - Choose Elements

**题意：**

>给定两个序列和一个整数k：
>$a_{1},a_{2}\dots a_{n-1},a_{n}$
>$b_{1},b_{2}\dots b_{n-1},b_{n}$
>要求构造出一个序列：
>$c_{1},c_{2}\dots c_{n-1},c_{n}(c_{i}=a_{i}或c_{i}=b_{i})$
>使得对于$c_{i}(1\leq i \leq n-1)$有:
>$|c[i]-c[i+1]|\leq k$

**思路：**

>如果对于$\ i\ (1\leq i\leq n-2)$都满足如上要求。
>那么显然此时是否满足要求只与$a_{n-1},a_{n},b_{n-1},b_{n}$有关。
>这种性质满足无后效性，考虑使用动态规划。
>我们设有$dp[i][2]$：
>若$dp[i][0]=0$表示第$a_{i}$可用
>若$dp[i][0]=1$表示第$a_{i}$不可用
>若$dp[i][1]=0$表示第$b_{i}$可用
>若$dp[i][1]=1$表示第$b_{i}$不可用
>(这里可能用1表示可用更好，但是当时我不想初始化)
>即可以按如下方式转移：

```cpp
 for(int i = 2 ; i <= n ; i++)
    {
        if(!dp[i-1][0]&&abs(a[i]-a[i-1])<=k||!dp[i-1][1]&&abs(a[i]-b[i-1])<=k)dp[i][0] = 0;
        else dp[i][0] = 1;
        if(!dp[i-1][0]&&abs(b[i]-a[i-1])<=k||!dp[i-1][1]&&abs(b[i]-b[i-1])<=k)dp[i][1] = 0;
        else dp[i][1] = 1;
    }
```

>那么最后$dp[n][0]$或$dp[n][1]$存在一个可用即可。

**时间复杂度：**

>O(n)

**AC代码：**
![在这里插入图片描述](https://img-blog.csdnimg.cn/f9e7926d468842efa9801a2fb96ea4eb.png)

```cpp
#include<bits/stdc++.h>

typedef long long ll;

const int N = 2e5+10,M = N * 2,INF = 0x3f3f3f3f,mod = 1e9+7;

int a[N],b[N],dp[N][2];

int main()
{
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);
    std::cout.tie(nullptr);
    int n,k;
    std::cin>>n>>k;
    for(int i = 1 ; i <= n ; i++)std::cin>>a[i];
    for(int i = 1 ; i <= n ; i++)std::cin>>b[i];
    for(int i = 2 ; i <= n ; i++)
    {
        if(!dp[i-1][0]&&abs(a[i]-a[i-1])<=k||!dp[i-1][1]&&abs(a[i]-b[i-1])<=k)dp[i][0] = 0;
        else dp[i][0] = 1;
        if(!dp[i-1][0]&&abs(b[i]-a[i-1])<=k||!dp[i-1][1]&&abs(b[i]-b[i-1])<=k)dp[i][1] = 0;
        else dp[i][1] = 1;
    }
    if(!dp[n][0]||!dp[n][1])std::cout<<"Yes";
    else std::cout<<"No";
    return 0;
}
```

# D - Polynomial division

**题意：**

>存在多项式：
>$a_{0}+a_{1}x^{1}+a_{2}x^{2}\dots a_{n-1}x^{n}+a_{n}x^{n}$
>$b_{0}+b_{1}x^{1}+b_{2}x^{2}\dots b_{m-1}x^{m}+b_{m}x^{m}$
>将两个多项式相乘得到：
>$a_{0}b_{0}+(b_{1}a_{0}+b_{0}a_{1})x^{1}\dots a_{n}b_{m}x^{n}x^{m}->$
>$c_{0}+c_{1}x^{1}\dots c_{n+m}x^{n}x^{m}$
>现在给出所有系数$a_{i}$和$c_{i}$，请输出所有的$b_{i}$。

**思路:**

>开始时，有$b[0]=\frac{c[0]}{a[0]}$，并做如下处理：
>$c[i]=c[i]-b[0]*a[i](0\leq i\leq n)$。
>处理完后显然有$b[1]=\frac{c[1]}{a[0]}$，并重复上述处理：
>$c[i+1]=c[i+1]-b[1]*a[i](0\leq i\leq n-1)$。
>因此我们可以重复上述步骤直至求出所有$b_{j}(0\leq j\leq n)$:
>$b[j]=\frac{c[j]}{a[0]}$
>$c[i+j]=c[i+j]-b[j]*a[i]$。

**时间复杂度：**

>$O(nm)$

**AC代码：**
![在这里插入图片描述](https://img-blog.csdnimg.cn/e951f3e325d84d99ab95cf888bee56de.png)

```cpp
#include<bits/stdc++.h>

typedef long long ll;

const int N = 2e5+10,M = N * 2,INF = 0x3f3f3f3f,mod = 1e9+7;

int a[N],b[N],c[N];

int main()
{
//    std::ios::sync_with_stdio(false);
//    std::cin.tie(nullptr);
//    std::cout.tie(nullptr);
    int n,m;
    std::cin>>n>>m;
    for(int i = n ; i >= 0 ; i--)std::cin>>a[i];
    for(int i = m + n; i >= 0 ; i--)
    {
        std::cin>>c[i];
    }
    for(int i = 0 ; i <= m ; i++)
    {
        b[i] = c[i]/a[0];
        for(int j = 1 ; j <= n ; j++)
        {
            c[i+j] -= (b[i] * a[j]);
        }
    }
    for(int i = m ; i >= 0 ; i--)std::cout<<b[i]<<" ";
    return 0;
}
```

# E - Wrapping Chocolate

>题意：
>有n个巧克力，宽度为$a_{i}$，长度为$b_{i}$。
>有m个盒子，宽度为$c_{i}$，长度为$d_{i}$。
>如果$a_{i}\leq c_{i},b_{i}\leq d_{i}$，那么第$i$盒子就可以装下第$i$个巧克力。
>询问是否存在一种方案，可以用盒子把所有的巧克力装下。

**思路：**

>~~没看数据之前，还想着暴力跑二分图最大匹配~~ 
>无序查找必然超时，考虑对某个关键字排序。
>我们把巧克力和盒子一起按照宽度降序排序(如果宽度相同则把盒子排在前面)，遍历排序后的数组，并维护一个集合S，按照如下方式处理：
>**1.如果当前位置为盒子：将长度$d_{i}$加入集合。
>2.如果当前位置为巧克力：找到$d_{i}(min(di\geq b_{i}),d_{i}\in S)$，并将$d_{i}$删除，如果查找失败，则不存在方案。
>易证明上述操作可以完成题目要求，上述操作可以用multiset完成。**

**时间复杂度：**

>O(nlogn)

**AC代码：**
![在这里插入图片描述](https://img-blog.csdnimg.cn/18ae96e3e0704f1b99626ddc99997bae.png)

```cpp
#include<bits/stdc++.h>

typedef long long ll;

const int N = 4e5+10,M = N * 4,INF = 0x3f3f3f3f,mod = 1e9+7;
struct Node{
    int x,y;
    bool box;
    bool operator<(const Node &a)const
    {
        if(a.x == x)return a.box < box;
        return a.x < x;
    }
}a[N];
std::multiset<int> st;

int main()
{
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);
    std::cout.tie(nullptr);
    int n,m;
    std::cin>>n>>m;
    for(int i = 1 ; i <= n ; i++)
    {
        int x;
        std::cin>>x;
        a[i].x = x;
    }
    for(int i = 1 ; i <= n ; i++)
    {
        int x;
        std::cin>>x;
        a[i].y = x;
        a[i].box = false;
    }
    for(int i = n + 1 ; i <= m + n; i++)
    {
        int x;
        std::cin>>x;
        a[i].x = x;
    }
    for(int i = n + 1 ; i <= m + n ; i++)
    {
        int x;
        std::cin>>x;
        a[i].y = x;
        a[i].box = true;
    }
    std::sort(a+1,a+1+n+m);
    for(int i = 1 ; i <= n + m; i++)
    {
        if(a[i].box)
        {
            st.insert(a[i].y);
        }
        else
        {
            auto it = st.lower_bound(a[i].y);
            if(it!=st.end())st.erase(it);
            else
            {
                std::cout<<"No";
                return 0;
            }
        }
    }
    std::cout<<"Yes";
    return 0;
}
```

# F - Endless Walk

**题意：**

>给定一张有向图，寻找这样的点，满足如下要求：
>从这个点出发，存在一条无限长的路径。
>输出有几个点满足上述要求。

**思路：**

>满足上述的点存在两种情况：
>**1.该点在环内
>2.从这个点出发可以走到环**
>我的处理可能复杂些，按照如下步骤：
>1.强连通分量跑tarjan缩点，对于任意的强连通分量，若内部点数$size_{i}\geq2$，则这些点都在环内。
>2.若选择这样的做法，细节较多：
>从其他点开始搜索，尝试是否能走到环。
>尝试采用另一种方法：
>**建立反向图，从环开始搜索，对于所有搜索到的点，都满足要求。**

**时间复杂度：**

>O(n+m)

**AC代码：**
![在这里插入图片描述](https://img-blog.csdnimg.cn/440f40aa5eb544b080f1032c70600b7d.png)

```cpp
#include<bits/stdc++.h>

typedef long long ll;

const int N = 2e5+10,M = N * 4,INF = 0x3f3f3f3f,mod = 1e9+7;

int h[N],hs[N],e[M],ne[M],idx;
int id[N],dfn[N],low[N],stk[N],size[N],scc,top,ts;
bool book[N],vis[N],OK[N];
int res;

void add(int h[],int a,int b)
{
    e[idx] = b,ne[idx] = h[a],h[a] = idx++;
}

void tarjan(int u)
{
    dfn[u] = low[u] = ++ts;
    book[u] = true,stk[++top] = u;
    for(int i = h[u] ; ~i ; i = ne[i])
    {
        int v = e[i];
        if(!dfn[v])
        {
            tarjan(v);
            low[u] = std::min(low[u],low[v]);
        }
        else if(book[v])low[u] = std::min(low[u],dfn[v]);
    }
    if(low[u]==dfn[u])
    {
        int temp;
        scc++;
        do{
            temp = stk[top--];
            book[temp] = false;
            id[temp] = scc;
            size[scc]++;
        }while(temp!=u);
    }
}

void dfs(int u)
{
    res++,vis[u] = OK[u] = true;
    for(int i = hs[u] ; ~i ; i = ne[i])
    {
        int v = e[i];
        if(vis[v])continue;
        dfs(v);
    }
}

int main()
{
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);
    std::cout.tie(nullptr);
    memset(h,-1,sizeof h);
    memset(hs,-1,sizeof hs);
    int n,m;
    std::cin>>n>>m;
    while(m--)
    {
        int a,b;
        std::cin>>a>>b;
        add(h,a,b),add(hs,b,a);
    }
    for(int i = 1 ; i <= n ; i++)if(!dfn[i])tarjan(i);
    for(int i = 1 ; i <= n ; i++)
        if(size[id[i]] > 1)OK[i] = true;
    for(int i = 1 ; i <= n ; i++)if(OK[i]&&!vis[i])dfs(i);
    std::cout<<res;
    return 0;
}
```

# G - Foreign Friends

**题意：**

>现有N个人，这些人属于K个国家，这N个人中有L个人是受欢迎的人，这L个人分别属于不同的国家。
>小明是个中间人，存在M对关系：
>小明可以让某一对中的两个人相互认识，但是要花费一定的金额。
>对于这N个人中的每一个人$a_{i}$，他们都想要认识一个不在自己国家的受欢迎的人,分别输出这N个人所需的最小花费。
>(若a认识b，b认识c，那么有a认识c)

**思路：**

>比较显然的，这是一个最短路问题,可以使用Dijkstra(使用优先队列)。
>正向考虑跑最短路显然不行，我们反向考虑让每个受欢迎的人去认识每一个人，但是我们如果让每个受欢迎的人去跑最短路，时间复杂度也会达到$O(LNlogN)$，但是这题比较特殊，我们可以进行如下考虑：
>**1.我们把所有受欢迎的人放在优先队列里同时跑最短路，并记录他们所属的国家,在这个过程中我们通过记录，保证每个国家只会更新$a_{i}$一次。
>2.那么当人$a_{i}$被第一次和第二次取出的时候，所需的花费分别是最小，次小的，并且更新这两次的国家不同。因为$a_{i}$只会属于一个国家，所以这两个最小数中一定有一个和自己的国家不同。
>3.如果与更新最小值的国家不同，输出最小值即可，反之输出次小值。**

**时间复杂度：**

>O(nlogn)

**AC代码：**
![在这里插入图片描述](https://img-blog.csdnimg.cn/6b704365f2614635921b42b08cbfc72e.png)

```cpp
#include<bits/stdc++.h>

typedef long long ll;

const int N = 2e5+10,M = N * 4,INF = 0x3f3f3f3f,mod = 1e9+7;
struct Node{
    ll dist;
    int u,city;
    bool operator <(const Node &a)const
    {
        return a.dist < dist;
    }
};
int h[N],e[N],ne[N],w[N],idx;
int vis[N],city[N],type[N];
ll dist1[N],dist2[N];
int n,m,k,l;
std::priority_queue<struct Node> que;

void add(int a,int b,int c)
{
    e[idx] = b,ne[idx] = h[a],w[idx] = c,h[a] = idx++;
}

void Dijkstra()
{
    while(!que.empty())
    {
        auto temp = que.top();
        que.pop();
        if(vis[temp.u] < 2 && type[temp.u] != temp.city)
        {
            if(vis[temp.u] == 0) type[temp.u] = temp.city,dist1[temp.u] = temp.dist;
            else dist2[temp.u] = temp.dist;
            vis[temp.u]++;
            for(int i = h[temp.u] ; ~i ; i = ne[i])
            {
                int v = e[i];
                que.push({temp.dist+w[i],v,temp.city});
            }
        }
    }
}

int main()
{
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);
    std::cout.tie(nullptr);
    memset(h,-1,sizeof h);
    std::cin>>n>>m>>k>>l;
    for(int i = 1 ; i <= n ; i++)std::cin>>city[i];
    for(int i = 1 ; i <= l ; i++)
    {
        int x;
        std::cin>>x;
        que.push({0ll,x,city[x]});
    }
    while(m--)
    {
        int a,b,c;
        std::cin>>a>>b>>c;
        add(a,b,c),add(b,a,c);
    }
    Dijkstra();
    for(int i = 1 ; i <= n ; i++)
    {
        if(type[i] != city[i]&&dist1[i])std::cout<<dist1[i]<<" ";
        else if(dist2[i])std::cout<<dist2[i]<<" ";
        else std::cout<<-1<<" ";
    }
    return 0;
}
```



