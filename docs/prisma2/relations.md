---
title: 关联(Relations)
description: 本章是数据建模(data modeling)章节的扩展，详细讨论了数据模型定义中的关联(relations)部分。
author: 许盛
author_url: https://github.com/xuxusheng
author_image_url: https://github.com/xuxusheng.png?size=400
author_title: qq：20691718，欢迎交流。
---

本章是[数据建模(data modeling)](./data-modeling.md)章节的扩展，详细讨论了数据模型定义中的关联(relations)部分。

页面中的例子都基于这个 [schema 文件](./data-modeling.md)：

```prisma
// schema.prisma

datasource mysql {
  url      = "file:data.db"
  provider = "sqlite"
}

model User {
  id        Int      @id
  posts     Post[]
  profile    Profile?
}

model Profile {
  id   Int    @id
  user User
}

model Post {
  id         Int        @id
  author     User
  categories Category[]
}

model Category {
  id    Int    @id
  posts Post[]
}

enum Role {
  USER
  ADMIN
}
```

> 注意所有的[标量类型(scalars)](./data-modeling.md/#scalar-types)都在示例的的数据模型中移除了，以便专注于关联(relations)的学习。

它包含了以下几种关联(relations)：

- 1:1: `User` <-> `Profile`
- 1:n: `User` <-> `Post`
- m:n: `Post` <-> `Category`

## 什么时候需要反向关联(back-relation)字段？

在很多情况下你都可以忽略反向关联，prisma2 会用特定的方式去推断它。

- **如果你想要一对一(1：1)的关联，你必须始终指定两个关联字段。** Prisma2 会保证关联的每一侧只能存储一个值。
- **如果你想要多对多(m：n)的关联，你必须始终指定两个关联字段。** Prisma2 将会维护一个关联表来追踪所有关联的实例。
- **如果你忽略一个关联字段，该关联将被自动推断为一对多(1:n)的关联。**
  - 如果你忽略了另一端为 _非列表关联字段(non-list relation field)_ 的关联中的反向关联字段，这将会被推断为一对多(1：n)的关联，这意味着缺失的反向关联字段被默认为 _列表(list)_。
  - 如果你忽略了另一端为 _列表关联字段(list relation field)_ 的关联中的反向关联字段，这将会被推断为一对多(1：n)的关联，这意味着缺失的反向关联字段被默认为 _单个值(single value)_(不是 _列表_)。

> **注意**：这种推断可能很快就会改变，并且可能总是要求双方都明确表述关联关系。请遵循[规范](https://github.com/prisma/specs/tree/master/schema#relations)以获取更多信息。

## `@relation` 属性

`@relation` 属性可以在一定程度上消除关联关系的歧义。

用法如下：

```prisma
@relation(_name: String?, references: Identifier[]?)
```

- `references` _(可选)_：要引用的[字段](./data-modeling.md#fields)列表。
- `name` _(可选)_：定义关联关系的 _名称_。如果是多对多(m：m)的关联, 这个名字还决定了底层数据库中关联表的名称。

> **注意**：级联删除尚未实现。你可以在这个 [GitHub issue](https://github.com/prisma/prisma2/issues/267) 中查看这个功能的进度。

## 1:1

要保持 1：1 关联，必须始终在关联的两端指定关联字段。 Prisma 可以防止在关联中意外存储多个记录。

```prisma
model User {
  id        Int      @id
  profile    Profile?
}

model Profile {
  id   Int    @id
  user User
}
```

对于 1：1 的关联关系，你将外键存储在哪一侧都没有关系。Prisma 有一个惯例，外键会加在数据模型中按照字母顺序先出现的模型上。在上面的例子中，就是 `Profile` 模型。

在底层，数据表如下所示：

| **User** |         |
| -------- | ------- |
| id       | integer |

| **Profile** |         |
| ----------- | ------- |
| id          | integer |
| user        | integer |

你可以使用 `@relation` 属性来明确指定将外键存储在关联关系的哪一侧。如果你希望存储在 `User` 表中，而不是在 `Profile` 表中，你可以通过下面这种方式来实现：

```prisma
model User {
  id        Int      @id
  profile    Profile?  @relation(references: [id])
}

model Profile {
  id   Int    @id
  user User
}
```

现在，表结构如下所示：

| **User** |         |
| -------- | ------- |
| id       | integer |
| profile  | integer |

| **Profile** |         |
| ----------- | ------- |
| id          | integer |

如果你针对已经存在的数据库进行内省，而外键并没有遵循字母先后顺序的约定，Prisma 会使用 [`@relation`](#the-relation-attribute) 属性来进行声明。

```prisma
model User {
  id        Int        @id
  customer  Profile?    @relation(references: id)
}

model Profile {
  id    Int     @id
  user  User?
}
```

## 1:n

指定 1：n 的关联关系时，你可以省略任意一侧，以下三种关联是等价的。

```prisma
// 两侧的关联字段都指定
model User {
  id        Int      @id
  posts     Post[]
}

model Post {
  id         Int        @id
  author     User
}
```

```prisma
// 忽略 `posts` 字段
model User {
  id        Int      @id
}

model Post {
  id         Int        @id
  author     User
}
```

```prisma
// 忽略 `author` 字段
model User {
  id        Int      @id
  posts     Post[]
}

model Post {
  id         Int        @id
}
```

> **注意**：此行为可能很快就会改变，并且可能始终需要双方都明确表述关联关系。请遵循[规范](https://github.com/prisma/specs/blob/remove/implicit/schema/Readme.md#relations)以获取更多信息。

在这个例子中，`Post.author` 始终指向 `User` 的主键。

关系型数据库的连接器(Connectors)会将其实现为两个表，并在 `Post` 表上使用外键进行约束：

| **User** |         |
| -------- | ------- |
| id       | integer |

| **Post** |         |
| -------- | ------- |
| id       | integer |
| author   | integer |

你可以省略 `Post.author`，同时关联关系将保持不变，如果关联关系的一侧字段缺失了，Prisma 会默认使用这个字段指向的模型的名称来作为字段名称。如果你省略了 `User.posts`，Prisma 会隐式的加上 `User.post` 字段，将关联关系从 `1:n` 替换为 `1:1`。

## m:n

双方的返回值都有可能是一个为空的列表，这是对关系型数据库中标准实现的改进，关系型数据库要求应用程序开发人员处理诸如中间关系表之类的实现细节。在 Prisma 中，每个连接器都将以给定存储引擎上最有效的方式来实现此概念，暴露 API 的同时隐藏了实现细节。

```prisma
model Post {
  id         Int        @id
  categories Category[]
}

model Category {
  id    Int    @id
  posts Post[]
}
```

Prisma 会为每个模型创建一张表，并加上下面所示的关联表：

| **Post** |         |
| -------- | ------- |
| id       | integer |

| **Category** |         |
| ------------ | ------- |
| id           | integer |

| **\_CategoryToPost** |         |
| -------------------- | ------- |
| id                   | integer |

要修改关联表的名称，你可以使用 `@relation` 属性的 `name` 参数：

```prisma
model Post {
  id         Int        @id
  categories Category[] @relation(name: "MyRelationTable")
}

model Category {
  id    Int    @id
  posts Post[] @relation(name: "MyRelationTable")
}
```

在底层数据库中的表结构如下：

| **Post** |         |
| -------- | ------- |
| id       | integer |

| **Category** |         |
| ------------ | ------- |
| id           | integer |

| **\_MyRelationTable** |         |
| --------------------- | ------- |
| id                    | integer |

> **注意**：现在无法删除关系表名称的下划线，但很快就会支持。在[规范](https://github.com/prisma/specs/blob/master/schema/Readme.md#explicit-many-to-many-mn-relationships)中了解更多信息。

## 自引用(Self-relations)

Prisma 支持 _自引用关联关系(self-referential relations)_(short: _self relations_)，自引用是指一个模型不引用其他模型，而引用自身的关联关系，例如：

```prisma
model User {
  id         Int   @id
  reportsTo  User
}
```

这会被作为 1：1 的关联关系处理，结果如下表所示：

| **User**  |         |
| --------- | ------- |
| id        | integer |
| reportsTo | integer |

对于 1：n 的关联关系，你需要让自引用字段是一个列表：

```prisma
model User {
  id         Int     @id
  reportsTo  User[]
}
```

如果你想要添加一个反向关联字段，你需要在两侧的关联字段都添加 `@relation` 属性来消除歧义。

```prisma
model User {
  id           String  @default(cuid()) @id
  email        String? @unique
  reportsTo    User[]  @relation(name: "reportsTo")
  reportedToBy User    @relation(name: "reportsTo")
}
```

同样的，对于 m：n 的关联关系来说也必须要加上 `@relation` 属性。

```prisma
model User {
  id           String  @default(cuid()) @id
  email        String? @unique
  reportsTo    User[]  @relation(name: "reportsTo")
  reportedToBy User[]  @relation(name: "reportsTo")
}
```

如果你的模型有不止一个自引用，你必须明确的加上所有的关联字段，同时用 `@relation` 属性来指定它们。

```prisma
model User {
  id           String  @default(cuid()) @id
  email        String? @unique
  reportsTo    User[]  @relation(name: "reportsTo")
  reportedToBy User[]  @relation(name: "reportsTo")
  created      User    @relation(name: "created")
  createdBy    User    @relation(name: "created")
}
```

## 自动生成的 Prisma Client JS API 中的关联(Relations)

[自动生成的 Prisma Client JS API](./prisma-client-js/api.md)附带了许多非常有用的与关联相关的功能(示例如下)：

- 使用 Fluent API 遍历返回的对象上的关联关系。
- 基于事务的嵌套创建、更新和连接(也称为嵌套写入)
- 通过 `select` 和 `include` 嵌套读取(eager loading)
- 关联过滤器(关联对象上的过滤器，例如在应用过滤器之前执行 JOIN)

### Fluent API

Fluent API 可以通过函数调用遍历模型之间的关联关系，需要注意的是最后一个函数调用的最后一个模型决定了整个请求返回的内容。

这个请求会返回指定 `user` 的所有 `post`：

```ts
const postsByUser: Post[] = await prisma.user
  .findOne({ where: { email: 'ada@prisma.io' } })
  .posts();
```

这个请求会返回指定 `post` 的所有 `category`；

```ts
const categoriesOfPost: Category[] = await prisma.post.findOne({ where: { id: 1 } }).categories();
```

尽管 Fluent API 允许你使用可链式调用的查询，有时你可能想要在已经知道特定字段的情况下处理特定的模型(比如获取指定 `author` 的所有 `post`)。

查询如下所示：

```ts
const postsByUser: Post[] = await prisma.post.findMany({
  where: {
    author: { id: author.id },
  },
});
```

注意，如果要查询关联关系，你必须要指定搜索字段的(`id`)。

### 嵌套写入 (事务)

嵌套写入提供了一个强大的 API 来将关联数据写入你的数据库。并进一步对在同一个 Prisma Client JS API 调用中跨多个表的创建、更新和删除操作提供了事务保证。嵌套写入的嵌套级别可以是任意深度的。

当使用模型的创建(`create`)或更新(`update`)函数时，模型的关联字段可以使用嵌套写入。每个函数都可以使用下列的嵌套写入操作。

- 一对一(1：1)关联字段 (例如上面示例数据模型中 `User` 的 `profile` 字段)
  - `create`
    - `create`: 创建新的 user 和新的 profile
    - `connect`: 创建新的 user 并关联到现有 profile
  - `update`
    - `create`: 通过创建新的 profile 来更新 user
    - `connect`: 通过关联到现有 profile 来更新 user
    - `update`: 通过更新关联的 profile 来更新 user
    - `upsert`: 通过更新关联的 profile 或创建新 profile 来更新 user
    - `delete` (仅当关联是可选的情况下): 删除现有 profile 来更新 user
    - `disconnect` (仅当关联是可选的情况下): 通过移除和 profile 的关联来更新 user
- 一对多(1：n)关联字段 (例如上面示例数据模型中 `User` 的 `posts` 字段)
  - `create`
    - `create`: 创建一个新 user 和一个或多个新 post
    - `connect`: 创建一个新 user 并关联到一个或多个现有 post
  - `update`
    - `create`: 创建一个或多个 post 来更新现有 user
    - `connect`: 通过关联到一个或多个现有 post 来更新 user
    - `set`: 通过关联到一个或多个现有 post 并替换现有的关联关系来更新 user
    - `disconnect`: 通过移除和一个或多个 post 的关联关系来更新 user
    - `update`: 通过更新一个或多个相关联的 post 来更新 user
    - `delete`: 通过删除一个或多个相关联的 post 来更新 user
    - `updateMany`: 通过更新一个或多个相关联的 post 来更新 user
    - `deleteMany`: 通过删除一个或多个相关联的 post 来更新 user
    - `upsert`: 通过更新一个或多个相关联的 post，或创建一个或多个新 post 来更新 user

这里有一些嵌套写入的例子：

```ts
// 在一次事务中创建一个 user 和相关联的两个 post
const newUser: User = await prisma.user.create({
  data: {
    email: 'alice@prisma.io',
    posts: {
      create: [
        { title: 'Join the Prisma Slack on https://slack.prisma.io' },
        { title: 'Follow @prisma on Twitter' },
      ],
    },
  },
});
```

```ts
// 一次事务中更改 post 的 author
const updatedPost: Post = await prisma.post.update({
  where: { id: 5424 },
  data: {
    author: {
      connect: { email: 'alice@prisma.io' },
    },
  },
});
```

```ts
// 一次事务中移除 post 的 author
const post: Post = await prisma.post.update({
  data: {
    author: { disconnect: true },
  },
  where: {
    id: 'ck0c7jl4t0001jpcbfxft600e',
  },
});
```

在下个示例中，假设有一个叫做 `Comment` 的模型，并关联到 `User` 和 `Post`，如下所示：

```prisma
model User {
  id       String    @default(cuid()) @id
  posts    Post[]
  comments Comment[]
  // ...
}

model Post {
  id         String     @default(cuid()) @id
  author     User?
  comments   Comment[]
  // ...
}

model Comment {
  id        String @default(cuid()) @id
  text      String
  writtenBy User
  post      Post
  // ...
}

// ...
```

由于在 `User`，`Post`，`Comment` 之间存在循环的关联关系，你可以任意嵌套你的写入操作：

```ts
// 在深度嵌套操作中，创建新 post，同时关联到现有的 user，并创建新的 comment、user 以及 post
const post = await prisma.post.create({
  data: {
    author: {
      connect: {
        email: 'alice@prisma.io',
      },
    },
    comments: {
      create: {
        text: 'I am Sarah and I like your post, Alice!',
        writtenBy: {
          create: {
            email: 'sarah@prisma.io',
            name: 'Sarah',
            posts: {
              create: {
                title: "Sarah's first blog post",
                comments: {
                  create: {
                    text: 'Hi Sarah, I am Bob. I like your blog post.',
                    writtenBy: {
                      create: {
                        email: 'bob@prisma.io',
                        name: 'Bob',
                        posts: {
                          create: {
                            title: 'I am Bob and this is the first post on my blog',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
});
```

### 嵌套读取 (贪婪加载 eager loading)

你可以通过 `select` 和 `inclue`(在[这里](./prisma-client-js/api.md#manipulating-the-selection-set)了解更多的不同之处)来贪婪加载(eager loading)(译者注：一次请求获取多个实体数据)模型上的关联关系。贪婪加载的模型关联关系可以嵌套任意深度。

```ts
// 返回的 `post` 对象会只包含 `id` 属性，和对应各自的用户对象的 `author` 属性。
const allPosts = await prisma.post.findMany({
  select: {
    id: true,
    author: true,
  },
});
```

```ts
// 返回的 post 对象会包含 `Post` 模型中所有的标量类型，以及每个 post 的所有分类信息(categories)
const allPosts = await prisma.post.findMany({
  include: {
    categories: true,
  },
});
```

```ts
// 返回的对象会包含 `User` 模型的所有标量类型，以及他们对应的所有 post 数据，以及 post 对应的 author，以及 author 对应的所有 post 数据。该嵌套仅展示，并无实际意义。
await prisma.user.findMany({
  include: {
    posts: {
      include: {
        author: {
          include: {
            posts: true,
          },
        },
      },
    },
  },
});
```

### 关联过滤器(Relation filters)

关联过滤器是针对模型的关联对象的过滤操作，在 SQL 术语中，这意味着在应用过滤器之前已经执行了 JOIN。

```ts
// 取出指定用户所有标题以“hello”开头的文章。
const posts: Post[] = await prisma.user
  .findOne({
    where: { email: 'ada@prisma.io' },
  })
  .posts({
    where: {
      title: { startsWith: 'Hello' },
    },
  });
```
