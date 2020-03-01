---
title: 教程
description: Prisma 2 教程，通过这篇教程快速完整地了解Prisma2 的功能和特性，并按照示例成功进行数据的存取。
author: Victor
author_url: https://kangwenchang.com
author_image_url: https://kangwenchang.com/static/favicon/logocorner.png
author_title: Prisma 爱好者
---

# Prisma 2 教程

通过这篇教程，我们将从实际出发全面地了解 Prisma 2 的生态系统，包括使用[**Lift**](http://lift.prisma.io)迁移数据库，使用[**Photon.js**](http://photonjs.prisma.io) 进行类型安全的数据库访问读写。

> **注意**: 如果你在这篇教程或 Prisma 2 的任何部分遇到任何问题， **请务必[提个 issues](https://github.com/prisma/prisma2/issues)**! 你也可以加入[微信群](/wechat)直接反馈。

接下来你将会学习到:

1. 安装 Prisma 2 CLI
2. 使用 `init` 命令新建一个项目
3. 了解 Prisma 项目设置的基本部分
4. 使用 `dev` 命令开发项目
5. 使用 `lift` 子命令迁移数据库 schema

好，让我们从零开始，使用 **TypeScript** 和 **PostgreSQL** 做一个项目. 你可以在[本地](https://www.runoob.com/postgresql/windows-install-postgresql.html) 创建一个数据库，也可以在阿里云、腾讯云等云服务商创建一个数据库。在本教程中使用本地数据库进行演示。

> **注意**: 如果你不想建一个 PostgreSQL 数据库，那么在运行 `prisma2 init` 命令时，可以选择 SQLite(一种本地数据库)。Prisma 的主要优点之一就是可以轻松地变更应用程序连接的数据源。因此，你尽管放心使用 SQLite 学习和测试，以后只需将[Prisma schema file](prisma2/prisma-schema-file.md)中的几行代码调整即可将相同的设置映射到 PostgreSQL 或 MySQL 数据库。

## 1. 安装 Prisma 2 CLI

Prisma 2 CLI 在 npm 上作为 `prisma2` 库提供。使用以下命令全局安装：

```
npm install -g prisma2 --registry=https://registry.npm.taobao.org
```

## 2. 连接到你的数据库

### 2.1. 运行初始化向导 `prisma2 init`

Prisma 2 CLI 的 `init` 可以设置新项目并连接到数据库，输入如下:

```
prisma2 init hello-prisma2
```

这将启动一个交互式向导，按照以下步骤操作。

当命令行出现提示时选择 **Blank project** 选项。

```
$ prisma2 init hello-prisma2

  Get started with a blank project or a starter kit.
  Starter kits provide ready-made setups for various use cases.
  开始使用空白项目或入门工具包。
  入门套件为各种使用情况提供了现成的设置。

┌─ Languages for starter kits ──────────────────────────────────────────────────────────┐
│                                                                                       │
│ ❯ Blank project(空白项目) Supports introspecting your existing DB (支持解析现有数据库)     │
│   Starter Kit(起步模板)   Sample setups for GraphQL, REST, gRPC, ...(这些类型的服务器示例) │
│                                                                                       │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2. 选择数据库

下一步，向导提示选择数据库，选择 **PostgreSQL** (或者当你没有跑起来的 PostgreSQL 数据库时选择 SQLite)。

```
$ prisma2 init hello-prisma2

  Connect to your PostgreSQL database
  连接到你的数据库
  https://pris.ly/d/postgres-connector

    Host: localhost

┌─ PostgreSQL database credentials ────────────────────────────────────────────────┐
│                                                                                  │
│ ❯ Host: localhost                                                                │
│   Port: 5432                                                                     │
│   User: user                                                                     │
│   Password:                                                                      │
│   Database: postgres                                                             │
│   Schema (optional):                                                             │
│   ☐ Use SSL                                                                      │
│                                                                                  │
├─ PostgreSQL database credentials ────────────────────────────────────────────────┤
│                                                                                  │
│   URL: postgresql://localhost:5432/admin                                         │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘

❯ Connect
❮ Back (Database options)
```

### 2.3. 提供数据库凭证

> 请注意，如果之前选择了 SQLite，则可以跳过此部分。

1. 提供数据库凭证:
   - **Host**: 你的 pg 数据库运行的 IP 地址或域名
   - **Port**: 该数据库的端口，默认为 `5432`
   - **User** and **Password**: 用户名密码
   - **Database**: 你想使用的数据库名字：[PostgreSQL database](https://www.postgresql.org/docs/current/tutorial-createdb.html)
   - **Schema** (可选): 你想用使用的 schema 名字[PostgreSQL schema](https://www.postgresql.org/docs/current/ddl-schemas.html) (如果你提供的 schema 名称不存在，Prisma 将创建 schema ； 如果未提供，则可以在下一步中选择现有 schema )
   - **SSL**: 如果你的数据库使用了 SSL 证书加密，则选中此框; 用 **SPACE** 按键
2. 确认 **Connect**

```
  Connect to your PostgreSQL database
  https://pris.ly/d/postgres-connector

┌─ PostgreSQL database credentials ────────────────────────────────────────────────┐
│                                                                                  │
│   Host: localhost                                                                │
│   Port: 5432                                                                     │
│   User: Victor                                                                   │
│ ❯ Password:                                                                      │
│   Database: postgres                                                             │
│   Schema (optional): prisma                                                      │
│   ☐ Use SSL                                                                      │
│                                                                                  │
├─ PostgreSQL database credentials ────────────────────────────────────────────────┤
│                                                                                  │
│   URL: postgresql://Victor@localhost:5432/postgres?schema=prisma                 │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘

❯ Connect
❮ Back (Database options)
```

此段代码显示了本地数据库的配置。请注意，我们为 **Schema** 字段提供了名称“prisma”。由于数据库中尚不存在该 schema，因此 Prisma 2 CLI 将使用该名称创建一个 schema。

```
  A schema named 'prisma' doesn't exist on this PostgreSQL server.
  Create PostgreSQL database 'prisma' or select an existing one.
  该PostgreSQL 服务器上不存在名为“prisma”的schema。
  创建PostgreSQL 数据库'prisma'或选择一个现有的数据库。

┌─ Database options ───────────────────────────────────────────────────────────────┐
│                                                                                  │
│ ❯ Create PostgreSQL schema 'prisma'        Start from scratch                    │
│   Use existing PostgreSQL schema           Found 1 schema                        │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘

❮ Back (Database credentials)
```

### 2.4. 给 Photon 选择合适的编程语言

Photon 是类型安全的数据库客户端，当前支持 JavaScript 和 TypeScript(此库称为 Photon.js)。在本教程中，我们使用 TypeScript。

这里，当向导提示时选择 **TypeScript** .

```
  Select the programming language you want to use.
  Specifies the language for Photon (database client).
  选择要使用的编程语言。
  指定Photon(数据库客户端)的语言。

┌─ Photon is available in these languages ─────────────────────────────────────────┐
│                                                                                  │
│   JavaScript                                                                     │
│ ❯ TypeScript                                                                     │
│   Go (Coming soon)                                                               │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘

❮ Back (Tool selection)
```

### 2.5. Select the demo script

该向导提供了以 _demo script_ 开头的选项。选择此选项将开始使用示例[数据模型定义](prisma2/data-modeling.md#data-model-definition)以及可执行脚本，可用于尝试一些 Photon.js API 调用。

选择 **Demo script** 。

```
  Start with a runnable demo script or just the Prisma schema
  Demo scripts showcase usage of the Photon API
  从可运行的demo脚本开始或只是包含Prisma schema
  演示脚本展示了Photon API的用法

┌──────────────────────────────────────────────────────────────────────────────────┐
│                                                                                  │
│ ❯ Demo script              Simple script with API examples                       │
│   Just the Prisma schema   Most minimal setup                                    │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘

❮ Back (Tool selection)
```

### 2.6. 下一步

一旦选择好了 **Demo script** 程序开始工作，创建项目：

```
Preparing your demo script (TypeScript) ...

✔  Downloading the demo script from GitHub ...
✔  Extracting content to hello-prisma2 ...
⠙  Installing dependencies with: `npm install` ...
4  Preparing your database ...
```

它还会打印成功消息和你要采取的后续步骤：

```
 SUCCESS  The hello-prisma2 directory was created!
 SUCCESS  Prisma is connected to your database at localhost

┌─ Next steps ─────────────────────────────────────────────────────────────────────┐
│                                                                                  │
│   Navigate into the project directory:                                           │
│   $ cd hello-prisma2                                                             │
│                                                                                  │
│   Start Prisma's development mode to enable access to                            │
│   Prisma Studio and watch schema.prisma for changes:                             │
│   $ prisma2 dev                                                                  │
│                                                                                  │
│   Start the REST API server (in a new terminal window/tab):                      │
│   $ npm start                                                                    │
│                                                                                  │
│   Learn more about Prisma 2:                                                     │
│   https://github.com/prisma/prisma2/                                             │
│                                                                                  │
│   If you encounter any issues, please report them here:                          │
│   https://github.com/prisma/prisma-examples/issues/new                           │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

我们先看一下项目再运行提示的下一步命令。

## 3. 浏览项目设置

`prisma2 init` 向导创建了如下的文件目录结构:

```
hello-prisma2
├── node_modules
│   └── @generated
│       └── photon
├── package.json
├── prisma
│   ├── migrations
│   │   └── dev
│   │       └── watch-20190903103132
│   │           ├── README.md
│   │           ├── schema.prisma
│   │           └── steps.json
│   └── schema.prisma
├── script.ts
└── tsconfig.json
```

接下来我们创建一些文件。

### 3.1. 理解 Prisma schema 文件

不管是使用 Photon 还是 Lift，其核心都是[Prisma schema file](prisma2/prisma-schema-file.md) (默认为 `prisma.schema`). 这里是它的内容:

```prisma
generator photon {
  provider = "photonjs"
}

datasource db {
  provider = "postgresql"
  url      = "postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA"
}

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
  published Boolean
  title     String
  content   String?
  author    User?
}
```

上面 `datasource` 中的大写字母是占位符，代表你真实的数据库凭据。

在本地运行 PostgreSQL 时，你的用户名和密码以及数据库名称通常与操作系统的当前 _user_ 相对应，例如：

```prisma
datasource db {
  provider = "postgresql"
  url      = "postgresql://victor:victor@localhost:5432/victor?schema=hello-prisma2"
}
```

而且可以设置 `url` 为[环境变量](prisma2/prisma-schema-file.md#using-environment-variables).

根据数据库的类型和位置不同，`datasource` 配置也不尽相同。

Prisma schema 包含三个重要元素:

- Data sources (就是你的数据库信息)
- Generators (在这个例子中 generator 就是 Photon.js)
- [Data model 定义](prisma2/data-modeling.md#data-model-definition) (此处为 `Post` 和 `User` models)

你也可以将 `output` 字段添加到 `generator` 中，就可以指定生成 Photon.js 的文件路径。由于这里没有指定 `output` ， 所以它默认在 `node_modules` 目录里。在此处了解更多生成到 `node_modules` 中的[细节](prisma2/photon/codegen-and-node-setup.md).

### 3.2. 理解 data model definition

Schema 文件中的[data model definition](prisma2/data-modeling.md#data-model-definition) 有以下功能:

- 它是你底层数据库 schema 的 _声明性_ 描述
- 它是生成[Photon API](prisma2/photon/api.md)的基础

核心模块是[models](prisma2/data-modeling.md#models)，它映射到底层数据库表现为 _tables_ ，也就是一个 models 对应一个数据库表。模型的[fields 字段](./data-modeling.md#fields)对应着数据库的 _columns_ 也就是一行 fields 对应数据库表一列.

我们来看文件中的 `User` model :

```prisma
model User {
  id    String  @default(cuid()) @id
  email String  @unique
  name  String?
  posts Post[]
}
```

这些分别为 `User` 模型中的功能:

- `id` 字段的类型为 `String` 并且带有两个[attributes 属性](prisma2/data-modeling.md#attributes):
  - `@id`: 表示此字段为 _primary key 主键_
  - `@default(cuid())`: 设置默认值为[`cuid`](https://github.com/ericelliott/cuid)
- `email` 字段的类型为 `String`。它用 `@unique` 属性标注，意味着数据库中用于不会有两个记录相同的值。Prisma 会自动检查。
- `name` 字段的类型为 `String?` (可选字符串). `?` 是类型修饰符，代表此字段可以不填。
- `posts` 字段的类型为 `Post[]` 表示为和`Post` model 的[relation 关系](./relations.md)类型。`[]` 代表这是一个 _list 列表_ (比如说一个用户可以发布多个 Post).

再来看一下 `Post` model:

```prisma
model Post {
  id        String   @default(cuid()) @id
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  published Boolean
  title     String
  content   String?
  author    User?
}
```

大部分和上面相似，但有两个新东西:

- `createdAt` 的字段类型为 `DateTime`。带有 `@default(now())` 属性的标注意味着该字段的值默认为该条记录创建时的时间戳。
- `updatedAt` 字段有 `@updatedAt` 属性。每当更新某条数据的任何字段时，这条记录的 `updateAt` 都会更新为更新时的时间戳。

### 3.3. 理解 TypeScript 设置

该项目还包含一些典型的 Node.js/TypeScript 设置所需的其他文件：

- `package.json`: 定义 Node.js 项目的依赖和配置。
- `tsconfig.json`: 指定 TypeScript 的配置。注意 Photon.js 当前需要设置 `esModuleInterop` 属性为 `true`。
- `node_modules/@generated/photon`: 包含生成的 Photon.js 代码。
- `script.ts`: 包含实际的“应用程序代码”，现在生成的是演示一些 Photon.js API 调用的简单脚本。

将 Photon.js 生成的代码放在 `node_modules/@generated` 中可以这样导入到代码中:

```ts
import { Photon } from '@generated/photon';
```

由于 Photon.js 生成到通常通过调用 npm install 填充的 `node_modules` 中，因此你应确保在每次调用 `npm install` 时也生成 Photon.js。这就是为什么将 `Prisma2 generate`(基于 Prisma schema 生成 Photon.js 的命令)作为`package.json`中的`postinstall`钩子的原因：

```json
{
  "name": "script",
  "license": "MIT",
  "devDependencies": {
    "ts-node": "8.3.0",
    "typescript": "3.6.2",
    "prisma2": "2.0.0-preview-9.1"
  },
  "scripts": {
    "start": "ts-node ./script.ts",
    "postinstall": "prisma2 generate"
  }
}
```

在使用 Photon.js 的项目上进行协作时，这种方法允许使用常规的 Node.js 最佳实践，团队成员可以克隆 Git 存储库，然后运行`npm install`以获取标准依赖和 Photon 代码。

### 3.4. 理解 `migrations` 目录

为了保留迁移历史记录，Prisma 默认使用名为`migrations`的文件夹。有两种方法可以生成`migrations`文件夹：

- 每当数据模型处于 _development_ 模式时，都会向`migrations/dev`中生成新的迁移记录。
- 每当要使用 Lift 保留数据模型更改时，它都会获得自己的目录。

在下一节中再详细了解这两种方法。请注意，在 dev 文件夹中已经存在一个名为首次迁移记录`watch-TIMESTAMP`(其中“ TIMESTAMP”是占位符，真实名称类似于`watch-20190903103132`)。这是因为 Prisma 已经准备了可以立即运行演示脚本的项目，也就是说，它已迁移了数据库以匹配你的数据模型定义(即数据库中已经存在`Post`和`User`表)。你可以通过数据库 GUI(例如[Postico](https://eggerapps.at/postico/)或[TablePlus](https://tableplus.com/))中浏览数据库架构来验证这一点：

请注意，在`migrations/dev`文件夹中的迁移被视为`throw away 丢弃`迁移。如果要将数据库模式迁移持久保存在 Lift 的*migration history*中，则需要使用`lift`子命令`prisma2 lift save`和`prisma2 lift up`来执行迁移。

## 4. 执行 demo 代码

好，现在我们就开始下一步，根据执行`init` 向导后的提示:

```
 SUCCESS  The hello-prisma2 directory was created!
 SUCCESS  Prisma is connected to your database at localhost

┌─ Next steps ─────────────────────────────────────────────────────────────────────┐
│                                                                                  │
│   Navigate into the project directory:                                           │
│   $ cd hello-prisma2                                                             │
│                                                                                  │
│   Start Prisma's development mode to enable access to                            │
│   Prisma Studio and watch schema.prisma for changes:                             │
│   $ prisma2 dev                                                                  │
│                                                                                  │
│   Start the REST API server (in a new terminal window/tab):                      │
│   $ npm start                                                                    │
│                                                                                  │
│   Learn more about Prisma 2:                                                     │
│   https://github.com/prisma/prisma2/                                             │
│                                                                                  │
│   If you encounter any issues, please report them here:                          │
│   https://github.com/prisma/prisma-examples/issues/new                           │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

该提示说明要进入项目目录，启动 Prisma 的 dev 模式，最后执行 demo 脚本。不过，我们现在将跳过`prisma2 dev`命令，仅运行`script.ts`脚本。在这之前，我们先看一下它的内容：

```ts
import { Photon } from '@generated/photon';

const photon = new Photon();

// 一个 `main` 函数让我们可以使用 async/await
async function main() {
  // 给数据库里的user和post加点初始数据
  const user1 = await photon.users.create({
    data: {
      email: 'alice@prisma.io',
      name: 'Alice',
      posts: {
        create: {
          title: 'Watch the talks from Prisma Day 2019',
          content: 'https://www.prisma.io/blog/z11sg6ipb3i1/',
          published: true,
        },
      },
    },
    include: {
      posts: true,
    },
  });
  const user2 = await photon.users.create({
    data: {
      email: 'bob@prisma.io',
      name: 'Bob',
      posts: {
        create: [
          {
            title: 'Subscribe to GraphQL Weekly for community news',
            content: 'https://graphqlweekly.com/',
            published: true,
          },
          {
            title: 'Follow Prisma on Twitter',
            content: 'https://twitter.com/prisma/',
            published: false,
          },
        ],
      },
    },
    include: {
      posts: true,
    },
  });
  console.log(
    `Created users: ${user1.name} (${user1.posts.length} post) and (${user2.posts.length} posts) `,
  );

  // 获取所有已published的post
  const allPosts = await photon.posts.findMany({
    where: { published: true },
  });
  console.log(`Retrieved all published posts: `, allPosts);

  // 新建一篇post(由一名邮箱为alice@prisma.io的已有用户写作)
  const newPost = await photon.posts.create({
    data: {
      title: 'Join the Prisma Slack community',
      content: 'http://slack.prisma.io',
      published: false,
      author: {
        connect: {
          email: 'alice@prisma.io',
        },
      },
    },
  });
  console.log(`Created a new post: `, newPost);

  // 发布上面那篇post
  const updatedPost = await photon.posts.update({
    where: {
      id: newPost.id,
    },
    data: {
      published: true,
    },
  });
  console.log(`Published the newly created post: `, updatedPost);

  // 再次获取所有发布了的post
  const postsByUser = await photon.users
    .findOne({
      where: {
        email: 'alice@prisma.io',
      },
    })
    .posts();
  console.log(`Retrieved all posts from a specific user: `, postsByUser);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await photon.disconnect();
  });
```

这是代码中发生的事情的简要概述：

1. 执行`photon.users.create(...)`创建两个分别名为 _Alice_ 和 _Bob_ 的用户
   - _Alice_ 拥有一个 post，标题为 _Watch the talks from Prisma Day 2019_
   - _Bob_ 有两个帖子，标题为 _Subscribe to GraphQL Weekly for community news_ 和 _Follow Prisma on Twitter_
2. 执行 `photon.posts.findMany(...)`检索所有已发布的帖子
3. 创建一个标题为 _Join the Prisma Slack community_ 的新帖子，该帖子通过用户的电子邮件地址连接到用户 _Alice_
4. 执行 `photon.posts.update(...)`发布 _Alice_ 新创建的帖子。
5. 执行 `photon.users.findOne(...).posts()`检索 _Alice_ 的所有帖子。

注意，每个操作的结果都执行`console.log`打印到控制台。

运行代码：

```
cd hello-prisma2
npm start
```

这将导致以下终端输出，确认所有操作都成功运行：

![out](/prisma2/O5vX9iP.png)

如果你有数据库 GUI，也可以验证是否已在此处创建所有记录。

## 5. 用 Prisma's development mode 开发应用程序

Prisma 2 有一个[development mode 开发模式](./development-mode.md)，可以再开发过程中加快迭代速度。使用 `prisma2 dev` 命令启动。当运行开发模式时，Prisma 2 CLI 会监听你的 schema file。然后每当将 schema 的更改保存的时候，CLI 都会:

- 重新生成 Photon 代码
- 更新数据库 schema
- 创建 Prisma Studio 地址

简单来说就是开发模式简化了 schema 修改流程，不然就需要手动运行一下命令更新仓库:

- `prisma2 generate` 去生成 Photon
- `prisma2 lift save` 和 `prisma2 lift up` 变更数据库

直到你开发完 schema，就可以退出了，并且将更改保存到目录中。[更多](prisma2/development-mode.md#migrations-in-development-mode).

好，我们现在启动开发模式:

```
prisma2 dev
```

> **注意**: 你可以按两次 `control+c`退出开发模式。

执行后会是这样:

```
$ prisma2 dev

   Watching for changes in prisma/schema.prisma
   Last changed at 20:16:15


   Generator
   ──────────────────────────────────────────────────────────────────────────────────
 ✓ Photon.js Client    generated in 6.14s


   Migrations
   ──────────────────────────────────────────────────────────────────────────────────
 ✓ Database successfully migrated
   To save changes into a migration file, run prisma2 lift save




   Studio endpoint: http://localhost:5555/
   ──────────────────────────────────────────────────────────────────────────────────
   d: diff
```

### 5.1. 在 Prisma Studio 中查看数据

你可以使用 Prisma Studio 浏览数据库的数据。打开终端中显示的地址(正常来说在[`http://localhost:5555/`](http://localhost:5555/)):

![studio](/prisma2/4h9nk7i.png)

> **注意**: 有任何反馈意见可以提在此处[`studio`](https://github.com/prisma/studio)

### 5.2. 添加其他模型 model

现在让我们在开发模式下开发应用程序。先在架构中添加一个名为`Category`的新模型。`Category` 将通过[多对多](prisma2/relations.md#mn)关系连接到`Post`。如下调整 Prisma schema 的数据模型：

```diff
model User {
  id    String  @default(cuid()) @id
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id         String     @default(cuid()) @id
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
  published  Boolean
  title      String
  content    String?
  author     User?
+  categories Category[]
}

+ model Category {
+   id    String @id @default(cuid())
+   name  String
+   posts Post[]
+ }
```

确保**cmd+s 保存文件**。保存时，你可以看到终端窗口上 Prisma 的活动：

- 它向数据库 schema 添加了一个`Category`表。它还向数据库 schema 添加了一个名为`_CategoryToPost`的 _relation table_ ，以表示多对多关系。请注意，关系表的样子将来将是可配置的，有关更多信息，请参见[spec](https://github.com/prisma/specs/tree/master/schema#explicit-many-to-many-mn-relationships)。
- 它重新生成了 Photon API，为新的`Category`模型添加 CRUD 操作。

由于 Photon API 已重新生成，因此我们现在可以更新`script.ts`中的代码来创建新`Category`并将其连接到现有(或新)post。例如，此代码段将创建一个名为“prisma”的新类别，并将其连接到两个现有帖子：

Be sure to **save the file**. As you save it, you can observe your terminal window to see Prisma's activity:

```ts
const category = await photon.categories.create({
  data: {
    name: 'prisma',
    posts: {
      connect: [
        {
          id: '__POST_ID_1__',
        },
        {
          id: '__POST_ID_2__',
        },
      ],
    },
  },
});
```

如果想试用此代码段，要注意以下几点：

- 需要将“**POST_ID_1**”和“**POST_ID_2**”占位符替换为之前创建的帖子的实际 ID 值(例如，可以在 Prisma Studio 中或使用数据库 GUI 来找到这些 ID)。
- 需要从脚本中删除前面的代码(例如，通过将其注释掉)，否则它将尝试使用相同的电子邮件地址重新创建“user”记录，这将导致报错。
- 可以使用`npm start`调用脚本。

## 6. 使用 Lift 迁移数据库

由于使用了`Prisma2 dev`，我们已经在数据库和 Photon API 中引入了对数据模型的更改。要将迁移保留在 Lift 的迁移历史记录中，需要完成使用 Lift 迁移数据库的过程。

使用 Lift 进行的每个 schema 迁移都遵循 3 个步骤：

1. **调整数据模型**：更改数据模型以匹配所需的数据库 schema。
2. **保存迁移**：运行`prisma2 lift save`在文件系统上创建迁移文件。
3. **运行迁移**：运行`prisma2 lift up`对数据库执行迁移。

### 6.1。将迁移保存在文件系统上

借助 Lift，每次数据库迁移都会保留在文件系统上，并由多个文件表示。这可以保留数据库架构的迁移历史记录，并了解其项目随时间的变化。还可以轻松回滚和“重放”迁移。

> **注意**：Lift 还会在数据库中创建一个名为“ \_Migration”的表，该表还存储了每次迁移的详细信息。

运行以下命令以保存迁移文件：

```
prisma2 lift save --name 'add-category'
```

这将删除 `migrations/dev` 目录中的"throw-away"迁移文件，并在`migrations/dev`中创建一个名为`TIMESTAMP-add-category`的新目录：

```
hello-prisma2
├── README.md
├── node_modules
│   ├── @generated
│   │   └── photon
├── package-lock.json
├── package.json
├── prisma
│   ├── migrations
│   │   ├── 20190904103007-add-category
│   │   │   ├── README.md
│   │   │   ├── schema.prisma
│   │   │   └── steps.json
│   │   └── lift.lock
│   └── schema.prisma
├── script.ts
├── tsconfig.json
└── yarn.lock
```

注意，传递给 `prisma2 lift save` 的`--name`选项决定了所生成迁移目录的名称。为了确保唯一性和保留顺序，迁移目录的名称始终以时间戳为前缀，因此在这种情况下，迁移目录为`20191003131441-add-category`。

浏览每个文件的内容，更好地了解它们的使用。

### 6.2. 执行数据库迁移

创建迁移文件后，可以使用以下命令运行迁移：

```
prisma2 lift up
```

这会将数据模型映射到底层数据库中(即会 _变更你的数据库_ )。

### 6.3. [可选]创建从数据库到 Prisma schema 的自定义映射

使用 Lift 迁移数据库时，通常会将模型和字段名称映射到表和列名称。如果要更改基础数据库中的命名，则可以使用 `@@map` 属性指定自定义表名，并使用 `@@map` 字段属性指定自定义列名：

使用以下模型定义，基础数据库中的表将称为`users`，而映射到 `name` 字段的列为 `username`：

```prisma
model User {
  id    String  @id @default(cuid())
  name  String? @map("username")
  email String  @unique

  @@map("users")
}
```

这是执行迁移时 Lift 生成的 SQL 语句：

```sql
CREATE TABLE "hello-prisma2"."users" (
    "id" text NOT NULL,
    "username" text,
    "email" text NOT NULL DEFAULT ''::text,
    PRIMARY KEY ("id")
);
```

## 7. 下一步

恭喜你完成了第一个 Prisma 2 教程 🚀 以下是一些下一步的建议：

- 查看实例项目[REST](https://github.com/prisma/prisma-examples/tree/prisma2/typescript/rest-express),[GraphQL](https://github.com/prisma/prisma-examples/tree/prisma2/typescript/graphql) 或[gRPC](https://github.com/prisma/prisma-examples/tree/prisma2/typescript/grpc) APIs.
- 加入[Prisma 微信群](/wechat)
- [给 Prisma 2 提出意见和反馈](https://github.com/prisma/prisma2/blob/master/docs/prisma2-feedback.md)
- 🌟 在 GitHub 上给个星星呗
