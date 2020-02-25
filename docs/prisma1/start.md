---
title: 快速入门
description: 本章的目的在于快速了解prisma的能力和作用，初步认识prisma的粗略面貌
keywords:
  - start
  - prisma
  - 快速入门
---

![prisma](/prisma1/images/QgwDieO.png)

**Prisma 是现代应用程序的数据层**。 它通过 **Prisma client**使用通用数据库抽象替换传统的 ORM 和数据访问层。 Prisma 用于构建 **GraphQL 服务器，REST API 等**。

- **各种语言的 Prisma client**，如 JavaScript，TypeScript，Flow，Go，Java，Python。
- **支持多个数据库**，如 MySQL，PostgreSQL，MongoDB(目前仅以上三种，后续支持更多)。
- **类型安全的数据库访问**包括过滤器，聚合，分页和事务。
- **数据库的实时事件系统**以获得有关数据库事件的通知。
- **具有简单 SDL 语法的声明性数据建模和迁移（可选）**。

尝试在线示例：

[Prisma Client Demo](https://codesandbox.io/s/github/prisma-csb/prisma-client-demo-ts)

[GraphQL API](https://codesandbox.io/s/github/prisma-csb/graphql-example-ts)

[REST API](https://codesandbox.io/s/github/prisma-csb/rest-example-ts?initialpath=/feed)

## 开始

### 1. 安装

npm 或 yarn 安装，国内推荐使用 cnpm：

```

# 没有 cnpm 请先安装：npm i -g cnpm

cnpm i -g prisma

# or

yarn global add prisma

```

mac 用户也可选择使用 brew 安装：

```
brew tap prisma/prisma
brew install prisma
```

### 2. 连接数据库和 Prisma

有两种方式启动数据库和 Prisma，熟悉 docker 的用户选择第一种，不会 docker 的用户可以选择先部署在 Prisma 提供的云上，选第二种方式：

##### 1. Docker 用户

```
prisma init hello-world

```

在终端中可以看到各种选项，按如下选择:

- 选择 **Create new database** (你也可以选择 [existing database](https://prisma.1wire.com/blog/existingdatabase/) )
- 选择数据库类型: **MySQL** 或 **PostgreSQL**
- 选择生成 **Prisma Client**的编程语言: **TypeScript**, **Flow**, **JavaScript** 或 **Go**

向导终止后，运行以下命令来启动 Prisma：

```
cd hello-world
docker-compose up -d
```

> 部署到已有数据库？修改 docker-compose.yml 中的参数为你私有数据库参数即可（目前只支持 PostgreSQL）。

##### 2. Prisma 提供测试服务器

```
prisma init hello-world

```

在终端中可以看到各种选项，按上下键选择（windows 用户建议使用 PowerShell）:

- 选择 **Demo server**
- 此时会打开 app.prisma.io 网页，可以注册登录或使用 github 账户登录，登录后点击授权即可。
  **注意此处千万不能用数字开头的邮箱注册（尤其 qq 邮箱），包括注册 github 的邮箱，如果你的 github 账户邮箱由数字开头，建议用字母开头邮箱注册 app.prisma.io**
- 终端显示 **Authenticating** 后选择你想部署在哪个区域，有两个选择，欧洲和美国，后面有延迟状态，选延迟低的回车确认。如：账户名/demo-us1 即美国地区。
- 填入你想使用的名字，这里我们直接回车，选择 stage 分支，默认是 dev，再次直接回车就行。
- 选择生成 **Prisma Client**的编程语言，这里我们选择 **Prisma JavaScript Client**,如选择 TS，注意后面安装依赖会多个 graphql-tools。
- 初始文件已生成，按照提示进入目录部署： cd hello-world && prisma deploy
- 此时你的后端 API 已经可以访问，打开终端显示的 http 地址即可看到 Prisma playground

> `prisma.yml`是 Prisma 的根配置文件。
> `datamodel.prisma`定义应用程序的数据库的数据模型(它基本上定义了数据库模式)。
> 如果报错，请 prisma account 查看名称开头是否为数字。

### 3. 定义数据模型

打开编辑器编辑 `datamodel.prisma` 使用 SDL 语言风格 [SDL](https://www.prisma.io/blog/graphql-sdl-schema-definition-language-6755bcb9ce51/) 每个模型在数据库里对应一张表:

```graphql
type User {
  id: ID! @id
  email: String @unique
  name: String!
  posts: [Post!]!
}
type Post {
  id: ID! @id
  title: String!
  published: Boolean! @default(value: false)
  author: User
}
```

### 4. 部署 Prisma API

在终端输入以下命令变更数据库表并生成新 client：

```

prisma deploy
prisma generate

```

Prisma API 基于数据模型进行部署，并为该文件中的每个模型公开 CRUD 和实时操作。

### 5. 使用 Prisma client (JavaScript)

Prisma 客户端连接到 Prisma API，允许你对数据库执行读写操作。 本节介绍如何使用 **JavaScript** 中的 Prisma client。

首先，在`hello-world`中初始化并安装依赖：

```

cnpm init -y
cnpm install --save prisma-client-lib
prisma generate

```

在`hello-world`目录中创建一个新的 Node 脚本：

```

touch index.js
#or 在编辑器中新建 index.js

```

编辑如下代码：

```javascript
const { prisma } = require('./generated/prisma-client');
// 一个main函数，以便我们可以使用async/await
async function main() {
  // 新建一个user，并新建一个post文章
  const newUser = await prisma.createUser({
    name: 'Alice',
    posts: {
      create: {
        title: 'The data layer for modern apps',
      },
    },
  });
  console.log('Created new user: ${newUser.name} (ID: ${newUser.id})');
  // 从数据库中读取所有用户user并将其打印到控制台
  const allUsers = await prisma.users();
  console.log(allUsers);
  // 从数据库中读取所有文章post并将其打印到控制台
  const allPosts = await prisma.posts();
  console.log(allPosts);
}
main().catch(e => console.error(e));
```

最后，在终端启动这个文件：

```
node index.js

```

此时终端显示用户已被存到数据库：

```
Created new user: Alice (ID: cjn70mkjlgnv00b77iyk9zx0e)
[ { id: 'cjn70mkjlgnv00b77iyk9zx0e', email: null, name: 'Alice' } ]
[ { id: 'cjn70mkjrgnv10b77nhqgg2zd', title: 'The data layer for modern apps', published: false } ]
```

<details><summary><b>查看更多操作</b></summary>

```javascript
const usersCalledAlice = await prisma.users({
  where: {
    name: 'Alice',
  },
});
```

```javascript
// replace the __USER_ID__ placeholder with an actual user ID
const updatedUser = await prisma.updateUser({
  where: { id: '__USER_ID__' },
  data: { email: 'alice@prisma.io' },
});
```

```javascript
// replace the **USER_ID** placeholder with an actual user ID
const deletedUser = await prisma.deleteUser({ id: '**USER_ID**' });
```

```javascript
const postsByAuthor = await prisma.user({ email: 'alice@prisma.io' }).posts();
```

</details>

### 6. 下一步

- [在已存在数据库上使用 Prisma](https://prisma.1wire.com/blog/existingdatabase/)
- [使用 Prisma client 构建 APP](https://prisma.1wire.com/docs/part3)
- [Prisma 原理](https://prisma.1wire.com/docs/part4).

## 案例

Prisma 模板集合 💡

#### TypeScript

| Demo                                                                                                              | Description                                                                                         |
| :---------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------- |
| [`script`](https://github.com/prisma/prisma-examples/tree/master/typescript/script)                               | Simple usage of Prisma client in script                                                             |
| [`graphql`](https://github.com/prisma/prisma-examples/tree/master/typescript/graphql)                             | Simple GraphQL server based on [`graphql-yoga`](https://github.com/prisma/graphql-yoga)             |
| [`graphql-apollo-server`](https://github.com/prisma/prisma-examples/tree/master/typescript/graphql-apollo-server) | Simple GraphQL server based on [`apollo-server`](https://www.apollographql.com/docs/apollo-server/) |
| [`graphql-crud`](https://github.com/prisma/prisma-examples/tree/master/typescript/graphql-crud)                   | GraphQL server with full CRUD API                                                                   |
| [`graphql-auth`](https://github.com/prisma/prisma-examples/tree/master/typescript/graphql-auth)                   | GraphQL server with email-password authentication & permissions                                     |
| [`graphql-subscriptions`](https://github.com/prisma/prisma-examples/tree/master/typescript/graphql-subscriptions) | GraphQL server with realtime subscriptions                                                          |
| [`rest-express`](https://github.com/prisma/prisma-examples/tree/master/typescript/rest-express)                   | Simple REST API with Express.JS                                                                     |
| [`grpc`](https://github.com/prisma/prisma-examples/tree/master/typescript/grpc)                                   | Simple gRPC API                                                                                     |
| [`docker-mongodb`](https://github.com/prisma/prisma-examples/tree/master/typescript/docker-mongodb)               | Set up Prisma locally with MongoDB                                                                  |
| [`docker-mysql`](https://github.com/prisma/prisma-examples/tree/master/typescript/docker-mysql)                   | Set up Prisma locally with MySQL                                                                    |
| [`docker-postgres`](https://github.com/prisma/prisma-examples/tree/master/typescript/docker-postgres)             | Set up Prisma locally with PostgreSQL                                                               |
| [`cli-app`](https://github.com/prisma/prisma-examples/tree/master/typescript/cli-app)                             | Simple CLI TODO list app                                                                            |

#### Node.js

| Demo                                                                                                        | Description                                                     |
| :---------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------- |
| [`script`](https://github.com/prisma/prisma-examples/tree/master/node/script)                               | Simple usage of Prisma client in script                         |
| [`graphql`](https://github.com/prisma/prisma-examples/tree/master/node/graphql)                             | Simple GraphQL server                                           |
| [`graphql-auth`](https://github.com/prisma/prisma-examples/tree/master/node/graphql-auth)                   | GraphQL server with email-password authentication & permissions |
| [`graphql-subscriptions`](https://github.com/prisma/prisma-examples/tree/master/node/graphql-subscriptions) | GraphQL server with realtime subscriptions                      |
| [`rest-express`](https://github.com/prisma/prisma-examples/tree/master/node/rest-express)                   | Simple REST API with Express.JS                                 |
| [`grpc`](https://github.com/prisma/prisma-examples/tree/master/node/grpc)                                   | Simple gRPC API                                                 |
| [`docker-mongodb`](https://github.com/prisma/prisma-examples/tree/master/node/docker-mongodb)               | Set up Prisma locally with MongoDB                              |
| [`docker-mysql`](https://github.com/prisma/prisma-examples/tree/master/node/docker-mysql)                   | Set up Prisma locally with MySQL                                |
| [`docker-postgres`](https://github.com/prisma/prisma-examples/tree/master/node/docker-postgres)             | Set up Prisma locally with PostgreSQL                           |
| [`cli-app`](https://github.com/prisma/prisma-examples/tree/master/node/cli-app)                             | Simple CLI TODO list app                                        |

#### Golang

| Demo                                                                            | Description                                                        |
| :------------------------------------------------------------------------------ | :----------------------------------------------------------------- |
| [`cli-app`](https://github.com/prisma/prisma-examples/tree/master/go/cli-app)   | Simple CLI TODO list app                                           |
| [`graphql`](https://github.com/prisma/prisma-examples/tree/master/go/graphql)   | Simple GraphQL server                                              |
| [`http-mux`](https://github.com/prisma/prisma-examples/tree/master/go/http-mux) | Simple REST API with [gorilla/mux](https://github.com/gorilla/mux) |
| [`rest-gin`](https://github.com/prisma/prisma-examples/tree/master/go/rest-gin) | Simple REST API with [Gin](https://github.com/gin-gonic/gin)       |
| [`script`](https://github.com/prisma/prisma-examples/tree/master/go/script)     | Simple usage of Prisma client in script                            |

#### Flow

| Demo                                                                            | Description                             |
| :------------------------------------------------------------------------------ | :-------------------------------------- |
| [`graphql`](https://github.com/prisma/prisma-examples/tree/master/flow/graphql) | Simple GraphQL server                   |
| [`script`](https://github.com/prisma/prisma-examples/tree/master/flow/script)   | Simple usage of Prisma client in script |

这里是一个仿 AirBnb 后端的例子 [**AirBnB clone example**](https://github.com/prismagraphql/graphql-server-example) 我们写了一个包含 Prisma 全部用例的项目.

## 架构

Prisma 在后端架构中扮演 **数据层** 的角色，取代传统的 ORM 和自定义数据访问层。 它支持*layered 架构*，可以更好地分离关注点*并提高整个后端的\_maintainability*。

** Prisma client**在你的应用程序服务器中用于通过 Prisma API 对你的数据库执行读写操作。

Prisma 作为*standalone processes*运行，允许它独立于应用程序服务器进行扩展。

<div align='center'>
  <img src='/prisma1/images/OyIQQxF.png' height='132' alt='prisma' />
</div>

## 连接数据库

[数据库连接器](https://github.com/prisma/prisma/issues/1751) 提供 Prisma 和底层数据库之间的链接。

现在可以使用这几个数据库:

- MySQL
- PostgreSQL
- MongoDB

### 即将更新

如果你有兴趣参与以下连接器之一的预览，请加入我们的微信群。

- [Elastic Search](https://github.com/prisma/prisma/issues/1665)
- [MS SQL](https://github.com/prisma/prisma/issues/1642)
- [Oracle](https://github.com/prisma/prisma/issues/1644)
- [ArangoDB](https://github.com/prisma/prisma/issues/1645)
- [Neo4j](https://github.com/prisma/prisma/issues/1646)
- [Druid](https://github.com/prisma/prisma/issues/1647)
- [Dgraph](https://github.com/prisma/prisma/issues/1648)
- [DynamoDB](https://github.com/prisma/prisma/issues/1655)
- [Cloud Firestore](https://github.com/prisma/prisma/issues/1660)
- [CockroachDB](https://github.com/prisma/prisma/issues/1705)
- [Cassandra](https://github.com/prisma/prisma/issues/1750)
- [Redis](https://github.com/prisma/prisma/issues/1722)
- [AWS Neptune](https://github.com/prisma/prisma/issues/1752)
- [CosmosDB](https://github.com/prisma/prisma/issues/1663)
- [Influx](https://github.com/prisma/prisma/issues/1857)

加入讨论，呼声最高的我们将优先完成!

## 社区

Prisma 的[社区](https://www.prisma.io/community) ! 👋

- [WeChat](/wechat)
- [Forum](https://www.prisma.io/forum)
- [Slack](https://slack.prisma.io/)
- [Twitter](https://twitter.com/prisma)
- [Facebook](https://www.facebook.com/prisma.io)
- [Email](mailto:kwc@1wire.com)

## 贡献

欢迎贡献,参与中文翻译[地址](https://github.com/victorkangsh/prisma-docs-cn)

参考 [how to the contribution guide](https://github.com/prisma/prisma/blob/master/CONTRIBUTING.md)

版本分为三个： **alpha**，**beta**和 **stable** 。关于版本和 Prisma 的发布流程参考（https://www.prisma.io/blog/improving-prismas-release-process-yaey8deiwaex/）。
