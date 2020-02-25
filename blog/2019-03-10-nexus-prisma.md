---
title: 将 GraphQL Nexus 与数据库一起使用
tags: [prisma1, nexus]
---

> 翻译:[hanagm](https://github.com/hanagm) > [原文链接](https://www.prisma.io/blog/using-graphql-nexus-with-a-database-pmyl3660ncst/)

[GraphQL Nexus](https://nexus.js.org/)是 JavaScript / TypeScript 的代码优先、类型安全的 GraphQL API 框架。了解如何使用 Prisma client 和[`nexus-prisma`](https://github.com/prisma/nexus-prisma)插件将其连接到数据库。

![img](prisma1/images/using-graphql-nexus-with-a-database.jpg)

<!--truncate-->

本文是由三部分组成的系列文章的*第三*部分：

- 第 1 部分：[“架构优先”GraphQL 服务器开发的问题](/blog/2019/03/08/sdl-problems)
- 第 2 部分：[介绍 GraphQL Nexus：代码优先的 GraphQL 服务器开发](/blog/2019/03/09/nexus)
- 第 3 部分：**将 GraphQL Nexus 与数据库一起使用**

## 回顾：使用 GraphQL Nexus 进行代码优先开发

在[上一篇](/blog/2019/03/09/nexus)文章中，我们介绍了[GraphQL Nexus](https://nexus.js.org/docs/getting-started)，这是一个 GraphQL 库，可以为 TypeScript 和 JavaScript 实现代码优先开发。使用 Nexus，GraphQL 架构以*编程*方式定义和实现。因此，它遵循 GraphQL 服务器在其他语言中的成熟方法，例如[`sangria-graphql`](https://github.com/sangria-graphql/sangria)（Scala）[`graphlq-ruby`](https://github.com/rmosolgo/graphql-ruby)或[`graphene`](https://graphene-python.org/)（Python）。

今天的文章是关于使用 Prisma client 和新[`nexus-prisma`](https://github.com/prisma/nexus-prisma)插件,将基于 Nexus 的 GraphQL 服务器连接到数据库。我们稍后将向您介绍从头开始为博客应用程序构建 GraphQL API 的实际示例。

> `nexus-prisma`适用于 PostgreSQL，MySQL 和 MongoDB。在[这里](https://nexus.js.org/docs/database-access-with-prisma)找到它的文档。

### 概览：`nexus-prisma`插件的好处

- GraphQL 中 Prisma 模型的 CRUD 操作

- 自定义 Prisma 模型，例如*隐藏某些字段*或*添加计算字段*

- 完全类型安全：GraphQL 模式和数据库的一致类型集

- 与 GraphQL 生态系统兼容（例如`apollo-server`，`graphql-yoga`，...）

### 了解`nexus-prisma`工作流程

#### Prisma client 作为 ORM 替代品

如果您以前没有使用过 Prisma，请快速了解它的工作原理：

1. 定义您的数据模型或让 Prisma 内省您现有的数据库
2. 生成您的 Prisma 客户端，即类型安全的数据库客户端
3. 使用 Prisma 客户端访问应用程序中的数据库（例如 GraphQL API）

#### 在`nexus-prisma`下的插件

添加`nexus-prisma`时，还有另一个步骤：调用`nexus-prisma-generate`codegen CLI。它为您的 Prisma 模型生成完整的 GraphQL CRUD API 的构建块，例如，**User**它包括以下模型：

- **Queries**

  - **user(...): User!**: 获取单个记录
  - **users(...): [User!]!**: 获取记录列表
  - **usersConnection(...): UserConnection!**: [Relay connections](https://graphql.org/learn/pagination/#complete-connection-model) & aggregations

- **Mutations**

  - **createUser(...): User!**: 创建新记录
  - **updateUser(...): User**: 更新记录
  - **deleteUser(...): User**: 删除记录
  - **updatesManyUsers(...): BatchPayload!**: 批量更新多条记录
  - **deleteManyUsers(...): BatchPayload!**: 批量删除多条记录

- [**GraphQL input types**](https://graphql.org/graphql-js/mutations-and-input-types/)
  - **UserCreateInput**：覆盖记录的所有字段
  - **UserUpdateInput**：覆盖记录的所有字段
  - **UserWhereInput**：为记录的所有字段提供过滤器
  - **UserWhereUniqueInput**：为记录的唯一字段提供过滤器
  - **UserUpdateManyMutationInput**：覆盖可以批量更新的字段
  - **UserOrderByInput**：按字段指定升序或降序

> `UserCreateInput`并且`UserUpdateInput`关系字段的处理方式不同。

当编写 GraphQL 服务器代码`nexus`和`nexus-prisma`时，暴露和定制你自己的 API 需要这些操作：

![img](prisma1/images/dbEMHd5.png)

生成 CRUD 构建块后，您可以使用`prismaObjectType`from `nexus-prisma`开始公开（和自定义）它们。

以下代码片段描述了一个实现，该实现为基于 Prisma 的 TODO 列表应用程序提供 GraphQL API，并且`nexus-prisma`：

1. Prisma 数据模型

```graphql
type Todo {
  id: ID! @id
  title: String!
  done: Boolean! @default(value: false)
}
```

2. GraphQL 服务器(with nexus-prisma)

```typescript
import { prismaObjectType } from 'nexus-prisma'
import { idArg } from 'nexus-prisma'

// Expose the full "Query" building block
const Query = prismaObjectType({
  name: 'Query',
  definition: t => t.prismaFields(['*'])
})

// Customize the "Mutation" building block
const Mutation = prismaObjectType({
  name: 'Mutation',
  definition(t) {
    // Keep only the `createTodo` mutation
    t.prismaFields(['createTodo'])

    // Add a custom `markAsDone` mutation
    t.field('markAsDone', {
      args: { id: idArg() },
      nullable: true,
      resolve: (_, { id }, ctx) {
        return ctx.prisma.updateTodo({
          where: { id },
          data: { done: true }
        })
      }
    })
  }
})

const schema = makePrismaSchema({
  types: [Query, Mutation],

  // More config stuff, e.g. where to put the generated SDL
})

// Feed the `schema` into your GraphQL server, e.g. `apollo-server, `graphql-yoga`
```

3. GraphQL API(Generated SDL)

```graphql
# The fully exposed "Query" building block
type Query {
  todo(where: TodoWhereUniqueInput!): Todo
  todoes(
    after: String
    before: String
    first: Int
    last: Int
    orderBy: TodoOrderByInput
    skip: Int
    where: TodoWhereInput
  ): [Todo!]!
  todoesConnection(
    after: String
    before: String
    first: Int
    last: Int
    orderBy: TodoOrderByInput
    skip: Int
    where: TodoWhereInput
  ): TodoConnection!
}

# The customized "Mutation" building block
type Mutation {
  createTodo(data: TodoCreateInput!): Todo!
  markAsDone(id: ID): Todo
}

# The Prisma model
type Todo {
  done: Boolean!
  id: ID!
  title: String!
}

# More of the generated building blocks:
# e.g. `TodoWhereUniqueInput`, `TodoCreateInput`, `TodoConnection`, ...
```

我们将`prismaObjectType`要`Query`和`Mutation`。对于`Query`，我们保持所有领域（即`todo`，`todoes`和`todoesConnection`）。因为`Mutation`我们正在使用`prismaFields`自定义公开的操作。

`prismaFields`让我们选择要公开的操作。在这种情况下，我们只想保持操作以*创建*模型（`createTodo`）。从生成的 CRUD 构建块中，我们既不包括`updateTodo`也不包含`deleteTodo`但是实现我们自己的`markAsDone(id: ID!)`突变来检查某个特定的突变。

---

## 示例：从标准 CRUD 到自定义 GraphQL API

现在让我们快速浏览一下标准的 Prisma 用例，看看如何通过几个简单的步骤快速为博客应用程序构建 GraphQL API。这是我们要做的：

1. 使用 TypeScript 设置 Prisma 项目（使用免费的演示数据库）
2. 定义模型，迁移数据库并生成 Prisma 客户端
3. 通过公开完整的 CRUD GraphQL API `nexus-prisma`
4. 通过自定义 GraphQL API `nexus-prisma`

如果您想跟随，则需要安装 Prisma CLI：

**npm**(国内推荐使用 cnpm)

```bash
npm install -g prisma
#or
cnpm install -g prisma
```

**或 yarn**

```
yarn global add prisma
```

#### 1）使用 TypeScript 设置 Prisma 项目，`nexus`和`nexus-prisma`

本节主要介绍您的项目设置。如果您不想编码，请随意跳过它到第二步，否则**请参阅项目设置说明**。

**请参阅项目设置说明**

​ 使用 Prisma CLI 创建一个简单的 Prisma 项目：

```
prisma init myblog
```

在交互式提示中，选择以下选项：

1、选择**demo server**（拥有 Prisma Cloud 中的免费和托管 demo 数据库）

2、在浏览器中使用 Prisma Cloud 进行**身份验证**（如有必要）

3、返回终端，**确认所有建议值**

作为 Demo 服务器的替代方案，您还[可以使用 Docker 在本地运行 Prisma](https://www.prisma.io/docs/prisma-server/deployment-environments/docker-rty1/)。

接下来，您需要配置`nexus-prisma`工作流程。添加以下依赖项（在`myblog`目录中）：

```
npm init -y
npm install --save nexus graphql nexus-prisma prisma-client-lib graphql-yoga
npm install --save-dev typescript ts-node-dev
```

接下来，在 prisma.yml 的末尾添加以下两行：

```
hooks:
  post-deploy:
    - prisma generate
    - npx nexus-prisma-generate --client ./generated/prisma-client --output ./generated/nexus-prisma
```

这样可以确保每当您对模型进行更改时，prisma client 以及生成的 nexus prisma crud 构建块都会被更新。既然我们使用的是 typescript，那么让我们快速添加一个`tsconfig.json`：

```
{
  "compilerOptions": {
    "sourceMap": true,
    "outDir": "dist",
    "strict": true,
    "lib": ["esnext", "dom"]
  }
}
```

最后，继续添加一个用于开发的开始脚本。它启动一个开发服务器，在后台监视您的文件，并在编码时更新生成的 SDL 和 Nexus 类型。将其添加到 package.json 中：

```
"scripts": {
  "start": "ts-node-dev --no-notify --respawn --transpileOnly ./"
},
```

#### 2）定义模型，迁移数据库并生成 Prisma 客户端

该`prisma init`命令在中创建了默认`User`模型`datamodel.prisma`。在我们构建博客应用程序时，让我们将模型调整到我们的应用程序域：

```
type User {
  id: ID! @id
  email: String! @unique
  name: String
  posts: [Post!]!
}

type Post {
  id: ID! @id
  createdAt: DateTime! @createdAt
  updatedAt: DateTime! @updatedAt
  published: Boolean! @default(value: false)
  title: String!
  content: String
  author: User!
}
```

接下来，您需要通过将数据模型应用于数据库来迁移数据库。使用以下命令，定义的每个模型`datamodel.prisma`将映射到基础数据库中的表：

```
prisma deploy
```

> 请注意，Prisma 很快将拥有更强大的迁移系统。[了解更多](https://github.com/prisma/rfcs/blob/migrations/text/0000-migrations.md)。

由于您之前配置了`post-deploy`挂钩`prisma.yml`，因此您的 Prisma 客户端和 CRUD 构建块会自动更新。

#### 3）通过公开完整的 CRUD GraphQL API `nexus-prisma`

在项目的早期阶段，通过 API 公开完整的 CRUD 功能通常很有帮助 - 通常会出现更多受限制的 API 要求。`nexus-prisma`通过提供从完整 CRUD 到自定义 API 操作的简单路径，完美地解决了这个问题。

让我们从一个 GraphQL API 开始，它为已定义的模型公开完整的 CRUD（请注意，这包括过滤器，分页和排序）。创建一个名为的新文件`index.ts`，并将以下代码添加到其中：

```typescript
import * as path from 'path';
import { GraphQLServer } from 'graphql-yoga';
import { makePrismaSchema, prismaObjectType } from 'nexus-prisma';
import { prisma } from './generated/prisma-client';
import datamodelInfo from './generated/nexus-prisma';

const Query = prismaObjectType({
  name: 'Query',
  definition: t => t.prismaFields(['*']),
});
const Mutation = prismaObjectType({
  name: 'Mutation',
  definition: t => t.prismaFields(['*']),
});

const schema = makePrismaSchema({
  types: [Query, Mutation],

  prisma: {
    datamodelInfo,
    client: prisma,
  },

  outputs: {
    schema: path.join(__dirname, './generated/schema.graphql'),
    typegen: path.join(__dirname, './generated/nexus.ts'),
  },
});

const server = new GraphQLServer({
  schema,
  context: { prisma },
});
server.start(() => console.log(`Server is running on http://localhost:4000`));
```

> 在这个简短的教程中，我们没有太多关注文件结构。检查我们的[`graphql-auth`](https://github.com/prisma/prisma-examples/tree/master/typescript/graphql-auth)示例以获得正确的设置和模块化架构。

运行后`npm run start`，您可以在`http://localhost:4000`上为您的 graphql 服务器打开 graphql 操作界面。

使用上面编写的小代码，您已经拥有了一个完整的 GraphQL CRUD API。

**查看一些 queries 和 mutations 示例**

##### Example queries

```graphql
# Fetch all posts with their authors
query {
  posts {
    id
    title
    published
    author {
      id
      name
    }
  }
}
```

```graphql
# Fetch a certain user by email
query {
  user(where: { email: "alice@prisma.io" }) {
    id
    name
    posts {
      id
      title
    }
  }
}
```

##### Example mutations

```graphql
# Create a post and its author
mutation {
  createPost(data: { title: "Hello World", author: { create: { email: "bob@prisma.io" } } }) {
    id
    published
    author {
      id
      name
    }
  }
}
```

```graphql
# Update the name of a user
mutation {
  updateUser(data: { name: "Alice" }, where: { email: "alice@prisma.io " }) {
    id
    name
  }
}
```

```graphql
# Delete a user
mutation {
  deleteUser(where: { email: "alice@prisma.io " }) {
    id
    name
  }
}
```

这是如何运作的？`nexus-prisma-generate`生成了一个 GraphQL 模式，为 Prisma 模型（您的*CRUD 构建块*）提供 CRUD API 。此 GraphQL 架构遵循[OpenCRUD](https://www.opencrud.org/)规范。使用该`prismaObjectType`功能，您现在可以公开和自定义该架构的操作。

`prismaObjectType`并`prismaFields`使用*白名单*方法，这意味着您需要明确列出要公开的字段。通配符运算符`*`包括*所有*字段。

![img](prisma1/images/RLsS1lm.png)

#### 4）通过`nexus-prisma`自定义 GraphQL API

在本节中，我们将了解如何`nexus-prisma`自定义 CRUD GraphQL API 。具体来说，我们将：

1. 隐藏`User`模型中的字段

2. 将计算字段添加到`Post`模型中

3. 隐藏`createPost`和`updatePost`突变

4. 添加两个自定义`createDraft`和`publish`突变

##### 4.1）隐藏`User`模型中的字段

在本节中，我们将隐藏模型中的`email`字段`User`。

要自定义模型，我们需要将`prismaObjectType`函数应用于它并将该`definition(t)`函数作为选项传递：

```typescript
const User = prismaObjectType({
  name: 'User',
  definition(t) {
    t.prismaFields(['id', 'name', 'posts']);
  },
});
```

通过调用`prismaFields`模型`t`，我们可以自定义公开的字段（及其参数）。因为`email`未包含在列表中，所以它已从我们的 GraphQL API 中删除。

![img](prisma1/images/Zwby9Hs.png)

要应用更改，您需要显式传递`User`到以下`types`内部的数组`makePrismaSchema`：

```typescript
const schema =  makePrismaSchema （{
  types ： [ Query ， Mutation ， User ] ，

  // ...
}
```

请注意，您的编辑器能够根据生成的 CRUD 构建基块建议传递到 prismaObjectType 和 prismaFields 中的内容。这意味着当您键入 prismaObjectType（''）并点击 ctrl+space 时，它显示了所有生成的 CRUD 构建块的名称。当调用 t.prismafields（['']）时，它表示 t 的字段:

##### 4.2）向`Post`模型添加计算字段

新的代码优先方法`nexus-prisma`也使得向 Prisma 模型添加计算字段变得容易。假设你要添加一个字段`Post`，总是返回`title`完全大写的拼写。以下是实现代码：

```typescript
const Post = prismaObjectType({
  name: 'Post',
  definition(t) {
    t.prismaFields(['*']);
    t.string('uppercaseTitle', {
      resolve: ({ title }, args, ctx) => title.toUpperCase(),
    });
  },
});
```

我们使用`t.string(...)`来自的 API 为我们的模型添加一个新字段`graphql-nexus`。因为它是一个计算字段（因此不能自动解析`nexus-prisma`），我们还需要附加一个解析器。

![img](prisma1/images/64ipcsj.png)

和以前一样，您需要将自定义`Post`模型显式添加到`types`数组中：

```typescript
const schema = makePrismaSchema({
  types: [Query, Mutation, User, Post],

  // ...
}
```

##### 4.3）隐藏`createPost`和`updatePost` Mutations

与我们`email`从`User`模型中隐藏字段的方式相同，我们还可以隐藏作为生成的 CRUD 构建块一部分的`Query`/ `Mutation`类型的操作`nexus-prisma`。

要隐藏`createPost`，`updatePost`我们再次需要传递`definition(t)`给`prismaObjectType`选项。请注意，一旦我们调用`prismaFields`了一个类型，我们需要显式列出我们想要保留的所有字段（空数组将被解释为“保持无操作”）：

```typescript
const Mutation = prismaObjectType({
  name: 'Mutation',
  definition(t) {
    t.prismaFields(['createUser', 'updateUser', 'deleteUser', 'deletePost']);
  },
});
```

> 生成的 CRUD GraphQL API 还包括批处理和 upsert 操作，为简洁起见，我们在此处将其排除。

##### 4.4 添加两个自定义`createDraft`和`publish`突变

最后，我们在 GraphQL API 中添加了两个自定义突变。这是他们的 SDL 定义应该是什么样子：

```graphql
type Mutation {
  createDraft(title: String!, content: String): Post!
  publish(id: ID!): Post
}
```

要实现这些 Mutation，您需要将两个字段（通过`t.field( ... )`从`nexus`API 调用）添加到以下`Mutation`类型：

```typescript
const Mutation = prismaObjectType({
  name: 'Mutation',
  definition(t) {
    t.prismaFields(['createUser', 'updateUser', 'deleteUser', 'deletePost']);
    t.field('createDraft', {
      type: 'Post',
      args: {
        title: stringArg(),
        content: stringArg({ nullable: true }),
      },
      resolve: (parent, { title, content }, ctx) => {
        return ctx.prisma.createPost({ title, content });
      },
    });
    t.field('publish', {
      type: 'Post',
      nullable: true,
      args: {
        id: idArg(),
      },
      resolve: (parent, { id }, ctx) => {
        return ctx.prisma.updatePost({
          where: { id },
          data: { published: true },
        });
      },
    });
  },
});
```

一定要导入`stringArg`并`idArg`从`nexus`包中进行此操作。

GraphQL Nexus 还会生成 GraphQL 架构的 SDL 版本，您可以在其中找到它`./generated/schema.graphql`。我们的 GraphQL API 的最终版本如下所示：

```graphql
type Mutation {
  createDraft(content: String, title: String): Post!
  createUser(data: UserCreateInput!): User!
  deletePost(where: PostWhereUniqueInput!): Post
  deleteUser(where: UserWhereUniqueInput!): User
  publish(id: ID): Post
  updateUser(data: UserUpdateInput!, where: UserWhereUniqueInput!): User
}

type Query {
  node(id: ID!): Node
  post(where: PostWhereUniqueInput!): Post
  posts(
    after: String
    before: String
    first: Int
    last: Int
    orderBy: PostOrderByInput
    skip: Int
    where: PostWhereInput
  ): [Post!]!
  postsConnection(
    after: String
    before: String
    first: Int
    last: Int
    orderBy: PostOrderByInput
    skip: Int
    where: PostWhereInput
  ): PostConnection!
  user(where: UserWhereUniqueInput!): User
  users(
    after: String
    before: String
    first: Int
    last: Int
    orderBy: UserOrderByInput
    skip: Int
    where: UserWhereInput
  ): [User!]!
  usersConnection(
    after: String
    before: String
    first: Int
    last: Int
    orderBy: UserOrderByInput
    skip: Int
    where: UserWhereInput
  ): UserConnection!
}

type User {
  id: ID!
  name: String
  posts(
    after: String
    before: String
    first: Int
    last: Int
    orderBy: PostOrderByInput
    skip: Int
    where: PostWhereInput
  ): [Post!]
}

type Post {
  id: ID!
  createdAt: DateTime! @createdAt
  updatedAt: DateTime! @updatedAt
  author: User!
  content: String
  published: Boolean!
  title: String!
  uppercaseTitle: String!
}

# More generated SDL types ...
```

### 我们的代码优先 GraphQL 文章中的 3 个关键点

这是我们关于代码优先的 GraphQL 服务器开发的系列文章的最后一部分。

[GraphQL Nexus](https://nexus.js.org/)和`nexus-prisma`插件实现了我们从 GraphQL 生态系统的积极贡献者那里收集的知识，已有两年多了。在使用[SDL 优先](https://www.prisma.io/blog/the-problems-of-schema-first-graphql-development-x1mn4cb0tyl3)方法发现太多问题之后，我们对目前正在出现的新的代码优先工具感到非常兴奋。

我们坚信 GraphQL Nexus（以及其他代码优先的方法，如[TypeGraphQL](https://github.com/19majkel94/type-graphql)）将彻底改变未来构建 GraphQL 模式的方式。

以下是该系列的主要搭配：

1. 代码优先方法允许您以语言惯用的方式构建 GraphQL 服务器，而无需额外的工具（“您需要的唯一工具是您的编程语言”），同时保留 SDL 作为通信工具的优势。
2. GraphQL Nexus 允许开发人员使用灵活且类型安全的 API 构建其模式。由于自动完成和构建时错误检查，开发人员获得了惊人的体验。
3. 该`nexus-prisma`插件构建于 Prisma 模型之上，允许开发人员通过公开和自定义自动生成的 CRUD 构建块来构建 GraphQL API。

### Try out `nexus-prisma` today🙌

有几种方法可供您试用[`nexus-prisma`](https://github.com/prisma/nexus-prisma)。您可以按照文档中的“ [**入门部分进行操作，**](https://nexus.js.org/docs/database-access-with-prisma#getting-started)也可以浏览我们的[**TypeScript GraphQL 示例**](https://github.com/prisma/prisma-examples/tree/master/typescript)。

请通过[打开 GitHub 问题](https://github.com/prisma/nexus-prisma)或联系我们的[Slack](https://slack.prisma.io/)来分享您的反馈。

---

向我们的开源工程师[Flavian Desverne](https://twitter.com/fdesverne)致敬，感谢他对 nexus-prisma 插件所做的出色工作
