---
title: kube-proxy工作机制浅析
description: kube-proxy是k8s中的重要组件，在k8s的整个网络模型中有着重要的作用，kube-proxy有着多种工作模式，本博客只考虑在iptables模式下工作的kube-proxy iptables iptables是linux中著名的防火墙，有着过滤，转发等多种功能，iptables中有多张ta
date: 2023-10-09T09:15:59+08:00
tags:
  - kubernetes
categories: []
legacyPath: /2023/10/09/kube-proxy工作机制浅析/
---

kube-proxy是k8s中的重要组件，在k8s的整个网络模型中有着重要的作用，kube-proxy有着多种工作模式，本博客只考虑在`iptables`模式下工作的kube-proxy

# iptables

iptables是linux中著名的防火墙，有着过滤，转发等多种功能，iptables中有多张table，每张table有着不同的功能，一张table由多条chain组成，chain中的规则决定了包最后的走向

![20231009135911](https://skynesserblog.oss-cn-hangzhou.aliyuncs.com/20231009135911.png)

nat table有PREROUTING，OUTPUT，POSTROUTING等chains，这些chains中有若干rules，chains中的rules会决定流入的包的走向，特殊的，本地进程发出的包会走向OUTPUT，而外部的包不会

# kube-proxy的工作机制

kube-proxy接受api-server的信息，接收到地址的映射信息以后修改iptables的内容，通过linux的iptables实现kubernetes的网络

可以通过下面的命令查看kube-proxy的工作模式
```shell
$ curl localhost:10249/proxyMode
```
返回的内容就是kube-proxy的工作模式

## kube-proxy 工作实例

先创建一个deployment和service

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: ngx-conf

data:
  default.conf: |
    server {
      listen 80;
      location / {
        default_type text/plain;
        return 200
          'srv : $server_addr:$server_port\nhost: $hostname\nuri : $request_method $host $request_uri\ndate: $time_iso8601\n';
      }
    }

---

apiVersion: apps/v1
kind: Deployment
metadata:
  name: ngx-dep

spec:
  replicas: 2
  selector:
    matchLabels:
      app: ngx-dep


  template:
    metadata:
      labels:
        app: ngx-dep
    
    spec:
      volumes:
      - name: ngx-conf-vol
        configMap:
          name: ngx-conf

      containers:
      - image: nginx:alpine
        name: nginx
        ports:
        - containerPort: 80
      
        volumeMounts:
        - mountPath: /etc/nginx/conf.d
          name: ngx-conf-vol

---

apiVersion: v1
kind: Service
metadata:
  name: ngx-svc

spec:
  selector:
    app: ngx-dep

  ports:
  - port: 80
    targetPort: 80
    protocol: TCP
```

```shell
$ kubectl apply -f ngx.yaml
```

创建完成我们查看service的clusterIP和两个pod的ip
```shell
$ kubectl get svc
```
```
NAME         TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
kubernetes   ClusterIP   10.43.0.1       <none>        443/TCP        2d15h
ngx-svc      NodePort    10.43.120.124   <none>        80/TCP         4s
```
```shell
$ kubectl get pod -o wide
```
```
NAME                      READY   STATUS    RESTARTS   AGE   IP            NODE    NOMINATED NODE   READINESS GATES
ngx-dep-9bf586b97-kshgd   1/1     Running   0          98s   10.42.0.148   honor   <none>           <none>
ngx-dep-9bf586b97-zbwww   1/1     Running   0          98s   10.42.0.149   honor   <none>           <none>
```

## 查看kube-proxy在iptables中创建的rules

现在可以通过service的固定ip访问到pod，那么iptables中的规则是怎么样的呢，我们一步步查看包在chains中的流向，`-L可以选择显示的chain`
```shell
$ sudo iptables -t nat -L PREROUTING
```
output:
```
Chain PREROUTING (policy ACCEPT)
target     prot opt source               destination         
KUBE-SERVICES  all  --  anywhere             anywhere             /* kubernetes service portals */
DOCKER     all  --  anywhere             anywhere             ADDRTYPE match dst-type LOCAL
CNI-HOSTPORT-DNAT  all  --  anywhere             anywhere             ADDRTYPE match dst-type LOCAL
```

我们可以看到kube-proxy在iptables中创建了`KUBE-SERVICES`的chain target，我们继续跟踪这个chain
```shell
$ sudo iptables -t nat -L KUBE-SERVICES
```
output:
```
Chain KUBE-SERVICES (2 references)
target     prot opt source               destination         
KUBE-SVC-NPX46M4PTMTKRN6Y  tcp  --  anywhere             10.43.0.1            /* default/kubernetes:https cluster IP */ tcp dpt:https
KUBE-SVC-DQYKF4NVSQPF2JO7  tcp  --  anywhere             10.43.120.124        /* default/ngx-svc cluster IP */ tcp dpt:http
KUBE-NODEPORTS  all  --  anywhere             anywhere             /* kubernetes service nodeports; NOTE: this must be the last rule in this chain */ ADDRTYPE match dst-type LOCAL
```

可以看到，在这里的`KUBE-SVC-DQYKF4NVSQPF2JO7`指定了目标为`10.43.120.124`的包，这也是service的ip，继续跟踪这条chains
```shell
$ sudo iptables -t nat -L KUBE-SVC-DQYKF4NVSQPF2JO7
```
output:
```
Chain KUBE-SVC-DQYKF4NVSQPF2JO7 (2 references)
target     prot opt source               destination         
KUBE-MARK-MASQ  tcp  -- !10.42.0.0/16         10.43.120.124        /* default/ngx-svc cluster IP */ tcp dpt:http
KUBE-SEP-WHP752REJFIVTA3A  all  --  anywhere             anywhere             /* default/ngx-svc -> 10.42.0.148:80 */ statistic mode random probability 0.50000000000
KUBE-SEP-KOUJFWPU7NB2K4H6  all  --  anywhere             anywhere             /* default/ngx-svc -> 10.42.0.149:80 */
```
最终，我们发现这个包会被转发到`10.42.0.148:80或者10.42.0.149:80`，也就是两个pod所在的ip和port，最后查看这两个chain

output:
```
Chain KUBE-SEP-WHP752REJFIVTA3A (1 references)
target     prot opt source               destination         
KUBE-MARK-MASQ  all  --  10.42.0.148          anywhere             /* default/ngx-svc */
DNAT       tcp  --  anywhere             anywhere             /* default/ngx-svc */ tcp to:10.42.0.148:80

Chain KUBE-SEP-KOUJFWPU7NB2K4H6 (1 references)
target     prot opt source               destination         
KUBE-MARK-MASQ  all  --  10.42.0.149          anywhere             /* default/ngx-svc */
DNAT       tcp  --  anywhere             anywhere             /* default/ngx-svc */ tcp to:10.42.0.149:80
```