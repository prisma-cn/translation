---
title: 深入理解 Prisma
description: 本章介绍了prisma的基本原理，有助于学习和理解
keywords:
  - 深入理解 Prisma
  - prisma
  - Prisma client
---

### 什么是 Prisma？

Prisma 是一个*data layer*在你的应用程序体系结构取代了传统的 ORM。

数据层由几个部分组成:

- 一个充当数据库的代理的 **Prisma 服务器**
- 一个 Prisma 服务器上运行的并产生实际的数据库查询的高性能 **查询引擎**
- 一个连接到 Prisma 服务器的 **Prisma client**
- 一个可让你 Subscriptions 数据库事件的 **实时事件系统**

使用 Prisma cloud 的说明

*Prisma*是开源的，可以随意使用在别的云服务上。[_Prisma Cloud_](https://www.prisma.io/cloud)是一种 Prisma 自己的提供围绕 Prisma 的工具和服务的应用程序(通过 CLI 及 web 接口使用)。当你使用 Prisma 时 Prisma 云的使用是可选的。

Prisma cloud 的目标是简化 Prisma 的项目工作流程。它具有一个 **数据浏览器**和一个 **部署历史**(很快推出 **自动回滚**)，各种 **团队协作**选项，以及 **云提供商的集成**，以方便为开发者建立和维护他们的 Prisma 服务器。

**开始使用 Prisma 云 [点这里](https://app.prisma.io/)。**

### 用例

Prisma 在你使用数据库的任何 content 中。

#### 构建 GraphQL 服务器

Prisma 是构建 GraphQL 服务器的完美工具。Prisma client 与 Apollo 生态系统兼容，具有 GraphQLSubscriptions 和 Relay-style 分页默认支持，提供端到端的类型安全，并配有一个内置的 DataLoader 解决 N + 1 问题。

#### 构建 REST API

Prisma 也可以构建 REST API，它完全可以取代传统的 ORM。它提供了 N 多好处，如类型安全，先进的 API 和读写相关数据灵活的方式。

#### CLIs, Scripts, Serverless Functions & a lot more

Prisma 的有一个非常灵活的 API，这使得它非常适合用于各种使用情况。每当你需要跟一个或多个数据库连接，Prisma 将对简化数据库工作流程有很大的帮助。

### 为什么要使用 Prisma 的？

#### 简单的数据库工作流

Prisma 的总体目标是从常见数据库的工作流中删除的复杂性并简化你的应用程序数据访问:

- **类型安全的数据库访问**得益于定制和自动生成的 Prisma client。
- **关系数据和事务**简单而强大的 API。
- Prisma 统一(_即将推出_)访问多个数据库，并且因此显着地降低了**跨数据库工程的复杂性**。
- **数据库的实时流操作和事件系统**确保使你的数据库中发生的所有重要事件实时更新。
- 根据数据模型声明**自动数据库迁移(可选)**使用 GraphQL 的 schema 定义语言(SDL)表示。
- 其他数据库的工作流如**数据导入，导出**。还有更多……

#### 数据库的实时层

一些数据库，如 RethinkDB 或 DynamoDB 提供开箱即用的实时 API。这样的 API 可以让客户*订阅*任何修改数据库中发生的事情。绝大多数传统的数据库不提供这样的实时 API，手动实现它变得非常复杂。

**但 Prisma 提供所有支持的数据库的实时 API**，让你 Subscriptions 任何数据库事件，如*creating*，*updating*或*deleting*数据。

#### 端到端类型安全

类型安全地编程是现代应用开发的默认（如 TypeScript）。下面是一些类型安全提供的核心优势:

- **信心**:由于静态分析和编译时错误检查，开发人员可以对其代码充满信心。
- **开发者体验**:具有明确定义的数据类型时，开发人员的开发体验会极大提升。类型定义是 IDE 功能的基础，如*智能自动完成*或*跳转到定义*。
- **代码生成**:在开发工作流程中利用代码生成很容易，避免编写样板代码。
- **跨系统约定:**类型定义可以跨系统共享（例如，在客户端和服务器之间），并用作定义相应接口/API 的约定。

**端到端类型安全**是指从客户端到数据库在整个堆栈中具有类型安全性。 端到端类型安全体系结构可能如下所示：

- **数据库**:Prisma 提供强类型数据库层，datamodel 定义存储在数据库中的数据类型。
- **应用服务器**:应用程序服务器定义自己的 schema（例如，使用 GraphQL 或 OpenAPI / Swagger），它可以重用或转换数据库中的数据类型。 应用程序服务器需要使用类型安全的语言（例如 TypeScript，Scala，Go）编写。
- **客户端**:了解应用程序服务器架构的客户端可以在构建时验证 API 请求和潜在响应。

#### 干净和分层的架构

在开发应用程序服务器时，最复杂的是在同步，查询优化/性能和安全性方面实现安全且组织良好的数据库访问。 当涉及多个数据库时，这会变得更加复杂。

解决这个问题的一个常见解决方案是引入专用数据访问层（DAL），它抽象出数据库访问的复杂性。 DAL 的 API 由应用程序服务器使用，允许 API 开发人员简单地思考他们需要什么数据，而不必担心如何从数据库安全地和高效地检索它。

![](/prisma1/images/SUH6AqW.png)

使用 DAL 可确保 **明确区分关注点**，从而提高代码的 **可维护性和可重用性**。 具有某种数据库抽象（无论是简单的 ORM 库还是独立的基础架构组件）是小型应用程序以及大规模运行的应用程序的最佳实践。 它确保应用程序服务器能够以 **安全且高效**的方式与你的数据库通信。

Prisma 是一个自动生成的 DAL，遵循与行业领先的 DAL（例如 Twitter 的 Strato 或 Facebook 的 TAO）相同的原则，同时仍然可以灵活应用于较小的应用程序。

Prisma 允许你从一开始就使用干净的体系结构启动项目，并使你免于编写将数据库和应用程序服务器强耦合在一起的代码。

### 如何使 Prisma 融入你的体系？

Prisma 是一个独立的基础架构组件，位于数据库之上。 然后，你在应用程序服务器中使用 Prisma client（可以使用各种语言）连接到 Prisma。

这使你可以通过简单而现代的 API 与数据库通信，从而确保高性能和安全的数据库访问。

## Prisma 基础：datamodel、Prisma server、Prisma client

当使用 Prisma 时，你主要得清楚这**三个概念**:

- **datamodel**:定义应用程序的数据模型，是 Prisma client API 的基础。(可选:可以用来对数据库进行迁移。)
- **Prisma server**:位于数据库顶层的独立基础架构组件。
- **Prisma client**:一个自动生成的库，它连接到 Prisma 服务器，允许你在数据库中读取，写入和实时传输数据。 它应用于应用程序中的数据访问。

### datamodel

数据模型的主要用途是定义数据库、定义 Prisma client 的 API 基础。

#### Prisma client 操作都是从数据模型得出

对于在数据模型中定义的每个模型中，会自动为你生成以下 Prisma client 操作:

- **读取单个数据**
- **读取数据的列表**(包括过滤，排序和分页)
- **写入新数据**
- **更新现有的数据**
- **删除现有的数据**
- **检查是否存在**某些数据
- **有实时更新**时，对任何数据写操作

你可以在 part3 找到所有这些操作。

#### schema 定义语言(SDL)

数据模型在`.prisma`文件定义好，用了[GraphQL SDL 语法](https://www.prisma.io/blog/graphql-sdl-schema-definition-language-6755bcb9ce51/)。使用 SDL 是因为它与编程语言无关，使用简单，富有表现力和直观。

使用 SDL 定义数据模型没有严格的技术要求，并且 API 可能会在将来以其他方式指定数据模型。 如果你想要查看指定数据模型的其他方法，请创建功能请求。

#### 使用 datamodel 迁移数据模型(可选)

有两种情况创建的数据模型:

- **手动写入**:从头开始手动编写数据模型时，数据模型还用于执行数据库迁移（这仅适用于没有现有数据的新数据库）。 数据模型的模型定义不仅确定了 Prisma client 的 API 操作，还映射到数据库（这意味着它们用于以声明方式执行数据库迁移）。
- **从现有的数据库 schema(Introspecting )**当你开始将 Prisma 与现有数据库一起使用时，数据模型将从现有数据库模式派生。 在这种情况下，Prisma 不用于执行数据库迁移（相反，你也可以在使用时手动迁移数据库）。

#### 示例

以下是两个简单的数据模型:

```graphql
type Post {
  id: ID! @id
  createdAt: DateTime! @createdAt
  published: Boolean! @default(value: false)
  title: String!
  author: User!
}

type User {
  id: ID! @id
  email: String @unique
  name: String!
  posts: [Post!]!
}
```

这里有几件事情需要注意:

- 该`POST`和`User`模型经由关系(由`author`和`posts`字段中定义)连接。
- `！`意味着该模型的相应字段永远不能`null`。
- `@unique`指令保证不会有两个记录有该字段的值相同。
- `@default`指令设置默认值。
- `createdAt`不可设置，将由 Prisma 生成，表示创建一个记录的确切时间。还有就是`updatedAt`表明一个记录的最后更新的时间。

### Prisma client

该 Prisma client 是一个自动生成的库，它取代了 API 服务器中的传统 ORM。 它连接到位于数据库顶部的 Prisma 服务器：

![](/prisma1/images/URyxmnZ.png)

#### 无缝关系 API

该 Prisma client 是在不同的编程语言，并提供类型安全的数据库访问。相对于传统的 ORM，它提供了一个无缝的 API 与关系数据的工作，连接和交易。

以下是处理在单个事务几个写操作的例子:

- 创建一个新的`User`纪录
- 创建两个新的`POST`记录
- 通过`posts`关系新建两个 post 并和现有的一个`post`记录连接到新的`User`纪录

JavaScript：

```javascript
prisma.createUser({
  name: 'Alice',
  password: 'IlikeTurtles',
  posts: {
    create: [
      {
        title: 'Prisma is the data layer for modern applications',
      },
      {
        title: 'Check out How to GraphQL - The fullstack tutorial for GraphQL',
      },
    ],
    connect: {
      id: 'cjli6tknz005s0a23uf0lmlve',
    },
  },
});
```

TypeScript：

```typescript
prisma.createUser({
  name: 'Alice',
  password: 'IlikeTurtles',
  links: {
    create: [
      {
        description: 'The data layer for modern applications',
        url: 'https://www.prisma.io',
      },
      {
        description: 'Fullstack GraphQL tutorial',
        url: 'https://www.howtographql.com',
      },
    ],
    connect: {
      id: 'cjli6tknz005s0a23uf0lmlve',
    },
  },
});
```

Go：

```go
password := "IlikeTurtles"
description := "The data layer for modern applications"
url := "https://www.prisma.io"
linkId := "cjli6tknz005s0a23uf0lmlve"
db.CreateUser(&prisma.UserCreateInput{
Name: &name,
Password: &password,
Links: &prisma.LinkCreateManyWithoutPostedByInput{
Create: &prisma.LinkCreateWithoutPostedByInput{
Description: &description,
Url: &url,
},
Connect: &prisma.LinkWhereUniqueInput{
ID: &linkId,
},
},
})
```

对于传统的 ORM，这样一组写操作需要你手动控制数据库事务。而现在 Prisma client 可以处理你的操作。

#### 类型安全数据访问

通过你的 Prisma client 暴露的操作是强类型。 对于任何类型化的编程语言，这意味着你可以获得所有数据库操作的编译时安全性，并且你确切地知道要返回的数据形状。

它还为你提供了令人惊叹的开发人员体验：你可以在编辑器中获得自动补全功能。

所有类型都是自动生成的，因此你无需为此编写任何样板文件。 更改数据模型后，只需重新生成 Prisma 客户端，所有类型都将更新。

#### 实时更新

将实时事件系统添加到数据库是一项非常复杂的任务。 Prisma 客户端允许你潜入任何数据库事件，而无需处理底层基础架构。 你可以通过\$ subscribe 属性上的生成方法执行此操作。

下面是一个订阅事件的示例，其中创建了在其电子邮件地址中包含 gmail 的新用户记录：

JavaScript：

```javascript
prisma.\$subsribe
  .user({
    mutation_in: ['CREATED'],
    email_contains: 'gmail',
  })
  .node();
```

TypeScript：

```typescript
prisma.$subsribe
  .user({
    mutation_in: ['CREATED'],
    email_contains: 'gmail',
  })
  .node();
```

Go：

```go
// subscriptions for the Prisma Go client will be available soon

```

#### 原生 GraphQL

Prisma client 可以运行使用`$graphql`方法对数据库运行 GraphQL 的 Query 和 Mutation。

这里展示了如何使用原生 API GraphQL 创建一个新的`User`记录的例子:

```javascript
const mutation = `mutation ($name: String!){ createUser(name: $name) { id } }`;
const variables = { name: 'Alice' };
const result = prisma.$graphql(mutation, variables);
```

```typescript
const mutation = `
mutation ($name: String!){
    createUser(name: $name) {
id
}
}
`;
const variables: UserCreateInput = { name: 'Alice' };
const result: any = prisma.$graphql(mutation, variables);
```

```go
db.GraphQL(`
mutation ($name: String!){
    createUser(name: $name) {
id
}
}
`,
map[string]interface{}{
"name": "Alice"
})

```

### Prisma server

Prisma server 是连接到数据库的独立基础架构组件:

![](/prisma1/images/774DDya.png)

它需要与你的数据库连接信息和用户名密码来配置部署时。

Prisma server 的主要职责是翻译由 Prisma client 生成的实际的数据库查询请求。

虽然有几种方法可以设置 Prisma 服务器，但目前推荐的方法是使用 Docker。 下面是一个示例 Docker Compose 文件，用于配置连接到本地 MySQL 数据库的 Prisma 服务器：

```yaml
version: '3'
services:
  prisma:
    image: prismagraphql/prisma:1.34
    restart: always
    ports: - "4466:4466"
    environment:
      PRISMA_CONFIG: |
        port: 4466
        databases:
        default:
        connector: mysql
        host: localhost
        port: 3306
        user: root
        password: secret42
```

Prisma service 可以部署到你最喜爱的云提供商，如[阿里云](https://www.aliyun.com)[AWS](https://aws.amazon.com/de/)，[gcp](https://cloud.google.com/gcp/)，[Azure](https://azure.microsoft.com/)，[now](https://zeit.co/now)。 ..

在 Prisma cloud 管理服务器

Prisma cloud 是一套工具，帮助你管理你的 Prisma 服务器和服务。它由基于 Web 的[Pri​​sma 的控制台(https://app.prisma.io/),是 Prisma CLI 的部分。

你可以在任何地方托管 Prisma 服务器 - 无论是你自己的服务器还是使用你喜欢的云提供商（例如 aliyun，AWS，Google Cloud，Digital Ocean，......）。 无论 Prisma 服务器托管在哪里，你仍然可以通过 Prisma Cloud 进行管理。 这包括维护任务，如升级 Prisma 版本。

为了充分利用这些优势，你需要使你的 Prisma 服务器连接到 Prisma cloud。

![](/prisma1/images/gUzWSwS.png)

通过云提供商集成，你还可以直接通过 Web UI 设置 Prisma 服务器，而不是操作 Docker 和云提供商的 API / UI。 例如，[setup a new Prisma server with a connected database on Heroku](https://www.youtube.com/watch?v=b2ofz3XxR14).

要在没有设置自己的数据库和 Prisma 服务器的麻烦的情况下开始使用 Prisma，你可以在 Prisma Cloud 中使用免费的托管 Demo 服务器。 运行 prisma init 并选择 Demo 服务器选项或按照“part1”教程。

### Prisma & GraphQL

Prisma 使用[GraphQL(http://graphql.org/)作为一种通用的数据库抽象，这意味着它*可以转变数据库为 GraphQL API*，使你可以:

- 读写数据使用*GraphQL queries*和*mutations*
- 使用*GraphQL subscriptions*接收数据库事件的实时更新
- 使用*GraphQL SDL*执行迁移你的数据模型

当 Prisma 客户端向 Prisma 服务器发出请求时，它实际上会生成 GraphQL 操作，这些操作将被发送到 Prisma 的 GraphQL API。 然后，客户端将 GraphQL 响应转换为预期的结果结构，并从调用的方法返回它。

### Prisma services

数据库的 GraphQL 映射由 Prisma 服务提供。 每个服务都为数据库提供自己的 GraphQL CRUD 映射。 GraphQL API 是自动生成的，并为服务的数据模型中的每个模型提供 CRUD 操作。

Prisma 服务正在 Prisma 服务器上运行。 Prisma 服务器可以配置为托管多个 Prisma 服务。

![](/prisma1/images/3RqTUXQ.png)

Prisma 服务是使用两个组件构成:

- `prisma.yml`:为 Prisma services 根配置文件(包括服务的端点，密码，数据模型文件的路径，...)
- `datamodel`:在数据模型中，可以定义其 Prisma 的使用来生成数据库的 GraphQL API 模型。它是一个使用[GraphQL SDL](https://www.prisma.io/blog/graphql-sdl-schema-definition-language-6755bcb9ce51/)语法和存储在一个叫做'datamodel.prisma`的文件中。

一个`prisma.yml`类似于此:

```yaml
endpoint: http://localhost:4466
datamodel: datamodel.prisma
secret: mysecret42
```

这是它包含的配置属性:

- `endpoint`：应该部署服务的 Prisma 服务器的 HTTP 端点。 此端点公开服务的 Prisma API。
- `datamodel`：数据模型的*file path*，它作为 GraphQL CRUD / realtime API 的基础。
- `secret`：*service secret*用于使用基于 JWT 的身份验证来保护服务的 GraphQL API 端点。 如果未指定`secret`，则该服务不需要身份验证。

每个 Prisma services 只能有一个*endpoint*。端点是由以下几部分组成:

- **Host**: 你 Prisma 服务器的*host*(含协议和端口)，例如`https://example.com:4466`
- **Service name**: 端点 URL 的第一个路径组件是 Prisma 服务的名称，例如 my-service。 如果未指定服务名称，则默认为 default。
- **Service stage**: 端点 URL 的第二个路径组件是服务的 stage。 与服务名称一样，这可以是随机字符串 - 但你通常使用描述部署环境的术语（例如 dev，staging，prod，...）。 如果未指定服务 stage，则默认为 default。

全部放在一起，一个服务可能看起来如下:`https://example.com:4466/my-service/dev`

![](/prisma1/images/Ge85JyL.png)

Prisma services 也可以部署到没有任何路径组件的端点(例如，通过`http://localhost:4466`)，在这些情况下 PRISMA 采用`default`。

**这意味着`http://localhost:4466/default/default`总是可以写成`http://localhost:4466`**

端点结构的另一个例外是 Prisma 云上的 Demo 服务器，它们在服务名称和阶段之前有一个额外的路径组件。这对应于工作区的名称。例如，如果你的工作区名为 john-doe，则端点可能如下所示：http://prisma-eu1.sh/john-doe/my-service/dev

下一节是 Prisma 创造的 GraphQL
