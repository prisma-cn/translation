---
title: Prisma 2 数据建模
description: 数据模型(data model)是 schema 文件的重要组成部分, 这篇主要介绍数据模型(data model)相关的组成元素。
author: HaveF
author_url: https://havef.github.io/
author_image_url: https://avatars1.githubusercontent.com/u/54462?s=460&v=4
author_title: 数据分析、机器学习、JS/TS技术爱好者
---

- [数据模型定义](#数据模型定义)
- [示例](#示例)
- [模型(models)](<#模型(models)>)
- [IDs](#ids)
- [字段(Fields)](<#字段(Fields)>)
- [枚举类型](#枚举类型)
- [属性](#属性)
- [索引](#索引)
- [函数](#函数)
- [标量类型](#标量类型)
- [关系(relations)](<#关系(relations)>)
- [保留的模型名称](#保留的模型名称)

## 数据模型定义

数据模型定义 (简称为: 数据模型, 即 data model 或 datamodel) 是你 [schema 文件](./prisma-schema-file.md) 的一个组成部分.

它描述了每个数据源中的数据形态(shape). 例如, 当连接到一个 _关系型数据库_ 时, 数据模型定义就是 _数据库架构(schema)_(表, 列, 索引等) 的一个陈述式的描述.

## 例子

下面是一个基于同一目录下的 SQLite 数据库(`data.db`) 的 schema 文件例子:

```prisma
// schema.prisma

datasource sqlite {
  url      = "file:data.db"
  provider = "sqlite"
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  post      Post[]
  profile    Profile?
}

model Profile {
  id   Int    @id @default(autoincrement())
  user User
  bio  String
}

model Post {
  id         Int        @id @default(autoincrement())
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
  author     User
  title      String
  published  Boolean    @default(false)
  category   Category[]
}

model Category {
  id    Int    @id @default(autoincrement())
  name  String
  post  Post[]
}

enum Role {
  USER
  ADMIN
}
```

虽然这个文件主要由数据模型定义组成, 但它仍然是一个有效的 [schema 文件](./prisma-schema-file.md), 因为在这里例子中它还指定了数据源连接器(这个例子中是 SQLite 连接器).

## 模型(models)

模型(models)代表了你应用程序域(application domain)中的实体. 在数据模型中, 他们是使用 `model` 代码块定义的. 在上面的[示例](#示例)中, `User`, `Profile`, `Post` `Category` 都是模型. 下面是其中的 `User` 模型供参考:

```prisma
model User {
  id        Int      @id
  createdAt DateTime @default(now())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  post      Post[]
  profile    Profile?
}
```

在技术层面上讲, 模型映射了数据源的底层结构, 例如:

- 在 PostgreSQL, 模型(model) 映射了 _一张表_
- 在 MySQL, 模型(model) 映射了 _一张表_
- 在 SQLite, 模型(model) 映射了 _一张表_

> **注**: 在未来可能会有非关系型数据库或是其他数据源的连接器. 比如, 对于 MongoDB 来说, 模型(model)可以被映射到一个 _集合(collection)_ 上, 对于 REST API 来说, 它可以被映射到一个 _资源(resource)_ 上.

### 命名模型(Naming models)

模型通常使用[驼峰式拼写 PascalCase](http://wiki.c2.com/?PascalCase), 并且使用单数形式 (比如使用 `User` 而非 `Users`).

技术上讲, 一个模型可以被命名为任何符合下面这个正则表达式的字符串:

```
[A-Za-z_][A-Za-z0-9_]*
```

### Prisma Client JS API 中的模型操作(CRUD)

在生成的 [Prisma Client JS API](./prisma-client-js/api.md) 中, 数据模型定义中的每一个模型都会有一系列的 CRUD 操作:

- `findMany`
- `findOne`
- `create`
- `update`
- `upsert`
- `delete`
- `updateMany`
- `deleteMany`

可以通过 Prisma Client JS 实例上生成的属性使用这些操作。

下面是[Prisma Client JS API](./prisma-client-js/api.md)中 `user` 属性使用的例子:

```js
const newUser = await prisma.user.create({
  data: {
    name: 'Alice',
  },
});
const allUsers = await prisma.user.findMany();
```

## IDs

Prisma 模式中的每个模型都需要有唯一的 ID. 在关系数据库中，此唯一 ID 对应于具有主键约束的列。另外，[复合主键还不受支持](https://github.com/prisma/prisma-client-js/issues/339)(但很快就会支持)。

要确定模型的哪个字段是 ID 字段，可以使用 `@id` 属性对其进行注释。 带有 `@id` 属性注释的字段必须是 String 或 Int 类型:

```prisma
model User {
  id    String  @id
  name  String
}
```

或

```prisma
model User {
  id    Int     @id
  name  String
}
```

注意, 在上述情况下，使用 Prisma Client JS 为 `User` 模型创建新记录时，必须自己提供 ID 值，例如:

```ts
const newUser = await prisma.user.create({
  data: {
    id: 1,
    name: 'Alice',
  },
});
```

也可以 **为 IDs 指定默认值**. 支持的方式有:

- `String`:
  - `cuid`: Prisma 会根据 [`cuid`](https://github.com/ericelliott/cuid) 产生一个全局唯一值并进行设定
  - `uuid`: Prisma 会根据 [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) 产生一个全局唯一值并进行设定
- `Int`:
  - `autoincrement`: Prisma 会在底层数据库中产生一个整数序列, 将序列中的值做为记录的 ID 值. 在 PostgreSQL 中这相当于使用 [`SERIAL`](https://www.postgresql.org/docs/9.1/datatype-numeric.html#DATATYPE-SERIAL).

下面是使用模型默认值的例子:

```prisma
model User {
  id    String  @id @default(cuid())
  name  String
}
```

or

```prisma
model User {
  id    String  @id @default(uuid())
  name  String
}
```

或

```prisma
model User {
  id    Int     @id @default(autoincrement())
  name  String
}
```

## 字段(Fields)

[模型(models)](<#模型(models)>)的属性称为 _字段(Fields)_。字段(Fields)由以下几部分组成:

- [字段名称](#字段名称)
- [字段类型](#字段类型)
- [类型修饰符](#类型修饰符) (可选)
- [字段属性](#字段属性) (可选)

你可以在上面的[示例](#示例)模型中看到字段(Fields)的示例。

### 字段名称

字段名通常是小写字母开头的[驼峰式命名 camelCase](http://wiki.c2.com/?CamelCase).

从技术上讲，一个字段可以被任何符合下面这个正则表达式的字符串命名:

```
[A-Za-z_][A-Za-z0-9_]*
```

> **注**: 目前有[一个 bug](https://github.com/prisma/prisma2/issues/259)，不允许字段名前面加下划线。 因此，当前有效字段名的正则表达式是: `[A-Za-z][A-Za-z0-9_]*`

### 字段类型

字段的类型决定了它的 _结构_。 类型有两类:

- [标量类型](#标量类型) (包括 [枚举类型](#枚举类型))
- [模型(models)](<#模型(models)>)

### 类型修饰符

字段的类型后面可以添加下面两个修饰符来进行修饰:

- `[]`: 这个字段是一个 **列表**
- `?`: 这个字段是 **可选的**

在上面的示例中，`User` 模型上的字段 `name` 是 _可选的_，`post` 字段是一个 _列表_。

### 字段属性

在[下面](#属性)了解更多关于属性的信息。

## 枚举类型

枚举描述的是有一组预定义的值，通过 `enum` 定义:

```prisma
enum Color {
  Red
  Teal
}
```

## 属性

属性可以用来修改[字段(Fields)](<#字段(Fields)>)或代码块(Block)(比如 [模型(models)](<#模型(models)>))的行为。 有两种方法可以向数据模型中添加属性:

- [字段属性](#字段属性) 的前缀是 `@`.
- [代码块(block)属性](<#代码块(block)属性>) 的前缀是 `@@`.

根据他们的签名(signature, 译者:可理解为函数定义)不同, 属性可以通过下来方式调用:

**案例 1. 没有参数的属性**

- _签名_: `@attribute`
- _说明_: 后面 **不能有** 圆括号.
- _例子_:
  - `@id`
  - `@unique`
  - `@updatedAt`

**案例 2. 一个位置参数(positional argument)的属性**

- _签名_: `@attribute(_ p0: T0, p1: T1, ...)`
- _说明_: 至多有一个不需要命名的参数.
- _例子_:
  - `@field("my_column")`
  - `@default(10)`
  - `@default(now())`

对于只有一个参数的数组, 你 **可以** 省略方括号:

```prisma
@attribute([email]) // 等同于
@attribute(email)
```

**案例 3. 许多的命名参数的属性**

- _签名_: `@attribute(_ p0: T0, p1: T1, ...)`
- _说明_: 能有任意数量的命名参数。 如果有一个位置参数, 它 **可以** 出现在函数签名中的任何位置, 但如果它是存在且必需的, 那么调用它时 **必须** 将其放在其他命名参数之前. 命名参数的顺序随意.

不能有多个同名的参数:

```prisma
// 会编译错误
@attribute(key: "a", key: "b")
```

对于只有一个参数的数组, 你 **可以** 省略方括号:

```prisma
@attribute([item], key: [item])
// 等同于
@attribute(item, key: item)
```

### 字段属性

字段属性由放在字段定义末尾, 其前缀为 `@`。一个字段可以有任意数量的字段属性，可以以多行形式列写:

```
// 只有一个属性的字段
model _ {
  myField String @attribute
}

// 有两个属性的字段
models _ {
  myField String @attribute @attribute2
}

// 有三个属性的字段
type MyType String @attribute("input")
         @attribute2("input", key: "value", key2: "value2")
         @attribute3
```

### 代码块(block)属性

块属性由放在块内任何位置, 由前缀 `@@` 标识. 可以拥有任意多的块属性，可以多行形式列写:

```
model _ { @@attribute0

---

@@attribute1("input") @attribute2("input", key: "value", key2: "value2")

---

@@attribute1 @@attribute2("input") }
```

### 核心属性

_核心_ 属性必须由每个[数据源](./prisma-schema-file.md#数据源)连接器实现(使用 _最佳实践_)，这意味着它们在任何 Prisma 配置中都是可用的。

它们可用于 `model` 块以及 `type` 定义。

下面是所有可用的核心 **字段** 属性:

- `@id`: 定义主键.
- `@unique`: 定义唯一约束.
- `@map(_ name: String)`: 定义字段(field)映射到原始的哪一列.
- `@default(_ expr: Expr)`: 指定默认值.
- `@relation(_ fields?: Field[], name?: String)`: 在需要的时候消除关系(relationships)的歧义. 更多细节在[这里](./relations.md/#the-relation-attribute).
- `@updatedAt`: 当记录更新时, 更新时间为 `now()`.

下面是所有可用的核心 **代码块(block)** 属性:

- `@@map(_ name: String)`: 定义字段映射到原始表的名称.
- `@@index(_ fields: Field[])`: 定义特定字段/列的索引.

### 连接器属性

连接器属性允许你使用数据源的原生特性。 对于 PostgreSQL 数据库，您可以将其用于任意值。

数据源连接器属性文档在这里:

- [MySQL](./core/connectors/mysql.md)
- [PostgreSQL](./core/connectors/postgresql.md)
- [SQLite](./core/connectors/sqlite.md)

## 索引

你可以通过模型(model)的属性 `@@index([...])` 定义索引(可通过一个字段或多个字段定义索引)。

### 例子

假设你想为[上面示例](#示例)中的 `Post` 模型的 `title` 字段添加索引。可以这样做:

```prisma
model Post {
  id         Int        @id
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
  author     User
  title      String
  published  Boolean    @default(false)
  categories Category[]

  @@index([title])
}
```

这将转化为如下创建索引的 SQL 语句:

```sql
-- PostgreSQL
CREATE INDEX "Post.title" ON public."Post"(title text_ops);

-- MySQL
CREATE  INDEX `Post.title` ON `mydb`.`Post`(`title`)
```

要在多个字段上定义索引(即多列索引)，以数组形式传递多个字段到 `@@index` 属性就可以了，例如:

```prisma
model Post {
  id         Int        @id
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
  author     User
  title      String
  published  Boolean    @default(false)
  categories Category[]

  @@index([title, content])
}
```

这将转化为如下创建索引的 SQL 语句:

```sql
-- PostgreSQL
CREATE INDEX "Post.title_content" ON public."Post"(title text_ops,content text_ops);

-- MySQL
CREATE  INDEX `Post.title_content` ON `mydb`.`Post`(`title`,`content`)
```

### 局限性

当前无法为索引提供更多的配置选项:

- PostgreSQL
  - 将索引字段定义为表达式 (比如 `CREATE INDEX title ON public."Post"((lower(title)) text_ops);`)
  - 通过 `USING` 指定索引方法; Postgresql 支持 B-tree, hash, GiST, GIN 这些索引方法; Prisma 默认使用 B-Tree
  - 通过 `WHERE` 定义部分索引
  - 通过 `CONCURRENTLY` 并行创建索引
- MySQL
  - 通过 `USING` 指定索引方法; MySQL 支持 B-tree, hash 这些索引方法; Prisma 默认使用 B-Tree

## 函数

Prisma 的核心提供了一组函数，每个连接器 _必须_ 使用 _最佳实践_ 来实现这些函数。 函数只能用在接受它们的字段或块属性中:

- `uuid()`: 生成一个新的 [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier)
- `cuid()`: 生成一个新的 [cuid](https://github.com/ericelliott/cuid)
- `now()`: 生成当前的日期时间

> **注**: [目前只能](https://github.com/prisma/prisma2/issues/457)用 `@default(now())` 为每个模型(model)注释一个字段(field)。

使用动态生成器的默认值可以用如下方式指定:

```prisma
model User {
  id         String    @id @default(cuid())
  createdAt  DateTime  @default(now())
}
```

函数是通过 Prisma 的查询引擎提供的。

这些函数返回的数据类型将由数据源连接器自己定义。 例如，PostgreSQL 数据库中的 `now()` 将返回一个 `带有时区的时间戳`，而在 JSON 连接器中 `now()` 将返回一个 `ISOString`。

## 标量类型

Prisma 核心提供了以下标量类型:

| Prisma 类型 | 说明           |
| ----------- | -------------- |
| `String`    | 可变长度的文本 |
| `Boolean`   | True 或 false  |
| `Int`       | 整数值         |
| `Float`     | 浮点数         |
| `DateTime`  | 时间戳         |

_数据源连接器_ 决定了 _原生数据库类型_ 是怎样映射成上述类型的。 类似地，_生成器(generator)_ 决定了目标程序语言中的类型是怎样映射的。

下面查看每个连接器和生成器(generator)的映射.

映射到连接器和生成器(generator)的标量类型

**连接器**

| Prisma Type | PostgreSQL  | MySQL       | SQLite    | Mongo    | Raw JSON  |
| ----------- | ----------- | ----------- | --------- | -------- | --------- |
| `String`    | `text`      | `TEXT`      | `TEXT`    | `string` | `string`  |
| `Boolean`   | `boolean`   | `BOOLEAN`   | _N/A_     | `bool`   | `boolean` |
| `Int`       | `integer`   | `INT`       | `INTEGER` | `int32`  | `number`  |
| `Float`     | `real`      | `FLOAT`     | `REAL`    | `double` | `number`  |
| `DateTime`  | `timestamp` | `TIMESTAMP` | _N/A_     | `date`   | _N/A_     |

**_N/A_:** 意思是没有完美的等价类型, 但是我们可以做的很接近.

**生成器(Generator)**

| Prisma Type | JS / TS   | Go          |
| ----------- | --------- | ----------- |
| `String`    | `string`  | `string`    |
| `Boolean`   | `boolean` | `bool`      |
| `Int`       | `number`  | `int`       |
| `Float`     | `number`  | `float64`   |
| `DateTime`  | `Date`    | `time.Time` |

## 关系(relations)

你可在此了解更多[关系(relations)](./relations.md).

## 保留的模型名称

在根据[数据模型定义](./data-modeling.md#数据模型定义)生成 Prisma Client JS 时，有许多保留名称不能用于模型。下面是保留名称列表:

- `String`
- `Int`
- `Float`
- `Subscription`
- `DateTime`
- `WhereInput`
- `IDFilter`
- `StringFilter`
