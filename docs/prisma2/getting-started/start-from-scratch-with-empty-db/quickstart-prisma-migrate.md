---
title: 使用Prisma Migrate开始
description: 本章示范用Prisma Migrate创建新数据库和项目，直接用Prisma执行DDL。
author: Victor
author_url: https://kangwenchang.com
author_image_url: https://kangwenchang.com/static/favicon/logocorner.png
author_title: Prisma 爱好者
---

本章内容为将 Prisma 连接到空数据库来开始新项目。它使用 Prisma Migrate 构建和迁移数据库 schema。

> **警告**：Prisma Migrate 目前处于**experimental**状态。使用以下任何命令时，你都需要加上如下参数`--experimental`，例如`prisma2 migrate save --name 'init' --experimental`

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
5.  将模型添加到 Prisma schema 中，例如：

    ```prisma
    model Post {
      post_id    Int      @id @default(autoincrement())
      content    String?
      title      String
      author     User?
    }

    model Profile {
      profile_id Int     @id @default(autoincrement())
      bio        String?
      user       User
    }

    model User {
      user_id  Int       @id @default(autoincrement())
      email    String    @unique
      name     String?
      posts    Post[]
      profiles Profile[]
    }
    ```

6.  在 Prisma schema 中添加一个`generator`用来生成 Prisma Client：
    ```prisma
    generator client {
      provider = "prisma-client-js"
    }
    ```
7.  运行以下命令来配置你的项目(TypeScript)：
    ```
    npm init -y
    npm install typescript ts-node prisma2 --save-dev
    npm install @prisma/client
    ```
8.  运行`touch tsconfig.json`并复制下面的代码到里面：
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
9.  通过运行以下命令来构建数据库：
    ```
    npx prisma2 migrate save --name 'init' --experimental
    npx prisma2 migrate up --experimental
    ```
10. 执行以下命令根据你的 data model 生成 Prisma Client：
    `npx prisma2 generate`
11. 运行`touch index.ts`创建一个 ts 文件并添加以下代码：

    ````ts
    import { PrismaClient } from '@prisma/client';

        const prisma = new PrismaClient();

        async function main() {
          const user1 = await prisma.user.create({
            data: {
              email: 'alice@prisma.io',
              name: 'Alice',
              posts: {
                create: {
                  title: 'Watch the talks from Prisma Day 2019',
                  content: 'https://www.prisma.io/blog/z11sg6ipb3i1/',
                },
              },
            },
            include: {
              posts: true,
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

    ````

12. 运行`npx ts-node index.ts`启动 node.js 执行脚本，你将会在终端看到`user1`成功写入数据库的信息。
