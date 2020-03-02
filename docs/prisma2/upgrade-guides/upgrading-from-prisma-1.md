---
title: 升级指引 (Prisma 1 to Prisma 2)
description: 该升级指引帮助你将一个基于Prisma1并使用了Prisma client的Node.js项目迁移到Prisma2。
author: pangfeng
author_url: https://github.com/pangfeng
author_image_url: https://avatars3.githubusercontent.com/u/5036046?s=460&v=4
author_title: Prisma 爱好者
---

该升级指引帮助你将一个基于[Prisma1](https://github.com/prisma/prisma)并使用了[Prisma client](https://www.prisma.io/docs/prisma-client/)的 Node.js 项目迁移到 Prisma2。

## 概述

Prisma2 与 Prisma1 主要有以下几点区别：

- Prisma2 不需要运行数据库代理服务(就是 prisma1 中的[Prisma server](https://www.prisma.io/docs/prisma-server/)).
- Prisma2 使 Prisma1 的功能更加模块化:
  - 可以通过专门提供的`prisma2 migrate`子命令实现 Prisma1 的 _数据建模和数据迁移_
  - 使用 Prisma Client JS 可以实现 Prisma1 中 _通过 Prisma client 访问数据库_ 的功能
- Prisma1 的 datamodel 和`prisma.yml`已经合并到了 Prisma2 中的[Prisma schema](../prisma-schema-file.md)文件中
- Prisma2 使用了自己的模型语言 SDL，替代基于 GraphQL 的 SDL

基于这些区别, 从 Prisma 1 升级的步骤如下:

1. 安装 Prisma 2 CLI 作为一个 development dependency
2. 使用 Prisma 2 CLI 把你的 Prisma 1 detamodel 转换成 Prisma schema
3. 修改你的项目代码, 用 Prisma client JS 的 API 调用替换 Prisma client 的 API 调用

注意，出现这种情况时，你的步骤可能会有些不同：

- **没有使用 Prisma client** (例如当你正在用 Prisma bindings 时).
- **使用 `nexus-prisma` 创建 GraphQL API**.

这两种情况将在其他升级指引中介绍. 在这篇指引中, 我们将基于这个例子研究如何将一个 REST API 从 Prisma1 迁移到 Prisma2 : [Prisma 1 example](https://github.com/prisma/prisma-examples/tree/master/typescript/rest-express).

> **注意**: 如果你正在升级一个使用了 `nexus-prisma`的项目, 一定要查看[@AhmedElywa](https://github.com/AhmedElywa)的项目 [`create-nexus-type`](https://github.com/oahtech/create-nexus-type)， 它将 Prisma 模型转换为 Nexus `objectType` 定义.

## 1. 安装 Prisma 2 CLI

Prisma 2 CLI 目前是 [`prisma2`](https://www.npmjs.com/package/prisma2) 的 npm 包。 你可以按如下方式将其安装到 Node.js 项目中 (确保在`package.json`所在的目录中调用该命令):

```
npm install prisma2 --save-dev
```

然后就可以通过`npx`使用在本地安装好的`prisma2`:

```
npx prisma2
```

## 2. 将 Prisma1 的 datamodel 转换为 Prisma schema

[Prisma schema](./prisma-schema-file.md) 是所有 Prisma2 项目的基础。 可以把 Prisma schema 看作 Prisma1 的 datamodel 和`prisma.yml`配置文件的组合。

有三种方式可以基于已有的 Prisma1 项目得到 Prisma schema:

- 手写 Prisma schema
- 对现有数据库使用 introspection
- 使用`prisma2 convert`命令

需要注意的是，[introspection 目前还不可用](https://github.com/prisma/prisma2/issues/781), 因此，在本升级指南中，你将使用`prisma2 convert`命令将 prisma1 datamodel 转换为 Prisma schema 文件。而且，生成的 Prisma schema 还不包含任何数据源和生成器定义, 这些必须手动添加.

### 2.1. 转换 datamodel

假设你的 Prisma1 datamodel 名称为 `datamodel.prisma`, 你可以使用如下命令创建一个名为 `schema.prisma`的 Prisma schema:

```bash
cat datamodel.prisma | npx prisma2@2.0.0-preview017 convert > schema.prisma
```

> **Note**: Prisma 2 CLI 在 [2.0.0-preview018](https://github.com/prisma/prisma2/releases/tag/2.0.0-preview018)版本移除了 `convert` 命令， 所以你需要使用老版本的 CLI.

参考 [example datamodel](https://github.com/prisma/prisma-examples/blob/master/typescript/rest-express/prisma/datamodel.prisma):

```graphql
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

Prisma1 的 datamodel 被转换成 Prisma schema，如下:

```prisma
model User {
  id    String  @default(cuid()) @id @unique
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id        String   @default(cuid()) @id @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  published Boolean
  title     String
  content   String?
  author    User
}
```

> **Note**: `id`字段上的 `@unique`属性是[冗余的](https://github.com/prisma/prisma2/issues/786) ，因为 `@id` 属性已经包含了唯一性。还有一个 bug 就是没有[转换`@default`属性](https://github.com/prisma/prisma2/issues/790), 所以你需要手动将`@default(false)` 属性添加到 Prisma schema 中的 `published` 字段上。

### 2.2. 添加数据源

在 Prisma1 中，数据库连接信息是在部署 Prisma server 的 Docker 镜像中指定的。 Prisma server 会暴露一个 HTTP 端点，代理来自实际应用程序代码的所有数据库请求， 这个 HTTP 端点也是在`prisma.yml`中指定的。

使用 Prisma2 时，HTTP 层不再公开，数据库客户端(Prisma client JS)被配置为“直接”对数据库执行请求(即请求由查询引擎代理发送，不再有额外的 server)。

接下来，你需要告诉 Prisma2 你的数据库在哪。你可以添加一个`datasource` 块到你的 Prisma schema, 如下所示 (使用了占位符):

```prisma
datasource db {
  provider = "DB_PROVIDER"
  url      = "DB_CONNECTION_STRING"
}
```

把 `DB_PROVIDER` 和 `DB_CONNECTION_STRING` 这两个占位符改成实际的数据库连接.

对于`provider`字段，需要添加以下三个值中的一个:

- MySQL 数据库: `mysql`
- PostgreSQL 数据库: `postgresql`
- SQLite 数据库: `sqlite`

`url` 字段定义了数据库的 _连接字符串_ 。假设你使用 Docker Compose 部署你 Prisma server，在 Docker Compose 中定义数据库链接配置，如下所示:

```yml
databases:
  default:
    connector: postgres
    host: host.docker.internal
    database: mydb
    schema: public
    user: janedoe
    password: janedoe
    ssl: false
    rawAccess: true
    port: '5432'
    migrations: true
```

根据这些连接细节，你需要把`datasource`添加到调用`prisma2 convert`时创建的`schema.prisma`文件中:

```diff
+ datasource postgresql {
+   provider = "postgresql"
+   url =      "postgresql://janedoe:janedoe@localhost:5432/mydb?schema=public"
+ }

model User {
  id    String  @default(cuid()) @id
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id        String   @default(cuid()) @id
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  published Boolean  @default(true)
  title     String
  content   String?
  author    User
}
```

### 2.3. 添加生成器

在 Prisma1 中, 你可以在`prisma.yml`中指定要使用哪种语言的 Prisma client,例如:

```yml
generate:
  - generator: typescript-client
    output: ../src/generated/prisma-client/
```

在 Prisma2 中，这个信息现在也通过一个`generator`块包含在 Prisma schema 中。像这样把它添加到你的 Prisma schema 中:

```diff
datasource postgresql {
  provider = "postgresql"
  url =      "postgresql://janedoe:janedoe@localhost:5432/mydb?schema=public"
}

+ generator client {
+   provider = "prisma-client-js"
+ }

model User {
  id    String  @default(cuid()) @id
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id        String   @default(cuid()) @id
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  published Boolean  @default(true)
  title     String
  content   String?
  author    User
}
```

注意，默认情况下 Prisma Client JS 的代码会[被生成到 `node_modules/@prisma/client`](../prisma-client-js/codegen-and-node-setup.md)中，但是可以通过`generator` 块上的`output`字段进行定制。
你也需要将 `@prisma/client` 作为另一个 npm dependency 安装到你的项目中。

## 3. 调整应用，使用 Prisma Client JS

Prisma Client JS 在`node_modules/@prisma/client`中生成，为了让这个包在 Node.js 包管理器的编译中“存活”下来，你首先需要将它作为一个 npm 依赖来安装:

```
npm install @prisma/client
```

为了能够在你的代码中使用 Prisma Client JS，下面要做的就是生成它。 与 Prisma1 类似，可以通过运行`generate`CLI 命令来调用 Prisma schema 文件中的生成器:

```
npx prisma2 generate
```

要完成迁移，你必须更改应用程序代码，并使用新的 Prisma Client JS 替换 Prisma client 的用法。

我们示例中的应用程序代码位于独立的文件中，如下所示:

```ts
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { prisma } from './generated/prisma-client';

const app = express();

app.use(bodyParser.json());

app.post(`/user`, async (req, res) => {
  const result = await prisma.createUser({
    ...req.body,
  });
  res.json(result);
});

app.post(`/post`, async (req, res) => {
  const { title, content, authorEmail } = req.body;
  const result = await prisma.createPost({
    title: title,
    content: content,
    author: { connect: { email: authorEmail } },
  });
  res.json(result);
});

app.put('/publish/:id', async (req, res) => {
  const { id } = req.params;
  const post = await prisma.updatePost({
    where: { id },
    data: { published: true },
  });
  res.json(post);
});

app.delete(`/post/:id`, async (req, res) => {
  const { id } = req.params;
  const post = await prisma.deletePost({ id });
  res.json(post);
});

app.get(`/post/:id`, async (req, res) => {
  const { id } = req.params;
  const post = await prisma.post({ id });
  res.json(post);
});

app.get('/feed', async (req, res) => {
  const posts = await prisma.post({ where: { published: true } });
  res.json(posts);
});

app.get('/filterPosts', async (req, res) => {
  const { searchString } = req.query;
  const draftPosts = await prisma.post({
    where: {
      OR: [
        {
          title_contains: searchString,
        },
        {
          content_contains: searchString,
        },
      ],
    },
  });
  res.json(draftPosts);
});

app.listen(3000, () => console.log('Server is running on http://localhost:3000'));
```

将每个 Prisma client 的实例`prisma`用 Prisma Client JS 替换掉。

### 3.1. 调整引入方式

由于 Prisma Client JS 是在`node_modules/@prisma/client`中生成的，所以应这样引入:

```ts
import { PrismaClient } from '@prisma/client';
```

注意，这里只引入了`PrismaClient`的 构造函数，所以你还需要创建一个 Prisma Client JS 的实例:

```ts
const prisma = new PrismaClient();
```

### 3.2. 调整`/user`路由(`POST`)

在 Prisma Client JS API 中，`POST`请求的`/user`路由须更改为:

```ts
app.post(`/user`, async (req, res) => {
  const result = await prisma.user.create({
    data: {
      ...req.body,
    },
  });
  res.json(result);
});
```

### 3.3. 调整`/post`路由(`POST`)

在 Prisma Client JS API 中，`POST`请求的`/post`路由须更改为:

```ts
app.post(`/post`, async (req, res) => {
  const { title, content, authorEmail } = req.body;
  const result = await prisma.post.create({
    data: {
      title: title,
      content: content,
      author: { connect: { email: authorEmail } },
    },
  });
  res.json(result);
});
```

### 3.4. 调整 `/publish/:id` 路由(`PUT`)

在 Prisma Client JS API 中，`PUT`请求的`/publish/:id`路由须更改为:

```ts
app.put('/publish/:id', async (req, res) => {
  const { id } = req.params;
  const post = await prisma.post.update({
    where: { id },
    data: { published: true },
  });
  res.json(post);
});
```

### 3.5. 调整`/post/:id`路由(`DELETE`)

在 Prisma Client JS API 中，`DELETE`请求的`/post/:id`路由须更改为:

```ts
app.delete(`/post/:id`, async (req, res) => {
  const { id } = req.params;
  const post = await prisma.post.delete({
    where: { id },
  });
  res.json(post);
});
```

### 3.6. 调整`/post/:id`路由(`GET`)

在 Prisma Client JS API 中，`GET`请求的`/post/:id`路由须更改为:

```ts
app.get(`/post/:id`, async (req, res) => {
  const { id } = req.params;
  const post = await prisma.post.findOne({
    where: { id },
  });
  res.json(post);
});
```

### 3.7. 调整`/feed`路由(`GET`)

在 Prisma Client JS API 中，`GET`请求的`/feed`路由须更改为:

```ts
app.get('/feed', async (req, res) => {
  const posts = await prisma.post.findMany({ where: { published: true } });
  res.json(posts);
});
```

### 3.8. 调整`/filterPosts`路由(`GET`)

在 Prisma Client JS API 中，`POST`请求的`/user`路由须更改为:

```ts
app.get('/filterPosts', async (req, res) => {
  const { searchString } = req.query;
  const filteredPosts = await prisma.post.findMany({
    where: {
      OR: [
        {
          title: { contains: searchString },
        },
        {
          content: { contains: searchString },
        },
      ],
    },
  });
  res.json(filteredPosts);
});
```

## 4. 使用 Prisma Migrate 执行数据库迁移

今后你不必再使用`prisma deploy`命令执行 schema 迁移，可以用`prisma2 migrate`替代它。每个 schema 迁移都遵循一个 3 步走流程:

1. 在你的 Prisma schema 中调整 data model，表示预期的更改 (例如添加一个新的 model)
2. 运行`npx prisma2 migrate save --experimental`，在你的文件系统上保存迁移(到这里还没有实际执行迁移)
3. 运行`npx prisma2 migrate up --experimental`， 对你的数据库真正执行迁移

> **警告**: Prisma Migrate 当前处于**实验**阶段. 执行以下命令时, 你需要通过一个`--experimental`参数显示调用， 例如：
> `prisma2 migrate save --name 'init' --experimental`.

## 总结

在这篇升级指引中，你了解到了怎样使用 Prisma Client JS 和 Prisma Migrate 把 ExpressJS-based REST API 从 Prisma1 升级到 Prisma2。未来我们将基于更复杂的数据库 schema，以及使用 GraphQL Nexus 和`nexus-prisma`的项目介绍更细粒度的升级场景。
