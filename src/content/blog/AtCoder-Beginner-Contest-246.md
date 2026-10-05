---
title: AtCoder Beginner Contest 246
description: A - Four Points 题意： 给出三个点，找到一个点，让这4个点组成一个矩形 思路： 分别找到横纵坐标中只有一个的值。 时间复杂度： $O(1)$ AC代码： B - Get Closer 题意： 给出一个向量，将其变成单位向量。 思路： 将向量除以他的模即可。 时间复杂度： $O(1)$
date: 2022-04-12T17:34:16+08:00
tags:
  - Atcoder
categories:
  - 题解
legacyPath: /2022/04/12/AtCoder-Beginner-Contest-246/
---

![请添加图片描述](https://img-blog.csdnimg.cn/575e994279a24ffb92a1ea7a71037e04.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAdGltZXJfY2F0Y2g=,size_20,color_FFFFFF,t_70,g_se,x_16)


***

## A - Four Points

**题意：**

>给出三个点，找到一个点，让这4个点组成一个矩形

**思路：**

>分别找到横纵坐标中只有一个的值。

**时间复杂度：**

>$O(1)$

**AC代码：**
![!\[在这里插入图片描述\](https://img-blog.csdnimg.cn/aa8cfb2912ee42e683d85a44](https://img-blog.csdnimg.cn/c6d852d3d1ed4e5e8f7a483db5acfcf3.png)

```cpp
#include<bits/stdc++.h>

typedef long long ll;

const int N = 1e2+5,M = 2e4+10,INF = 0x3f3f3f3f,mod = 1e9+7;

int main()
{
//    std::ios::sync_with_stdio(false);
//    std::cin.tie(nullptr);
//    std::cout.tie(nullptr);
    int x,y,ans_x = 0,ans_y = 0;
    for(int i = 1 ; i <= 3 ; i++)
    {
        std::cin>>x>>y;
        ans_x ^= x,ans_y ^= y;
    }
    std::cout<<ans_x<<' '<<ans_y;
    return 0;
}

```

***

## B - Get Closer

**题意：**

>给出一个向量，将其变成单位向量。

**思路：**

>将向量除以他的模即可。

**时间复杂度：**

>$O(1)$

**AC代码：**

![在这里插入图片描述](https://img-blog.csdnimg.cn/ee08775b42d546c99946cc23b4231b2d.png)

```cpp
#include<bits/stdc++.h>

typedef long long ll;

const int N = 1e2+5,M = 2e4+10,INF = 0x3f3f3f3f,mod = 1e9+7;

int main()
{
//    std::ios::sync_with_stdio(false);
//    std::cin.tie(nullptr);
//    std::cout.tie(nullptr);
    double x,y;
    scanf("%lf%lf",&x,&y);
    printf("%.10f %.10f",x / sqrt(x*x+y*y),y / sqrt(x*x+y*y));
    return 0;
}

```

***

## C - Coupon

**题意：**

>给定n个商品，每个商品的价格是$a_i$，现在有k张优惠券，每张优惠券可以减少某个商品x元(不得低于0)，询问购买全部商品的最小花费。

**思路：**

>先保证不浪费优惠券的情况下，把尽可能多的商品价格减免到x元以下，然后如果还有优惠券剩余，我们对剩下的商品价格从高到低使用优惠券。

**时间复杂度：**

>$O(nlogn)$

**AC代码：**

```cpp
#include<bits/stdc++.h>

typedef long long ll;

const int N = 2e5+10,M = 2e4+10,INF = 0x3f3f3f3f,mod = 1e9+7;

int a[N];

int main()
{
//    std::ios::sync_with_stdio(false);
//    std::cin.tie(nullptr);
//    std::cout.tie(nullptr);
    int n,k,x;
    std::cin>>n>>k>>x;
    for(int i = 1; i <= n ; i++)
    {
        std::cin>>a[i];
        if(k == 0)continue;
        if(k >= a[i]/x)
        {
            k -= a[i]/x;
            a[i] %= x;
        }
        else
        {
            a[i] -= k * x;
            k = 0;
        }
    }
    ll sum = 0;
    std::sort(a+1,a+1+n,std::greater<int>());
    for(int i = 1 + k ; i <= n ; i++)sum += a[i];
    std::cout<<sum;
    return 0;
}

```

***

## D - 2-variable Function

**题意：**

>给定一个数n，找到一个数x，满足下列两个条件：
>
>>1. $x\geq n$
>>2. $\exists a\exists b,使得x=a^3+a^2b+ab^2+b^3(a,b\in N)$

**思路：**

>$\because n\leq 10^{18}$
>$\therefore a,b\leq10^{6}$
>我们可以使用双指针，从小到大枚举$a$，从大到小$b$，从而枚举出所有的$x=a^3+a^2b+ab^2+b^3\geq n$，并从中找到最小值。

**时间复杂度：**

>$O(\sqrt[3]{n})$

**AC代码：**
![在这里插入图片描述](https://img-blog.csdnimg.cn/78966db3a96845ca92c3d9d25cc195ee.png)

```cpp
#include<bits/stdc++.h>

typedef long long ll;

const int N = 1500+10,M = 2e4+10,INF = 0x3f3f3f3f,mod = 1e9+7;



int main()
{
//    std::ios::sync_with_stdio(false);
//    std::cin.tie(nullptr);
//    std::cout.tie(nullptr);
    ll n;
    std::cin>>n;
    ll res = 1e18;
    ll j = 1e6;
    for(ll i = 0 ; i <= 1e6 ; i++)
    {
        ll temp = i*i*i+i*i*j+i*j*j+j*j*j;
        while(temp >= n && j >= 0)
        {
            res = std::min(res,temp);
            j--;
            temp = i*i*i+i*i*j+i*j*j+j*j*j;
        }
    }
    std::cout<<res;
    return 0;
}

```

***

## E - Bishop 2

**题意：**

>给出一个$n*n$的地图，其中$'.'$是平地，其中#是障碍，并给出一个起点和终点，在不跨越障碍的情况下，可以往左上，右上，右下，左下四个斜角方向一次移动任意个单位，询问从起点移动到终点的最小步数，若不存在路径，则输出-1。

**思路：**

>修改正常BFS的拓展方式即可，每次拓展的时候把四个斜角方向可以拓展的点全部拓展。

**时间复杂度：**

>$O(n^2)$

**AC代码：**
![在这里插入图片描述](https://img-blog.csdnimg.cn/5b9ac310fc3746399327794cbd0739f2.png)

```cpp
#include<bits/stdc++.h>

typedef long long ll;

const int N = 1500+10,M = 2e4+10,INF = 0x3f3f3f3f,mod = 1e9+7;
struct Node{
    int x,y,step;
}que[N*N];
char a[N][N];
bool book[N][N];
int ne[4][2] = {1,1,1,-1,-1,1,-1,-1};
int n,start_x,start_y,end_x,end_y;

bool OK(int x,int y)
{
    if(x<1||y<1||x>n||y>n||a[x][y]=='#')return false;
    return true;
}

void bfs()
{
    int head = 0,tail = -1;
    que[++tail] = {start_x,start_y,0};
    book[start_x][start_y] = true;
    while(tail>=head)
    {
        auto temp = que[head++];
        if(temp.x == end_x && temp.y == end_y)
        {
            std::cout<<temp.step;
            return;
        }
        for(int i = 0 ; i < 4 ; i++)
        {
            int tx = temp.x + ne[i][0];
            int ty = temp.y + ne[i][1];
            while(OK(tx,ty))
            {
                if(!book[tx][ty])que[++tail] = {tx,ty,temp.step+1};
                book[tx][ty] = true;
                tx += ne[i][0];
                ty += ne[i][1];
            }
        }
    }
    std::cout<<-1;
}

int main()
{
//    std::ios::sync_with_stdio(false);
//    std::cin.tie(nullptr);
//    std::cout.tie(nullptr);
    std::cin>>n>>start_x>>start_y>>end_x>>end_y;
    for(int i = 1 ; i <= n ; i++)std::cin>>(a[i]+1);
    bfs();
    return 0;
}

```

***

## F - typewriter

**题意：**

>给出n个键盘，每个键盘可以打印字母由一个字符串表示，现在要打印一个长度为L的字符串，每次选择一个键盘打印字符串，可以打印出多少不同的字符串。

**思路：**

>应用容斥原理，以n=3为例：
>
>>ans = 
>>+（只使用第一个键盘）+（只使用第二个键盘）+（只使用第三个键盘）-（只使用第一个键盘和第二个键盘共有的字母打印）-（只使用第一个键盘和第三个键盘共有的字母打印）-（只使用第二个键盘和第三个键盘共有的字母打印）+（使用所用键盘共有的字母打印）。
>
>因此我们只需要枚举上述所有情况，求出答案即可。

**时间复杂度：**

>N个字母所能打印的长度为L的字符串的个数为$N^{L}$。
>使用快速幂会花费$O(logL)$的时间。
>此外，枚举所有的情况是$O(2^n)$
>所以总时间复杂度为$O(2^nlogL)$

**AC代码：**
![在这里插入图片描述](https://img-blog.csdnimg.cn/2130c6d073b9419daf26d8453aaa2b3a.png)

```cpp
#include<bits/stdc++.h>

typedef long long ll;

const int N = 30,M = 2e4+10,INF = 0x3f3f3f3f,mod = 998244353;

bool temp[N],a[N][N];
ll ans,n,len;

ll quickPow(ll x,ll k)
{
    ll res = 1;
    while(k)
    {
        if(k&1)res = (x * res) % mod;
        x = x * x % mod;
        k >>= 1;
    }
    return res;
}

void dfs(int u,int cnt)
{
    if(u==n)
    {
        if(cnt==0)return;
        int count = 0;
        for(int i = 0 ; i < 26 ; i++)if(temp[i])count++;
        if(cnt&1)ans = (ans + quickPow(count,len)) % mod;
        else ans = (ans - quickPow(count,len) + mod) % mod;
        return;
    }
    dfs(u+1,cnt);
    bool last[N];
    memcpy(last,temp,sizeof temp);
    for(int i = 0 ; i < 26 ; i++)temp[i] &= a[u][i];
    dfs(u+1,cnt+1);
    memcpy(temp,last,sizeof temp);
}

int main()
{
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);
    std::cout.tie(nullptr);
    std::cin>>n>>len;
    for(int i = 0 ; i < n ; i++)
    {
        std::string s;
        std::cin>>s;
        for(int j = 0 ; j < s.size() ; j++) a[i][s[j]-'a'] = true;
    }
    for(int i = 0 ; i < 26 ; i++)temp[i] = true;
    dfs(0,0);
    std::cout<<ans;
    return 0;
}
```

***

## G - Game on Tree 3

**题意：**

>给定一棵根为1的树，除了根，每个点都有一个权值$w_i$，现在小明和小红从根节点开始按照如下规则玩一个游戏：
>
>>1. 小红任意选择一个点，把这个点的权值变为0
>>2. 小明从当前点出发，可以走到任意一个儿子节点
>>3. 然后小明可以决定是否结束游戏(如果小明在叶子节点则必须结束游戏)
>
>最后小明获得的分数就是小明所在点的权值，小明希望获得的分数尽可能得高，小红希望小明获得的分数尽可能的低,假设两人都足够聪明的情况下(即总是做出对当前最有利的操作)，小明可以获得的最大分数是多少。

**思路：**

>使用动态规划(树形dp)和二分答案。
>考虑对于某一个分数$x$，小明是否存在方案可以获得比$x$大的分数：
>
>>我们令$w_u\geq x$的点$v_u$为1，$w_u< x$的点$v_u$为0，。
>>如果要使小明无法获得分数$x$，那么必须要使这些为1的点变成0，我们假设$dp[i]$为小明在点$i$开始游戏小红所需要的消除次数。
>>那么对于某个点的$dp[i]$，我们可以用如下式子求出：
>>
>>>$dp[i]=v_i+max(0,\sum_{c}dp[c]-1)(c\in children_i)$
>
>>如果当前点$v_i=1$,那么肯定是要消除的，在小明走到儿子节点之前，我们还有一次消除机会(开始游戏时小红是先手)，所以还要加上$(max(\sum_{c}dp[c]-1,0))$。
>
>>最后可以求得$dp[0]$，如果$dp[0]!=0$，那么小明是可以获得一个比$x$大的分数的。
>
>最后用二分找到最大值即可。

**时间复杂度：**

>$O(nlog(maxA_i))$

**AC代码：**
![在这里插入图片描述](https://img-blog.csdnimg.cn/395c1cd329ad486dbbf7fd4a6aa145a7.png)

```cpp
#include<bits/stdc++.h>

typedef long long ll;

const int N = 2e5+10,M = N * 2,INF = 0x3f3f3f3f,mod = 998244353;

int h[N],e[M],ne[M],idx;
int w[N],dp[N];

void add(int a,int b)
{
    e[idx] = b,ne[idx] = h[a],h[a] = idx++;
}

void dfs(int u,int fa,int val)
{
    dp[u] = (w[u] >= val);
    int sum = 0;
    for(int i = h[u] ; ~i ; i = ne[i])
    {
        int v = e[i];
        if(v==fa)continue;
        dfs(v,u,val);
        sum += dp[v];
    }
    dp[u] += std::max(0,sum-1);
}

bool check(int val)
{
    dfs(1,-1,val);
    return dp[1] != 0;
}

int main()
{
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);
    std::cout.tie(nullptr);
    int n;
    std::cin>>n;
    memset(h,-1,sizeof h);
    int max = -1;
    for(int i = 2 ; i <= n ; i++)std::cin>>w[i],max = std::max(max,w[i]);
    for(int i = 1 ; i < n ; i++)
    {
        int a,b;
        std::cin>>a>>b;
        add(a,b),add(b,a);
    }
    w[0] = -1;
    int L = 0,R = max;
    while(R>L)
    {
        int mid = L + R + 1 >> 1;
        if(check(mid))L = mid;
        else R = mid - 1;
    }
    std::cout<<L;
    return 0;
}
```

***

## Ex - 01? Queries

**题意：**

>给定一个由'0','1'和'?'组成的字符串,我们可以任意得将$'?'$替换成$'0'$或$'1'$,求字符串的所有子串可以形成的不同的01串有多少种。
>现在存在q个操作,每次操作将第x个字符变成$'0','1'或'?'$,询问每次操作后的答案。

**思路：**

>我们先考虑在某种情况下的01串种数。
>考虑动态规划,定义$dp[i][0]和dp[i][1]$分别表示前$i$个字母所能组成的以0结尾的和以1结尾的种数。
>那么应该有如下状态转移方程:
>
>>1. $s[i]=0$
>>     $dp[i][0]=dp[i-1][0]+dp[i-1][1]+1$
>>     $dp[i][1]=dp[i-1][1]$
>>2. $s[i]=1$
>>     $dp[i][0]=dp[i-1][0]$
>>     $dp[i][1]=dp[i-1][1]+dp[i-1][0]+1$
>>3. $s[i]= \ ?$
>>     $dp[i][0]=dp[i-1][0]+dp[i-1][1]+1$
>>     $dp[i][1]=dp[i-1][1]+dp[i-1][0]+1$
>
>我们将上述状态转移方程用矩阵表示:
>
>>$\begin{bmatrix} dp[i][0] \\dp[i][1] \\1  \end{bmatrix}=A_{s_{i}}\begin{bmatrix} dp[i-1][0]\\ dp[i-1][1]\\1 \end{bmatrix}$
>>分别的,对于不同的$A_{s_{i}}$,有:
>>
>>>$s[i]=0:$
>>>$A_{s_{i}}=\begin{bmatrix}
>>> 1& 1 &1 \\ 
>>> 0&1  & 0\\ 
>>> 0& 0 & 1
>>>\end{bmatrix}$
>>>$s[i]=1:$
>>>$A_{s_{i}}=\begin{bmatrix}
>>> 1& 0 &0 \\ 
>>> 1&1  & 1\\ 
>>> 0& 0 & 1
>>>\end{bmatrix}$
>>>$s[i]=\ ?:$
>>>$A_{s_{i}}=\begin{bmatrix}
>>> 1& 1 &1 \\ 
>>> 1&1  & 1\\ 
>>> 0& 0 & 1
>>>\end{bmatrix}$
>
>>此外有$\begin{bmatrix} dp[i][0] \\dp[i][1] \\1  \end{bmatrix}=A_{s_{i}}A_{s_{i-1}}\dots A_{s_{1}}\begin{bmatrix} dp[0][0]\\ dp[0][1]\\1 \end{bmatrix}=A_{s_{i}}A_{s_{i-1}}\dots A_{s_{1}}\begin{bmatrix} 0\\ 0\\1 \end{bmatrix}$
>
>我们可以用线段树维护每一个矩阵,这样修改操作可以在$logn$时间内完成。

**时间复杂度：**

>$O(qlogn)$

**AC代码：**
![在这里插入图片描述](https://img-blog.csdnimg.cn/bc5a7997abb347ce8011788c81a0cddc.png)

```cpp
#include<bits/stdc++.h>

typedef long long ll;

const int N = 1e5+10,M = N * 2,INF = 0x3f3f3f3f,mod = 998244353;
struct Node{
    int l,r;
    ll a[3][3];
}tr[N*4];

char s[N];
int n,q;

void pushup(int u)
{
    memset(tr[u].a,0,sizeof tr[u].a);
    for(int i = 0 ; i < 3 ; i++)
        for(int j = 0 ; j < 3 ; j++)
        {
            for(int k = 0 ; k < 3 ; k++)
                tr[u].a[i][j] = (tr[u].a[i][j] + tr[u<<1].a[i][k]*tr[u<<1|1].a[k][j])%mod;
        }
}

void assign(Node &root,char ch)
{
    if(ch=='0')
    {
        root.a[0][0] = 1;
        root.a[0][1] = 1;
        root.a[0][2] = 1;
        root.a[1][0] = 0;
        root.a[1][1] = 1;
        root.a[1][2] = 0;
        root.a[2][0] = 0;
        root.a[2][1] = 0;
        root.a[2][2] = 1;
    }
    else if(ch=='1')
    {
        root.a[0][0] = 1;
        root.a[0][1] = 0;
        root.a[0][2] = 0;
        root.a[1][0] = 1;
        root.a[1][1] = 1;
        root.a[1][2] = 1;
        root.a[2][0] = 0;
        root.a[2][1] = 0;
        root.a[2][2] = 1;
    }
    else
    {
        root.a[0][0] = 1;
        root.a[0][1] = 1;
        root.a[0][2] = 1;
        root.a[1][0] = 1;
        root.a[1][1] = 1;
        root.a[1][2] = 1;
        root.a[2][0] = 0;
        root.a[2][1] = 0;
        root.a[2][2] = 1;
    }
}

void build(int u,int l,int r)
{
    if(l==r)
    {
        tr[u] = {l,r};
        assign(tr[u],s[r]);
    }
    else
    {
        int mid = l + r >> 1;
        tr[u] = {l,r};
        build(u<<1,l,mid),build(u<<1|1,mid+1,r);
        pushup(u);
    }
}

void modify(int u,int x,char ch)
{
    if(tr[u].l==x&&tr[u].r==x)
    {
        assign(tr[u],ch);
    }
    else
    {
        int mid = tr[u].l + tr[u].r >> 1;
        if(x <= mid)modify(u<<1,x,ch);
        else modify(u<<1|1,x,ch);
        pushup(u);
    }
}

int main()
{
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);
    std::cout.tie(nullptr);
    std::cin>>n>>q;
    std::cin>>(s+1);
    build(1,1,n);
    while(q--)
    {
        int x;
        char ch;
        std::cin>>x>>ch;
        modify(1,x,ch);
        std::cout<<(tr[1].a[0][2]+tr[1].a[1][2])%mod<<'\n';
    }
    return 0;
}
```

***

