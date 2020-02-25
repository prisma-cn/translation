---
title: 用 Prisma 模板快速构建一个生产成熟的 Prisma-GraphQL API 服务
tags: [prisma1]
---

# Prisma 起步模板

[配套视频](https://www.bilibili.com/video/av35372612/)

## 1. 下载并安装依赖

在终端运行如下命令:

```
git clone git@github.com:victorkangsh/prisma-start.git

```

<!--truncate-->

进入目录并安装依赖

```
cd prisma-start
yarn install
```

配置在`.env`文件中，endpoint 已注释，docker 用户把注释去掉即可，prisma cloud 用户在创建服务后修改即可。

## 2. 部署 Prisma server 和数据库

详见[prisma 中文网址](https://prisma.1wire.com)

虽然 dev 依赖中有，但还是尽量确保你已经全局安装了 prisma 和 graphqlgen@beta

docker 用户需要先执行`docker-compose up -d`

没有 docker 的可以用 demo 服务器，配置详见[prisma 中文网址](https://prisma.1wire.com)，直接执行以下命令即可创建。

```
prisma deploy

```

此时会得到 generate 目录和 tmp-resolvers 目录，prisma client 和 resolver 脚手架已经创建好了，将 tmp-resolvers 目录拷贝到 resolvers 目录，然后将其中的代码修改为自己的业务逻辑即可。

## 3. 运行 GraphQL server

上面 deploy 好后就编辑自己的 datamodel 和 schema，运行的话命令如下：（确保 env 文件 endpoint 修改为你的服务器地址）

```
yarn dev
```

## 你的环境变量在 `.env`文件中设置

建议创建 `.env.prod` 文件用于生产环境:

```
PRISMA_ENDPOINT="https://api.example.com"
PRISMA_SECRET="mysecret123"
APP_SECRET="appsecret321"
```
