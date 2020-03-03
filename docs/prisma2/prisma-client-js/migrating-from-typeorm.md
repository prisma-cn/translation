---
title: 从TypeORM迁移到Prisma Client JS
description: 本章是将已有的使用了TypeORM的项目修改为Prisma Client JS的示例。
author: Victor
author_url: https://kangwenchang.com
author_image_url: https://kangwenchang.com/static/favicon/logocorner.png
author_title: Prisma 爱好者
---

[TypeORM](https://typeorm.io/)和[Prisma Client JS](https://photonjs.prisma.io/)都是你的后端和数据库之间的抽象层，但是它们的工作原理各不相同，也提供了不同类型的抽象。在本教程中，我们将比较两种使用数据库的方法，并逐步介绍如何从 TypeORM 项目迁移到 Prisma Client JS。

> **注意**：如果你在本教程或 Prisma 2 的任何部分遇到任何问题，可以通过以下方法获得帮助：**在[微信群](/wechat)提问**，**在[GitHub]上创建问题(https://github.com/prisma/prisma2/issue)**或在[slack](https://slack.prisma.io/)上加入[`#prisma2-preview`](https://prisma.slack.com/messages/CKQTGR6T0/)频道直接分享你的反馈。我们还在[Spectrum](https://spectrum.chat/prisma)上设有一个社区论坛。

## 目标

本教程将向你展示如何在迁移过程中实现以下目标：

1. [从数据库中获取 Prisma schema](#1-从TypeORM项目内省现有数据库schema)
2. [定义数据源](#2-指定数据源)
3. [安装和导入库](#3-安装并导入库)
4. [建立连接](#4-建立连接)
5. [建模数据](#5-建模数据)
6. [查询数据库](#6-查询数据库)
7. [设置你的 TypeScript 项目](#7-设置你的TypeScript项目)
8. [其他迁移注意事项](#8-其他注意事项)

## 先决条件

本教程假设你已基本了解：

- TypeScript
- Node.js
- PostgreSQL

你将在本教程中使用 TypeScript 和 PostgreSQL 数据库。你可以在[本地](https://www.runoob.com/postgresql/windows-install-postgresql.html) 创建一个数据库，也可以在阿里云、腾讯云等云服务商创建一个数据库。

- 确保你的数据库服务器正在[运行](https://tableplus.com/blog/2018/10/how-to-start-stop-restart-postgresql-server.html)
- 得到你的数据库服务器地址和用户名密码
- 为本教程创建数据库

你将使用[Express](https://expressjs.com/)框架构建迁移的 REST API。可以在此[github 库](https://github.com/infoverload/migration_typeorm_photon)中找到示例项目。

克隆这个仓库并进入文件夹

```
git clone https://github.com/infoverload/migration_typeorm_photon
cd migration_typeorm_photon
```

该项目的 TypeORM 版本可以在[`typeorm`](https://github.com/infoverload/migration_typeorm_photon/tree/typeorm)分支中找到。要切换到分支，请输入：

```
git checkout typeorm
```

该项目的完整 Prisma Client JS 版本位于[`master`](https://github.com/infoverload/migration_typeorm_photon/tree/master)分支中。要切换到该分支，请输入：

```
git checkout master
```

## 1.从 TypeORM 项目内省现有数据库 schema

请按照[`typeorm`](https://github.com/infoverload/migration_typeorm_photon/)分支中的[README 文件](https://github.com/infoverload/migration_typeorm_photon/blob/typeorm/README.md)的说明进行操作。 将项目连接到 PostgreSQL 数据库上运行。这将设置数据库为项目的 TypeORM [entities](https://github.com/infoverload/migration_typeorm_photon/tree/typeorm/src/entity)中定义的 schema。

Prisma 可以[introspect](..introspection.md)数据库，从当前数据库中获取数据模型定义。

现在，你可以从 TypeORM 项目中对数据库进行 introspect 了。导航到当前项目目录之外，以便你可以创建一个新项目。在你的终端中，输入以下命令：

```
npx prisma2 init clientjs_app
```

这将初始化一个新的 Prisma 项目“ clientjs_app”并启动初始化过程：

1. "Languages for starter kits": **Blank project**
2. "Supported databases": **PostgreSQL**
3. "PostgreSQL database credentials": fill in your database credentials and select **Connect**
4. "Database options": **Use existing PostgreSQL schema**
5. "Non-empty schemas": **public**
6. "Prisma 2 tools": confirm the default selections
7. "Prisma Client JS is available in these languages": **TypeScript**
8. **Just the Prisma schema**

自省 introspection 过程现已完成。你应该看到类似以下的消息：

```
 SUCCESS  The introspect directory was created!
 SUCCESS  Prisma is connected to your database at localhost
```

如果浏览项目目录，将看到：

```
prisma
└── schema.prisma
```

[Prisma schema 文件](../prisma-schema-file.md)是 Prisma 的主要配置文件。它包含数据库信息和密码，数据模型定义 data model，生成器 generator。迁移到 Prisma Client JS 的流程都将从此文件开始。

查看刚刚生成的文件。

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = "postgresql://user:password@127.0.0.1:5432/database?schema=public"
}

model Category {
  id                     Int                      @id
  name                   String
  postCategoriesCategory PostCategoriesCategory[]

  @@map("category")
}

model Post {
  id                     Int                      @id
  postCategoriesCategory PostCategoriesCategory[]
  text                   String
  title                  String

  @@map("post")
}

model PostCategoriesCategory {
  categoryId Category
  postId     Post

  @@map("post_categories_category")
}
```

当对具有多对多关系的数据库进行 introspecting 时，Prisma 遵循其自己的关系表约定。因此，当你从 TypeORM 项目 introspecting 现有数据库时，如果执行`prisma2 dev`，可能会遇到一个错误：“Model PostCategoriesCategory 没有 id 字段”。

这是一个已知的[限制](../limitations.md)。解决方法是在[schema.prisma](https://github.com/infoverload/migration_typeorm_photon/blob/master/prisma/schema.prisma#L28)中手动在`PostCategoriesCategory`模型中添加`id`主键，如下：

```diff
//...
model PostCategoriesCategory {
+ id         Int           @id
  //...
}
```

然后在终端输入:

```
cd clientjs_ap
npx prisma2 migrate save --experimental
npx prisma2 migrate up --experimental
npx prisma2 generate
```

请注意，每当对[Prisma schema](../prisma-schema-file.md)进行更改时，都需要重新执行`npx prisma2 generate`。对数据模型所做的更改感到满意后，就可以使用`migrate`来保持迁移。

你可以执行`npx prisma2 studio --experimental`打开 Prisma Studio 查看当前数据库中的数据。打开终端中显示的链接(一般是`http://localhost:5555/`](http://localhost:5555/))：

![](/prisma2/4h9nk7i.png)

> **注意**：请在[`studio`](https://github.com/prisma/studio)库中分享你对 Prisma Studio 的任何反馈。

## 2.指定数据源

在 TypeORM 项目示例中，可以在[`ormconfig.json`](https://github.com/infoverload/migration_typeorm_photon/blob/typeorm/ormconfig.json)文件中定义数据源和凭据：

```json
{
  "name": "default",
  "type": "postgres",
  "host": "localhost",
  "port": 5432,
  "username": "user",
  "password": "password",
  "database": "database",
  "synchronize": true,
  "logging": true
}
```

在你的 Prisma Client JS 项目中，当你执行`prisma2 init`时会自动生成，配置在[`schema.prisma`](https://github.com/infoverload/migration_typeorm_photon/blob/master/prisma/schema.prisma) 文件中:

```prisma
//...
datasource db {
  provider = "postgresql"
  url      = "postgresql://user:password@localhost:5432/database?schema=public"
}
//...
```

## 3.安装和导入库

TypeORM 作为[node module](https://www.npmjs.com/package/typeorm)通过 npm install 安装，而 Prisma Client JS 由 Prisma CLI(调用 Prisma Client JS 生成器)生成。为你的数据模型提供类型安全的数据访问 API。

### 安装 Prisma 依赖

确保将`@prisma/client`添加到你的项目依赖项中，并将`prisma2`设置为开发依赖项。请注意，两个软件包版本必须保持同步：

```
npm install @prisma/client
npm install prisma2 --save-dev
```

### 迁移到`PrismaClient`构造函数

确保你位于`clientjs_app`项目目录中。然后，在你的终端中运行：

```
npx prisma2 generate
```

这将解析 Prisma schema 文件，然后生成正确的数据库客户端代码(通过`generator`指定)：

[schema.prisma](https://github.com/infoverload/migration_typeorm_photon/blob/master/prisma/schema.prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}
//...
```

这样就在`node_modules/@prisma`中生成了一个 Prisma Client JS 和一个`client`目录：

```
node_modules
└── @prisma
    └── client
        └── runtime
            ├── index.d.ts
            └── index.js
```

这是默认路径，但可以[自定义](https://github.com/prisma/prisma2/blob/master/docs/prisma-client-js/codegen-and-node-setup.md)。最好不要更改生成目录中的文件，因为每次调用`prisma2 generate`时，该目录都会被覆盖。

现在，你可以在项目中导入 Prisma Client JS。在`src`目录中创建一个主应用程序文件`index.ts`，并导入 PrismaClient 构造函数：

```ts
import { PrismaClient } from '@prisma/client';
```

## 4.建立连接

在 TypeORM 中，有几种创建连接的方法。最常见的方式是使用`createConnection`和`createConnections`函数：

[index.ts](https://github.com/infoverload/migration_typeorm_photon/blob/typeorm/src/index.ts)

```ts
import createConnection from 'typeorm';

const connection = createConnection();
```

### 迁移连接

要在 Prisma Client JS 项目中实现此目的，请在你的`index.ts`文件中导入`PrismaClient`并创建一个新的实例，如下所示：

```ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
```

现在，你就可以使用`prisma`实例，并使用生成的 Prisma Client JS API 与你的数据库进行交互。

当发送第一个请求时，`PrismaClient`实例会[自动连接](../prisma-client-js/api.md#managing-connections)数据库(在幕后为你调用`connect()`)。

## 5.创建模型

在 TypeORM 中，模型称为*entities*。它建议为每个文件定义一个 entity class(作为“entity schema”，以便后面导入)。这就是为什么在示例项目中，对于`Category` entity 和`Post` entity 都有[Category.ts](https://github.com/infoverload/migration_typeorm_photon/blob/typeorm/src/entity/Category.ts)文件和[Post.ts](https://github.com/infoverload/migration_typeorm_photon/blob/typeorm/src/entity/Post.ts)文件的原因。TypeORM 允许你将 class 用作数据库模型，并提供一种声明性方式来定义模型的哪些部分将成为数据库表的一部分。 Entity 是映射到数据库表的类。你可以通过定义一个新类来创建一个实体，并用`@Entity()`进行标记。每个实体必须至少有一个主列(@PrimaryGeneratedColumn())。用“ @Column”标记的每个实体类属性都将映射到数据库表的列。

在我们的示例 TypeORM 项目中：

[Category.ts](https://github.com/infoverload/migration_typeorm_photon/blob/typeorm/src/entity/Category.ts)

```ts
import { Entity } from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
```

[Post.ts](https://github.com/infoverload/migration_typeorm_photon/blob/typeorm/src/entity/Post.ts)

```ts
import { Entity } from 'typeorm';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  text: string;

  @ManyToMany(type => Category, {
    cascade: true,
  })
  @JoinTable()
  categories: Category[];
}
```

在你的 Prisma Client JS 项目中，以上模型是通过 introspection 自省过程自动生成的。这些模型定义位于 Prisma schema 文件中。Model 代表你的应用程序的实体，定义基础数据库 schema ，并且是数据库客户端自动生成的 CRUD 操作的基础。

查看生成的 Prisma schema 文件([此处为示例](https://github.com/infoverload/migration_typeorm_photon/blob/master/prisma/schema.prisma))。来自 TypeORM 项目的`Category`和`Post`实体被转换为`Category`和`Post` model：

```prisma
model Category {
  id                     Int                      @id
  name                   String
  postCategoriesCategory PostCategoriesCategory[]

  @@map("category")
}

model Post {
  id                     Int                      @id
  postCategoriesCategory PostCategoriesCategory[]
  text                   String
  title                  String

  @@map("post")
}

model PostCategoriesCategory {
  id         Int           @id
  categoryId Category
  postId     Post

  @@map("post_categories_category")
}
```

`Category` 和 `Post`被映射到数据库表。字段映射到表的列。注意，通过`PostCategoriesCategory`关系表，在`Category` 和 `Post`之间存在多对多关系，而`@id`指令则表示该字段是*主键 primary key*。

如果更改数据模型，则可以重新生成 Prisma Client JS，所有类型都会更新。

## 6.查询数据库

使用 TypeORM 时可以通过多种方式查询数据库。在这个例子中，[`Repository`](https://typeorm.io/#/working-with-repository)被用作一个具体实体的所有操作的集合(在本例中是`Post`)。

在示例项目中，你首先要通过`getRepository`方法访问`Post`存储库，以便可以对其执行操作。然后，在你的 Express 应用程序中的`/posts`路由中使用`Post` 存储库的 `find()`方法从数据库中获取所有`Post`，并将结果返回。

[index.ts](https://github.com/infoverload/migration_typeorm_photon/blob/typeorm/src/index.ts)

```ts
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { Request, Response } from 'express';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { Post } from './entity/Post';

// connection settings are in the "ormconfig.json" file
createConnection()
  .then(connection => {
    const postRepository = connection.getRepository(Post);

    app.get('/posts', async function(req: Request, res: Response) {
      const posts = await postRepository.find();
      res.send(posts);
    });
    //...

    // start Express server
    app.listen(3000);
    console.log('Express application is up and running on port 3000');
  })
  .catch(error => console.log('Error: ', error));
```

你生成的 Prisma Client JS API 将为`Category` 和 `Post`公开以下[CRUD 操作](../prisma-client-js/api.md#crud)：

- `findOne`
- `findMany`
- `create`
- `update`
- `updateMany`
- `upsert`
- `delete`
- `deleteMany`

### 迁移`/posts`路由(`GET`)

所以要在 Prisma Client JS 项目中实现相同的路由和功能，请转至 `index.ts` 文件，并在 `app.get`的 `/posts` 路由中，使用以下命令从数据库中获取所有 post： [`findMany`](../prisma-client-js/api.md#findMany)。请注意，API 调用是异步的，因此我们可以`await`操作结果。

```ts
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { PrismaClient } from '@prisma/client';

const app = express();
app.use(bodyParser.json());

const prisma = new PrismaClient();

app.get('/posts', async (req, res) => {
  const posts = await prisma.post.findMany();
  res.send(posts);
});

//...

app.listen(3000, () => console.log('Server is running on http://localhost:3000'));
```

让我们迁移另一个路由。在 TypeORM 项目中，这是通过 ID 检索 Post 的功能：

```ts
//...
app.get('/posts/:id', async function(req: Request, res: Response) {
  const post = await postRepository.findOne(req.params.id);

  if (!post) {
    res.status(404);
    res.end();
    return;
  }
  return res.send(post);
});
//...
```

所有 repository `find`方法都接受特殊选项，可用于查询所需的数据。

### 迁移`/posts/:id`路由(`GET`)

现在要在 Prisma Client JS 项目中实现相同的路由，请转至 `index.ts` 文件，然后在 `/posts/:id` 路由中，通过查询参数获取 `id` ，使用 `findOne` 方法查询 `post` ，这里用 `where` 选项指定 post 的唯一字段。最后将结果返回。

```ts
//...
app.get(`/posts/:id`, async (req, res) => {
  const { id } = req.params;
  const post = await prisma.post.findOne({
    where: {
      id: Number(id),
    },
  });
  res.json(post);
});
//...
```

让我们迁移处理 POST 请求的路由。在 TypeORM 项目中，这是创建和保存新 post 的代码：

```ts
//...
app.post('/posts', async function(req: Request, res: Response) {
  const newPost = await postRepository.create(req.body);
  await postRepository.save(newPost);
  return res.send(newPost);
});
//...
```

### 迁移`/posts`路由(`POST`)

要在 Prisma Client JS 项目中实现相同的路由，请转到你的 `index.ts`文件，在 `app.post`的`/posts` 路由中，保存来自请求 body 的用户输入，使用为 `post` 模型生成的 `create` 方法创建新记录，并返回新创建的对象。

```ts
//...
app.post(`/posts`, async (req, res) => {
  const { text, title } = req.body;
  const post = await prisma.post.create({
    data: {
      text,
      title,
    },
  });
  res.json(post);
});
//...
```

让我们迁移最后一条路由。在 TypeORM 项目中，这是通过 ID 删除帖子的功能：

```ts
//...
app.delete('/posts/:id', async function(req: Request, res: Response) {
  const result = await postRepository.delete(req.params.id);
  return res.send(result);
});
//...
```

### 迁移`/posts/:id`路由(`DELETE`)

要在 Prisma Client JS 项目中实现相同的路由，请转至 `index.ts` 文件，并在 `app.delete`的`/posts/:id` 路由中，从请求参数中保存我们要删除`post`的`id`，使用为 `post` 模型生成的 `delete` 方法删除现有记录，其中 `id` 与请求的输入匹配，然后返回相应的对象。

```ts
//...
app.delete(`/posts/:id`, async (req, res) => {
  const { id } = req.params;
  const post = await prisma.post.delete({
    where: {
      id: Number(id),
    },
  });
  res.json(post);
});
//...
```

现在，你可以按照此方法迁移其他路由。如果遇到问题，请返回项目的`master`分支。

## 7.设置你的 TypeScript 项目

在主应用程序文件中实现路由之后，就该设置 TypeScript 项目了。

### 7.1。初始化项目并安装依赖项

在你的项目根目录中，初始化一个新的 npm 项目：

```
npm init -y
```

在本地安装`typescript`和`ts-node`包：

```
npm install --save-dev typescript ts-node
```

### 7.2。添加 TypeScript 配置

在项目根目录中创建一个[tsconfig.json](https://github.com/infoverload/migration_typeorm_photon/blob/master/tsconfig.json)文件，然后添加：

```json
{
  "compilerOptions": {
    "sourceMap": true,
    "outDir": "dist",
    "strictFunctionTypes": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "lib": ["esnext", "dom"]
  }
}
```

### 7.3。在`package.json`中添加一个启动脚本

在你的[package.json](https://github.com/infoverload/migration_typeorm_photon/blob/master/package.json)文件中，添加一个启动脚本：

```diff
//...
"scripts": {
+ "start": "ts-node src/index.ts"
  //...
}
//...
```

### 7.4 运行项目

一切就绪，你就可以运行项目！

```
npm start
```

## 8.其他注意事项

所使用的示例项目演示了 TypeORM 和 Prisma Client JS 的基本功能，但是在迁移时还有更多需要考虑的事项，例如事务和处理关系，这些可能会在以后的教程中介绍。要注意的主要事情是，虽然 Prisma Client JS 与 ORM 类似，但应将其视为自动生成的数据库客户端。

## 下一步

- 了解有关[Prisma Query JS'Relation API]的更多信息(../prisma-client-js/api.md#relations)
- 参与我们的[社区](/wechat)！

如果你在本教程中遇到问题或发现任何错误，请随时提出反馈。
