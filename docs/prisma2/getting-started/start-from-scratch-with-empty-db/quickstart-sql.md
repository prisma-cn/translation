---
title: 用SQL创建数据库开始
description: 本章示范在新数据库中执行SQL并使用Prisma migrations 解析后进行开发。
author: Victor
author_url: https://kangwenchang.com
author_image_url: https://kangwenchang.com/static/favicon/logocorner.png
author_title: Prisma 爱好者
---

## 目录

- 选择你的数据库:
  - [PostgreSQL](#postgresql)
  - [MySQL](#mysql)
  - [SQLite](#sqlite)

## PostgreSQL

请按照以下步骤进行初始设置：

1.  运行`mkdir hello-prisma`创建你的项目目录
2.  运行`cd hello-prisma`进入目录
3.  运行`touch schema.prisma`创建一个空的[Pri​​sma schema](../../prisma-schema-file.md)
4.  在 Prisma schema 中添加一个`datasource`，并将你的数据库连接字符串设置为`url`，例如：
    ```prisma
    datasource db {
      provider = "postgresql"
      url      = "postgresql://janedoe:janedoe@localhost:5432/hello-prisma"
    }
    ```
5.  执行 `touch schema.sql` 来创建你的 SQL schema ，将下面的代码复制进去:

    ```sql
    CREATE TABLE "public"."User" (
      user_id SERIAL PRIMARY KEY NOT NULL,
      name VARCHAR(255),
      email VARCHAR(255) UNIQUE NOT NULL
    );

    CREATE TABLE "public"."Post" (
      post_id SERIAL PRIMARY KEY NOT NULL,
      title VARCHAR(255) NOT NULL,
      content TEXT,
      author_id INTEGER,
      FOREIGN KEY (author_id) REFERENCES "public"."User"(user_id)
    );

    CREATE TABLE "public"."Profile" (
      profile_id SERIAL PRIMARY KEY NOT NULL,
      bio TEXT,
      user_id INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES "public"."User"(user_id)
    );
    ```

6.  运行以下命令来构建数据库 schema:
    ```
    psql -h __HOST__ -d __DATABASE__ -U __USER__ -f schema.sql
    ```
    请注意，你需要使用你真实的数据库信息替换大写的占位符，例如:
    ```
    psql -h localhost -d hello-prisma -U janedoe -f schema.sql
    ```
7.  在 Prisma schema 中添加一个`generator`用来生成 Prisma Client：
    ```prisma
    generator client {
      provider = "prisma-client-js"
    }
    ```
8.  配置项目 (TypeScript):
    ```
    npm init -y
    npm install typescript ts-node prisma2 --save-dev
    npm install @prisma/client
    ```
9.  运行`prisma2 introspect`从数据库 schema 中获取数据模型 data model 到 Prisma schema 中
10. 运行`prisma2 generate`生成 Prisma Client
11. 运行`touch tsconfig.json`并复制下面的代码到里面：
    ```json
    {
      "compilerOptions": {
        "sourceMap": true,
        "outDir": "dist",
        "strict": true,
        "lib": ["esnext", "dom"],
        "esModuleInterop": true
      }
    }
    ```
12. 运行`touch index.ts`创建一个 ts 文件并添加以下代码：

    ```ts
    import { PrismaClient } from '@prisma/client';

    const prisma = new PrismaClient();

    async function main() {
      const user1 = await prisma.user.create({
        data: {
          email: 'alice@prisma.io',
          name: 'Alice',
          post: {
            create: {
              title: 'Watch the talks from Prisma Day 2019',
              content: 'https://www.prisma.io/blog/z11sg6ipb3i1/',
            },
          },
        },
        include: {
          post: true,
        },
      });
      console.log(user1);
    }

    main()
      .catch(e => console.error(e))
      .finally(async () => {
        await prisma.disconnect();
      });
    ```

13. 运行`npx ts-node index.ts`启动 node.js 执行脚本，你将会在终端看到`user1`成功写入数据库的信息。

## MySQL

请按照以下步骤进行初始设置：

1.  运行`mkdir hello-prisma`创建你的项目目录
2.  运行`cd hello-prisma`进入目录
3.  运行`touch schema.prisma`创建一个空的[Pri​​sma schema](../../prisma-schema-file.md)
4.  在 Prisma schema 中添加一个`datasource`，并将你的数据库连接字符串设置为`url`，例如：
    ```prisma
    datasource db {
      provider = "mysql"
      url      = "mysql://root:admin@localhost:3306/hello-prisma"
    }
    ```
5.  执行 `touch schema.sql` 来创建你的 SQL schema ，将下面的代码复制进去:

    ```sql
    CREATE TABLE User (
      user_id BIGINT NOT NULL AUTO_INCREMENT,
      name VARCHAR(255),
      email VARCHAR(255) UNIQUE NOT NULL,
      PRIMARY KEY (user_id)
    );

    CREATE TABLE Post (
      post_id BIGINT NOT NULL AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      content TEXT,
      author_id BIGINT,
      PRIMARY KEY (post_id),
      FOREIGN KEY (author_id) REFERENCES User(user_id)
    );

    CREATE TABLE Profile (
      profile_id BIGINT NOT NULL AUTO_INCREMENT,
      bio TEXT,
      user_id BIGINT NOT NULL,
      PRIMARY KEY (profile_id),
      FOREIGN KEY (user_id) REFERENCES User(user_id)
    );
    ```

6.  运行以下命令来构建数据库 schema:
    ```
    mysql -u __USER__ -p __DATABASE__ < schema.sql
    ```
    请注意，你需要使用你真实的数据库信息替换大写的占位符，例如:
    ```
    mysql -u root -p hello-prisma < schema.sql
    ```
7.  在 Prisma schema 中添加一个`generator`用来生成 Prisma Client：
    ```prisma
    generator client {
      provider = "prisma-client-js"
    }
    ```
8.  配置项目 (TypeScript):
    ```
    npm init -y
    npm install typescript ts-node prisma2 --save-dev
    npm install @prisma/client
    ```
9.  运行`prisma2 introspect`从数据库 schema 中获取数据模型 data model 到 Prisma schema 中
10. 运行`prisma2 generate`生成 Prisma Client
11. 运行`touch tsconfig.json`并复制下面的代码到里面：
    ```json
    {
      "compilerOptions": {
        "sourceMap": true,
        "outDir": "dist",
        "strict": true,
        "lib": ["esnext", "dom"],
        "esModuleInterop": true
      }
    }
    ```
12. 运行`touch index.ts`创建一个 ts 文件并添加以下代码：

    ```ts
    import { PrismaClient } from '@prisma/client';

    const prisma = new PrismaClient();

    // A `main` function so that we can use async/await
    async function main() {
      const user1 = await prisma.user.create({
        data: {
          email: 'alice@prisma.io',
          name: 'Alice',
          post: {
            create: {
              title: 'Watch the talks from Prisma Day 2019',
              content: 'https://www.prisma.io/blog/z11sg6ipb3i1/',
            },
          },
        },
        include: {
          post: true,
        },
      });
      console.log(user1);
    }

    main()
      .catch(e => console.error(e))
      .finally(async () => {
        await prisma.disconnect();
      });
    ```

13. 运行`npx ts-node index.ts`启动 node.js 执行脚本，你将会在终端看到`user1`成功写入数据库的信息。

## SQLite

请按照以下步骤进行初始设置：

1.  运行`mkdir hello-prisma`创建你的项目目录
2.  运行`cd hello-prisma`进入目录
3.  运行`touch schema.prisma`创建一个空的[Pri​​sma schema](../../prisma-schema-file.md)
4.  在 Prisma schema 中添加一个`datasource`，并将你的数据库连接字符串设置为`url`，例如：
    ```prisma
    datasource db {
      provider = "sqlite"
      url      = "file:./hello-prisma.db"
    }
    ```
5.  执行 `touch schema.sql` 来创建你的 SQL schema ，将下面的代码复制进去:

    ```sql
    CREATE TABLE User (
      user_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(255),
      email VARCHAR(255) UNIQUE NOT NULL
    );

    CREATE TABLE Post (
      post_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      title VARCHAR(255) NOT NULL,
      content TEXT,
      author_id INTEGER,
      FOREIGN KEY (author_id) REFERENCES User(user_id)
    );

    CREATE TABLE Profile (
      profile_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      bio TEXT,
      user_id INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES User(user_id)
    );
    ```

6.  运行以下命令以从 `schema.sql`文件中创建 SQLite 数据库:
    ```
    sqlite3 hello-prisma.db < schema.sql
    ```
7.  在 Prisma schema 中添加一个`generator`用来生成 Prisma Client：
    ```prisma
    generator client {
      provider = "prisma-client-js"
    }
    ```
8.  配置项目 (TypeScript):
    ```
    npm init -y
    npm install typescript ts-node prisma2 --save-dev
    npm install @prisma/client
    ```
9.  运行`prisma2 introspect`从数据库 schema 中获取数据模型 data model 到 Prisma schema 中
10. 运行`prisma2 generate`生成 Prisma Client
11. 运行`touch tsconfig.json`并复制下面的代码到里面：
    ```json
    {
      "compilerOptions": {
        "sourceMap": true,
        "outDir": "dist",
        "strict": true,
        "lib": ["esnext", "dom"],
        "esModuleInterop": true
      }
    }
    ```
12. 运行`touch index.ts`创建一个 ts 文件并添加以下代码：

    ```ts
    import { PrismaClient } from '@prisma/client';

    const prisma = new PrismaClient();

    async function main() {
      const user1 = await prisma.user.create({
        data: {
          email: 'alice@prisma.io',
          name: 'Alice',
          post: {
            create: {
              title: 'Watch the talks from Prisma Day 2019',
              content: 'https://www.prisma.io/blog/z11sg6ipb3i1/',
            },
          },
        },
        include: {
          post: true,
        },
      });
      console.log(user1);
    }

    main()
      .catch(e => console.error(e))
      .finally(async () => {
        await prisma.disconnect();
      });
    ```

13. 运行`npx ts-node index.ts`启动 node.js 执行脚本，你将会在终端看到`user1`成功写入数据库的信息。
