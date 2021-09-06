---
title: 'GraphQL'
metaTitle: 'Building GraphQL servers with Prisma'
metaTitle: '使用 Prisma 构建 GraphQL 服务器'
metaDescription: '本文介绍了如何使用 Prisma 构建 GraphQL 服务器。并显示了 Prisma 是如何融入 GraphQL 生态的，同时提供了一些实际的例子'
---

<TopBlock>

[GraphQL](https://graphql.org/) 是一种 API 查询语言。经常被用作 REST API 的替代品，但也可以用作现有的 REESTful 服务之上的额外"网关"层。

使用 Prisma，你可以构建一个连接数据库的 GraphQL 服务。Prisma 与你使用的 GraphQL 工具毫不相关。在构建 GraphQL 服务时，你可以将 Prisma 与 Apollo Server、`express-graphql`、TypeGraphQL、GraphQL.js 或者任何其他你在 GraphQL 服务中使用的工具相结合起来。

</TopBlock>

## GraphQL 服务深入了解

GraphQL 服务由两个主要部分组成：

- GraphQL schema (类型定义（type definitions） + resolve 函数（resolvers）)
- HTTP 服务（HTTP server）

注意，GraphQL schema 可以使用 code-first 或者 SDL-first 两种模式进行编写。查看 [article](https://www.prisma.io/blog/the-problems-of-schema-first-graphql-development-x1mn4cb0tyl3/) 了解更多关于这两种模式的区别。如果你喜欢 SDL-first 的模式，但是仍然希望你的代码能够类型安全，请查看 [GraphQL Code Generator](https://graphql-code-generator.com/) 来根据 SDL 生成各种类型定义。

GraphQL schema 和 HTTP 服务通常由不同的库进行处理。下面是当前常用的一些 GraphQL 服务端库及其使用场景的概述。

| Library (npm package) | Purpose                     | 兼容 Prisma | Prisma 集成                                                        |
| :-------------------- | :-------------------------- | :--------------------- | :------------------------------------------------------------------------ |
| `graphql`             | GraphQL schema (code-first) | Yes                    | No                                                                        |
| `graphql-tools`       | GraphQL schema (SDL-first)  | Yes                    | No                                                                        |
| `type-graphql`        | GraphQL schema (code-first) | Yes                    | [`typegraphql-prisma`](https://www.npmjs.com/package/typegraphql-prisma)  |
| `nexus`               | GraphQL schema (code-first) | Yes                    | [`nexus-plugin-prisma`](https://nexusjs.org/docs/plugins/prisma/overview) |
| `apollo-server`       | HTTP server                 | Yes                    | n/a                                                                       |
| `express-graphql`     | HTTP server                 | Yes                    | n/a                                                                       |
| `fastify-gql`         | HTTP server                 | Yes                    | n/a                                                                       |
| `graphql-yoga`        | HTTP server                 | Yes                    | n/a                                                                       |

In addition to these standalone and single-purpose libraries, there are several projects building integrated _application frameworks_:

除了这些独立和单一用途的库之外，还有几个项目正在建立集成的 _应用框架_。

| Framework                                  | Stack     | Built by                                          | Prisma                 | Description                                                                      |
| :----------------------------------------- | :-------- | :------------------------------------------------ | :--------------------- | :------------------------------------------------------------------------------- |
| [Redwood.js](https://redwoodjs.com)        | 全栈 | [Tom Preston-Werner](https://github.com/mojombo/) | 建立在 Prisma 之上 | 将全栈能力引入 JAMstack_                                           |
| [Blitz](https://github.com/blitz-js/blitz) | 全栈 | [Brandon Bayer](https://github.com/flybayer)      | 建立在 Prisma 之上 | _类似 Rails 的框架，用来建立纯前端或全栈的 React 应用 - 建立在 Next.js 之上_ |

> **注意**：如果你发现列表中缺少了任何 GraphQL 库/框架，请让我们知道。

## Prisma & GraphQL 例子

In the following section will find several ready-to-run examples that showcase how to use Prisma with different combinations of the tools mentioned in the table above.

在下一节中，将看到几个可运行的例子，演示了如何将 Prisma 与上面提到的工具进行组合使用。

### TypeScript

| Demo                                                                                                              | HTTP Server     | GraphQL schema  | Description                                                                                                                     |
| :---------------------------------------------------------------------------------------------------------------- | :-------------- | :-------------- | :------------------------------------------------------------------------------------------------------------------------------ |
| [GraphQL API](https://github.com/prisma/prisma-examples/tree/latest/typescript/graphql)                           | `apollo-server` | `nexus`         | 基于 [`apollo-server`](https://www.apollographql.com/docs/apollo-server/) 的 GraphQL 服务                                    |
| [GraphQL API (SDL-first)](https://github.com/prisma/prisma-examples/tree/latest/typescript/graphql-sdl-first)     | `apollo-server` | `graphql-tools` | 基于 [`graphql-tools`](https://www.apollographql.com/docs/graphql-tools/) (Apollo) 的 SDL-first GraphQL 服务 |
| [GraphQL API (TypeGraphQL)](https://github.com/prisma/prisma-examples/tree/latest/typescript/graphql-typegraphql) | `apollo-server` | `type-graphql`  | 基于 [TypeGraphQL](https://typegraphql.com/) 的 code-first GraphQL 服务                                      |
| [GraphQL API (Auth)](https://github.com/prisma/prisma-examples/tree/latest/typescript/graphql-auth)               | `apollo-server` | `nexus`         | 带有邮箱-密码校验的 GraphQL 服务                                                                 |
| [Fullstack app](https://github.com/prisma/prisma-examples/tree/latest/typescript/graphql-nextjs)                  | `apollo-server` | `nexus`         | 使用 Next.js (React), Apollo Client, Apollo Server 和 Nexus 的全栈应用                                                      |
| [GraphQL subscriptions](https://github.com/prisma/prisma-examples/tree/latest/typescript/subscriptions-pubsub)    | `apollo-server` | `nexus`         | 实现了 GraphQL 实时订阅的 GraphQL 服务                                                                      |

### JavaScript (Node.js)

| Demo                                                                                                                  | HTTP Server     | GraphQL schema  | Description                                                                                                                     |
| :-------------------------------------------------------------------------------------------------------------------- | :-------------- | :-------------- | :------------------------------------------------------------------------------------------------------------------------------ |
| [GraphQL API](https://github.com/prisma/prisma-examples/tree/latest/javascript/graphql)                               | `apollo-server` | `nexus`         | 基于 [`apollo-server`](https://www.apollographql.com/docs/apollo-server/) 的 GraphQL 服务                                    |
| [GraphQL API (Apollo Server)](https://github.com/prisma/prisma-examples/tree/latest/javascript/graphql-apollo-server) | `apollo-server` | `nexus`         | 基于 [`apollo-server`](https://www.apollographql.com/docs/apollo-server/) 的 GraphQL 服务                                    |
| [GraphQL API (SDL-first)](https://github.com/prisma/prisma-examples/tree/latest/javascript/graphql-sdl-first)         | `apollo-server` | `graphql-tools` | 基于 [`graphql-tools`](https://www.apollographql.com/docs/graphql-tools/) (Apollo) 的 SDL-first GraphQL 服务 |
| [GraphQL API (Auth)](https://github.com/prisma/prisma-examples/tree/latest/javascript/graphql-auth)                   | `apollo-server` | `nexus`         | 带有邮箱-密码校验的 GraphQL 服务                                                             |
|                                                                                                                       |

## 常见问题

### 在 GraphQL 服务中，Prisma 起什么样的作用？

无论你使用上述的哪种 GraphQL 工具/库。Prisma 都在你的 resolver 函数中用于连接数据库。它的作用与其他任何在 resolver 函数中使用的 ORM 或 SQL 查询生成器一样。

在 GraphQL 查询（query）的 resolver 函数中，Prisma 通常从数据库中读取数据并在 GraphQL 响应中返回。对于 GraphQL 操作（mutation） 的 resolver 函数，Prisma 通常会将数据写入数据库。（例如：新建用户或更新用户）

## 其他 GraphQL 相关资源

Prisma 策划了 [GraphQL Weekly](https://www.graphqlweekly.com/)，这是一份聚焦 GraphQL 社区的资源及其动态的刊物。订阅来获取最新的 GraphQL 文章、视频、教程、库等等。
