---
title: Prisma Client
description: 本章介绍了prisma的基本核心client，类似于ORM工具但更加强大
keywords:
  - ORM
  - prisma
  - Prisma client
---

Prisma client 是一个自动生成的库，可连接到你的 Prisma service。在[this](https://www.prisma.io/blog/prisma-client-beta-ahph4o1umail/)文章中了解更多信息。

### 设置

使用[Prisma CLI]的`prisma generate`命令自动生成 Prisma client。 一个 Prisma client 连接到一个 Prisma service。

`prisma generate`读取 prisma.yml 中`generate`属性下指定的信息。

#### 在 prisma.yml 中配置`generate`

`generate`根属性接受一个对象列表。 每个对象都有两个字段:

- `generator`: #生成 Prisma client 的编程语言。
     - 可选的值:`typescript-client`, `javascript-client`, `flow-client`, `go-client`.
     - 即将推出:`reason`
- `output`:应存储 Prisma client 的文件的路径和名称。

例如，我们看下面的 prisma.yml:

```yaml
datamodel: datamodel.prisma
endpoint: http://localhost:4000
generate:
  - generator: typescript-client
    output: ./prisma-client/
```

在 prisma.yml 所在的目录中运行`prisma generate`会在 TypeScript 中生成一个 Prisma client，并将其存储在名为`prisma.ts`的文件中。

> `generator`也接受`graphql-schema`作为值。 这将通过[introspection](https://graphql.org/learn/introspection/)查询下载 Prisma API 的 GraphQL schema。

##### 更多例子

当`generate`接受一个对象列表时，你也可以同时生成多个文件:

```yaml
datamodel: datamodel.prisma
endpoint: http://localhost:4466
secret: mysecret42
generate:
  - generator: typescript-client
    output: ./prisma-client-ts/
  - generator: javascript-client
    output: ./prisma-client-js/
  - generator: go-client
    output: ./prisma-client-go/
  - generator: flow-client
    output: ./prisma-client-flow/
  - generator: graphql-schema
    output: ./graphql-schema/
```

#### 生成的代码

假设 Prisma service 的数据模型定义如下:

```graphql
type Link {
  id: ID! @id
  createdAt: DateTime! @createdAt
  description: String!
  url: String!
  postedBy: User
  votes: [Vote!]!
}
type User {
  id: ID! @id
  name: String!
  email: String! @unique
  password: String!
  links: [Link!]!
  votes: [Vote!]!
}
type Vote {
  id: ID! @id
  link: Link!
  user: User!
}
```

你可以在你电脑本地或者此处查看生成的文件的代码:

- [适用于 JavaScript 的 Prisma client](https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.js)
- [TypeScript 的 Prisma client](https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts)
- [Prisma API 的 GraphQL schema](https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.graphql)

生成的 Prisma client 已经知道在生成时 prisma.yml 中指定的`endpoint`和`secret`。

#### 构造函数-JavaScript

`Prisma`构造函数用于创建 Prisma client 的新实例。

```javascript
constructor((options: BasePrismaOptions));
```

`BasePrismaOptions`具有以下属性(都是可选的):

- `endpoint: string`:Prisma service 的端点。 如果未提供，则 client 将默认使用在生成 client 时在 prisma.yml 中指定的"端点"。
- `secret: string`:保护 Prisma serviceAPI 的密码。 如果未提供，client 将默认使用在生成 client 时在 prisma.yml 中指定的`secret`。
- `debug: boolean`:如果设置为`true`，Prisma client 上每个方法的调用都会打印发送到 Prisma API 的 GraphQL 查询到控制台。 **默认值:`false`**。
- `fragmentReplacements: FragmentReplacement []`:将应用于发送到 Prisma API 的每个 Query/Mutation/Subscriptions 的 GraphQL 片段列表。

##### 例子

_使用 client generate 时在 prisma.yml 中指定的`endpoint`和`secret`的默认值:_

```javascript
const prisma = new Prisma({});
```

_覆盖默认值:_

```javascript
const prisma = new Prisma({
  endpoint: 'http://localhost:4466/hello-world/dev',
  secret: 'mysecret42',
});
```

#### 构造函数-TypeScript

`Prisma`构造函数用于创建 Prisma client 的新实例。

```javascript
constructor((options: BasePrismaOptions));
```

`BasePrismaOptions`具有以下属性(都是可选的):

- `endpoint:string`:Prisma service 的端点。 如果未提供，则 client 将默认使用在生成 client 时在 prisma.yml 中指定的"端点"。
- `secret:string`:保护 Prisma serviceAPI 的密码。 如果未提供，client 将默认使用在生成 client 时在 prisma.yml 中指定的`secret`。
- `debug:boolean`:如果设置为`true`，Prisma client 上每个方法的调用都会打印发送到 Prisma API 的 GraphQL 查询到控制台。 **默认值:`false`**。
- `fragmentReplacements:FragmentReplacement []`:将应用于发送到 Prisma API 的每个 Query/Mutation/Subscriptions 的 GraphQL 片段列表。

##### 例子

_使用 client 生成时在 prisma.yml 中指定的`endpoint`和`secret`的默认值:_

```javascript
const prisma = new Prisma({});
```

_覆盖默认值:_

```javascript
const prisma = new Prisma({
  endpoint: 'http://localhost:4466/hello-world/dev',
  secret: 'mysecret42',
});
```

#### 构造函数-Go

`Prisma`构造函数用于创建 Prisma client 的新实例。

```go
New(options PrismaOptions) Client

```

`PrismaOptions`具有以下属性(都是可选的):

- `endpoint:string`:Prisma service 的端点。 如果未提供，则 client 将默认使用在生成 client 时在 prisma.yml 中指定的"端点"。
- `debug:boolean`:如果设置为`true`，Prisma client 上每个方法的调用都会打印发送到 Prisma API 的 GraphQL 查询到控制台。 **默认值:`false`**。

##### 例子

_使用 client 生成时在 prisma.yml 中指定的`endpoint`和`secret`的默认值:_

```go
db := prisma.New(nil)

```

_覆盖默认值:_

```go
client := prisma.New(&prisma.PrismaOptions{
Endpoint: "http://localhost:4466/hello-world/dev",
Debug: true,
})

```

### 读取数据-JavaScript

Prisma client 基于 Prisma API 的 GraphQL schema 定义生成操作。对于*reading*数据，它基本上*复制*你 Prisma service 中的`GraphQL Query`。

对于此页面，我们假设你的 Prisma API 基于以下`datamodel`:

```graphql
type Link {
  id: ID! @id
  createdAt: DateTime! @createdAt
  description: String!
  url: String!
  postedBy: User
  votes: [Vote!]!
}
type User {
  id: ID! @id
  name: String!
  email: String! @unique
  password: String!
  links: [Link!]!
  votes: [Vote!]!
}
type Vote {
  id: ID! @id
  link: Link!
  user: User!
}
```

- 你可以查看 API 生成的 GraphQL schema[这里](https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.graphql)
- 你可以查看生成的 JavaScript client[此处](https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.js)。

每当使用 Prisma client 查询模型时，都会获取该模型的*所有字段*。无论是查询单个对象还是对象列表，都是如此。

例如，以下查询返回单个"User"的所有标量字段:

```javascript
const user = await prisma.user({ email: 'bob@prisma.io' });
```

在这种情况下，返回的`user`对象将具有四个属性(对应于`User`模型的标量字段):`id`，`name`，`email`和`password`。

`links`和`votes`字段都是*relation fields*，因此不包含在查询中。

以下是获取所有`User`对象*列表*的示例:

```javascript
const users = await prisma.users();
```

与前面的查询类似，`users`数组中的每个对象只有标量和无关系字段。

#### 获取单个对象

对于 datamodel 中的每个模型类型，在 Prisma clientAPI 中生成一种方法，允许获取该模型的单个对象。 该方法以类型命名，但以*小写*字符开头。 对于上面的示例数据模型，获取单个"User"，"Link"和"Vote"对象的三种方法称为"user"，"link"和"vote"。

这些函数的输入是一个对象，它具有模型的任何 **唯一字段**作为属性。 这意味着，对于所有三种方法，都接受`id`字段(因为相应的模型每个都有一个注释为`@unique`的`id`字段)。 `user`方法的输入对象另外有一个`email`字段可以来查询。

- 查看`Link`的"where"类型[here](https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts#L455)
- 查看`User`的"where"类型[here](https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts#L357)
- 查看`Vote`的"where"类型[here](https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts#L522)

##### 例子

**以下所有例子中，第一段代码为 resolvers 中的代码，第二段是 playground 中的操作**

*通过其 id*获取单个投票:

```javascript
const vote = await prisma.vote({ id: 'cjlgpyueg001o0a239d3i07ao' });
```

```graphql
# generated query

query {
  vote(where: { id: "cjlgpyueg001o0a239d3i07ao" }) {
    id
  }
}
```

*通过 email*获取单个用户:

```javascript
const user = await prisma.user({ email: 'alice@prisma.io' });
```

```graphql
# generated query

query {
  user(where: { email: "alice@prisma.io" }) {
    id
  }
}
```

#### 获取列表

对于 datamodel 中的每个模型类型，在 Prisma clientAPI 中生成一个方法，允许获取这些模型对象的列表。 该方法以模型命名，但以*小写*字符开头并使用*复数*形式。 对于上面的示例数据模型，获取"User"，"Link"和"Vote"模型列表的三种方法称为"users"，"links"和"votes"。

这些函数的输入参数是一个具有以下属性的对象:

- [过滤](#列表基础过滤):`where`
- [排序](#排序):`orderBy`
- [分页](#分页):`before`，`after`，`first`，`last`，`skip`

##### 例子

_获取所有 links_:

```javascript
const links = await prisma.links();
```

```graphql
# generated query

query {
  links {
    id
    createdAt
    url
    description
  }
}
```

*获取 users*列表:

```javascript
const users = await prisma.users();
```

```graphql
query {
  links {
    id
    createdAt
    url
    description
  }
}
```

#### 关系

Prisma client 基于[fluent API](https://www.sitepoint.com/javascript-like-boss-understanding-fluent-apis/)来查询数据图中的关系。这意味着你可以简单地*链式调用*你的方法来返回模型的关系属性。

**注意**

这仅在检索*单个*对象时才有可能，而不是用于列表。这意味着你无法查询列表中返回的对象的关系字段，例如:

```javascript
//不可能
const result = await prisma.users().links();
```

在这个例子中，`users()`已经返回一个列表，因此不可能查询列表中每个用户对象的`links`关系。

##### 例子

*Query 查询单个 user*的所有链接:

```javascript
const linksByUser = await prisma.user({ email: 'alice@prisma.io' }).links();
```

```graphql
query {
  user(where: { email: "alice@prisma.io" }) {
    links {
      id
      createdAt
      description
      url
    }
  }
}
```

*查询某个 user*所做的所有投票:

```javascript
const votesByUser = await prisma.user({ email: 'alice@prisma.io' }).votes();
```

```graphql
query {
  user(where: { email: "alice@prisma.io" }) {
    votes {
      id
    }
  }
}
```

#### 使用片段 fragment 进行细粒度数据访问

你可以使用`$fragment` API 功能(基于 GraphQL)指定要检索的字段，而不是查询模型的所有标量字段(这是默认行为)。这对于排除大量不需要的字段(如 BLOB 值或大字符串)或检索关系很有用。

##### 例子

*获取用户的`name`和`email`以及相关 links*的`description`和`url`:

```javascript
const fragment = `
fragment UserWithLinks on User {
name
email
links {
description
url
}
}
`;
const userWithPosts = await prisma.users().\$fragment(fragment);
```

```graphql
query {
  users {
    ...UserWithLinks
  }
}
fragment UserWithLinks on User {
  name
  email
  links {
    description
    url
  }
}
```

#### 列表的基本过滤器

*Basic*过滤器允许你指定某些条件来约束应在列表中返回哪些对象。过滤器在输入参数的`where`对象中指定，任何列表查询都接受该对象。

`where`对象的类型取决于生成它的模型。

查看`Link`，`User`和`Vote` 的`where`类型

- 查看`Link`的"where"类型[here](https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts#L154)
- 查看`User`的"where"类型[here](https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts#L267)
- 查看`Vote`的"where"类型[here](https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts#L219)

也可以使用`AND`和`OR`字段*组合*多个过滤器。

##### 例子

找到名称中包含"A"的用户:

```javascript
const usersWithAInName = await prisma.users({
  where: {
    name_contains: 'A',
  },
});
```

```graphql
query {
  users(where: { name_contains: "A" }) {
    id
    name
    email
    password
  }
}
```

使用自动完成功能来探索过滤系统

![](/prisma1/images/XwE5z9o.png)

_查询称为"Alice"或"Bob`的用户_:

```javascript
const usersCalledAliceOrBob = await prisma.users({
  where: {
    name_in: ['Alice', 'Bob'],
  },
});
```

```graphql
query {
  users(where: { name_in: ["Alice", "Bob"] }) {
    id
    name
    email
    password
  }
}
```

_获取 2018 年 12 月 24 日之前创建的链接_:

```javascript
const linksBeforeChristmas = await prisma.links({
  where: {
    createdAt_lt: '2018-12-24',
  },
});
```

```graphql
query {
  links(where: { createdAt_lt: "2018-12-24" }) {
    id
    createdAt
    description
    url
  }
}
```

> Prisma client API 中的日期和时间遵循[ISO 8601](https://en.wikipedia.org/wiki/ISO_8601)标准，该标准通常具有以下形式:`YYYY-MM-DDThh:mm:ss`。

_查询在 description 中有`prisma` **或**`graphql`的链接**并且是**在 2018 年创建的_:

```javascript
const filteredLinks = await prisma.links({
  where: {
    AND: [
      {
        OR: [
          {
            description_contains: 'graphql',
          },
          {
            description_contains: 'prisma',
          },
        ],
      },
      {
        AND: [
          {
            createdAt_gt: '2017',
          },
          {
            createdAt_lt: '2019',
          },
        ],
      },
    ],
  },
});
```

```graphql
query {
  links(
    where: {
      OR: [{ description_contains: "graphql" }, { description_contains: "prisma" }]
      AND: [{ createdAt_lt: "2019" }, { createdAt_gt: "2017" }]
    }
  ) {
    id
    description
  }
}
```

实际上可以省略`AND`过滤器，因为默认情况下使用*logical and*组合了多个过滤条件。这意味着上面的过滤器也可以表示如下:

```javascript
const filteredLinks = await prisma.links({
  where: {
    OR: [
      {
        description_contains: 'graphql',
      },
      {
        description_contains: 'prisma',
      },
    ],
    createdAt_gt: '2017',
    createdAt_lt: '2019',
  },
});
```

```graphql
query {
  links(
    where: {
      OR: [{ description_contains: "graphql" }, { description_contains: "prisma" }]
      createdAt_lt: "2019"
      createdAt_gt: "2017"
    }
  ) {
    id
    createdAt
    description
    url
  }
}
```

#### 列表的关系过滤器

关系过滤器可用于约束关系列表字段上的返回对象。用于过滤的类型与基本过滤器相同，唯一的区别是过滤器不应用于方法调用的第一级，而是在第二级查询关系时。

##### 例子

```javascript
const linksByUserBeforeChristmas = await prisma.user({ email: 'alice@prisma.io' }).links({
  where: {
    createdAt_lt: '2017-12-24',
  },
});
```

```graphql
query {
  user(where: { email: "alice@prisma.io" }) {
    links(where: { createdAt_lt: "2017-12-24" }) {
      id
      createdAt
      description
      url
    }
  }
}
```

#### 排序

查询模型对象列表时，可以按该模型类型的任何标量字段对列表进行排序。因此，每个生成的查询模型列表的方法都接受其输入对象上的`orderBy`字段。

`orderBy`字段的类型取决于生成它的模型的标量字段。

查看`link`，`user`和`Vote`的`orderBy`类型

- 查看`link` 的`orderBy`类型[here](https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts#L114)
- 查看`user` 的`orderBy`类型[here](https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts#L132)
- 查看`Vote` 的`orderBy`类型[here](https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts#L125)

##### 例子

\_按创建日期(升序)\_links:

```javascript
const sortedLinks = prisma.links({
  orderBy: 'createdAt_ASC',
});
```

```graphql
query {
  links(orderBy: createdAt_ASC) {
    id
    createdAt
    description
    url
  }
}
```

_按字母顺序排序用户名(降序)_:

```javascript
const sortedUsers = prisma.users({
  orderBy: 'name_DESC',
});
```

```graphql
query {
  users(orderBy: name_DESC) {
    id
    name
    email
    password
  }
}
```

#### 分页

查询模型对象列表时，可以通过提供分页参数来获取该列表的*部分信息*。常在 feed 流中使用。

##### 用'first`和`last`向前和从后往前

你可以在对象中向前或从后往前并提供可选的起始对象:

- 要 **从前往后**，使用`first`;用`after`指定一个起始对象。
- 要 **从后往前**，请使用`last`;用`before`指定一个起始对象。

你 **不能**将`first`与`before`或`last`与`after`结合起来。如果你在查询中这样做，`before`/`after`将被忽略，实际上只应用`first`或`last`(在列表的开头或结尾，取决于你使用的是哪个) 。

请注意，你可以在没有错误消息的情况下查询比实际存在的对象更多的对象。

##### 使用`skip`跳过元素

你还可以通过提供`skip`参数跳过任意方向的任意数量的对象:

- 当使用`first`时，`skip`会跳过列表开头的对象。
- 当使用`last`时，`skip`跳过列表末尾的对象。

##### 例子

对于以下示例，我们假设一个正好包含 30 个对象的列表:

![](/prisma1/images/Xh6Qjts.png)

_查询前 3 个链接(从前往后)_:

![](/prisma1/images/O1Jj3Z2.png)

```javascript
const links = await prisma.links({
  first: 3,
});
```

```graphql
query {
  links(first: 3) {
    id
    createdAt
    description
    url
  }
}
```

_查询从位置 6 到位置 10 的对象(从前往后)_:

![](/prisma1/images/PpI5X0X.png)

```javascript
const links = await prisma.links({
  first: 5,
  skip: 5,
});
```

```graphql
query {
  links(first: 5, skip: 5) {
    id
    createdAt
    description
    url
  }
}
```

_查询最后 3 个对象(从后往前)_:

![](/prisma1/images/pkuYCrV.png)

```javascript
const links = await prisma.links({
  last: 3,
});
```

```graphql
query {
  links(last: 3) {
    id
    createdAt
    description
    url
  }
}
```

_查询从第 21 位到第 27 位的对象(从后往前)_:

![](/prisma1/images/iSl9Y07.png)

```javascript
const links = await prisma.links({
  last: 7,
  skip: 3,
});
```

```graphql
query {
  links(last: 7, skip: 3) {
    id
    createdAt
    description
    url
  }
}
```

使用`cixnen24p33lo0143bexvr52n`作为`id`_查询对象之后的前 3 个对象_:

![](/prisma1/images/InYSSkQ.png)

```javascript
const links = await prisma.links({
  first: 3,
  after: 'cixnen24p33lo0143bexvr52n',
});
```

```graphql
query {
  links(first: 3, after: "cixnen24p33lo0143bexvr52n") {
    id
    createdAt
    description
    url
  }
}
```

使用`cixnen24p33lo0143bexvr52n`作为`id`跳过 3 条数据查询后面的 5 个对象:

![](/prisma1/images/u4WEAJv.png)

```javascript
const links = await prisma.links({
  first: 5,
  after: 'cixnen24p33lo0143bexvr52n',
  skip: 3,
});
```

```graphql
query {
  links(first: 5, after: "cixnen24p33lo0143bexvr52n", skip: 3) {
    id
    createdAt
    description
    url
  }
}
```

使用`cixnen24p33lo0143bexvr52n`作为`id`_查询对象之前的最后 5 个对象_:

![](/prisma1/images/306eghw.png)

```javascript
const links = await prisma.links({
  last: 5,
  before: 'cixnen24p33lo0143bexvr52n',
});
```

```graphql
query {
  links(last: 5, before: "cixnen24p33lo0143bexvr52n") {
    id
    createdAt
    description
    url
  }
}
```

_查询节点之前的最后 3 个节点，其中 cixnen24p33lo0143bexvr52n 为 id 并跳过 5 个_:

![](/prisma1/images/iZGUiHJ.png)

```javascript
const links = await prisma.links({
  last: 3,
  before: 'cixnen24p33lo0143bexvr52n',
  skip: 5,
});
```

```graphql
query {
  links(last: 3, before: "cixnen24p33lo0143bexvr52n", skip: 5) {
    id
    createdAt
    description
    url
  }
}
```

#### 聚合

你可以通过[Connection 查询]提交聚合查询。支持以下聚合功能:

- `count`:计算列表中的对象数
- `avg`(_即将推出_):计算数字列表的平均值。
- `median`(_即将推出_):计算数字列表的中位数。
- `max`(_即将推出_):返回数字列表中最大的元素。
- `min`(_即将推出_):返回数字列表中的最小元素。
- `sum`(_即将推出_):计算数字列表的总和。

> 请参阅[this](https://github.com/prisma/prisma/issues/1312)GitHub 问题以了解有关即将推出的聚合功能的更多信息。

##### 例子

_Count 链接对象的数量_:

```javascript
const linkCount = await prisma
  .linksConnection()
  .aggregate()
  .count();
```

```graphql
query {
  linksConnection {
    aggregate {
      count
    }
  }
}
```

### 写入数据-JavaScript

对于前面创建的的数据模型，每个模型类型生成了写入数据六种方法。这些在 GraphQL schema，例如用于`User`模型中的 Mutation 而得到:

- `createUser`:创建一个新的`User`记录在数据库中
- `updateUser`:更新现有`User`记录在数据库中
- `deleteUser`:从数据库中删除现有的`User`记录
- `upsertUser`:更新现有的或在数据库中创建一个新的`User`纪录
- `updateManyUsers`:更新许多现有的`User`数据库中的记录
- `deleteManyUsers`:从数据库中删除现有的许多`User`记录

- 你可以查看一下生成 GraphQL schema 的 API [这里](https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.graphql)
- 你可以查看要生成的 JavaScript client[这里](https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.js)。

这些方法中的一个的每个调用被作为[事务]执行，这意味着它要么保证完全成功，或者如果它只是部分地失败但要被全部取消而回到原先状态，所以不必担心数据一致性。

#### 创建对象

当在数据库中创建新的记录，`create`方法需要用一个输入对象包裹起来所有数据。它还提供了一种用于模型创建关系数据，这可以通过使用[嵌套对象写入](#嵌套对象写入)来提供。

每个方法调用的返回包含刚刚创建的模型的所有字段。

- 查看 createLink`的`的输入对象的类型(这里)(https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts#L567)
- 查看 createUser`的`的输入对象的类型(这里)(https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts#L418)
- 查看 createVote`的`的输入对象的类型(这里)(https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts#L214)

##### 例子

_create 新用户_:

```javascript
const newUser = await prisma.createUser({
  name: 'Alice',
  email: 'alice@prisma.io',
  password: 'IlikeTurtles',
});
```

```graphql
# generated mutation
mutation {
  createUser(data: { name: "Alice", email: "alice@prisma.io", password: "IlikeTurtles" }) {
    id
    name
    email
    password
  }
}
```

_create 新 vote_:

```javascript
const newVote = await prisma.createVote({
  user: {
    connect: {
      email: 'alice@prisma.io',
    },
  },
  link: {
    connect: {
      id: 'cjli47wr3005b0a23m9crhh0e',
    },
  },
});
```

```graphql
# generated mutation
mutation {
  createVote(
    data: {
      user: { connect: { email: "alice@prisma.io" } }
      link: { connect: { id: "cjli47wr3005b0a23m9crhh0e" } }
    }
  ) {
    id
  }
}
```

_create 新用户并加两个新 links_:

```javascript
const newUserWithLinks = await prisma.createUser({
  name: 'Alice',
  email: 'alice@prisma.io',
  password: 'IlikeTurtles',
  links: {
    create: [
      {
        description: 'My first link',
        url: 'https://www.prisma.io',
      },
      {
        description: 'My second link',
        url: 'https://www.howtographql.com',
      },
    ],
  },
});
```

```graphql
# generated mutation
mutation {
  createUser(
    data: {
      name: "Alice"
      email: "alice@prisma.io"
      password: "IlikeTurtles"
      links: {
        create: [
          { description: "My first link", url: "https://www.prisma.io" }
          { description: "My second link", url: "https://www.howtographql.com" }
        ]
      }
    }
  ) {
    id
    name
    email
    password
  }
}
```

#### 更新对象

当在数据库中更新现有记录中，`update`-方法接收具有两个字段的一个输入对象:

- `data`:这类似于你提供给一个`create`-方法输入对象。它包含模型更新的字段，让你提供的关系数据通过[嵌套对象写入](#嵌套对象写入)。
- `where`:这是用来选择要更新的记录。你可以使用任何[唯一]字段来标识记录。

查看`data`的类型和`where`用于`Link`，`User`和`Vote`

- `data`
  - 查看`updateLink`的`data`字段的类型[这里](https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts#L255)
  - 查看`updateUser`的`data`字段的类型[这里](https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts#L468)
  - 查看`updateVote`的`data`字段的类型[这里](https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts#L366)
- `where`
  - 查看`updateLink`的`where`字段的类型[这里](https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts#L455)
  - 查看`updateUser`的`where`字段的类型[这里](https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts#L357)
  - 查看`updateVote`的`where`字段的类型[这里](https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts#L522)

每个方法调用返回一个包含刚更新了模型的所有字段的对象。

##### 例子

*设置现有用户*一个新的名字:

```javascript
const updatedUser = await prisma.updateUser({
  data: {
    name: 'Alice',
  },
  where: {
    id: 'cjli512bd005g0a233s1ogbgy',
  },
});
```

```graphql
# generated mutation
mutation {
  updateUser(data: { name: "Alice" }, where: { id: "cjli512bd005g0a233s1ogbgy" }) {
    id
    name
    email
    password
  }
}
```

_Update 一个链接，改变它的发布者为不同的用户_:

```javascript
const updatedLink = await prisma.updateLink({
  data: {
    postedBy: {
      connect: {
        id: 'cjli512bd005g0a233s1ogbgy',
      },
    },
  },
  where: {
    id: 'cjli47wr3005b0a23m9crhh0e',
  },
});
```

```graphql
mutation {
  updateLink(
    data: { postedBy: { connect: { id: "cjli512bd005g0a233s1ogbgy" } } }
    where: { id: "cjli47wr3005b0a23m9crhh0e" }
  ) {
    id
    createdAt
    description
    url
  }
}
```

_delete 发布 vote 的用户_:

```javascript
const updatedVote = await prisma.updateVote({
  data: {
    user: {
      delete: true,
    },
  },
  where: {
    id: 'cjli5aual005n0a233ekv89o4',
  },
});
```

```graphql
mutation {
  updateVote(data: { user: { delete: true } }, where: { id: "cjli5aual005n0a233ekv89o4" }) {
    id
  }
}
```

> 为了成功执行此操作，vote 的 user 不能是必填字段。否则，每一个`Vote`需要连接到一个`User`，删除就报错了。

#### 删除对象

当从数据库中删除记录，该`delete`-方法接收一个输入对象，指定哪个记录是要被删除。类型此输入对象的是相同的`update`-方法`where`对象。

该对象的属性对应于被标记为[唯一](#唯一)的模型的那些字段。对于上面的示例数据模型，这意味着，对于`User`，`Vote`和`Link`它有一个`id`属性。对于`User`它另外接受`email`字段。

查看类型的输入对象的`Link`，`User`和`Vote`

- 查看 deleteLink`的`的输入对象的类型(这里)(https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts#L455)
- 查看 deleteUser`的`的输入对象的类型(这里)(https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts#L357)
- 查看 deleteVote`的`的输入对象的类型(这里)(https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts#L522)

每个方法调用返回一个包含刚删除的模型的所有字段的对象。

##### 例子

*delete 其 ID*链接:

```javascript
const deletedLink = await prisma.deleteLink({
  id: 'cjli47wr3005b0a23m9crhh0e',
});
```

```graphql
mutation {
  deleteLink(where: { id: "cjli47wr3005b0a23m9crhh0e" }) {
    id
    createdAt
    description
    url
  }
}
```

*通过他们的 email 来 delete*用户:

```javascript
const deletedUser = await prisma.deleteUser({
  email: 'alice@prisma.io',
});
```

```graphql
mutation {
  deleteUser(where: { email: "alice@prisma.io" }) {
    id
    createdAt
    description
    url
  }
}
```

#### 创建或更新对象(upserts)

UPSERT 操作允许你*尝试*更新现有的记录。如果该记录实际上还不存在，它将被创建。该`upsert`的方法是`create`-和`update`-的搭配方法，这意味着他们收到有三个字段输入参数:

- `where`:相同于在`update`方法中提供的`where`字段
- `update`:相同于在`update`的方法中提供的`data`字段
- `create`:相同于在`create`的方法中提供的输入 input

##### 例子

_Update 链接的 URL。如果该链接不存在，创建一个新的_:

```javascript
const updatedOrCreatedLink = await prisma.upsertLink({
  where: {
    id: 'cjli47wr3005b0a23m9crhh0e',
  },
  update: {
    url: 'https://www.howtographql.com',
  },
  create: {
    url: 'https://www.howtographql.com',
    description: 'Fullstack GraphQL Tutorial',
  },
});
```

```graphql
mutation {
  upsertLink(
    where: { id: "cjli47wr3005b0a23m9crhh0e" }
    update: { url: "https://www.howtographql.com" }
    create: { url: "https://www.howtographql.com", description: "Fullstack GraphQL Tutorial" }
  ) {
    id
  }
}
```

#### 更新和删除多条记录

该 Prisma 的 clientAPI 提供了特殊的方法来更新或一次删除多条记录。GraphQL API 中的相应的 Mutation 被称为[批量 Mutation(#批量 Mutation)。每个`updateMany`-和`deleteMany`-方法返回最终受到影响的操作记录数。

##### 例子

_Update 三个 links，通过其 ID 指定，将其网址重置为空 string_:

```javascript
const updatedLinksCount = await prisma.updateManyLinks({
  where: {
    id_in: ['cjli6tknz005s0a23uf0lmlve', 'cjli6tnkj005x0a2325ynfpb9', 'cjli6tq3200620a23s4lp8npd'],
  },
  data: {
    url: '',
  },
}).count;
```

```graphql
mutation {
  updateManyLinks({
    where: {
      id_in: ["cjli6tknz005s0a23uf0lmlve", "cjli6tnkj005x0a2325ynfpb9", "cjli6tq3200620a23s4lp8npd"]
    }
    data: {
      url: ""
    }
  }) {
    count
  }
}
```

**注意**

如果一个或多个所提供的 ID 没有在数据库中实际存在，操作将 **不返回**错误。

_Update 所有 links 的描述中包含字符串'graphql`的数据，其网址重置为空 string_:

```javascript
const updatedLinksCount = await prisma.updateManyLinks({
  where: {
    description_contains: 'graphql',
  },
  data: {
    url: '',
  },
}).count;
```

```graphql
mutation {
  updateManyLinks({
    where: {
      description_contains: "graphql"
    }
    data: {
      url: ""
    }
  }) {
    count
  }
}
```

_delete 在 2018 年之前创建的所有链接_:

```javascript
const deleteLinksCount = await prisma.deleteManyLinks({
  createdAt_lte: '2018',
}).count;
```

```graphql
mutation {
  deleteManyLinks(where: { createdAt_lte: "2018" }) {
    count
  }
}
```

#### 嵌套对象写入

嵌套的对象写入操作让你在一个单一的 Mutation 中修改多个模型数据库记录。Prisma 的 GraphQL API 相应的概念被称为[嵌套 Mutation](#嵌套的Mutation)。嵌套对象写入可供`create`-和`update`的方法。

如果模型具有相对于不同的 schema，对应关系字段被设定为具有以下性质中的一个子集的对象:

- `create`:创建相关模型的新纪录，并通过关系将其连接。
- `update`:更新通过关系已经连接了相关模型的现有记录。
- `upsert`:更新相关模型的现有记录或创建并连接一个新的。
- `delete`:删除通过关系连接的相关模型的现有记录。
- `connect`:通过连接关系的相关模型的现有记录。
- `disconnect`:删除通过关系连接相关模型的现有记录。

##### 例子

_create 新用户和两个新的 link，并连接一个现有的 link_:

```javascript
const newUserWithLinks = await prisma.createUser({
  name: 'Alice',
  email: 'alice@prisma.io',
  password: 'IlikeTurtles',
  links: {
    create: [
      {
        description: 'My first link',
        url: 'https://www.prisma.io',
      },
      {
        description: 'My second link',
        url: 'https://www.howtographql.com',
      },
    ],
    connect: {
      id: 'cjli6tknz005s0a23uf0lmlve',
    },
  },
});
```

```graphql
# generated mutation
mutation {
  createUser(
    data: {
      name: "Alice"
      email: "alice@prisma.io"
      password: "IlikeTurtles"
      links: {
        create: [
          { description: "My first link", url: "https://www.prisma.io" }
          { description: "My second link", url: "https://www.howtographql.com" }
        ]
        connect: { id: "cjli6tknz005s0a23uf0lmlve" }
      }
    }
  ) {
    id
    name
    email
    password
  }
}
```

_delete 用户的链接_:

```javascript
const updatedUser = await prisma.updateUser({
  where: {
    id: 'cjli8znnd006n0a23ywc6wf8w',
  },
  data: {
    links: {
      delete: {
        id: 'cjli6tknz005s0a23uf0lmlve',
      },
    },
  },
});
```

```graphql
mutation {
  updateUser(
    where: { id: "cjli8znnd006n0a23ywc6wf8w" }
    data: { links: { delete: { id: "cjli6tknz005s0a23uf0lmlve" } } }
  ) {
    id
  }
}
```

#### 实时数据-JavaScript

该 Prisma 的 client，使用`\$subscribe`属性实时更新和订阅数据库事件和数据。对于你的数据模型中的每个模型类型，Prisma client 公开以此属性的模型命名的(小写)一个函数：Subscriptions。使用此函数意味着比对该模型的[写入]事件（即*create*，_update_，_delete_）有实时需求。你可以提供一个过滤器对象，使得可以进一步约束要接收更新的事件类型。该函数返回[async iterator](https://github.com/tc39/proposal-async-iteration)，只要发生指定的数据库事件，就会发出事件通知。

该`\$subscribe` API 是基于[WebSockets 的(https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)。

##### 例子

*Subscribe"新建"和"更新"`User`*的事件:

```javascript
const createdAndUpdatedUserIterator = await prisma.\$subscribe
  .user({
    mutation_in: ['CREATED', 'UPDATED'],
  })
  .node();
```

\_Subscribe`User`的电子邮件地址有包含字符串'gmail`的更新:

```javascript
const userIterator = await prisma.$subscribe
  .user({
    email_contains: `gmail`,
  })
  .node();
```

### 检查是否存在-JavaScript

该 Prisma 的 client，你可以为你在使用`$exists`属性中的数据库中是否存在一定的记录。对于你的[数据模型]每个模型类型，Prisma client 公开此属性的模型命名的(小写)一个函数。这些函数的接收过滤对象作为指定该记录的条件，并返回一个布尔值;如果有至少一个数据库记录符合指定过滤，该值是 TRUE，否则返回 FALSE。

输入对象具有用于[过滤列表]相同的类型。

#### 例子

*检查是否有具有特定 ID 存在*的用户:

```javascript
const userExists = prisma.\$exists.user({
  id: 'cjli6tko8005t0a23fid7kke7',
});
```

_检查是否有用户名为`Alice`或`Bob` 的 user 存在_:

```javascript
const userExists = prisma.$exists.user({
  name_in: ['Alice', 'Bob'],
});
```

检查是否有在描述中有`prisma`或`graphql`字段存在的 link，并且创建于 2018 年:

```javascript
const linkExists = await prisma.\$exists.link({
  AND: [
    {
      OR: [
        {
          description_contains: 'graphql',
        },
        {
          description_contains: 'prisma',
        },
      ],
    },
    {
      AND: [
        {
          createdAt_gt: '2017',
        },
        {
          createdAt_lt: '2019',
        },
      ],
    },
  ],
});
```

### graphql-requests-JavaScript

该 Prisma 的 client，可以直接发送 GraphQL Query 和 Mutation，`$request`方法请求你的 Prisma service:

```typescript
\$request: <T = any>(query: string, variables?: {[key: string]: any}) => Promise<T>;

```

#### 例子

_查询单个用户_:

```javascript
query {
user(id: "cjcdi63j80adw0146z7r59bn5") {
id
name
}
}
prisma.request(query)
.then(result => console.log(result))
// 示例 result:
// {"data": { "user": { "id": "cjcdi63j80adw0146z7r59bn5", "name": "Sarah" } } }

```

*使用 variables 查询*单个用户:

```javascript
  query ($userId: ID!){
    user(id: $userId) {
      id
      name
    }
  }
const variables = { userId: 'cjcdi63j80adw0146z7r59bn5' }
prisma.request(query, variables)
  .then(result => console.log(result))
// 示例result:
// {"data": { "user": { "id": "cjcdi63j80adw0146z7r59bn5", "name": "Sarah" } } }
```

### 读取数据-TypeScript

Prisma client 基于 Prisma API 的 GraphQL schema 定义生成操作。对于*reading*数据，它基本上*复制*你 Prisma service 中的`GraphQL Query`。

对于此页面，我们假设你的 Prisma API 基于以下`datamodel`:

```graphql
type Link {
  id: ID! @id
  createdAt: DateTime! @createdAt
  description: String!
  url: String!
  postedBy: User
  votes: [Vote!]!
}
type User {
  id: ID! @id
  name: String!
  email: String! @unique
  password: String!
  links: [Link!]!
  votes: [Vote!]!
}
type Vote {
  id: ID! @id
  link: Link!
  user: User!
}
```

- 你可以查看 API 生成的 GraphQL schema[这里](https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.graphql)
- 你可以查看生成的 TypeScript client[此处](https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts)。

每当使用 Prisma client 查询模型时，都会获取该模型的*所有字段*。无论是查询单个对象还是对象列表，都是如此。

例如，以下查询返回单个"User"的所有标量字段:

```typescript
const user: UserNode = await prisma.user({ email: 'bob@prisma.io' });
```

在这种情况下，返回的`user`对象将具有四个属性(对应于`User`模型的标量字段):`id`，`name`，`email`和`password`。

`links`和`votes`字段都是*relation fields*，因此不包含在查询中。

以下是获取`User`对象*list*的示例:

```typescript
const users: UserNode[] = await prisma.users();
```

与前面的查询类似，`users`数组中的每个对象只有标量和无关系字段。

#### 获取单个对象

对于 datamodel 中的每个模型类型，在 Prisma clientAPI 中生成一种方法，允许获取该模型的单个对象。该方法以类型命名，但以*小写*字符开头。对于上面的示例数据模型，获取单个"User"，"Link"和"Vote"对象的三种方法称为"user"，"link"和"vote"。

这些函数的输入是一个对象，它具有模型的任何[唯一]字段作为属性。这意味着，对于所有三种方法，都接受`id`字段(因为相应的模型每个都有一个注释为`@unique`的`id`字段)。 `user`方法的输入对象另外有一个`email`字段。

查看`Link`，`User`和`Vote`的输入对象的类型

- 查看`Link`的"where"类型[here](https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts#L455)
- 查看`User`的"where"类型[here](https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts#L357)
- 查看`Vote`的"where"类型[here](https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts#L522)

##### 例子

*通过其 id*获取单个投票:

```typescript
const vote: VoteNode = await prisma.vote({ id: 'cjlgpyueg001o0a239d3i07ao' });
```

```graphql
# generated query

query {
  vote(where: { id: "cjlgpyueg001o0a239d3i07ao" }) {
    id
  }
}
```

*通过 email*获取单个用户:

```typescript
const 用户: UserNode = await prisma.user({ email: 'alice@prisma.io' });
```

```graphql
# generated query

query {
  user(where: { email: "alice@prisma.io" }) {
    id
  }
}
```

#### 获取列表

对于 datamodel 中的每个模型类型，在 Prisma client API 中生成一个方法，允许获取这些模型对象的列表。该方法以模型命名，但以*小写*字符开头并使用*复数*形式。对于上面的示例数据模型，获取"User"，"Link"和"Vote"模型列表的三种方法称为"users"，"links"和"votes"。

这些函数的输入参数是一个具有以下属性的对象:

- [过滤](#列表基础过滤):`where`
- [排序](#排序):`orderBy`
- [分页](#分页):`before`，`after`，`first`，`last`，`skip`

##### 例子

_查询 all links_:

```typescript
const links: LinkNode[] = await prisma.links();
```

```graphql
# generated query

query {
  links {
    id
    createdAt
    url
    description
  }
}
```

*获取 users*列表:

```typescript
const users: UserNode[] = await prisma.users();
```

```graphql
# generated query

query {
  users {
    id
    name
    email
    password
  }
}
```

#### 关系

Prisma client 基于[fluent API](https://www.sitepoint.com/javascript-like-boss-understanding-fluent-apis/)来查询数据图中的关系。这意味着你可以简单地*链式调用*你的方法来返回模型的关系属性。

**注意**

这仅在检索*单个*对象时才有可能，而不是用于列表。这意味着你无法查询列表中返回的对象的关系字段，例如:

```typescript
//不可能
const result = await prisma.users().links();
```

在这个例子中，`users()`已经返回一个列表，因此不可能查询列表中每个用户对象的`links`关系。

##### 例子

*Query 查询单个 user*的所有链接:

```typescript
const linksByUser: LinkNode[] = await prisma.user({ email: 'alice@prisma.io' }).links();
```

```graphql
query {
  user(where: { email: "alice@prisma.io" }) {
    links {
      id
      createdAt
      description
      url
    }
  }
}
```

*查询某个 user*所做的所有投票:

```typescript
const votesByUser: VoteNode[] = await prisma.user({ email: 'alice@prisma.io' }).votes();
```

```graphql
query {
  user(where: { email: "alice@prisma.io" }) {
    votes {
      id
    }
  }
}
```

#### 使用片段 fragment 进行细粒度数据访问

你可以使用`$fragment` API 功能(基于 GraphQL)指定要检索的字段，而不是查询模型的所有标量字段(这是默认行为)。这对于排除大量不需要的字段(如 BLOB 值或大字符串)或检索关系很有用。

##### 例子

*获取用户的`name`和`email`以及相关 links*的`description`和`url`:

```typescript
const fragment = `fragment UserWithLinks on User { name email links { description url } }`
const userWithPosts = await prisma.users().\$fragment(fragment)
```

```graphql
query {
  users {
    ...UserWithLinks
  }
}
fragment UserWithLinks on User {
  name
  email
  links {
    description
    url
  }
}
```

#### 列表的基本过滤器

*Basic*过滤器允许你指定某些条件来约束应在列表中返回哪些对象。过滤器在输入参数的`where`对象中指定，任何列表查询都接受该对象。

`where`对象的类型取决于生成它的模型。

查看`Link`，`User`和`Vote` 的`where`类型

- 查看`Link`的"where"类型[here](https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts#L154)
- 查看`User`的"where"类型[here](https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts#L267)
- 查看`Vote`的"where"类型[here](https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts#L219)

也可以使用`AND`和`OR`字段*组合*多个过滤器。

##### 例子

找到名称中包含"A"的用户:

```typescript
const usersWithAInName: UserNode[] = await prisma.users({
  where: {
    name_contains: 'A',
  },
});
```

```graphql
query {
  users(where: { name_contains: "A" }) {
    id
    name
    email
    password
  }
}
```

使用自动完成功能来探索过滤系统

![](/prisma1/images/XwE5z9o.png)

_查询称为"Alice"或"Bob`的用户_:

```typescript
const usersCalledAliceOrBob: UserNode[] = await prisma.users({
  where: {
    name_in: ['Alice', 'Bob'],
  },
});
```

```graphql
query {
  users(where: { name_in: ["Alice", "Bob"] }) {
    id
    name
    email
    password
  }
}
```

_获取 2018 年 12 月 24 日之前创建的链接_:

```typescript
const linksBeforeChristmas: LinkNode[] = await prisma.links({
  where: {
    createdAt_lt: '2018-12-24',
  },
});
```

```graphql
query {
  links(where: { createdAt_lt: "2018-12-24" }) {
    id
    createdAt
    description
    url
  }
}
```

> Prisma clientAPI 中的日期和时间遵循[ISO 8601](https://en.wikipedia.org/wiki/ISO_8601)标准，该标准通常具有以下形式:`YYYY-MM-DDThh:mm:ss`。

_查询在 description 中有`prisma` **或**`graphql`的链接**并且是**在 2018 年创建的_:

```typescript
const filteredLinks: LinkNode[] = await prisma.links({
  where: {
    AND: [
      {
        OR: [
          {
            description_contains: 'graphql',
          },
          {
            description_contains: 'prisma',
          },
        ],
      },
      {
        AND: [
          {
            createdAt_gt: '2017',
          },
          {
            createdAt_lt: '2019',
          },
        ],
      },
    ],
  },
});
```

```graphql
query {
  links(
    where: {
      OR: [{ description_contains: "graphql" }, { description_contains: "prisma" }]
      AND: [{ createdAt_lt: "2019" }, { createdAt_gt: "2017" }]
    }
  ) {
    id
    description
  }
}
```

实际上可以省略`AND`过滤器，因为默认情况下使用*logical and*组合了多个过滤条件。这意味着上面的过滤器也可以表示如下:

```typescript
const filteredLinks: LinkNode[] = await prisma.links({
  where: {
    OR: [
      {
        description_contains: 'graphql',
      },
      {
        description_contains: 'prisma',
      },
    ],
    createdAt_gt: '2017',
    createdAt_lt: '2019',
  },
});
```

```graphql
query {
  links(
    where: {
      OR: [{ description_contains: "graphql" }, { description_contains: "prisma" }]
      createdAt_lt: "2019"
      createdAt_gt: "2017"
    }
  ) {
    id
    createdAt
    description
    url
  }
}
```

#### 列表的关系过滤器

关系过滤器可用于约束关系列表字段上的返回对象。用于过滤的类型与基本过滤器相同，唯一的区别是过滤器不应用于方法调用的第一级，而是在第二级查询关系时。

##### 例子

```typescript
const linksByUserBeforeChristmas: LinkNode[] = await prisma
  .user({ email: 'alice@prisma.io' })
  .links({
    where: {
      createdAt_lt: '2017-12-24',
    },
  });
```

```graphql
query {
  user(where: { email: "alice@prisma.io" }) {
    links(where: { createdAt_lt: "2017-12-24" }) {
      id
      createdAt
      description
      url
    }
  }
}
```

#### 排序

查询模型对象列表时，可以按该模型类型的任何标量字段对列表进行排序。因此，每个生成的查询模型列表的方法都接受其输入对象上的`orderBy`字段。

`orderBy`字段的类型取决于生成它的模型的标量字段。

查看`link`，`user`和'vote'的`orderBy`类型

- 查看`link` 的`orderBy`类型[here](https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts#L114)
- 查看`user` 的`orderBy`类型[here](https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts#L132)
- 查看`Vote` 的`orderBy`类型[here](https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts#L125)

##### 例子

\_按创建日期(升序)\_links:

```typescript
const sortedLinks: LinkNode[] = prisma.links({
  orderBy: 'createdAt_ASC',
});
```

```graphql
query {
  links(orderBy: createdAt_ASC) {
    id
    createdAt
    description
    url
  }
}
```

_按字母顺序排序用户名(降序)_:

```typescript
const sortedUsers: UserNode[] = prisma.users({
  orderBy: 'name_DESC',
});
```

```graphql
query {
  users(orderBy: name_DESC) {
    id
    name
    email
    password
  }
}
```

#### 分页

查询模型对象列表时，可以通过提供分页参数来获取该列表的*部分信息*。常在 feed 流中使用。

##### 用'first`和`last`向前和从后往前

你可以在对象中向前或从后往前并提供可选的起始对象:

- 要 **从前往后**，使用`first`;用`after`指定一个起始对象。
- 要 **从后往前**，请使用`last`;用`before`指定一个起始对象。

你 **不能**将`first`与`before`或`last`与`after`结合起来。如果你在查询中这样做，`before`/`after`将被忽略，实际上只应用`first`或`last`(在列表的开头或结尾，取决于你使用的是哪个) 。

请注意，你可以在没有错误消息的情况下查询比实际存在的对象更多的对象。

##### 使用`skip`跳过元素

你还可以通过提供`skip`参数跳过任意方向的任意数量的对象:

- 当使用`first`时，`skip`会跳过列表开头的对象。
- 当使用`last`时，`skip`跳过列表末尾的对象。

##### 例子

对于以下示例，我们假设一个正好包含 30 个对象的列表:

![](/prisma1/images/Xh6Qjts.png)

_查询前 3 个链接(从前往后)_:

![](/prisma1/images/O1Jj3Z2.png)

```typescript
const links: LinkNode[] = await prisma.links({
  first: 3,
});
```

```graphql
query {
  links(first: 3) {
    id
    createdAt
    description
    url
  }
}
```

_查询从位置 6 到位置 10 的对象(从前往后)_:

![](/prisma1/images/PpI5X0X.png)

```typescript
const links: LinkNode[] = await prisma.links({
  first: 5,
  skip: 5,
});
```

```graphql
query {
  links(first: 5, skip: 5) {
    id
    createdAt
    description
    url
  }
}
```

_查询最后 3 个对象(从后往前)_:

![](/prisma1/images/pkuYCrV.png)

```typescript
const links: LinkNode[] = await prisma.links({
  last: 3,
});
```

```graphql
query {
  links(last: 3) {
    id
    createdAt
    description
    url
  }
}
```

_查询从第 21 位到第 27 位的对象(从后往前)_:

![](/prisma1/images/iSl9Y07.png)

```typescript
const links: LinkNode[] = await prisma.links({
  last: 7,
  skip: 3,
});
```

```graphql
query {
  links(last: 7, skip: 3) {
    id
    createdAt
    description
    url
  }
}
```

使用`cixnen24p33lo0143bexvr52n`作为`id`_查询对象之后的前 3 个对象_:

![](/prisma1/images/InYSSkQ.png)

```typescript
const links: LinkNode[] = await prisma.links({
  first: 3,
  after: 'cixnen24p33lo0143bexvr52n',
});
```

```graphql
query {
  links(first: 3, after: "cixnen24p33lo0143bexvr52n") {
    id
    createdAt
    description
    url
  }
}
```

使用`cixnen24p33lo0143bexvr52n`作为`id`跳过 3 条数据查询后面的 5 个对象:

![](/prisma1/images/u4WEAJv.png)

```typescript
const links: LinkNode[] = await prisma.links({
  first: 5,
  after: 'cixnen24p33lo0143bexvr52n',
  skip: 3,
});
```

```graphql
query {
  links(first: 5, after: "cixnen24p33lo0143bexvr52n", skip: 3) {
    id
    createdAt
    description
    url
  }
}
```

使用`cixnen24p33lo0143bexvr52n`作为`id`_查询对象之前的最后 5 个对象_:

![](/prisma1/images/306eghw.png)

```typescript
const links: LinkNode[] = await prisma.links({
  last: 5,
  before: 'cixnen24p33lo0143bexvr52n',
});
```

```graphql
query {
  links(last: 5, before: "cixnen24p33lo0143bexvr52n") {
    id
    createdAt
    description
    url
  }
}
```

_查询节点之前的最后 3 个节点，其中 cixnen24p33lo0143bexvr52n 为 id 并跳过 5 个_:

![](/prisma1/images/iZGUiHJ.png)

```typescript
const links: LinkNode[] = await prisma.links({
  last: 3,
  before: 'cixnen24p33lo0143bexvr52n',
  skip: 5,
});
```

```graphql
query {
  links(last: 3, before: "cixnen24p33lo0143bexvr52n", skip: 5) {
    id
    createdAt
    description
    url
  }
}
```

#### 聚合

你可以通过[Connection 查询]提交聚合查询。支持以下聚合功能:

- `count`:计算列表中的对象数
- `avg`(_即将推出_):计算数字列表的平均值。
- `median`(_即将推出_):计算数字列表的中位数。
- `max`(_即将推出_):返回数字列表中最大的元素。
- `min`(_即将推出_):返回数字列表中的最小元素。
- `sum`(_即将推出_):计算数字列表的总和。

> 请参阅[this](https://github.com/prisma/prisma/issues/1312)GitHub 问题以了解有关即将推出的聚合功能的更多信息。

##### 例子

_Count 链接对象的数量_:

```typescript
const linkCount: number = await prisma
  .linksConnection()
  .aggregate()
  .count();
```

```graphql
query {
  linksConnection {
    aggregate {
      count
    }
  }
}
```

### 写入数据-TypeScript

对于前面创建的的数据模型，每个模型类型生成了写入数据六种方法。这些在 GraphQL schema，例如用于`User`模型中的 Mutation 而得到:

- `createUser`:创建一个新的`User`记录在数据库中
- `updateUser`:更新现有`User`记录在数据库中
- `deleteUser`:从数据库中删除现有的`User`记录
- `upsertUser`:更新现有的或在数据库中创建一个新的`User`纪录
- `updateManyUsers`:更新许多现有的`User`数据库中的记录
- `deleteManyUsers`:从数据库中删除现有的许多`User`记录

- 你可以查看一下生成 GraphQL schema 的 API [这里](https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.graphql)
- 你可以查看要生成的 JavaScript client[这里](https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts)。

这些方法中的一个的每个调用被作为[事务]执行，这意味着它要么保证完全成功，或者如果它只是部分地失败但要被全部取消而回到原先状态，所以不必担心数据一致性。

#### 创建对象

当在数据库中创建新的记录，`create`方法需要用一个输入对象包裹起来所有数据。它还提供了一种用于模型创建关系数据，这可以通过使用[嵌套对象写入](#嵌套对象写入)来提供。

每个方法调用的返回包含刚刚创建的模型的所有字段。

- 查看 createLink`的`的输入对象的类型(这里)(https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts#L567)
- 查看 createUser`的`的输入对象的类型(这里)(https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts#L418)
- 查看 createVote`的`的输入对象的类型(这里)(https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts#L214)

##### 例子

_create 新用户_:

```typescript
const newUser: UserNode = await prisma.createUser({
  name: 'Alice',
  email: 'alice@prisma.io',
  password: 'IlikeTurtles',
});
```

```graphql
# generated mutation
mutation {
  createUser(data: { name: "Alice", email: "alice@prisma.io", password: "IlikeTurtles" }) {
    id
    name
    email
    password
  }
}
```

_create 新 vote_:

```typescript
const newVote: VoteNode = await prisma.createVote({
  user: {
    connect: {
      email: 'alice@prisma.io',
    },
  },
  link: {
    connect: {
      id: 'cjli47wr3005b0a23m9crhh0e',
    },
  },
});
```

```graphql
# generated mutation
mutation {
  createVote(
    data: {
      user: { connect: { email: "alice@prisma.io" } }
      link: { connect: { id: "cjli47wr3005b0a23m9crhh0e" } }
    }
  ) {
    id
  }
}
```

_create 新用户并加两个新 links_:

```typescript
const newUserWithLinks: UserNode = await prisma.createUser({
  name: 'Alice',
  email: 'alice@prisma.io',
  password: 'IlikeTurtles',
  links: {
    create: [
      {
        description: 'My first link',
        url: 'https://www.prisma.io',
      },
      {
        description: 'My second link',
        url: 'https://www.howtographql.com',
      },
    ],
  },
});
```

```graphql
# generated mutation
mutation {
  createUser(
    data: {
      name: "Alice"
      email: "alice@prisma.io"
      password: "IlikeTurtles"
      links: {
        create: [
          { description: "My first link", url: "https://www.prisma.io" }
          { description: "My second link", url: "https://www.howtographql.com" }
        ]
      }
    }
  ) {
    id
    name
    email
    password
  }
}
```

#### 更新对象

当在数据库中更新现有记录中，`update`-方法接收具有两个字段的一个输入对象:

- `data`:这类似于你提供给一个`create`-方法输入对象。它包含模型更新的字段，让你提供的关系数据通过[嵌套对象写入](#嵌套对象写入)。
- `where`:这是用来选择要更新的记录。你可以使用任何[唯一]字段来标识记录。

查看`data`的类型和`where`用于`Link`，`User`和`Vote`

- `data`
  - 查看`updateLink`的`data`字段的类型[这里](https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts#L255)
  - 查看`updateUser`的`data`字段的类型[这里](https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts#L468)
  - 查看`updateVote`的`data`字段的类型[这里](https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts#L366)
- `where`
  - 查看`updateLink`的`where`字段的类型[这里](https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts#L455)
  - 查看`updateUser`的`where`字段的类型[这里](https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts#L357)
  - 查看`updateVote`的`where`字段的类型[这里](https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts#L522)

每个方法调用返回一个包含刚更新了模型的所有字段的对象。

##### 例子

*设置现有用户*一个新的名字:

```typescript
const updatedUser: UserNode = await prisma.updateUser({
  data: {
    name: 'Alice',
  },
  where: {
    id: 'cjli512bd005g0a233s1ogbgy',
  },
});
```

```graphql
# generated mutation
mutation {
  updateUser(data: { name: "Alice" }, where: { id: "cjli512bd005g0a233s1ogbgy" }) {
    id
    name
    email
    password
  }
}
```

_Update 一个链接，改变它的发布者为不同的用户_:

```typescript
const updatedLink: LinkNode = await prisma.updateLink({
  data: {
    postedBy: {
      connect: {
        id: 'cjli512bd005g0a233s1ogbgy',
      },
    },
  },
  where: {
    id: 'cjli47wr3005b0a23m9crhh0e',
  },
});
```

```graphql
mutation {
  updateLink(
    data: { postedBy: { connect: { id: "cjli512bd005g0a233s1ogbgy" } } }
    where: { id: "cjli47wr3005b0a23m9crhh0e" }
  ) {
    id
    createdAt
    description
    url
  }
}
```

_delete 发布 vote 的用户_:

```typescript
const updatedVote: VoteNode = await prisma.updateVote({
  data: {
    user: {
      delete: true,
    },
  },
  where: {
    id: 'cjli5aual005n0a233ekv89o4',
  },
});
```

```graphql
mutation {
  updateVote(data: { user: { delete: true } }, where: { id: "cjli5aual005n0a233ekv89o4" }) {
    id
  }
}
```

> 为了成功执行此操作，vote 的 user 不能是必填字段。否则，每一个`Vote`需要连接到一个`User`，删除就报错了。

#### 删除对象

当从数据库中删除记录，该`delete`-方法接收一个输入对象，指定哪个记录是要被删除。类型此输入对象的是相同的`update`-方法`where`对象。

该对象的属性对应于被标记为[唯一](#唯一)的模型的那些字段。对于上面的示例数据模型，这意味着，对于`User`，`Vote`和`Link`它有一个`id`属性。对于`User`它另外接受`email`字段。

查看类型的输入对象的`Link`，`User`和`Vote`

- 查看 deleteLink`的`的输入对象的类型(这里)(https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts#L455)
- 查看 deleteUser`的`的输入对象的类型(这里)(https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts#L357)
- 查看 deleteVote`的`的输入对象的类型(这里)(https://github.com/nikolasburk/prisma-client-examples/blob/master/generated/prisma.ts#L522)

每个方法调用返回一个包含刚删除的模型的所有字段的对象。

##### 例子

*delete 其 ID*链接:

```typescript
const deletedLink: LinkNode = await prisma.deleteLink({
  id: 'cjli47wr3005b0a23m9crhh0e',
});
```

```graphql
mutation {
  deleteLink(where: { id: "cjli47wr3005b0a23m9crhh0e" }) {
    id
    createdAt
    description
    url
  }
}
```

*通过他们的 email 来 delete*用户:

```typescript
const deletedUser: UserNode = await prisma.deleteUser({
  email: 'alice@prisma.io',
});
```

```graphql
mutation {
  deleteUser(where: { email: "alice@prisma.io" }) {
    id
    createdAt
    description
    url
  }
}
```

#### 创建或更新对象(upserts)

UPSERT 操作允许你*尝试*更新现有的记录。如果该记录实际上还不存在，它将被创建。该`upsert`的方法是`create`-和`update`-的搭配方法，这意味着他们收到有三个字段输入参数:

- `where`:相同于在`update`方法中提供的`where`字段
- `update`:相同于在`update`的方法中提供的`data`字段
- `create`:相同于在`create`的方法中提供的输入 input

##### 例子

_Update 链接的 URL。如果该链接不存在，创建一个新的_:

```typescript
const updatedOrCreatedLink: LinkNode = await prisma.upsertLink({
  where: {
    id: 'cjli47wr3005b0a23m9crhh0e',
  },
  update: {
    url: 'https://www.howtographql.com',
  },
  create: {
    url: 'https://www.howtographql.com',
    description: 'Fullstack GraphQL Tutorial',
  },
});
```

```graphql
mutation {
  upsertLink(
    where: { id: "cjli47wr3005b0a23m9crhh0e" }
    update: { url: "https://www.howtographql.com" }
    create: { url: "https://www.howtographql.com", description: "Fullstack GraphQL Tutorial" }
  ) {
    id
  }
}
```

#### 更新和删除多条记录

该 Prisma 的 clientAPI 提供了特殊的方法来更新或一次删除多条记录。GraphQL API 中的相应的 Mutation 被称为[批量 Mutation(#批量 Mutation)。每个`updateMany`-和`deleteMany`-方法返回最终受到影响的操作记录数。

##### 例子

_Update 三个 links，通过其 ID 指定，将其网址重置为空 string_:

```typescript
const updatedLinksCount: number = await prisma.updateManyLinks({
  where: {
    id_in: ['cjli6tknz005s0a23uf0lmlve', 'cjli6tnkj005x0a2325ynfpb9', 'cjli6tq3200620a23s4lp8npd'],
  },
  data: {
    url: '',
  },
}).count;
```

```graphql
mutation {
  updateManyLinks({
    where: {
      id_in: ["cjli6tknz005s0a23uf0lmlve", "cjli6tnkj005x0a2325ynfpb9", "cjli6tq3200620a23s4lp8npd"]
    }
    data: {
      url: ""
    }
  }) {
    count
  }
}
```

**注意**

如果一个或多个所提供的 ID 没有在数据库中实际存在，操作将 **不返回**错误。

_Update 所有 links 的描述中包含字符串'graphql`的数据，其网址重置为空 string_:

```typescript
const updatedLinksCount: number = await prisma.updateManyLinks({
  where: {
    description_contains: 'graphql',
  },
  data: {
    url: '',
  },
}).count;
```

```graphql
mutation {
  updateManyLinks({
    where: {
      description_contains: "graphql"
    }
    data: {
      url: ""
    }
  }) {
    count
  }
}
```

_delete 在 2018 年之前创建的所有链接_:

```typescript
const deleteLinksCount: number = await prisma.deleteManyLinks({
  createdAt_lte: '2018',
}).count;
```

```graphql
mutation {
  deleteManyLinks(where: { createdAt_lte: "2018" }) {
    count
  }
}
```

#### 嵌套对象写入

嵌套的对象写入操作让你在一个单一的 Mutation 中修改多个模型数据库记录。Prisma 的 GraphQL API 相应的概念被称为[嵌套 Mutation](#嵌套的Mutation)。嵌套对象写入可供`create`-和`update`的方法。

如果模型具有相对于不同的 schema，对应关系字段被设定为具有以下性质中的一个子集的对象:

- `create`:创建相关模型的新纪录，并通过关系将其连接。
- `update`:更新通过关系已经连接了相关模型的现有记录。
- `upsert`:更新相关模型的现有记录或创建并连接一个新的。
- `delete`:删除通过关系连接的相关模型的现有记录。
- `connect`:通过连接关系的相关模型的现有记录。
- `disconnect`:删除通过关系连接相关模型的现有记录。

##### 例子

_create 新用户和两个新的 link，并连接一个现有的 link_:

```typescript
const newUserWithLinks: UserNode = await prisma.createUser({
  name: 'Alice',
  email: 'alice@prisma.io',
  password: 'IlikeTurtles',
  links: {
    create: [
      {
        description: 'My first link',
        url: 'https://www.prisma.io',
      },
      {
        description: 'My second link',
        url: 'https://www.howtographql.com',
      },
    ],
    connect: {
      id: 'cjli6tknz005s0a23uf0lmlve',
    },
  },
});
```

```graphql
# generated mutation
mutation {
  createUser(
    data: {
      name: "Alice"
      email: "alice@prisma.io"
      password: "IlikeTurtles"
      links: {
        create: [
          { description: "My first link", url: "https://www.prisma.io" }
          { description: "My second link", url: "https://www.howtographql.com" }
        ]
        connect: { id: "cjli6tknz005s0a23uf0lmlve" }
      }
    }
  ) {
    id
    name
    email
    password
  }
}
```

_delete 用户的链接_:

```typescript
const updatedUser: UserNode = await prisma.updateUser({
  where: {
    id: 'cjli8znnd006n0a23ywc6wf8w',
  },
  data: {
    links: {
      delete: {
        id: 'cjli6tknz005s0a23uf0lmlve',
      },
    },
  },
});
```

```graphql
mutation {
  updateUser(
    where: { id: "cjli8znnd006n0a23ywc6wf8w" }
    data: { links: { delete: { id: "cjli6tknz005s0a23uf0lmlve" } } }
  ) {
    id
  }
}
```

#### 实时数据-TypeScript

该 Prisma 的 client，使用`\$subscribe`属性实时更新和订阅数据库事件和数据。对于你的数据模型中的每个模型类型，Prisma client 公开以此属性的模型命名的(小写)一个函数：Subscriptions。使用此函数意味着比对该模型的[写入]事件（即*create*，_update_，_delete_）有实时需求。你可以提供一个过滤器对象，使得可以进一步约束要接收更新的事件类型。该函数返回[async iterator](https://github.com/tc39/proposal-async-iteration)，只要发生指定的数据库事件，就会发出事件通知。

该`\$subscribe` API 是基于[WebSockets 的(https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)。

##### 例子

*Subscribe"新建"和"更新"`User`*的事件:

```typescript
const createdAndUpdatedUserIterator: UserAsyncIterator = await db.\$subscribe.user({
mutation_in: ['CREATED', 'UPDATED']
}).node()

```

\_Subscribe`User`的电子邮件地址有包含字符串'gmail`的更新:

```typescript
const userIterator: UserAsyncIterator = await db.$subscribe
  .user({
    email_contains: `gmail`,
  })
  .node();
```

### 检查是否存在-TypeScript

该 Prisma 的 client，你可以为你在使用`$exists`属性中的数据库中是否存在一定的记录。对于你的[数据模型]每个模型类型，Prisma client 公开此属性的模型命名的(小写)一个函数。这些函数的接收过滤对象作为指定该记录的条件，并返回一个布尔值;如果有至少一个数据库记录符合指定过滤，该值是 TRUE，否则返回 FALSE。

输入对象具有用于[过滤列表]相同的类型。

#### 例子

*检查是否有具有特定 ID 存在*的用户:

```typescript
const userExists: boolean = prisma.\$exists.user({
id: "cjli6tko8005t0a23fid7kke7"
})

```

_检查是否有用户名为`Alice`或`Bob` 的 user 存在_:

```typescript
const userExists: boolean = prisma.$exists.user({
  name_in: ['Alice', 'Bob'],
});
```

检查是否有在描述中有`prisma`或`graphql`字段存在的 link，并且创建于 2018 年:

```typescript
const linkExists: boolean = await prisma.\$exists.link({
AND: [
{
OR: [{
description_contains: "graphql",
}, {
description_contains: "prisma",
}]
},
{
AND: [{
createdAt_gt: "2017"
}, {
createdAt_lt: "2019"
}]
}
],
})

```

### graphql-requests-TypeScript

该 Prisma 的 client，可以直接发送 GraphQL Query 和 Mutation，`$request`方法请求你的 Prisma service:

```typescript
$request: <T = any>(query: string, variables?: {[key: string]: any}) => Promise<T>;
```

#### 例子

_查询单个用户_:

```typescript
query {
user(id: "cjcdi63j80adw0146z7r59bn5") {
id
name
}
}
const result: any = prisma.\$request(query)
// 示例 result:
// {"data": { "user": { "id": "cjcdi63j80adw0146z7r59bn5", "name": "Sarah" } } }

```

*使用 variables 查询*单个用户:

```typescript
  query ($userId: ID!){
    user(id: $userId) {
      id
      name
    }
  }
const variables: UserWhereUniqueInput = { id: 'cjcdi63j80adw0146z7r59bn5' }
const result: any = prisma.$request(query, variables)
  .then(result => console.log(result))
// 示例result:
// {"data": { "user": { "id": "cjcdi63j80adw0146z7r59bn5", "name": "Sarah" } } }
```

### 读取数据-Go

每当使用 Prisma client 查询模型时，都会获取该模型的*all 标量 fields*。 无论是查询单个对象还是对象列表，都是如此。

例如，以下查询返回单个"User"的所有标量字段:

```go
user := client.User(&prisma.UserWhereInput{ "email": "bob@prisma.io" })

```

在这种情况下，返回的`user`对象将具有四个属性(对应于`User`模型的标量字段):`id`，`name`，`email`和`password`。

`links`和`votes`字段都是*relation fields*，因此不包含在查询中。

以下是获取`User`对象*list*的示例:

```go
users := client.Users(nil).Exec()
```

与前面的查询类似，`users`数组中的每个对象只有标量和无关系字段。

### 写入数据-Go

与 JS 和 TS 类似，仅语法不同。

#### 创建对象

当在数据库中创建新的记录，`create`法需要它包装上创建的所有记录的字段一个输入对象。它还提供了一种用于模型创建关系数据，这可以通过使用[嵌套对象写入](#嵌套对象写入)来供给。

每个方法调用返回包含刚刚创建的模型的所有字段的对象。

##### 例子

_create 新用户_:

```go
name := "Alice",
email := "alice@prisma.io",
password := "IlikeTurtles"
newUser, err := db.CreateUser(&prisma.UserCreateInput{
Name: &name,
Email: &email,
Password: &password,
}).Exec()

```

```graphql
# generated mutation
mutation {
  createUser(data: { name: "Alice", email: "alice@prisma.io", password: "IlikeTurtles" }) {
    id
    name
    email
    password
  }
}
```

### Subscription-Go

目前暂时没有。

### 检查是否存在-Go

##### 例子

*检查是否具有特定 ID 存在*的用户:

```go
userExists := client.Exists.User(&prisma.UserWhereUniqueInput{
ID: "cjli6tko8005t0a23fid7kke7",
})

```

#### graphql-request-go

该 Prisma 的 client，你可以直接使用`$request`方法发送 GraphQL Query 和 Mutation 到你的 Prisma service:

```go
GraphQL(query string, variables map[string]interface{}) (map[string]interface{}, error)
```

由于 GraphQL 操作传递无类型(作为一个普通字符串)，返回的承诺的类型是`any`。

##### 例子

_查询单个用户_:

```go
query := `query { user(id: "cjcdi63j80adw0146z7r59bn5") { id name } }`
result := client.GraphQL(query, nil)
// sample result:
// map[data:[map[user:[map[id:cjcdi63j80adw0146z7r59bn5 name:Sarah]]]]]
```

*使用 variables*查询单个用户:

```go
query := `
  query ($id: ID!){
    user(id: $id) {
      id
      name
    }
  }
`
variables := map[string]interface{}{
  "id": "cjcdi63j80adw0146z7r59bn5",
result := client.GraphQL(query, variables)
// sample result:
// map[data:[map[user:[map[id:cjcdi63j80adw0146z7r59bn5 name:Sarah]]]]]
```

_Creating 新用户_:

```go
mutation := `mutation ($name: String!){ createUser(name: $name) { id name } }`
variables := map[string]interface{}{ "name": "Alice" }
result := client.GraphQL(mutation, variables)
// sample result:
// map[data:[map[createUser:[map[id:cjlhqfbfa003t0a23rhzjragl name:Alice]]]]]
//{ "数据":{ "的 createUser":{ "ID": "cjlhqfbfa003t0a23rhzjragl"， "名": "爱丽丝"}}}
```

下一节是 Prisma 概念，来深入理解它。
