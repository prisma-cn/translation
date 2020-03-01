---
title: 在已有项目中使用Prisma
description: 本章示范如何在已有项目中加入Prisma，结合原先的项目和代码，改善效率和开发体验。
author: Victor
author_url: https://kangwenchang.com
author_image_url: https://kangwenchang.com/static/favicon/logocorner.png
author_title: Prisma 爱好者
---

如果你还没有数据库来学习 Prisma 或想直接找到适合你的代码示例，[点击此处](https://github.com/prisma/prisma-examples/)查看一些已经写好的模板，有 REST, GraphQL, gRPC 等例子。

## 简略版指南

按照以下步骤将 Prisma 与现有数据库一起使用。请注意，这些步骤假定你已经有一个 Node.js 或 TypeScript 项目(如果没有，请遵循下面的[完整指南](#完整指南))：

- 安装 prisma2 作为开发依赖项：`npm install prisma2 --save-dev`
- 运行`npx prisma2 init`创建一个空的[Pri​​sma schema](../prisma-schema-file.md)
- 将 Prisma schema 中`datasource`的`url`设置为你的数据库连接 URL
- 运行`prisma2 introspect`从数据库 schema 中获取数据模型 data model
- 运行`npm install @prisma/client`将 Prisma Client npm 包添加到你的项目中
- 运行`prisma2 generate`生成 Prisma Client
- 将 Prisma Client 导入你的代码：`import { PrismaClient } from '@prisma/client'`
- 实例化 Prisma Client：`const prisma = new PrismaClient()`
- 在代码中使用 Prisma Client(可使用编辑器的自动补全功能来探索其 API)

> **注意**：如果 Prisma 对于你的数据库 schema 的 introspection 自省失败，请[提交 issue](https://github.com/prisma/prisma2/issues/new)并告诉我们出了什么问题。如果你想帮助我们使 Prisma 更好用，请[与我们共享你的数据库 SQL schema](https://github.com/prisma/prisma2/issues/757)，以便我们可以将其添加到我们的 introspection 测试用例中。

## 完整指南

在本指南中，我们将更详细地完成上述步骤。

### 先决条件

本指南基于 Prisma 的[introspection](../introspection.md)功能，该功能正在不断改进。目前，它仍然具有以下限制：

- 每个列都需要在单个列上具有主键约束([尚不支持多列主键](https://github.com/prisma/prisma-client-js/issues/339))。如果不是这种情况，自省将失败。请注意，这通常使得无法对使用关系表(有时也称为“join tables”)的表结构进行 introspection，因为这些关系表通常没有单列主键。
- 尚不支持`ENUM`类型。内省将成功但是会忽略数据库 schema 中的`ENUM`类型。
- `TIMESTAMP WITH TIMEZONE`类型现在是支持的(映射到 Prisma 的`DateTime`类型)，但[当前无法用 Prisma Client 查询](https://github.com/prisma/prisma2/issues/1386)。

### 1.为你的数据库设置 Prisma

首先，运行以下命令以创建一个空的 Prisma schema 文件：

```
npx prisma2 init
```

这将创建一个空的 Prisma schema，看起来与此类似：

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// `datasource` 部分用于指定与数据库的连接。
// 设置 `provider` 字段和你的数据库类型相匹配: "postgresql", "mysql" 或 "sqlite".
// `url` 字段必须包含与数据库的连接字符串。
// 了解有关数据库连接字符串的更多信息: https://pris.ly/d/connection-strings
datasource db {
  provider = "postgresql" // 其他选择是: "mysql" 或 "sqlite"
  url      =  env("DATABASE_URL")
}
// 连接字符串的其他示例是:
// SQLite: url = "file:./dev.db"
// MySQL:  url = "mysql://admin:admin@localhost:3306/mydb"
// 你还可以使用环境变量来指定连接字符串: https://pris.ly/d/prisma-schema#using-environment-variables

// 通过添加 `generator` 部分, 你可以指定要生成Prisma的数据库客户端。
// 客户端是通过运行 `prisma generate` 命令生成的，位于`node_modules/@prisma`下，并可以在你的代码中导入:
// import { PrismaClient } from '@prisma/client'
generator client {
  provider = "prisma-client-js"
}

// 它还会创建一个`.env`文件，你可以使用该文件来设置环境变量。它包含一个数据库连接URL的占位符，该占位符定义为“DATABASE_URL”环境变量。
// 下一步：
// 1. 将数据库连接字符串替换“datasource”里的“url”
// 2. 执行 `prisma2 introspect` 使你的数据模型导入schema
// 3. 执行 `prisma2 generate` 来生成 Prisma Client JS
// 4. 开始在你的应用程序中使用Prisma Client JS
```

该文件包含许多注释，告诉你如何使用。

首先，你需要提供数据库的连接 URL 作为`datasource`的`url`。这是必填部分，以便 Prisma 可以解析数据库 schema 并生成 Prisma Client。

数据库的连接 URL 的格式通常取决于你使用的数据库(拼写全大写的部分是占位符，代表你的实际连接详细信息)：

- MySQL: `mysql://USER:PASSWORD@HOST:PORT/DATABASE`
- PostgreSQL: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA`
- SQLite: `file:./FILE.db`

例如，对于在 AWS 上托管的 PostgreSQL 数据库，[连接字符串](../core/connectors/postgresql.md#connection-string)可能和下面的类似：

```prisma
datasource db {
  provider = "postgresql"
  url      = "postgresql://opnmyfngbknppm:XXX@ec2-46-137-91-216.eu-west-1.compute.amazonaws.com:5432/d50rgmkqi2ipus?schema=hello-prisma2"
}
```

在本地运行 PostgreSQL 时，你的用户名和密码以及数据库名称通常对应于你操作系统的当前*user*，例如：

```prisma
datasource db {
  provider = "postgresql"
  url      = "postgresql://victor:victor@localhost:5432/victor?schema=hello-prisma2"
}
```

> **注意**：如果不确定为 PostgreSQL 连接 URL 的`schema`参数提供什么，则可以忽略它。在这种情况下，将使用默认 schema 名称`public`。例如`postgresql://victor:victor@localhost:5432/victor`

### 2.内省数据库以生成数据模型

下一步是运行 Prisma introspect 以获取数据模型 data model：

```
npx prisma2 introspect
```

> **注意**：如果 Prisma 对你的数据库 schema introspect 失败，请[提个 issue](https://github.com/prisma/prisma2/issues/new)并告诉我们出了什么问题。如果你想帮助我们使 Prisma 更好用，请[与我们共享你的数据库 SQL schema](https://github.com/prisma/prisma2/issues/757)，以便我们可以将其添加到我们的 introspect 测试用例中。

此命令连接到你的数据库并检查其 schema。然后，Prisma 将基于该 schema 将许多模型添加到 Prisma schema 文件中，这些模型代表你的应用程序的数据模型。该数据模型将成为 Prisma Client 生成的数据访问 API 的基础。

出于本指南的目的，我们使用以下 SQL schema：

```sql
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(256),
  email VARCHAR(256) UNIQUE NOT NULL
);

CREATE TABLE posts (
  post_id SERIAL PRIMARY KEY NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  title VARCHAR(256) NOT NULL,
  content TEXT,
  author_id INTEGER,
  FOREIGN KEY (author_id) REFERENCES users(user_id)
);

CREATE TABLE profiles (
  profile_id SERIAL PRIMARY KEY NOT NULL,
  bio TEXT,
  user_id INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

Prisma 的 introspection 会为上面的 SQL schema 生成以下数据模型：

```prisma
model posts {
  author_id  users?
  content    String?
  created_at DateTime?
  post_id    Int       @id
  title      String
}

model profiles {
  bio        String?
  profile_id Int     @id
  user_id    users
}

model users {
  email      String     @unique
  name       String?
  user_id    Int        @id
  posts      posts[]
  profiles    profiles[]
}
```

## 3.生成 Prisma Client

Prisma Client 是自动生成的且类型安全的数据库客户端，适合你的数据库架构。请注意，你将需要一个 Node.js/TypeScript 项目来生成 Prisma Client，因为它依赖于`@prisma/client`依赖项。在本指南中，将使用 TypeScript。

如果还没有，请运行以下命令来创建简单的 TypeScript 项目：

```
npm init -y
npm install typescript ts-node --save-dev
npm install @prisma/client
touch script.ts
touch tsconfig.json
```

接下来，将以下内容添加到你的`tsconfig.json`中：

```json
{
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "lib": ["esnext"],
    "strict": true
  },
  "include": ["src/**/*"]
}
```

现在你可以生成 Prisma Client：

```
npx prisma2 generate
```

你的 Prisma Client API 现在可以从`node_modules/@prisma/client`中使用了。

## 4.使用 Prisma Client 读取和写入数据库中的数据

设置好 TypeScript 后，将以下代码添加到`script.ts`中：

```ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: {
      posts: true,
    },
  });
  console.log(JSON.stringify(users));
}

main()
  .catch(e => {
    throw e;
  })
  .finally(async () => {
    await prisma.disconnect();
  });
```

这是一个简单的 API 调用，可从`users`表中获取所有记录。你可以使用以下命令运行脚本：

```
npx ts-node script.ts
```

如果你在本指南中使用了自己的数据库并且不确定要查询的内容，则可以打`prisma.`使用编辑器的自动补全功能来帮助创建查询，然后按<kbd>CTRL</kbd>+<kbd>SPACE</kbd> 可以建议你使用任何模型作为查询。选择模型并随后添加另一个点`.`后，你可以再次使用<kbd>CTRL</kbd>+<kbd>SPACE</kbd> 决定对模型进行操作(例如，`findMany`, `create`, `update`, ...)。选择操作之后，你可以再次调用自动完成功能探索提供的参数。

![auto](/prisma2/p4kdfhH.gif)
