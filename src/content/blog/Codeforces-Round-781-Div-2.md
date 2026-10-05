---
title: Codeforces Round 781 (Div. 2)
description: "A. GCD vs LCM 题意： 给定数n，找到a,b,c,d四个数满足下列条件： 1.$a+b+c+d=n$ 2.$gcd(a,b)=lcm(c,d)$ 思路： 取特殊情况，令$gcd(a,b)=1$即可。 即构造$a=1,b=n-3,c=1,d=1$ 时间复杂度： 所需时间与输入规模无关: $"
date: 2022-04-12T18:34:34+08:00
tags:
  - Codeforces
categories:
  - 题解
legacyPath: /2022/04/12/Codeforces-Round-781-Div-2/
---

![请添加图片描述](https://img-blog.csdnimg.cn/3e0c9e6545784e64b4cf89832e9fc83f.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAc2t5bmVzc2Vy,size_20,color_FFFFFF,t_70,g_se,x_16)


***

## A. GCD vs LCM

**题意：**

>给定数n，找到a,b,c,d四个数满足下列条件：
>
>>1.$a+b+c+d=n$
>>2.$gcd(a,b)=lcm(c,d)$

**思路：**

>取特殊情况，令$gcd(a,b)=1$即可。
>即构造$a=1,b=n-3,c=1,d=1$

**时间复杂度：**

>所需时间与输入规模无关:
>$O(1)$

**AC代码：**
![在这里插入图片描述](https://img-blog.csdnimg.cn/69cc329cf70d4bf98dc95222e120f632.png)

```cpp
#include<bits/stdc++.h>

const int N = 2e2+10,M = 2e5+10,INF = 0x3f3f3f3f;

void solve()
{
    int n;
    std::cin>>n;
    std::cout<<1<<' '<<n-3<<1<<' '<<1<<'\n';
}

int main()
{
//    std::ios::sync_with_stdio(false);
//    std::cin.tie(nullptr);
//    std::cout.tie(nullptr);
    int T;
    std::cin>>T;
    while(T--)
    {
        solve();
    }
    return 0;
}
```

***

## B. Array Cloning Technique

**题意：**

>给定一个长度为n的初始数组副本，你可以进行以下两种操作：
>
>>1. 选择任意一个数组副本，将其复制出一个新的数组副本。
>>2. 选择两个数组副本，交换它们的两个元素。
>
>询问将其中任意一个数组副本的全部元素变相同的最少操作次数。

**思路：**

>1. 首先，我们贪心的选择第一个数组副本作为目标，将这个数组的全部元素变成相同。
>2. 然后，我们记录下初始数组副本中的最大相同数字出现次数$max$,那么将其他所有元素变成相同的交换(操作1)次数显然是$n-max$。
>3. 接着我们计算复制数组副本的次数(操作2)，我们不难发现每次复制并交换结束后，相同数的个数都会翻倍，所以我们通过这种方式找到最小复制次数即可。
>
>最后，将操作1和操作2的次数相加即可。

**时间复杂度：**

>统计相同数字的最大出现次数中使用了map来完成，所以时间复杂度为：
>$O(nlogn)$

**AC代码：**
![在这里插入图片描述](https://img-blog.csdnimg.cn/bee7ce6348544de49308edbfe0afd11b.png)

```cpp
#include<bits/stdc++.h>

const int N = 2e2+10,M = 2e5+10,INF = 0x3f3f3f3f;

void solve()
{
    int n;
    int max = 0;
    std::cin>>n;
    std::map<int,int> mp;
    for(int i = 1 ; i <= n ; i++)
    {
        int x;
        std::cin>>x;
        mp[x]++;
        if(mp[x] > max)max = mp[x];
    }
    int res = 0,cnt = n - max;
    if(cnt==0)std::cout<<0<<'\n';
    else
    {
        for(;max < n;max <<= 1)res++;
        res += cnt;
        std::cout<<res<<'\n';
    }
}

int main()
{
//    std::ios::sync_with_stdio(false);
//    std::cin.tie(nullptr);
//    std::cout.tie(nullptr);
    int T;
    std::cin>>T;
    while(T--)
    {
        solve();
    }
    return 0;
}
```

***

## C. Tree Infection

**题意：**

>给定一棵树，现在要去感染这棵树的全部节点，我们可以在每个单位时间内执行以下两种操作(同时进行)：
>
>>1. 对于所有的节点，如果他的某个孩子节点被感染，那么可以感染一个其它健康的孩子节点。
>>   2.任意选择一个健康的节点，并感染它。
>
>询问将整棵树感染的最少时间。 

**思路：**

>首先，我们可以发现，感染传播(操作1)只会在一个个"孩子群体"中进行，实际上感染与树并没有太大的关系，我们完全可以把这一个个"孩子群体"取出来。
>还是举个例子(第一个案例)：
>
>>7
>>1 1 1 2 2 4
>>很显然，这里的"群体"有这些：
>>{1},{2,3,4},{5,6},{7}
>
>我们可以先把所有的群体找出来，然后采用贪心策略，从数量大的群体开始感染，采用如下判断方法：
>
>>1. 我们从大到小感染所有"群体"(依次对所有"群体"使用操作1一次，然后让它们内部传播)，我们记录下完成上述操作后所有群体还剩下的未感染个数(如果已经全部感染则不用管)。
>>2. 如果此时还有剩余节点未被感染，我们让它们内部传播，并手动感染剩余节点最多的"群体"。
>
>即在贪心后模拟感染的过程(实现上可能还是有点复杂了)。

**时间复杂度：**

>使用了map和优先队列，总时间复杂度：$O(nlogn)$

**AC代码：**
![在这里插入图片描述](https://img-blog.csdnimg.cn/16d3352593b742aba78eca793a507b5d.png)

```cpp
#include<bits/stdc++.h>

const int N = 2e2+10,M = 2e5+10,INF = 0x3f3f3f3f;

void solve()
{
    int n,t = 0;
    std::cin>>n;
    std::priority_queue<int> que;
    std::map<int,int> mp;
    mp[0] = 1;
    for(int i = 1 ; i < n ; i++)
    {
        int x;
        std::cin>>x;
        mp[x]++;
    }
    std::vector<int> num;
    for(auto map : mp)num.push_back(map.second);//从大到小排序"群体"
    std::sort(num.begin(),num.end());
    for(auto val : num)//第一步
    {
        if(val - 1 - t > 0)que.push(val - 1 - t);
        t++;
    }
    int res = 0;
    while(true)
    {
        if(que.empty()||que.top() - res <= 0)break;//第二步
        que.push(que.top()-1);
        que.pop();
        res++;
    }
    std::cout<<res+t<<'\n';
}

int main()
{
//    std::ios::sync_with_stdio(false);
//    std::cin.tie(nullptr);
//    std::cout.tie(nullptr);
    int T;
    std::cin>>T;
    while(T--)
    {
        solve();
    }
    return 0;
}
```

***

## D. GCD Guess

**题意：**

>交互题：
>先要猜测一个整数x的大小，你可以按照以下规则询问最多30次：
>
>>给出数字$a$和$b$，返回$gcd(a+x,b+x)$

**思路：**

>30次的询问次数，我们应该尝试从位的角度取解决。
>那么我们怎么知道每一位取0还是1呢，按照如下方法：
>
>>1. 假设我们已知$x\ mod\ 2^k = ans$
>>2. 那么$x-ans$的$1$~$k$位应该全是0
>>3. 我们可以用$gcd(x-ans,2^{k+1})$是否等于$2^k$来判断$k+1$位取0还是1。
>>4. 若等于$2^k$，则取1，若不等，则取0。
>>5. 此时询问的$a=-ans$，而询问数应该大于0，所以我们询问$gcd(x-ans+2^{k},2^{k+1})$。
>>6. 若等于$2^k$，则取0，若不等，则取1。
>>7. $gcd(x-ans+2^{k},2^{k+1})=gcd(x-ans+2^{k},2^{k+1}+(x-ans+2^{k}))$（这个转换是为了凑出a和b）,所以询问为$a=-ans+2^k,b=-ans+2^k+2^{k+1}$。

**时间复杂度：**

>我们每次询问可以确定数$x$的某一位：
>$O(logn)$

**AC代码：**
![在这里插入图片描述](https://img-blog.csdnimg.cn/62afe2ea13ac4c5bbeec96fc44644586.png)

```cpp
#include<bits/stdc++.h>
typedef long long ll;
const int N = 2e2+10,M = 2e5+10,INF = 0x3f3f3f3f;

int query(int x,int y)
{
    std::cout<<"? "<<x<<' '<<y<<std::endl;
    int res;
    std::cin>>res;
    return res;
}

void solve()
{
    int ans = 0;
    for(int i = 1 ; i <= 30 ; i++)
    {
        int res = query((1<<i-1)-ans,(1<<i)+(1<<i-1)-ans);
        if(res != (1<<i-1))ans += (1<<i-1);
    }
    std::cout<<"! "<<ans<<std::endl;
}

int main()
{
//    std::ios::sync_with_stdio(false);
//    std::cin.tie(nullptr);
//    std::cout.tie(nullptr);
    int T;
    std::cin>>T;
    while(T--)
    {
        solve();
    }
    return 0;
}
```


***

## E. MinimizOR

**题意：**

>给定长度为n的数组，定义花费为$a_i|a_j(i\ !=j)$，现在给出q个询问：
>
>>给出整数$l$和$r$，找出区间内的最小花费。

**思路：**

>本题最重要的是证明一个性质：
>
>>如果区间内的最大数$A_{max} < 2^k$(即最大数不超过k位),那么答案一定在$k+1$个区间最小数内按位或产生。
>>证明如下：
>>
>>>对$k=1$,只有0和1两个数，显然成立。
>>>现在我们将设结论对$k$成立，我们尝试证明对$k+1$也成立。
>>>分类讨论：
>>>
>>>1. 若$k+1$位全是1，那么答案必然出现在之前已经选择的$k+1$个数中，而且此时选择的$k+1$个最小数与之前应该是一致的。
>>>2. 若$k+1$位0的个数大于等于2，那么答案必然出现在之前已经选择的k+1个数中，而且此时选择的$k+1$个最小数与之前应该是一致的。
>>>3. 若$k+1$位0的个数恰好等于1，$k+1$应该取1，所以答案还是出现在之前选择的$k+1$个数中，但是此时选择的$k+1$个最小数与之前不一定一致，因为最坏情况就是之前$k+1$个数$k+1$位全是1，而此时$k+1$位是0的一个数会取代其中的一个数，所以我们这个时候要多取一个数，取$k+2$个最小数即可。
>
>>通过以上说明，我们证明结论：
>>
>>>如果区间内的最大数$A_{max} < 2^k$(即最大数不超过k位),那么答案一定在$k+1$个区间最小数内按位或产生
>
>现在的任务就是找到$k+1$区间最小数，这个可以用线段树完成。
>此外，因为$A_{max}$的范围并不会很大，所以我们每次并不会真的求出它，我们每次都假定它在边界最大值$A_{max}=2^{30}-1$，所以每次最多找到31个最小数。

**时间复杂度：**

>这题的常数会特别大，因为每次询问都需要查找最多31次。
>$O(q*(mlogn+m^2))(m=min(r-l+1,31))$

**AC代码：**
![在这里插入图片描述](https://img-blog.csdnimg.cn/4a16027cb1fb4304af68c7cd2afe335e.png)

```cpp
#include<bits/stdc++.h>
typedef long long ll;
const int N = 1e5+10,M = 2e5+10,INF = (1ll<<31)-1;
struct Node{
    int l,r,v,id;
}tr[N*4];
int w[N];

void pushup(int u)
{
    tr[u].v = std::min(tr[u<<1].v,tr[u<<1|1].v);
    if(tr[u<<1].v < tr[u<<1|1].v)tr[u].id = tr[u<<1].id;
    else tr[u].id = tr[u<<1|1].id;
}

void build(int u,int l,int r)
{
    if(l==r)
    {
        tr[u] = {l,r,w[r],r};
    }
    else
    {
        tr[u] = {l,r};
        int mid = l + r >> 1;
        build(u<<1,l,mid),build(u<<1|1,mid+1,r);
        pushup(u);
    }
}

std::pair<int,int> query(int u,int l,int r)
{
    if(tr[u].l >= l && tr[u].r <= r)
    {
        return std::make_pair(tr[u].v,tr[u].id);
    }
    else
    {
        int mid = tr[u].l + tr[u].r >> 1;
        std::pair<int,int> ans = {INF,INF};
        if(l <= mid)ans = std::min(ans,query(u<<1,l,r));
        if(r > mid)ans = std::min(ans,query(u<<1|1,l,r));
        return ans;
    }
}

void modify(int u,int x,int v)
{
    if(tr[u].l==x&&tr[u].r==x)
    {
        tr[u].v = v;
    }
    else
    {
        int mid = tr[u].l + tr[u].r >> 1;
        if(x <= mid)modify(u<<1,x,v);
        else modify(u<<1|1,x,v);
        pushup(u);
    }
}

void solve()
{
    int n,q;
    std::cin>>n;
    for(int i = 1 ; i <= n ; i++)std::cin>>w[i];
    build(1,1,n);
    std::cin>>q;
    while(q--)
    {
        int l,r;
        std::vector<int> res,id;
        std::cin>>l>>r;
        for(int i = 1 ; i <= std::min(31,r - l + 1) ; i++)
        {
            std::pair<int,int> temp = query(1,l,r);
            res.push_back(temp.first);
            id.push_back(temp.second);
            modify(1,temp.second,INF);
        }
        int ans = INF;
        for(int i = 0 ; i < res.size() ; i++)
            for(int j = i + 1 ; j < res.size() ; j++)ans = std::min(ans,res[i]|res[j]);
        std::cout<<ans<<'\n';
        for(auto _id : id)
        {
            modify(1,_id,w[_id]);
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

