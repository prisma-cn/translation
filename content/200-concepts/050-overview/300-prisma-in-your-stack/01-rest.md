---
title: 'REST'
metaTitle: '使用 Prisma 构建 REST 风格 API 服务'
metaDescription: '本文概述了使用 Prisma 构建 REST 风格 API 服务时最重要的部分。并提供了实际的例子和其支持的库'
---

<TopBlock>

当构建 REST 风格 API 服务时，Prisma Client 可以在你的 _路由控制器（route controller）_ 中使用，用来发送数据库查询。

![REST APIs with Prisma Client](https://res.cloudinary.com/prismaio/image/upload/v1628761155/docs/5NwAOMt.png)

</TopBlock>

## 支持的库

由于 Prisma Client 仅仅 "只" 负责向你的数据库发送查询，所以你可以选择在任意 HTTP 服务库或 Web 框架中使用它。

你可以在以下库或者框架中使用 Prisma：

- [Express](https://expressjs.com/)
- [koa](https://koajs.com/)
- [hapi](https://hapi.dev/)
- [Fastify](https://www.fastify.io/)
- [Sails](https://sailsjs.com/)
- [AdonisJs](https://adonisjs.com/)
- [NestJS](https://nestjs.com/)
- [Next.js](https://nextjs.org/)
- [Foal TS](https://foalts.org/)
- [Polka](https://github.com/lukeed/polka)
- [Micro](https://github.com/zeit/micro)
- [Feathers](https://feathersjs.com/)

## REST 风格 API 服务例子

假设你有一个类似下面这样的 Prisma schema：

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

generator client {
  provider = "prisma-client-js"
}

model Post {
  id        Int     @id @default(autoincrement())
  title     String
  content   String?
  published Boolean @default(false)
  author    User?   @relation(fields: [authorId], references: [id])
  authorId  Int?
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}
```

现在你可以实现一个路由控制器（route controller）（例如使用 Express），并在其中使用生成的 [Prisma Client API](../../../concepts/components/prisma-client) 执行数据库操作。本文中仅仅演示了几个代码示例片段，如果你想要执行这些代码片段，可以参考 [REST API example](https://github.com/prisma/prisma-examples/tree/latest/typescript/rest-express)。

#### `GET`

```ts
app.get('/feed', async (req, res) => {
  const posts = await prisma.post.findMany({
    where: { published: true },
    include: { author: true },
  })
  res.json(posts)
})
```

注意，在上面代码这种情况下， `feed` 接口会返回一个由 `Post` 对象包含 `author` 对象而组成的嵌套对象。下面是一个响应的例子：

```json
[
  {
    "id": "21",
    "title": "Hello World",
    "content": "null",
    "published": "true",
    "authorId": 42,
    "author": {
      "id": "42",
      "name": "Alice",
      "email": "alice@prisma.io"
    }
  }
]
```

#### `POST`

```ts
app.post(`/post`, async (req, res) => {
  const { title, content, authorEmail } = req.body
  const result = await prisma.post.create({
    data: {
      title,
      content,
      published: false,
      author: { connect: { email: authorEmail } },
    },
  })
  res.json(result)
})
```

#### `PUT`

```ts
app.put('/publish/:id', async (req, res) => {
  const { id } = req.params
  const post = await prisma.post.update({
    where: { id: Number(id) },
    data: { published: true },
  })
  res.json(post)
})
```

#### `DELETE`

```ts
app.delete(`/post/:id`, async (req, res) => {
  const { id } = req.params
  const post = await prisma.post.delete({
    where: {
      id: Number(id),
    },
  })
  res.json(post)
})
```

## 示例项目

你可以在 [`prisma-examples`](https://github.com/prisma/prisma-examples/) 仓库中找到几个可以运行的例子，展示了如何用 Prisma Client 实现 REST 风格 API。


| Example                                                                                                             | Language   | Stack        | Description                                                       |
| :------------------------------------------------------------------------------------------------------------------ | :--------- | ------------ | ----------------------------------------------------------------- |
| [`rest-nextjs-api-routes`](https://github.com/prisma/prisma-examples/tree/latest/typescript/rest-nextjs-api-routes) | TypeScript | 全栈    | Simple [Next.js](https://nextjs.org/) app (React) with a REST API |
| [`rest-express`](https://github.com/prisma/prisma-examples/tree/latest/typescript/rest-express)                     | TypeScript | 只有后端 | Simple REST API with Express                                      |
| [`rest-nextjs`](https://github.com/prisma/prisma-examples/tree/latest/javascript/rest-nextjs)                       | JavaScript | 全栈    | Simple [Next.js](https://nextjs.org/) app (React) with a REST API |
| [`rest-express`](https://github.com/prisma/prisma-examples/tree/latest/javascript/rest-express)                     | JavaScript | 只有后端 | Simple REST API with Express                                      |
