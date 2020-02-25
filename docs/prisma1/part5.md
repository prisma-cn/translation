---
title: Prisma GraphQL API
description: 本章介绍了Prisma GraphQL API, prisma 和graphql的对应关系
keywords:
  - Prisma GraphQL API
  - prisma
  - Prisma client
---

每个 Prisma 服务都公开一个 GraphQL API，其中包含 CRUD 和服务数据模型中定义的类型的实时操作。 此 API 称为 **Prisma API**。

定义 Prisma API 的类型和操作的 GraphQL schema 称为 **Prisma GraphQL schema**。 它由 Prisma 自动生成。

试试的 Prisma 的 playground

点击[这里](https://eu1.prisma.sh/running-examples/hello-world/dev)试试在 GraphQL playground 中的 Prisma API。

所述 Prisma API 是基于以下的数据模型:

```graphql
type Post {
  id: ID! @id
  createdAt: DateTime! @createdAt
  updatedAt: DateTime! @updatedAt
  isPublished: Boolean! @default(value: false)
  title: String!
  text: String!
  author: User!
}

type User {
  id: ID! @id
  email: String! @unique
  password: String!
  name: String!
  posts: [Post!]!
}
```

本章介绍所有你需要了解的 Prisma API，以及如何可以在各种环境中使用。

### 概念

本节解释了一些重要的概念，以了解 Prisma API。

除非另有说明，本页上的例子是基于以下数据模型的 Prisma API:

```graphql
type User {
  id: ID! @id
  email: String @unique
  name: String!
  posts: [Post!]!
}

type Post {
  id: ID! @id
  title: String!
  published: Boolean! @default(value: false)
  author: User
}
```

#### Prisma GraphQL schema

Prisma 数据库是定义 Prisma API 的数据类型和操作的[GraphQL schema](https://www.prisma.io/blog/graphql-server-basics-the-schema-ac5e2950214e/)。 它是自动生成的，并为 service 的数据模型中指定的模型指定 CRUD 和实时操作。

![](/prisma1/images/jHkNjKU.png)

#### 节点选择

Prisma API 中的许多操作仅影响现有节点的子集，有时仅影响单个节点，例如更新或删除节点。

在这些情况下，你需要一种方法来询问 API 中的特定节点。 这就是`where`过滤器参数的用途。 它允许你指定用于选择应应用操作的节点的条件。

可以通过使用`@unique`指令注释的任何字段选择节点。

以下是需要选择节点的几种情况。

**通过其`email`检索单个`User`节点**:

```graphql
query {
  user(where: { email: "alice@prisma.io" }) {
    id
  }
}
```

```javascript
{
  "data": {
    "user": {
      "id": "cjkawhcz44a4c0a84un9a86wt"
    }
  }
}
```

**更新单个`POST`节点的`title`**:

```graphql
mutation {
  updatePost(where: { id: "ohco0iewee6eizidohwigheif" }, data: { title: "GraphQL is awesome" }) {
    id
  }
}
```

```javascript
{
  "data": {
    "updatePost": {
      "id": "ohco0iewee6eizidohwigheif"
    }
  }
}
```

**一次性完成对`POST`节点的批量更新`published`**(见[批量 Mutation(#批量 Mutation)):

```graphql
mutation {
  updateManyPosts(
    where: {
      id_in: ["ohco0iewee6eizidohwigheif", "phah4ooqueengij0kan4sahlo", "chae8keizohmiothuewuvahpa"]
    }
    data: { published: true }
  ) {
    count
  }
}
```

```json
{
  "data": {
    "updateManyPosts": {
      "count": 3
    }
  }
}
```

#### 批量 Mutation

节点选择概念的一个应用是 Prisma API 暴露的批量 Mutation。 批量更新或删除已经过优化，可以更改大量节点。 因此，这些 Mutation 仅返回受影响的节点数，而不是特定节点上的完整信息。

例如，Mutation`updateManyPosts`和`deleteManyPosts`提供了一个`where`参数来选择特定节点，并返回一个带有受影响节点数的`count`字段（参见例子）。

```graphql
mutation {
  deleteManyUsers(where: { email_in: ["alice@prisma.io", "bob@prisma.io"] }) {
    count
  }
}
```

```json
{
  "data": {
    "deleteManyUsers": {
      "count": 2
    }
  }
}
```

#### 连接(Relay Pagination & Aggregations)

PRISMA 提供两种方法通过关系字段检索节点列表:

- 简单的关系查询(*direct*节点检索):

```graphql
query {
  posts {
    id
    title
    published
  }
}
```

- Connection 的查询:

```graphql
query {
  postsConnection {
    edges {
      node {
        id
        title
        published
      }
    }
  }
}
```

与直接返回节点列表的简单关系查询相比，连接查询基于[Relay Connection](https://facebook.github.io/relay/graphql/connections.htm)模型。 除了分页信息之外，Prisma API 中的连接还具有高级功能，如聚合。

例如，虽然 posts 查询允许你选择特定的 Post 节点，按某些字段对它们进行排序并对结果进行分页，但 postsConnection 查询还允许你计算所有未发布的帖子：

```graphql
query {
  postsConnection {
    # `aggregate` 允许执行常见的聚合操作
    aggregate {
      count
    }
    edges {
      # 每个“node”指的是一个“Post”节点
      node {
        title
      }
    }
  }
}
```

```json
{
  "data": {
    "postsConnection": {
      "aggregate": {
        "count": 1
      },
      "edges": [
        {
          "node": {
            "title": "Watch all the talks from GraphQL Europe: bit.ly/gql-eu"
          }
        }
      ]
    }
  }
}
```

> 查看[这些](https://github.com/prisma/prisma/issues/1312)功能的要求，了解即将实现的聚合操作。

#### Transactions＆嵌套 Mutation

Prisma API 中不是批处理操作的单个 Mutation 总是以事务方式执行，即使它们包含许多可能分布在多个相关节点上的操作。 这对于在多种类型上执行多个数据库写入的嵌套 Mutation 特别有用。

嵌套 Mutation 是触及至少两个节点的 Mutation，每个节点具有不同类型。 这是一个简单的例子：

```graphql
mutation {
  createUser(
    data: {
      name: "Sarah"
      posts: {
        create: [{ title: "GraphQL is great" }, { title: "Prisma is a data access layer" }]
        connect: [{ id: "cjk1e3t7i1ark0b299pvrge5m" }]
      }
    }
  ) {
    id
    posts {
      id
    }
  }
}
```

这种 Mutation 总共涉及了 **4 个**节点:

- 它*creates* **1 个**新的`User`节点。
- 它*creates* **2 个**`POST`节点。这两个`POST`节点也是直接*connected*到新的`User`节点。
- 它*connects*新的`User`节点到**1 个现有**`POST`节点。

这种 Mutation 总进行**6 个**单操作:

- _Creating_ **1 个**`User`节点。
- _Creating_ **2 个**`POST`节点。
- _Connecting_ **3 个**`POST`节点到新的`User`节点。

如果上述任何一项操作的失败(例如，由于的违反`@unique`约束)，则\_全部\_Mutation 回滚!

Mutation 是事务性的，意味着它们是原子的和孤立的。 这意味着在相同嵌套 Mutation 的两个单独动作之间，没有其他 Mutation 可以改变数据。 在处理完整 Mutation 之前，也不能观察到单个动作的结果。

#### 级联删除

Prisma 支持数据模型中关系的不同删除行为。 有两种主要的删除行为：

- `CASCADE`:当删除与一个或多个其他节点有关的节点时，也会删除这些节点。
- `SET_NULL`:当删除与一个或多个其他节点有关的节点时，引用已删除节点的字段将设置为 null。

如上所述，你可以为相关节点指定专用删除行为。 这就是`@ relation`指令的`onDelete`参数。

请看下面的例子:

```graphql
type User {
  id: ID! @id
  comments: [Comment!]! @relation(name: "CommentAuthor", onDelete: CASCADE)
  blog: Blog @relation(name: "BlogOwner", onDelete: CASCADE)
}
type Blog {
  id: ID! @id
  comments: [Comment!]! @relation(name: "Comments", onDelete: CASCADE)
  owner: User! @relation(name: "BlogOwner", onDelete: SET_NULL)
}
type Comment {
  id: ID! @id
  blog: Blog! @relation(name: "Comments", onDelete: SET_NULL)
  author: User @relation(name: "CommentAuthor", onDelete: SET_NULL)
}
```

让我们研究一下三种类型的删除行为:

- 当一个`User`节点被删除，
  - 所有相关的`Comment`节点将被删除。
  - 相关`Blog`节点将被删除。
- 当一个`Blog`节点被删除，
  - 所有相关的`Comment`节点将被删除。
  - 相关`User`节点将有其`blog`字段设置为`null`。
- 当一个`Comment`节点被删除，
  - 相关`Blog`节点继续存在，并且删除`Comment`节点从其`comments`列表中删除。
  - 相关`User`节点继续存在，并且删除`Comment`节点从其`comments`列表中删除。

#### Authentication 认证

可以使用 prisma.yml 中的服务`secret`（指定为`secret`属性）来保护 Prisma API：

```yaml
secret: my-secret-42
```

作为 Prisma services 的开发者，你可以选择自己的服务密码。当服务被使用包含`secret`属性 prisma.yml 部署，该服务的 Prisma API 将需要通过*Service token*(JWT)的认证:

![](/prisma1/images/cCmp8JI.png)

获得业务令牌最简单的方法是通过在你的 prisma.yml 所在的同一目录中运行`prisma token`命令:

```
\$ prisma token
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InNlcnZpY2UiOiJkZW1vQGRldiIsInJvbGVzIjpbImFkbWluIl19LCJpYXQiOjE1MzI1ODgzNzAsImV4cCI6MTUzMzE5MzE3MH0.Nv8coqsiwdwoSfWCBJHYfnr0WK2GRyqO5xTN6Q3IVkw

```

将所生成的令牌复制到到所述 Prisma API 的 HTTP 请求`Autorization`头:

```
curl '**YOUR_PRISMA_ENDPOINT**' \\
-H 'Content-Type: application/json' \\
-H 'Authorization: Bearer **YOUR_SERVICE_TOKEN**' \\
--data-binary '{"query":"mutation { createUser(data: { name: "Sarah" }) { id } }"'

```

**注意**

不要将服务机密和服务“令牌”与用于保护 Prisma 服务器的 Management API 的 Prisma Management API 密钥混淆。

#### Service secret

Service secret 是由 Prisma services 的开发者指定的字母数字的随机字符串。在 prisma.yml 的`secret`属性中设置:

```yaml
secret: my-secret-42
```

#### Service token

Service token 遵守[JSON web token](https://jwt.io/)(JWT)规范([RFC 7519](https://tools.ietf.org/html/rfc7519)):

_"JSON Web Token"(JWT)是一种紧凑的，URL 安全的方式，用于表示要在双方之间传输的声明.JWT 中的声明被编码为 JSON 对象，用作 JSON Web 签名的有效负载（JWS） ）结构或作为 JSON Web 加密（JWE）结构的明文，使声明能够通过消息验证代码（MAC）进行数字签名或完整性保护和/或加密。“_

一个 JWT 有以下三个部分组成:

- **Header**: 标头通常由两部分组成：令牌的类型，即 JWT，以及正在使用的散列算法（在 Prisma 服务令牌的情况下为 HS256）。

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

- **Payload**:`payload`包含声明。 声明是关于实体（通常是用户）和其他数据的声明。 以下是部署到 dev 阶段的名为 demo 的服务的样子：

```json
{
  "data": {
    "service": "demo@dev",
    "roles": [
      "admin"
    ]
  },
  "iat": 1532530208,
  "exp": 1533135008
}
}
```

- **Signature**:签名用于验证消息在此过程中未发生更改。 要创建签名部分，你必须采用编码标头，编码的有效负载，秘密，标头中指定的算法，并对其进行签名。 例如，如果要使用 HMAC SHA256 算法，将按以下方式创建签名：

```javascript
HMACSHA256(base64UrlEncode(header) + '.' + base64UrlEncode(payload), secret);
```

因此，JWT 通常是这样的:`xxxxx.yyyyy.zzzzz`

> 了解更多关于 JWTs [这里](https://jwt.io/introduction/)。

##### Claims

所述 JWT 必须包含以下的[Claims](https://jwt.io/introduction/#payload):

- **Issued at**：`iat`字段包含一个 Unix 时间戳，其中包含生成令牌的确切时间。
- **Expiration date**：`exp`字段包含表示令牌到期日期的 Unix 时间戳。 服务令牌完全有效**一周**。
- **Service information**：`data`字段是一个有两个键的对象
- `service`字段指定服务的*name*和*stage*
- “roles”字段包含使用该令牌授予的访问权限。 将来可能会通过引入一个角色概念来支持更细粒度的访问控制，例如`[“write：Log”，“read：*”]`

这里有一个 JWT 的示例 Payload:

```json
{
  "data": {
    "service": "myservice@prod",
    "roles": ["admin"]
  },
  "iat": 1532530208,
  "exp": 1533135008
}
```

##### 发送 service token

该 service token 是\_bearer_token:

\_ **\_bearer_token**:一种安全令牌，其属性是拥有该令牌的任何一方（“持票人”）可以以任何其他拥有该令牌的方式使用该令牌。 使用不记名令牌不需要持票人证明拥有加密密钥材料（占有证明）。

它需要由[OAuth2.0 的授权框架规格](http://self-issued.info/docs/draft-ietf-oauth-v2-bearer.html#authz-header)中指定要被发送到 Prisma API。

当发送在/由 HTTP 定义的授权请求报头字段 1.1 [RFC2617]的访问令牌，客户端使用的`Bearer`认证方案来发送访问令牌。

_例如:_

```

GET /resource HTTP/1.1
Host: server.example.com
Authorization: Bearer mF_9.B5f-4.1JqM

```

此方案的 Authorization 标头字段的语法遵循[RFC2617]第 2 节中定义的 Basic 方案的使用。 请注意，与 Basic 一样，它不符合[RFC2617]第 1.2 节中定义的通用语法，但与为 HTTP 1.1 [HTTP-AUTH]开发的通用身份验证框架兼容，尽管它不遵循首选实践 其中概述的是为了反映现有的部署。 Bearer 凭证的语法如下：

```

b64token = 1*( ALPHA / DIGIT /
"-" / "." / "\_" / "~" / "+" / "/" ) *"="
credentials = "Bearer" 1\*SP b64token
Clients SHOULD make authenticated requests with a bearer token using the `Authorization` request header field with the `Bearer` HTTP authorization scheme. Resource servers MUST support this method.

```

#### 例:保护你的 Prisma API

下面是一个例子，如何保护你的 Prisma API，使对请求身份验证。

##### 未受保护的 Prisma API

假设你开始通过以下服务配置配置一个新的 Prisma services:

**`datamodel.prisma` **

```graphql
type User {
  id: ID! @id
  name: String!
}
```

\*\*\*\*prisma.yml

```yaml
endpoint: https://eu1.prisma.sh/john-doe/demo/dev # deployed to a Prisma Demo server
datamodel: datamodel.prisma
```

在这个例子中，假设该服务被部署到一个演示服务器，因此可在公共互联网上。

当使用上述服务配置部署服务时，知道服务端点的每个人都能够向其 API 发送查询和 Mutation，这意味着他们可以有效地对你的数据库执行任意读取和写入：

```
curl 'https://eu1.prisma.sh/jane-doe/demo/dev' \\
-H 'Content-Type: application/json' \\
--data-binary '{"query":"mutation { createUser(data: { name: \"Sarah\" }) { id }}"}'

```

当使用 GraphQL Playground，需要跟 Prisma API 请求时不需要对 HTTP 头进行设置。

##### 保护 Prisma API

你需要为了你的 Prisma API 做的唯一的事情是在 prisma.yml 设置服务密码:

```yaml
endpoint: https://eu1.prisma.sh/john-doe/demo/dev # deployed to a Prisma Demo server
datamodel: datamodel.prisma
secret: my-secret-42
```

要应用此更改，你还需要重新部署服务:

```
prisma deploy

```

如果你现在正在试图使用`curl`重新发送上述 HTTP 请求:

```
curl 'https://eu1.prisma.sh/jane-doe/demo/dev' \\
-H 'Content-Type: application/json' \\
--data-binary '{"query":"mutation { createUser(data: { name: \"Sarah\" }) { id }}"}'

```

你会收到以下错误:

```json
{
  "errors" : [ {
    "message" : "Your token is invalid. It might have expired or you might be using a token from a different project.",
    "code" : 3015,
    "requestId" : "eu1:api:cjk28t8e55tld0b296sr2ey6v"
  } ]
}⏎
```

对于针对 Prisma API 发出的所有请求，无论是请求的查询，Mutation 还是订阅，都会发生这种情况。 如果在 GraphQL Playground 中未设置 HTTP 标头，请求将失败并显示相同的错误消息：

![](/prisma1/images/P8wtcSU.png)

要解决此问题，你需要在 HTTP 请求的 Authorization 标头字段中包含服务标记。 你可以使用 Prisma CLI 获取服务令牌：

```

prisma token
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InNlcnZpY2UiOiJkZW1vQGRldiIsInJvbGVzIjpbImFkbWluIl19LCJpYXQiOjE1MzI1MzAyMDgsImV4cCI6MTUzMzEzNTAwOH0.FM6haUilhi89-C-2h7asV3-Ot6NQrs1qoaKL-wPjj04

```

CLI 打印的令牌需要在 Authorization 标头字段中设置，并以 Bearer 为前缀：

```

curl 'https://eu1.prisma.sh/jane-doe/demo/dev' \\
-H 'Content-Type: application/json' \\
-H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InNlcnZpY2UiOiJkZW1vQGRldiIsInJvbGVzIjpbImFkbWluIl19LCJpYXQiOjE1MzI1MzAyMDgsImV4cCI6MTUzMzEzNTAwOH0.FM6haUilhi89-c-2h7asV3-Ot6NQrs1qoaKL-wPjj04' \\
--data-binary '{"query":"mutation { createUser(data: { name: \"Sarah\" }) { id }}"}'

```

同样地，在 GraphQL Playground，你需要(JSON 格式)在左下角的**HTTP header**窗格设置它:

```json
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InNlcnZpY2UiOiJkZW1vQGRldiIsInJvbGVzIjpbImFkbWluIl19LCJpYXQiOjE1MzI1MzAyMDgsImV4cCI6MTUzMzEzNTAwOH0.FM6haUilhi89-c-2h7asV3-Ot6NQrs1qoaKL-wPjj04M"
}
```

如果你使用了`PRISMA playground`命令打开 Playground 上，Prisma 的 CLI 自动注入了一个有效的服务标识`Authorization`头。

![](/prisma1/images/xBkBn9X.png)

### Queries

#### 如何生成 Prisma API 中的`query`？

一个 Prisma services 的 GraphQL API 在 Prisma 的 GraphQL schema 中指定。Prisma GraphQL schema 是基于数据模型自动生成的:

![](/prisma1/images/jHkNjKU.png)

在`Query`类型 Prisma 的 GraphQL schema 定义了所有的 Prisma API 接受查询。

作为一个例子，考虑下面的数据模型:

```graphql
type User {
  id: ID! @id
  name: String!
}
```

这是 Prisma 会自动生成的`Query`的 type:

```graphql
type Query {
  users(
    where: UserWhereInput
    orderBy: UserOrderByInput
    skip: Int
    after: String
    before: String
    first: Int
    last: Int
  ): [User]!
  user(where: UserWhereUniqueInput!): User
  usersConnection(
    where: UserWhereInput
    orderBy: UserOrderByInput
    skip: Int
    after: String
    before: String
    first: Int
    last: Int
  ): UserConnection!
}
```

对于 datamodel 中的每种类型，都会生成三个查询。 以上面的“User”类型为例，这些查询是：

- `user`:检索单个`User`节点
- `users`:检索`User`节点列表(作为一个对象查询)
- `usersConnection`:检索`User`节点列表(作为聚合查询)

要详细检查你的 Prisma API 的所有可用的操作，你可以读取 Prisma services 的 GraphQL schema。它可以用[GraphQL CLI](https://github.com/graphql-cli/graphql-cli)下载:

```
graphql get-schema --endpoint **YOUR_PRISMA_ENDPOINT** --output prisma.graphql --no-all

```

了解 Prisma API 具体功能的另一种方法是探索 GraphQL Playground 中自动生成的 API 文档。 你可以通过单击 Playground 右边缘的绿色** SCHEMA ** - 按钮来执行此操作：

![](/prisma1/images/XdVy80I.jpg)

#### 本页数据模型例子

本节的所有示例查询基于此数据模型配置 Prisma services:

```graphql
type Post {
  id: ID! @id
  title: String!
  published: Boolean!
  author: User!
}
type User {
  id: ID! @id
  age: Int
  email: String! @unique
  name: String!
  accessRole: AccessRole
  posts: [Post!]!
}
enum AccessRole {
  USER
  ADMIN
}
```

### Query 查询的概念

Prisma API 提供两种查询:

- **对象查询**:获取特定对象类型的单个或多个节点。
- **聚合查询**:公开聚合和“Relay”兼容连接等高级功能，实现强大的分页模型。

下面的概念也得记住有用:

- **分层（或嵌套）查询**：跨关系获取数据。
- **查询参数**:允许筛选，排序，分页等。

### 对象查询

我们可以使用对象查询来获取无论是**单个节点**，或某个对象类型节点的**列表**。

在这里，我们使用`posts`查询来获取`POST`节点列表。在响应中，我们只包括`id`和每个 POST 节点的`title`:

```graphql
query {
  posts {
    id
    title
  }
}
```

我们也可以查询特定`POST`节点。请注意，我们使用了`where`参数选择节点:

```graphql
query {
  post(where: { id: "cixnen24p33lo0143bexvr52n" }) {
    id
    title
    published
  }
}
```

因为`User`是在我们的数据模型另一种类型，`users`是另一种可用的查询。同样，我们可以使用`where`参数指定返回的用户条件。在这个例子中，我们筛选出`age`比`18`更高的所有`User`节点:

```graphql
query {
  users(where: { age_gt: 18 }) {
    id
    name
  }
}
```

这也适用于跨关系。在这里，我们要提取那些节点中`age`比`18`更高的`author`的`POST`:

```graphql
query {
  posts(where: { author: { age_gt: 18 } }) {
    id
    title
    author {
      name
      age
    }
  }
}
```

### 聚合查询

对象查询直接返回节点列表。在特殊情况下，或者使用高级功能时，使用**聚合查询**是较好的选择。它们的附加信息(完全符合)[Relay connections](https://facebook.github.io/relay/graphql/connections.htm)。

Relay connections 的核心思想是提供关于在数据图中的*edges*元信息。例如，每个 edge 不仅具有关于对应的对象访问信息(`node`)，而且还有`cursor`，允许实现强大的[基于指针的分页](https://graphql.org/learn/pagination/#complete-connection-model)。

在这里，我们撷取了使用`postsConnection`查询所有`POST`节点。请注意，我们还要求每个 edge 附带`cursor`:

```graphql
# Fetch all posts

query {
  postsConnection {
    edges {
      cursor
      node {
        id
        title
      }
    }
  }
}
```

聚合查询还通过字段公开聚合功能 aggregate：

```graphql
#含有"GraphQL"标题的所有帖子
query {
  postsConnection(where: { title_contains: "GraphQL" }) {
    aggregate {
      count
    }
  }
}
```

> 更多聚合将随时间被添加。找到[这里]路线图的更多信息(https://github.com/prisma/prismagraphql/issues/1312)。

### 跨关系查询数据

数据模型中的每个可用关系都会为其连接的两个模型的查询添加一个新字段。

在这里，我们取一个特定的`User`节点，并使用`posts`获取与其相关的全部`POST`节点:

```graphql
query {
  user(where: { id: "cixnekqnu2ify0134ekw4pox8" }) {
    id
    name
    posts {
      id
      published
    }
  }
}
```

`user.posts`行为与`posts`查询相同，因为它允许你指定你感兴趣的 Post 类型的字段。

### 查询参数

在整个 Prisma API 中，你将找到可以提供的查询参数，以进一步控制查询响应。它可以是以下任何一种：

- **Ordering**排序:使用`orderBy`对任何字段值排序节点
- **Filtering**过滤:使用标量或关系过滤器选择查询中的节点`where`
- **Pagination**分页:使用`first`和`before`，`last`和`after`，和在查询节点切片`skip`

这些查询参数可以结合起来，实现非常具体的查询响应。

#### 排序

查询的所有节点可以提供`orderBy`参数的类型的每个字段:`ORDERBY:<字段> _ASC`或`ORDERBY:<字段> _DESC`。

**按 title 正序排序所有 Post 节点的列表:**

```graphql
query {
  posts(orderBy: title_ASC) {
    id
    title
    published
  }
}
```

**按 published 倒序排序所有 Post 节点的列表:**

```graphql
query {
  posts(orderBy: published_DESC) {
    id
    title
    published
  }
}
```

不必在实际查询中选择要排序的字段。如果未指定排序，则会按 id 字段自动按顺序排序响应。

**注意**

这是目前无法排序的[多个字段](https://github.com/prismagraphql/feature-requests/issues/62)

#### 过滤

当查询类型的所有节点上，你可以提供不同的参数给`where`参数根据你的要求来约束数据。可用选项取决于在相关类型上定义的标量和关系字段。

##### 应用单一过滤器

如果只为参数提供一个参数 where，则查询响应将仅包含符合此约束的节点。可以使用 AND/OR 组合多个过滤器，有关详细信息，请参见下文。

###### 通过一个具体的值过滤

筛选查询响应的最简单方法是为要筛选的特定字段提供具体值。

查询尚未`published`的 **所有`POST`节点:**

```graphql
query {
  posts(where: { published: false }) {
    id
    title
    published
  }
}
```

**查询所有`User`节点特定的`name`:**

```graphql
query {
  users(where: { name: "Alice" }) {
    id
  }
}
```

**查询所有具有特定`age` 的`User`节点:**

```graphql
query {
  users(where: { age: 30 }) {
    id
  }
}
```

###### 高级过滤条件

根据要筛选的字段类型，你可以访问可用于筛选查询响应的不同高级条件。

**查询所有`POST`节点，其`title`是一个指定的字符串:**

```graphql
query {
  posts(where: { title_in: ["My biggest Adventure", "My latest Hobbies"] }) {
    id
    title
    published
  }
}
```

**查询所有`User`节点，其`age`小于 42 **:

```graphql
query {
  users(where: { age_lt: 42 }) {
    id
  }
}
```

##### 关系过滤器

对于一对一关系，你可以通过嵌入相应的参数来定义相关节点上的条件 where。

**查询其中`author`有`USER`访问角色的所有`POST`节点:**

```graphql
query {
  posts(where: { author: { accessRole: USER } }) {
    title
  }
}
```

对于*一对多*关系，另外三个参数可用:`every`，`some`和`none`，定义的条件应符合`every`，`some`或`none`相关节点。

查询至少有一个 Post 节点 published 的所有 User 节点：

```graphql
query {
  users(where: { posts_some: { published: true } }) {
    id
    posts {
      published
    }
  }
}
```

对于一对一或多对多关系的嵌套参数中也可以使用关系过滤器。

**查询*like*的`author`不是`ADMIN`访问角色的`POST`所有`User`节点:**

```graphql
query {
  users(where: { likedPosts_none: { author: { accessRole: ADMIN } } }) {
    name
  }
}
```

> `likedPosts`不是上述数据模型的一部分，但可以很容易地通过将相应字段添加到`User`:`likedPosts: [Post!]! @relation(name: "LikedPosts")`。我们还提供了一个 name 关系来解决我们原本会创建的歧义，因为有两个关系字段针对 Post 该 User 类型。

##### 结合使用多种过滤器

你可以使用过滤器组合程序` OR``AND `和`NOT`创建的过滤条件的任意逻辑组合:

- 对于要评估为“true”的`AND`过滤器，*all*嵌套条件必须为“true”。
- 对于要评估为“true”的“OR”过滤器，*至少有一个*嵌套条件必须为“true”。
- 对于要评估为“true”的`NOT`过滤器，*所有*嵌套条件都必须为“false”。

###### 使用` OR``AND `和 `NOT`

让我们先从一个简单的例子:

**查询`published` 和其`title`是一个字符串的给定列表中的所有`POST`节点:**

```graphql
query {
  posts(
    where: {
      AND: [{ title_in: ["My biggest Adventure", "My latest Hobbies"] }, { published: true }]
    }
  ) {
    id
    title
    published
  }
}
```

`OR`，`AND`和`NOT`每个接受一个*list*作为输入，其中每个列表项是一个对象，因此需要用大括号包裹。从上述查询的样品过滤器条件包含两个滤波器对象:

- `{title_in: ["My biggest Adventure", "My latest Hobbies"]}`
- `{published: true}`

只有当针对`POST`节点这两个过滤条件符合时，该节点将被包含在响应。

###### `AND`，`OR`和`NOT`过滤器任意组合

你可以组合甚至嵌套过滤器组合器 AND，OR 并 NOT 创建过滤条件的任意逻辑组合。

**在提供的列表中的所有`POST`节点查询要么`published` 和其`title`是在给定的字符串，或者有具体的`id`:**

```graphql
query {
  posts(
    where: {
      OR: [
        { AND: [{ title_in: ["My biggest Adventure", "My latest Hobbies"] }, { published: true }] }
        { id: "cixnen24p33lo0143bexvr52n" }
      ]
    }
  ) {
    id
    title
    published
  }
}
```

注意我们如何将 AND 组合嵌套在 OR 组合器中。

##### 局限性

目前，[**标量列表过滤器**](https://github.com/prismagraphql/feature-requests/issues/60)[**JSON 滤波器**](https://github.com/prismagraphql/功能请求/问题/148)不可用。加入 GitHub 相应功能的讨论。

### 分页

当查询的特定对象类型的所有节点，可以提供参数，让你进行分页查询响应。

#### 用`first`和`last`实现从前往后查询和从后往前查询

分页允许你请求一定数量的节点。 你可以通过节点向前或向后搜索并提供可选的起始节点：

- **从前往后查询**，用`first`; 指定起始节点用`after`。
- **从后往前查询**，使用`last`; 指定起始节点用`before`。

你不能把`first`和`before`或`last`和`after`结合起来。 如果你在查询中这样做，`before`或`after`将被简单地忽略，只应用`first`或`last`（在列表的开头或结尾，取决于你使用的是哪一个）。

请注意，当你只有 5 条数据时，你可以查询更多比如 10 条数据，也不会有错误消息。

#### 跳过`skip`

你还可以通过提供`skip`参数跳过任意方向的任意数量的节点：

- 当使用`first`时，`skip`会跳过列表开头的元素
- 当使用`last`时，`skip`跳过列表末尾的元素

#### 例子

对于下面的例子，我们假设有三十条数据:

![](/prisma1/images/Xh6Qjts.png)

**查询前 3 个节点(从前往后):**

![](/prisma1/images/O1Jj3Z2.png)

```graphql
query {
  posts(first: 3) {
    id
    title
  }
}
```

**从第 6 条数据开始，取 5 条数据(从前往后):**

![](/prisma1/images/PpI5X0X.png)

```graphql
query {
  posts(first: 5, skip: 5) {
    id
    title
  }
}
```

**查询的最后 3 个节点(从后往前)**:

![](/prisma1/images/pkuYCrV.png)

```graphql
query {
  posts(last: 3) {
    id
    title
  }
}
```

**从倒数第 4 条数据取到倒数第 10 条(寻从后往前):**

![](/prisma1/images/iSl9Y07.png)

```graphql
query {
  posts(last: 7, skip: 3) {
    id
    title
  }
}
```

**查询 id 为`cixnen24p33lo0143bexvr52n`的后面 3 个数据:**

![](/prisma1/images/InYSSkQ.png)

```graphql
query {
  posts(first: 3, after: "cixnen24p33lo0143bexvr52n") {
    id
    title
  }
}
```

**查询 id 为`cixnen24p33lo0143bexvr52n`的数据再跳过 3 条，取 5 个:**

![](/prisma1/images/u4WEAJv.png)

```graphql
query {
  posts(first: 5, after: "cixnen24p33lo0143bexvr52n", skip: 3) {
    id
    title
  }
}
```

**`cixnen24p33lo0143bexvr52n`当 id 的那条数据的前面 5 条:**

![](/prisma1/images/306eghw.png)

```graphql
query {
  posts(last: 5, before: "cixnen24p33lo0143bexvr52n") {
    id
    title
  }
}
```

**`cixnen24p33lo0143bexvr52n`当 id 的那条数据的前面 5 条数据略过，再取 3 个:**

![](/prisma1/images/iZGUiHJ.png)

```graphql
query {
  posts(last: 3, before: "cixnen24p33lo0143bexvr52n", skip: 5) {
    id
    title
  }
}
```

### Mutations

#### 如何生成 Prisma API 中的`mutation`？

一个 Prisma services 的 GraphQL API 在 Prisma 的 GraphQL schema 中指定。Prisma GraphQL schema 是基于数据模型自动生成的:

![](/prisma1/images/jHkNjKU.png)

Prisma GraphQL schema 中的`Mutation`类型中定义了所有的 Prisma API 接受的 Mutation。

作为一个例子，考虑下面的数据模型:

```graphql
type User {
  id: ID! @id
  name: String!
}
```

这是 Prisma 会自动生成的`Mutation`:

```graphql
type Mutation {
  createUser(data: UserCreateInput!): User!
  updateUser(data: UserUpdateInput!, where: UserWhereUniqueInput!): User
  deleteUser(where: UserWhereUniqueInput!): User
  upsertUser(
    where: UserWhereUniqueInput!
    create: UserCreateInput!
    update: UserUpdateInput!
  ): User!
  updateManyUsers(data: UserUpdateInput!, where: UserWhereInput!): BatchPayload!
  deleteManyUsers(where: UserWhereInput!): BatchPayload!
}
```

对于你的数据模型每一种 type，都形成了 6 个 Mutation。以上述`User`类型作为示例，这些 Mutation 是:

- `createUser`:创建一个新的`User`节点
- `updateUser`:更新现有`User`节点
- `deleteUser`:删除现有`User`节点
- `upsertUser`:更新现有`User`节点; 如果它不存在，创建一个新的`User`节点
- `updateManyUsers`:更新很多`User`节点
- `deleteManyUsers`:一次性删除很多`User`节点

要详细检查你的 Prisma API 的所有可用的操作，你可以读取 Prisma services 中的 Prisma GraphQL schema。它可以用[GraphQL CLI](https://github.com/graphql-cli/graphql-cli)下载:

```
graphql get-schema --endpoint **YOUR_PRISMA_ENDPOINT** --output prisma.graphql --no-all

```

了解你的 Prisma API 的具体能力的另一种方式是通过打开 GraphQL Playground 内自动生成的 API 文档。你可以通过点击在 Playground 的右边按钮**SCHEMA**:

![](/prisma1/images/ArteAJQ.jpg)

#### 数据模型本页例子

本节的所有 Mutation 例子基于这个数据模型的 Prisma services:

```graphql
type Post {
  id: ID! @id
  title: String!
  published: Boolean! @default(value: false)
  author: User
}
type User {
  id: ID! @id
  age: Int
  email: String! @unique
  name: String!
  posts: [Post!]!
}
```

### Mutation 概念

Prisma API 提供了三种 Mutation:

- **对象 Mutation**:创建，更新，更新插入或删除某[对象类型]的单个节点。
- **嵌套 Mutation**:创建，更新，更新插入，删除，连接，断开连接两个或多个相关类型的多个节点。
- **批量 Mutation**:更新和删除[对象类型]的许多节点。

当使用 Prisma API 时，下面的概念也记住有用:

- **Relation Mutation**:连接和断开两个节点的关系(这是通过嵌套 Mutation 完成)。
- **Input types**:Prisma API 遵循 GraphQL Mutation 设计的最佳实践，并从'data`这个单个对象中接受 Mutation 参数。

### 对象 Mutation

你可以使用对象 Mutation 来修改特定模型的单个节点。

#### 创建节点

你可以使用`create`Mutation 创建新的节点。这些 Mutation 采用一个称为`data`的输入对象包裹所有*必填字段*相应类型的字段。

**创建一个新的`User`节点:**

```graphql
mutation {
  createUser(data: { age: 42, email: "alice@prisma.io", name: "Alice" }) {
    id
    name
  }
}
```

#### 更新节点

你可以使用`update`Mutation 改变一个节点的一个或多个字段值。要更新的节点[选择]使用`where`参数，经由`data`参数提供新的值。节点可以通过`@unique`指令标注的任何字段进行选择。

**更改`User`节点的`name`:**

```graphql
mutation {
  updateUser(data: { name: "Alice" }, where: { id: "cjcdi63j80adw0146z7r59bn5" }) {
    id
    name
  }
}
```

**通过其`email`标识更改`User`节点的`name`:**

```graphql
mutation {
  updateUser(data: { name: "Alice" }, where: { email: "alice@prisma.io" }) {
    id
    name
  }
}
```

#### Upserting 节点

当你想要么更新现有的节点，要么创建一个新的节点，你可以使用\_upsert_Mutation。

**根据`email`更新`User`，如果没有该`User`则创建一个新的`User`**:

```graphql
mutation {
  upsertUser(
    where: { email: "alice@prisma.io" }
    create: { email: "alice@prisma.io", age: 42, name: "Alice" }
    update: { age: 42 }
  ) {
    name
  }
}
```

#### 删除节点

要删除节点，需要先选择节点，在`delete`Mutation 中使用`where`参数。

**通过`id`删除`User`节点:**

```graphql
mutation {
  deleteUser(where: { id: "cjcdi63l20adx0146vg20j1ck" }) {
    id
    name
    email
  }
}
```

**通过`email`删除`User`节点:**

```graphql
mutation {
  deleteUser(where: { email: "cjcdi63l20adx0146vg20j1ck" }) {
    id
    name
    email
  }
}
```

### 嵌套 Mutation

你可以在使用`create`和`update`Mutation 的同时修改整个关系的节点。这被称为嵌套**Mutation**，其执行方式为[事务]。

嵌套 Mutation:

- `create`
- `update`
- `upsert`
- `delete`
- `connect`
- `disconnect`

我们提供一系列例子，罗列出所有可能出现的情况。

我们建议使用[GraphQL Playground](https://github.com/prismagraphql/graphql-playground)尝试不同的嵌套 Mutation 的行为。

#### 创建和连接相关节点

你可以使用嵌套输入对象字段内的`connect`Mutation 连接到一个或多个相关的节点。

**创建一个新的`POST`节点，并通过唯一`email`字段将其连接到现有的`User`节点:**

```graphql
mutation {
  createPost(
    data: { title: "This is a draft", author: { connect: { email: "alice@prisma.io" } } }
  ) {
    id
    author {
      name
    }
  }
}
```

如果你在`author`中提供`create`参数，而不是`connect`，你会*create*一个新的`User`节点，同时新的`POST`节点将连接到它:

```graphql
mutation {
  createPost(
    data: {
      title: "This is a draft"
      author: { create: { name: "Bob", email: "bob@prisma.io", age: 42 } }
    }
  ) {
    id
    author {
      name
    }
  }
}
```

当使用`createUser`而不是`createPost`Mutation，实际上你可以同时创建并连接到多个'POST`节点，因为`User`和`POST`有*一对多*关系。

**创建一个新的`User`节点，并直接将其连接到几个新创建的`POST`节点:**

```graphql
mutation {
  createUser(
    data: {
      name: "Bob"
      email: "bob@prisma.io"
      age: 42
      posts: { create: [{ published: true, title: "Hello World" }, { title: "GraphQL is great" }] }
    }
  ) {
    id
    posts {
      id
    }
  }
}
```

**创建一个新的`User`节点，并直接将其连接到几个新创建的和现有的`POST`节点:**

```graphql
mutation {
  createUser(
    data: {
      name: "Bob"
      email: "bob@prisma.io"
      age: 42
      posts: {
        create: [{ published: true, title: "Hello World" }, { title: "GraphQL is great" }]
        connect: [{ id: "cjcdi63j80adw0146z7r59bn5" }, { id: "cjcdi63l80ady014658ud1u02" }]
      }
    }
  ) {
    id
    posts {
      id
    }
  }
}
```

#### Updating 和 upserting 关系节点

当更新的节点时，可以同时更新一个或多个关系的节点。

**更新属于某一`User`节点的`POST`节点的`title`:**

```graphql
mutation {
  updateUser(
    data: {
      posts: {
        update: [{ where: { id: "cjcf1cj0r017z014605713ym0" }, data: { title: "Hello World" } }]
      }
    }
    where: { id: "cjcf1cj0c017y01461c6enbfe" }
  ) {
    id
    posts {
      id
    }
  }
}
```

`update`接受列表数据并以`where`和`data`字段的参数更新相关字段。

**更新某个`POST`节点让它连接到现有`User`节点的 name，如果没有就创建新`User`节点:**

嵌套 upserting 工作方式类似:

```graphql
mutation {
  updatePost(
    where: { id: "cjcf1cj0r017z014605713ym0" }
    data: {
      author: {
        upsert: {
          where: { id: "cjcf1cj0c017y01461c6enbfe" }
          update: { id: "cjcdi63l80ady014658ud1u02", name: "Alice" }
          create: { email: "alice@prisma.io", name: "Alice", age: 42 }
        }
      }
    }
  ) {
    id
    author {
      id
    }
  }
}
```

**从`User`节点断开一个`POST`节点**:

```graphql
mutation {
  updateUser(
    where: { id: "cjcf1cj0c017y01461c6enbfe" }
    data: { posts: { disconnect: [{ id: "cjcdi63l80ady014658ud1u02" }] } }
  ) {
    id
    posts {
      id
    }
  }
}
```

#### 删除相关节点

当更新的节点时，你可以在同时删除一个或多个相关节点。

**删除属于某`User`节点的`POST`节点:**

```graphql
mutation {
  updateUser(
    data: {
      posts: { delete: [{ id: "cjcf1cj0u01800146jii8h8ch" }, { id: "cjcf1cj0u01810146m84cnt34" }] }
    }
    where: { id: "cjcf1cj0c017y01461c6enbfe" }
  ) {
    id
  }
}
```

### scalar list Mutation

当对象类型的字段具有标量列表作为其类型时，可以使用许多特殊的 Mutation。

在下面的数据模型，`User`类型有三个这样的字段:

```graphql
type User {
  id: ID! @id
  scores: [String!]! @scalarList(strategy: RELATION) # scalar list for integers
  friends: [String!]! @scalarList(strategy: RELATION) # scalar list for strings
  coinFlips: [String!]! @scalarList(strategy: RELATION) # scalar list for booleans
}
```

#### 创建节点

当创建`User`的一个新的节点，可以使用`set`提供用于每个标量字段的值的列表。

**创建一个新的`User`并设置`scores`，`friends`和`coinFlips`值:**

```graphql
mutation {
  createUser(
    data: {
      scores: { set: [1, 2, 3] }
      friends: { set: ["Sarah", "Jane"] }
      throws: { set: [false, false] }
    }
  ) {
    id
  }
}
```

#### 更新节点

当更新类型的现有节点`User`，可以在标量列表字段中进行许多附加操作(如`scores: [Int!]!`!):

- `set`:用全新的列表覆盖现有的列表。
- `push`(即将推出):在列表中的任意位置添加一个或多个元素。
- `pop`(即将推出):删除列表开头或末尾的一个或多个元素。
- `remove`(即将推出):删除列表中匹配给定过滤器的所有元素。

> `push`，`pop`和`remove`尚未实现。如果你感兴趣，你可以在[这里预览](https://github.com/prisma/prisma/issues/1275)。

Each scalar list field takes an object with a `set` field in an `update` mutation. The value of that field is a single value _or_ a list of the corresponding scalar type.

**设置现有`User`节点的`scores`到`[1]`:**

```graphql
mutation {
  updateUser(where: { id: "cjd4lfdyww0h00144zst9alur" }, data: { scores: { set: 1 } }) {
    id
  }
}
```

**设置现有`User`节点的`scores`到`[10,20,30]`:**

```graphql
mutation {
  updateUser(where: { id: "cjd4lfdyww0h00144zst9alur" }, data: { scores: { set: [10, 20, 30] } }) {
    id
  }
}
```

### 批量 Mutation

批量 Mutation 可用于一次更新或删除多个节点。返回的数据只包含受影响的节点的`count`。

**注意**

批量 Mutation\*\*\*\*不适用于[Subscriptions]事件!

对于许多更新的节点，你可以使用`where`参数选择受影响的节点，而用'data`输入新的值。所有节点都将更新为相同的值。

**设置在创建于 2017 年的所有未发表的'POST`节点`published`字段为 TRUE:**

```graphql
Mutation{
mutation {
  updateManyPosts(
    where: {
      createdAt_gte: "2017"
      createdAt_lt: "2018"
      published: false
    }
    data: {
      published: true
    }
  ) {
    count
  }
}
```

**删除其中`author`的`name`是`Alice`的所有未发布`POST`节点:**

```graphql
mutation {
  deleteManyPosts(where: { published: false, author: { name: "Alice" } }) {
    count
  }
}
```

### Subscriptions

#### Prisma API 中的 Subscriptions 如何生成？

一个 Prisma services 的 GraphQL API 在 Prisma 的 GraphQL schema 中指定。Prisma GraphQL schema 是基于数据模型自动生成的:

![](/prisma1/images/jHkNjKU.png)

Prisma GraphQL schema 中的`Subscription`type 定义了所有的 Prisma API 接受的 subscription。

作为一个例子，考虑下面的数据模型:

```graphql
type User {
  id: ID! @id
  name: String!
}
```

这是 Prisma 会生成的`Subscription`type:

```graphql
type Subscription {
  user(where: UserSubscriptionWhereInput): UserSubscriptionPayload
}
```

对于你的数据模型每一个类型，生成一个 Subscriptions。以上述`User`type 为例，此 Subscriptions 是:

- `user`:每当创建，更新或删除 User 节点时触发。(除[批量 Mutation]时)。

要详细检查你的 Prisma API 的所有可用的操作，你可以读取 Prisma services Prisma 的 GraphQL schema。它可以用[GraphQL CLI](https://github.com/graphql-cli/graphql-cli)下载:

```
graphql get-schema --endpoint **YOUR_PRISMA_ENDPOINT** --output prisma.graphql --no-all

```

了解你的 Prisma API 的具体能力的另一种方式是通过查看 GraphQL Playground 内自动生成的 API 文档。你可以通过点击在 Playground 的右边按钮链接**SCHEMA**:

![](/prisma1/images/ArteAJQ.jpg)

#### 本例的 datamodel

本节的所有例子 Subscriptions 基于这个 datamodel 配置的 Prisma services:

```graphql
type Post {
  id: ID! @id
  title: String!
  published: Boolean! @default(value: false)
  author: User
}
type User {
  id: ID! @id
  name: String!
  posts: [Post!]!
}
```

### 了解 Prisma 的的 Subscriptions API

Prisma 允许你订阅三种不同类型的事件（数据模型中的每种类型）。以 Post 上面数据模型中的类型为例，这些事件是：

- 创建一个新的'Post`节点
- 更新现有的`Post`节点
- 删除现有的`Post`节点

**注意**

Subscriptions 不支持[批量 Mutation]。

`Subscription`类型的对应定义如下所示(在此定义可在 Prisma 的 GraphQL schema 中找到):

```graphql
type Subscription {
  post(where: PostSubscriptionWhereInput): PostSubscriptionPayload
}
```

下面是一个 Subscriptions 操作:

```graphql
subscription {
  post {
    node {
      id
      title
    }
  }
}
```

如果没有通过 where 参数进一步约束，则 post 订阅将针对上述所有事件触发。PostSubscriptionPayload 来自服务器的消息中包含哪些字段取决于事件的类型。

#### 过滤特定事件

`where`参数允许用户指定监听什么事件，也许用户只希望出现某些更新的时候监听，比如：

- ...删除一个`POST`时
- ...一个其中`title`包含特定关键字的`POST`创建时

这些类型的约束可以使用`where`参数来表示。该类型的`where`是`PostSubscriptionWhereInput`:

```graphql
input PostSubscriptionWhereInput {
  # Filter for a specific mutation:
  # CREATED, UPDATED, DELETED
  mutation_in: [MutationType!]
  # Filter for a specific field being updated
  updatedFields_contains: String
  updatedFields_contains_every: [String!]
  updatedFields_contains_some: [String!]
  # Filter for concrete values of the Post being mutated
  node: PostWhereInput
  # Combine several filter conditions
  AND: [PostSubscriptionWhereInput!]
  OR: [PostSubscriptionWhereInput!]
}
```

上面提到的两个例子可与 Prisma API 中的以下 Subscriptions 来表示:

```graphql

# Only fire for _deleted_ posts

subscription {
post(where: {
mutation_in: [DELETED]
}) { # ... we'll talk about the selection set in a bit
}
}

# Only fire when a post whose title contains "GraphQL" is _created_

subscription {
post(where: {
mutation_in: [CREATED]
node: {
title_contains: "GraphQL"
}
}) { # ... we'll talk about the selection set in a bit
}
}

```

#### 探索 Subscriptions 的选择集

你现在已经很好地了解了如何订阅你感兴趣的活动。但是，你现在如何得知与事件相关的数据？

该 PostSubscriptionPayload 类型定义了你可以在 post 订阅中请求的字段。这是它的样子：

```graphql
type PostSubscriptionPayload {
  mutation: MutationType!
  node: Post
  updatedFields: [String!]
  previousValues: PostPreviousValues
}
```

下面是根据触发 Subscriptions 该事件的每个字段值的概述:

| `mutation` | `node`         | `previousValues` | `updatedFields`        |
| ---------- | -------------- | ---------------- | ---------------------- |
| `CREATE`   | 创建的节点     | `null`           | `null`                 |
| `UPDATE`   | 更新节点的新值 | 更新节点前的值   | 更新的字段的字符串列表 |
| `DELETE`   | `null`         | 被删除的节点     | `null`                 |

在下文中，我们队每个字段进行更详细的讨论。

###### Mutation

该`mutation`字段类型是`MutationType`。`MutationType`是一个有三个值的枚举 enum 类型:

```graphql
enum MutationType {
  CREATED
  UPDATED
  DELETED
}
```

因此，`PostSubscriptionPayload`类型的`mutation`字段包含发生了什么类型的信息。

###### node

该 node 字段具有 Post 类型。它表示创建或更新的 Post 元素，并允许你检索有关它的更多信息。

请注意，对于 DELETED-mutations，node 将永远是 null。如果你需要了解有关已删除 Post 节点的更多详细信息，可以使用该 previousValues 字段（稍后会详细介绍）。

###### updatedFields

`updatedFields`的类型为`[String!]`。

你可能对 UPDATED-mutations 感兴趣的一条信息是哪些字段已更新为 Mutation。这就是该 updatedFields 领域的用途。

假设一个 clientSubscriptions 与以下 SubscriptionsPrisma API:

```graphql
subscription {
  post {
    updatedFields
  }
}
```

现在，假设服务器接收以下 Mutation 更新指定`POST`的`title`:

```graphql
mutation {
  updatePost(
    where: { id: "..." }
    data: { title: "Prisma is the best way to build GraphQL servers" }
  ) {
    id
  }
}
```

然后，订阅的 client 端将收到以下 Payload:

```json
{
  "data": {
    "post": {
      "updatedFields": ["title"]
    }
  }
}
```

这是因为 Mutation 只更新了 Post 节点的 title 字段 - 没有别的。

###### previousValues

`previousValues`是`PostPreviousValues`的类型，和`POST`本身看起来非常相似:

```graphql
type PostPreviousValues {
  id: ID!
  title: String!
}
```

它基本上是一个镜像字段的辅助类型 Post。

previousValues 仅用于 UPDATED- 和 - DELETEDMutation。对于 CREATED-mutations，它将永远是 null（出于同样的原因，节点 null 用于 DELETED-mutations）。

###### 将所有内容放在一起

再考虑前面示例的`updatePost`Mutation。但是现在假设，订阅查询包括*所有*我们刚才讨论的字段:

```graphql
subscription {
  post {
    mutation
    updatedFields
    node {
      title
    }
    previousValues {
      title
    }
  }
}
```

以下是服务器在执行之前的 Mutation 后推送到客户端的 payload：

```json
{
  "data": {
    "post": {
      "mutation": "UPDATED",
      "updatedFields": ["title"],
      "node": {
        "title": "Prisma is the best way to build GraphQL servers"
      },
      "previousValues": {
        "title": "GraphQL servers are best built with conventional ORMs"
      }
    }
  }
}
```

请注意，这假设更新在执行 Mutation 之前 Post 具有以下内容 title：“GraphQL servers are best built with conventional ORMs”。

### 对象 Subscriptions

对于 datamodel 中的每个可用对象类型，将自动生成一个对象订阅。

#### 订阅创建节点

对于给定的 type，你可以订阅正在使用生成的对象正在创建的所有节点。

##### 订阅所有创建的节点

要订阅某种 type 创建的节点，则可以使用所生成的对象的 Subscription 和`where`参数指定的`mutation_in:[CREATED]`。

**订阅创建`POST`节点:**

```graphql
subscription {
  post(where: { mutation_in: [CREATED] }) {
    mutation
    node {
      description
      imageUrl
      author {
        id
      }
    }
  }
}
```

##### 使用过滤订阅特定创建的节点

可以利用`where`对象的`node`参数订阅特定节点。

**订阅创建特定`author`的`POST`节点:**

```graphql
subscription {
post(where: {
AND: [
{
mutation_in: [CREATED]
}, {
node: {
author: {
id: "cj03x3nacox6m0119755kmcm3"
}
}
]
}) {
mutation
node {
description
imageUrl
author {
id
}
}
}
}

```

#### 订阅删除节点

要订阅某种类型删除的节点，则可以使用所生成的对象的 subscription 和用`where`参数指定的`mutation_in:[DELETED]`。

##### 订阅所有被删除的节点

**订阅删除`POST`节点:**

```graphql
subscription deletePost {
  post(where: { mutation_in: [DELETED] }) {
    mutation
    previousValues {
      id
    }
  }
}
```

##### 订阅特定删除节点

可以使用`where`对象的`node`参数过滤特定节点。

**订阅其中`title`包含特定字符串的`POST`节点:**

```graphql
subscription {
  post(where: { mutation_in: [DELETED], node: { title_contains: "GraphQL" } }) {
    mutation
    previousValues {
      id
    }
  }
}
```

#### 订阅更新节点

要订阅某种 type 的更新节点，则可以使用所生成的对象的 subscription 和用`where`参数指定的`mutation_in:[UPDATED]`。

##### 订阅所有更新节点

**订阅更新`POST`节点:**

```graphql
subscription {
  post(where: { mutation_in: [UPDATED] }) {
    mutation
    updatedFields
    node {
      description
      imageUrl
    }
    previousValues {
      description
      imageUrl
    }
  }
}
```

##### 订阅特定字段的更新

**订阅`POST`节点的其中一个`description`字段得到更新的事件，:**

```graphql
subscription {
  post(where: { mutation_in: [UPDATED], updatedFields_contains: "description" }) {
    mutation
    node {
      description
    }
    updatedFields
    previousValues {
      description
    }
  }
}
```

类似于`updatedFields_contains`，多个过滤器的情况:

- `updatedFields_contains_every:[String!]`:如果匹配指定的所有字段都进行了更新。
- `updatedFields_contains_some:[String!]`:如果某些指定的字段已经更新匹配。

**订阅所有`POST`节点的`description` 和`published`字段得到更新的事件，:**

```graphql
subscription {
  post(
    where: { mutation_in: [UPDATED], updatedFields_contains_every: ["description", "published"] }
  ) {
    mutation
    node {
      description
    }
    updatedFields
    previousValues {
      description
    }
  }
}
```

**订阅其中一个`POST`节点的`description` 或者`published`字段得到更新的事件，:**

```graphql
subscription {
  post(
    where: { mutation_in: [UPDATED], updatedFields_contains_some: ["description", "published"] }
  ) {
    mutation
    node {
      description
    }
    updatedFields
    previousValues {
      description
    }
  }
}
```

**注意**

不能同时使用 updatedFields 过滤器，mutation_in: [CREATED]或 mutation_in: [DELETED]仅适用于 UPDATE 事件！

### Relation Subscriptions

目前，关系字段 Subscriptions 仅可使用`UPDATED`Subscriptions 一种解决方法。

你可以通过“touching”节点强制进行通知。dummy: String 向相关类型添加字段，并为关系状态刚刚更改的节点更新此字段。

```graphql
mutation updatePost {
  updatePost(
    where: { id: "some-id" }
    data: {
      dummy: "dummy" # do a dummy change to trigger update subscription
    }
  )
}
```

> 如果你对订阅的直接关系触发感兴趣，[请加入 GitHub 上的讨论(https://github.com/prismagraphql/feature-requests/issues/146)。

### 用原始数据库 SQL 命令

配置`docker-compose.yml`文件：

```yaml
version: '3'
services:
prisma:
image: prismagraphql/prisma:1.34
restart: always
ports: - "4466:4466"
environment:
PRISMA_CONFIG: |
port: 4466
databases:
default:
connector: postgres
host: postgres
port: 5432 # port: 3306
user: prisma
password: prisma
migrations: true
rawAccess: true
postgres:
image: postgres:10.5
restart: always
ports: - "5432:5432"
environment:
POSTGRES_USER: prisma
POSTGRES_PASSWORD: prisma
volumes: - postgres:/var/lib/postgresql/data
volumes:
postgres:

```

然后就可以直接用数据库语言操作。

使用`executeRaw` Mutation:

创建一个新用户：

```graphql
mutation {
  executeRaw(query: "INSERT INTO default$default."User" (Id, Name, "updatedAt","createdAt") VALUES ('cjnkpvm0b000d0b22j7csr04v', 'Abhi', '2018-10-22T19:54:47.606Z', '2018-10-22T19:54:47.606Z');")
}
```

查询所有用户：

```graphql
mutation {
executeRaw(query: "SELECT \* FROM default\$default."User"")
}

```

## 运用

### 使用 Prisma GraphQL API

Prisma API 通过 HTTP 使用。 这意味着你可以使用任何你喜欢的 HTTP 工具/库与 Prisma API 进行通信。

这里是`createUser`Mutation 的 HTTP POST 请求的结构:

**Header**

- `Authorization`：携带用于验证请求的*service token*（前缀为'Bearer`）; 仅在使用*service secret*部署服务时才需要。
- `Content-Type`：指定请求主体（JSON）的格式，通常是`application / json`。

**Body** (JSON)

- `query`：要发送给 API 的 GraphQL 操作; 请注意，尽管该字段被称为“query”，它也用于 **Mutation**！！！
- `variables`：一个 JSON 对象，包含在`query`中提交的 GraphQL 操作中定义的变量。

此小节所有例子都基于与下面的服务配置的 Prisma services:

**prisma.yml**

```yaml
datamodel: datamodel.prisma
secret: my-secret-42
```

**`datamodel.prisma`**

```graphql
type User {
  id: ID! @id
  name: String!
}
```

### curl

[curl](https://curl.haxx.se/)是一个命令行工具(除其他事项外)，让你发送 HTTP 请求到 URL。

这里是你如何发送`createUser`Mutation 使用 curlPrisma API:

```
curl '**YOUR_PRISMA_ENDPOINT**' \\
-H 'Content-Type: application/json' \\
-H 'Authorization: Bearer **YOUR_SERVICE_TOKEN**' \\
--data-binary '{"query":"mutation ($name: String!) { createUser(data: { name: $name }) { id } }","variables":{"name":"Sarah"}}'

```

为了**尝试这个例子**，从 Prisma services 替换相应值`__YOUR_PRISMA_ENDPOINT__`和`__YOUR_SERVICE_TOKEN__`占位符，并将所得片段贴到终端。

一般来说在本地部署的服务 endpoint 为`http://localhost:4466`，使用 demo server 的请在 yml 文件中查看你的 endpoint。

token 请在终端输入`prisma token`获得，Authorization 格式类似这样： Bearer sadoifjaosif……

以上请求和下面的 Mutation 作用相同:

```graphql
mutation {
  createUser(data: { name: "Sarah" }) {
    id
  }
}
```

**试试这个例子**:

1.从 Prisma services 替换相应值`__YOUR_PRISMA_ENDPOINT__`和`__YOUR_SERVICE_TOKEN__`占位符 1.所生成的片段粘贴到你的终端，并按下回车键

### fetch (Node.JS)

[`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)功能可以让你的 HTTP 请求从 JavaScript 发送到 URL。

下面是你在一个 node 脚本中使用`fetch`发送`createUser`Mutation 的 Prisma API:

```javascript
const fetch = require('node-fetch');
const endpoint = '**YOUR_PRISMA_ENDPOINT**';
const query = `mutation($name: String!) { createUser(data: { name: $name }) { id } }`;
const variables = { name: 'Sarah' };

fetch(endpoint, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer **YOUR_SERVICE_TOKEN**',
  },
  body: JSON.stringify({ query: query, variables: variables }),
})
  .then(response => response.json())
  .then(data => console.log(JSON.stringify(data)));
```

同样为以下功能：

```graphql
mutation {
  createUser(data: { name: "Sarah" }) {
    id
  }
}
```

**试试这个例子**:

1.从 Prisma services 替换相应值`__YOUR_PRISMA_ENDPOINT__`和`__YOUR_SERVICE_TOKEN__`占位符 1.存放在一个 JavaScript 文件`script.js` 1.通过在`script.js`所在的同一目录中运行`yarn add node-fetch`来安装`node-fetch`库 1.使用以下终端命令执行该脚本:`node script.js`

### graphql-request

[`graphql-request`](https://github.com/prismagraphql/graphql-request)库是 fetch 的轻量级封装。它主要用于需要跟一个 GraphQL API 交互的轻量级应用。

#### 使用`request`

**注意**

`request`不支持将*headers*头放入请求([尚未](https://github.com/prismagraphql/graphql-request/pull/33))。因此，这个特殊的例子假定你的 Prisma services 部署时没有服务密码。

```javascript
const { request } = require('graphql-request');
const query = `mutation($name: String!) { createUser(data: { name: $name }) { id } }`;
const variables = { name: 'Sarah' };

request('**YOUR_PRISMA_ENDPOINT**', query, variables).then(data => console.log(data));
```

#### 使用`GraphQLClient`

```javascript
const { GraphQLClient } = require('graphql-request');
const client = new GraphQLClient('__YOUR_PRISMA_ENDPOINT__', {
  headers: { Authorization: 'Bearer __YOUR_SERVICE_TOKEN__' },
});
const query = `
mutation($name: String!) {
  createUser(data: {
    name: $name
}) {
id
}
}
`;
const variables = { name: 'Sarah' };
client.request(query, variables).then(data => console.log(data));
```

### GraphQL Playground

一个 GraphQL Playground 是一个 GraphQL IDE，让你发送 Query，Mutation 和 Subscriptions GraphQL 的 API。

你可以通过将终端 cd 到服务的 prisma.yml 所在的同一目录来打开 Prisma API 的 Playground，然后运行以下命令：

```
prisma playground

```

如果 prisma.yml 包含`secret`，Playground 将已经用*Service token*配置。你可以在窗格的左下角验证这一点，加入 **HTTP header**:

![](/prisma1/images/4Yvj4tD.png)

这意味着你可以开始将请求发送到 Prisma API 的时候了。Query，Mutation 和 Subscriptions 都写在 Playground 的左侧窗格中。然后你点击 **play** - 按钮实际发送请求。结果将出现在 Playground 的右窗格中:

![](/prisma1/images/lNXNKXR.png)

### Apollo Client

[Apollo Client](https://www.apollographql.com/client)是在较大的前端应用中通常使用的复杂的 GraphQL 库。虽然所有前面的例子中使用的通用工具来发送 Query 和 Mutation 一样，Apollo Client 使用用于发送 Query 和 Mutation 的专用方法:`query`＆`mutation`

#### query

```javascript
const { ApolloClient } = require('apollo-boost');
const gql = require('graphql-tag');
const endpoint = 'https://eu1.prisma.sh/nikolas-burk/demodofin/dev';
const client = new ApolloClient({ uri: endpoint });
const query = gql`
  query {
    users {
      id
      name
    }
  }
`;
client
  .query({
    query: query,
  })
  .then(data => console.log(data));
```

#### mutation

```javascript
const { ApolloClient } = require('apollo-boost');
const gql = require('graphql-tag');
const endpoint = 'https://eu1.prisma.sh/nikolas-burk/demodofin/dev';
const client = new ApolloClient({ uri: endpoint });
const mutation = gql`
  mutation($name: String!) {
    createUser(data: { name: $name }) {
      id
    }
  }
`;
const variables = { name: 'Sarah' };
client
  .mutate({
    mutation: mutation,
    variables: variables,
  })
  .then(data => console.log(data));
```

### Prisma Bindings

Prisma Bindings 可以看做 Prisma client 替代版本。

关于 GraphQL bindings 的文档[here](https://oss.prisma.io/content/GraphQL-Binding/01-Overview.html).

它和 Prisma client 的区别,阅读这里[forum post](https://www.prisma.io/forum/t/help-understanding-prisma-clients-value-proposition/4394/17) .

#### 安装

`cnpm i -S prisma-binding`

#### 示例

还是那个 datamodel:

```graphql
type User {
  id: ID! @id
  name: String
}
```

在`.graphqlconfig.yml`的`prisma`中定义：

```yaml
prisma:
schemaPath: src/generated/prisma.graphql
includes: [
"prisma.graphql",
"seed.graphql",
"datamodel.graphql",
]
extensions:
prisma: prisma/prisma.yml
codegen: - generator: prisma-binding
language: typescript
output:
binding: src/generated/prisma.ts

```

部署之后修改`index.ts`

```javascript
import { GraphQLServer } from 'graphql-yoga'
import { Prisma } from './generated/prisma-client'
import { resolvers } from './resolvers'
const prisma = new Prisma({
endpoint: process.env.PRISMA_ENDPOINT!,
secret: process.env.PRISMA_SECRET!,
// debug: true,
})
// 根据 id 查询某个 user 的名字
prisma.query.user({ where { id: 'abc' } }, '{ name }')
// 查询所有 user 的 id 和 name
prisma.query.users(null, '{ id name }')
// 创建新 user 并返回她的 id
prisma.mutation.createUser({ data: { name: 'Sarah' } }, '{ id }')
// 更新一个用户的名字并返回 id
prisma.mutation.updateUser({ where: { id: 'abc' }, data: { name: 'Sarah' } }, '{ id }')
// 删除一个用户并返回该用户存在时的 id
prisma.mutation.deleteUser({ where: { id: 'abc' } }, '{ id }')
const server = new GraphQLServer({
typeDefs: './src/schema.graphql',
resolvers: resolvers as any,
context: req => ({ ...req, db }),
})
server.start(({ port }) =>
console.log(`Server is running on http://localhost:${port}`),
)

```

在底层，每一个函数的调用都简单地转换为对你的 Prisma service 的实际 HTTP 请求（使用了[graphql-request](https://github.com/prisma/graphql-request))

查询某条数据是否存在：

```javascript
prisma.exists.Post({
  id: 'abc',
  author: {
    name: 'Sarah',
  },
});
```

更多使用方式查看 GraphQL bindings 的原文档[here](https://oss.prisma.io/content/GraphQL-Binding/01-Overview.html)

下一节来学习 Prisma 的工具和配置
