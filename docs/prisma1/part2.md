---
title: 数据模型定义
description: 本章介绍了prisma的基本核心datamodel
keywords:
  - datamodel
  - prisma
  - 数据模型定义
---

### datamodel 定义概述

datamodel 有两个主要功能:

- **定义底层数据库模式和表**(在无模式数据库(如 MongoDB)的情况下，它们映射到数据库表或等效结构，如*documents*)。
- 它是 Prisma API 的**自动生成的 CRUD 和实时操作代码**的基础。 [了解更多](#datamodel-vs-prisma-graphql-schema)。

数据模型使用 GraphQL 的 [schema 定义语言 SDL](https://www.prisma.io/blog/graphql-sdl-schema-definition-language-6755bcb9ce51/)(SDL)编写，并存储在一个或多个`.graphql`后缀的文件中。这些`.graphql`文件需要在`prisma.yml`的`datamodel`属性中引用。例如:

```yaml
endpoint: **YOUR_PRISMA_ENDPOINT**
datamodel: datamodel.prisma

```

#### 构建数据模型的块

有几个可用的构建块来塑造你的数据模型。

- [Types](#对象类型)由多个[fields 字段](#字段)组成，通常表示应用程序中的实体(例如`User`，`Car`，`Order`)。数据模型中的每种类型都映射到数据库表(或无模式数据库的等效结构)，并且将 CRUD 操作添加到 GraphQL schema 中。
- [Relations](#relations)描述类型之间的*relationship 关系*。
- [Directives](#graphql指令)指令涵盖不同的用例，例如类型约束或级联删除行为。
- [Interfaces](http://graphql.org/learn/schema/#interfaces)是抽象类型，包括一组字段，类型必须包含在*implement*接口中。接口目前不适用于 Prisma 中的数据建模，但将来会支持[待实现功能](https://github.com/prisma/prisma/issues/83)。

#### 为什么选择 SDL？

SDL 用于数据建模的主要原因有两个:

- SDL 是一种 **直观，简洁，简洁的表达类型定义的方式，因此有助于提供良好的开发人员体验**。
- 使用 GraphQL SDL 定义用作 GraphQL API 基础的模型是一种 **惯用的**方法。

没有严格的技术要求必须使用 SDL，在未来 Prisma 可能允许其他方法提供模型定义。

> 要了解有关 SDL 的更多信息，你可以查看官方[GraphQL 文档](http://graphql.org/learn/schema/#type-language)或阅读实际[规范](http://facebook.github.io/graphql/draft/#sec-Type-System)。

### datamodel 例子

一个简单的`datamodel.prisma`文件例子:

```graphql
type Tweet {
  id: ID! @id
  createdAt: DateTime! @createdAt
  text: String!
  owner: User! @relation(link: INLINE)
  location: Location!
}
type User {
  id: ID! @id
  createdAt: DateTime! @createdAt
  updatedAt: DateTime! @updatedAt
  handle: String! @unique
  name: String
  tweets: [Tweet!]!
}
type Location {
  latitude: Float!
  longitude: Float!
}
```

此示例说明了使用数据模型时的一些重要概念:

- 三种类型`Tweet`，`User`和`Location`被映射到数据库表(或无模式数据库的等效结构)。
- "User"和"Tweet"之间存在*双向*关系(通过`owner`和`tweets`字段)。`@relation(link: INLINE)`表示这个关系表现为在 Tweet 表上的外键。
- 从`Tweet`到`Location`(通过`location`字段)有一个*单向*关系。他们的关系通过中间表来实现。
- 除了`User`上的`name`字段外，所有字段在数据模型中都是*必填字段*(由类型后面的`!`表示)。
- `id`，`createdAt`和`updatedAt`字段由 Prisma 管理，在暴露的 Prisma API 中是*只读的*(意味着它们不能通过 Mutation 改变)。
- `@unique`指令表示*唯一约束*，这意味着 Prisma 会自动确保永远不会有两条数据具有相同的值，比如说 id 或手机号不会相同从而造成重复注册。

创建和更新数据模型就像编写和保存 datamodel 文件一样简单。一旦对数据模型感到满意，就可以通过运行`prisma deploy`来保存文件并将更改应用到 Prisma service:

```
prisma deploy

# 以下是终端输出

Changes:
Tweet (Type)

- Created type `Tweet`
- Created field `id` of type `GraphQLID!`
- Created field `createdAt` of type `DateTime!`
- Created field `text` of type `String!`
- Created field `owner` of type `Relation!`
- Created field `location` of type `Relation!`
- Created field `updatedAt` of type `DateTime!`
  User (Type)
- Created type `User`
- Created field `id` of type `GraphQLID!`
- Created field `createdAt` of type `DateTime!`
- Created field `updatedAt` of type `DateTime!`
- Created field `handle` of type `String!`
- Created field `name` of type `String`
- Created field `tweets` of type `[Relation!]!`
  Location (Type)
- Created type `Location`
- Created field `latitude` of type `Float!`
- Created field `longitude` of type `Float!`
- Created field `id` of type `GraphQLID!`
- Created field `updatedAt` of type `DateTime!`
- Created field `createdAt` of type `DateTime!`
  TweetToUser (Relation)
- Created relation between Tweet and User
  LocationToTweet (Relation)
- Created relation between Location and Tweet
  Applying changes... (22/22)
  Applying changes... 0.4s

```

### Datamodel vs Prisma GraphQL schema

当使用 GraphQL 和 Prisma 时，你正在使用的`.graphql`后缀的文件的作用可能会令人困惑。所以，了解每一个的功能至关重要。

我们看在 Prisma 项目中，有三个相关的`.graphql`后缀的文件:

- **datamodel**包含服务 API 的*数据模型定义*，通常称为`datamodel.prisma`。
- **Prisma GraphQL schema**定义服务 API(也就是前端能操作和请求)的实际 CRUD 和实时操作(realtime _operations_)，通常称为`prisma.graphql`。
- **应用程序 schema**定义通过 http 请求能够执行什么样的操作，不像上面的`prisma.graphql`包含所有操作，应用程序 schema 只需要写你能用到的，或去掉危险操作比如删除所有用户这种。所有在这里定义的 Query、Mutation 和 Subscription 都要一一对应写 resolvers 来决定返回的数据。通常为`schema.graphql`或`app.graphql`.

Prisma 数据库的表基于 datamodel 生成:

![](/prisma1/images/jHkNjKU.png)

该图展示了生成的 Prisma GraphQL schema 的简化版本，你可以找到完整的 schema[此处](https://gist.github.com/gc-codesnippets/f302c104f2806f9e13f41d909e07d82d)。

[GraphQL schema](https://www.prisma.io/blog/graphql-server-basics-the-schema-ac5e2950214e/)定义了 GraphQL API 的操作。它实际上是用 SDL 编写的*types*集合(SDL 还支持接口，枚举，联合类型等原语，你可以学习有关 GraphQL 类型系统的所有内容[这里](http://graphql.org/learn/schema/#type-system))。

GraphQL schema 有三个特殊的*根类型：root types*:`Query`，`Mutation`和`Subscription`。这些类型定义 API 的*入口点(类似路由的 url)：entry points*定义 API 将接受的操作。要了解有关 GraphQL schema 的更多信息，请查看此[文章](https://www.prisma.io/blog/graphql-server-basics-the-schema-ac5e2950214e/)。

#### 数据模型

数据模型由 Prisma service 的开发者手动编写。它定义了开发人员想要在其 API 和数据库中使用的模型和结构。

严格来说，**datamodel 不是有效的 GraphQL schema**，因为它不包含任何 GraphQL 的根类型(`Query`，`Mutation`，`Subscription`)，因此不定义任何 API 操作。

数据模型仅是生成 Prisma GraphQL API 的实际 GraphQL schema 的*基础*。

#### Prisma GraphQL schema

可以使用 Prisma.yml 中的 graphql-schema generator 从 Prisma service 下载 Prisma GraphQL schema：

```
generate:
  - generator: `graphql-schema`
    output: .src/generated/prisma.graphql
```

现在您可以运行`prisma generate`，Prisma CLI 将在`./prisma-schema/prisma.graphql`中存储 Prisma GraphQL Schema。

##### 使用 graphql-config 和 post-deployment hook 生成 Prisma GraphQL schema

在实际开发设置中，你希望保持本地 Prisma GraphQL schema 与服务的 API 同步，并确保在每次部署 Prisma service 时更新它。你可以使用*post-deployment* 来实现。

`.graphqlconfig.yml`和 prisma.yml 在设置好的样子:

**`prisma.yml`**

```yaml
datamodel: datamodel.prisma
endpoint: http://localhost:4466/myservice/dev
secret: mysecret
hooks:
post-deploy: - prisma generate

```

#### 应用程序 schema

如果你已经考虑过基于 Prisma 构建自己的 GraphQL 服务器，你可能会遇到另一个`.graphql`文件，它被称为你的**应用程序 schema**(通常为`schema.graphql`或`app.graphql`)。

这是一个有效的 GraphQL schema(意味着它包含`Query`，`Mutation`和`Subscription`根类型)，它定义了*应用程序层*的 API。与 Prisma 的通用 CRUD API 相比，应用程序层的 API 应该公开针对前端端应用程序需求而定制的特定的操作。

应用程序层使用 Prisma 作为*data 访问层*并将传入的请求委托给服务端的 Prisma API，它们实际上是针对数据库解析的。

你通常不会在应用程序 schema 中重新定义模型定义。相反，你使用[`graphql-import`](https://github.com/prismagraphql/graphql-import)*import*他们:

`schema.graphql`中如下，在这里`#`符号不是注释，而是特定导入语法。

```graphql
# import Post from "prisma.graphql"
type Query {
  feed: [Post!]!
}
```

`graphql-import`目前使用 SDL 注释来导入类型。 将来，SDL 可能会有一个正式的导入语法[已经讨论过](https://github.com/graphql/graphql-wg/blob/master/notes/2018-02-01.md#present)。

阅读 **深入理解 Prisma**了解有关应用程序 schema 的更多信息。

### 文件

你可以将你的数据模型编写在一个`.graphql`文件中，或者将其分成多个。

包含 datamodel 的`.graphql`文件需要在 prisma.yml 下的属性`datamodel`中指定。 例如:

```yaml
datamodel:
  - types.graphql
  - enums.graphql
```

如果只有一个文件定义了数据模型，则可以按如下方式指定:

```yaml
datamodel: datamodel.prisma
```

### 对象类型 type

_object type_(简称 _type_)定义数据模型中一个*model*的结构。 它用于表示*应用领域*中的*实体*。

每个对象类型都映射到数据库。 对于关系数据库，每种类型创建一个*table*。 对于无模式数据库，使用等效结构(例如*document*)。 请注意，即使对于无模式数据库，Prisma 也会强制执行模式!

![](/prisma1/images/NFLy3AO.png)

类型具有*name*和一个或多个[_fields 字段_](#字段)。 类型名称只能包含 **字母、数字、字符**，需要以大写字母开头。 它们可以包含 **最多 64 个字符**。

类型的实例化称为*node*。 该术语指的是*data graph*中的节点。

你在数据模型中定义的每种类型都将在生成的*Prisma GraphQL schema*中作为类似类型提供。

#### 定义对象类型

在 datamodel 中使用关键字"type"定义对象类型:

```graphql
type Article {
  id: ID! @id
  title: String!
  text: String
  isPublished: Boolean! @default(value: false)
}
```

上面定义的类型具有以下属性:

- Name: `Article`
- Fields: `id`, `title`, `text` , `isPublished` (默认为 `false`)

`id` , `title` , `isPublished` 是必填字段 (被后面的 `!` 符号定义), `text` 可选填.

所有`ID` 都必须是`@unique`。

#### 生成 type 的 API 操作

数据模型中的类型会影响 Prisma API 中的可用操作。以下是 Prisma API 中每种类型生成的 CRUD 和实时操作的概述:

- Query 允许你获取该类型的一个或多个节点
- Mutations 允许你创建，更新或删除该类型的节点
- Subscriptions 可以让你收到有关该类型节点更改的实时通知(即新节点是*created*或现有节点是*updated*或*deleted*)

### 字段

*Fields*是[type]的构建块，为节点提供*shape*。每个字段都由其名称引用，并且是[标量](#标量)或[关系](#关系)字段。

字段名称只能包含 **字母数字字符**，需要以小写字母开头。它们可以包含 **最多 64 个字符**。

通俗来说就是数据库表的列 column。

#### 标量字段

##### String

`String`保存文本。用于用户名的类型，博客文章的内容或能表示为文本的任何其他内容。

在 Demo 服务器上，字符串值当前限制为 256KB。使用[cluster 配置](https://github.com/graphcool/framework/issues/748)可以在其他 cluster 上增加此限制。

这是一个`String`标量定义的例子:

```graphql
type User {
  name: String
}
```

当在操作中用作参数时，必须使用用双引号括起来指定`String`字段:

```graphql
query {
  user(name: "Sarah") {
    id
  }
}
```

##### 整数

一个`Int`是一个整数，不能有小数。 使用此选项可存储值，例如年龄。

`Int`值的范围是-2147483648 到 2147483647。

这是一个`Int`标量定义的例子:

```graphql
type User {
  age: Int
}
```

当在操作中用作参数时，写`Int`字段不能包含任何封闭字符:

```graphql
query {
  user(age: 42) {
    id
  }
}
```

##### Float

`Float`是一个可以有小数的数字。 使用此选项可存储值，例如商品的价格或复杂计算的结果。

在查询或 Mutation 中，写`Float`字段，不带任何封闭字符，小数点为可选:`float:42`，`float:4.2`。

以下是"Float"标量定义的示例:

```graphql
type Item {
  price: Float
}
```

当在操作中用作参数时，写`Float`字段，不带任何封闭字符，小数点可选:

```graphql
query {
  item(priceLargerThan: 42.2) {
    id
  }
}
```

##### Boolean

一个`Boolean`的值可以是`true`或`FALSE`。 在判断场景比较常见，例如用户是否想要接收电子邮件或者用户是否是会员。

以下是`Boolean`标量定义的示例:

```graphql
type User {
  overEighteen: Boolean
}
```

同样不能有封闭字符

```graphql
query {
  user(overEighteen: true) {
    id
  }
}
```

##### DateTime

`DateTime`类型可用于存储日期和/或时间值。可能是一个人的出生日期或特定事件发生时的时间/数据。

这是一个`DateTime`标量定义的例子:

```graphql
type User {
  birthday: DateTime
}
```

当在操作中用作参数时，必须在[ISO 8601 格式](https://en.wikipedia.org/wiki/ISO_8601)中指定`DateTime`字段，并带有双引号:

```graphql
query {
  user(birthday: "2015-11-22") {
    id
  }
}
```

ISO 8601 还接受以下格式:

- `datetime:"2015"`
- `datetime:"2015-11"`
- `datetime:"2015-11-22"`
- `datetime:"2015-11-22T13:57:31.123Z"`。

##### Enum

像"Boolean"一样，枚举可以有一组预定义的值。 区别在于*你*可以定义可能的值(而对于`Boolean`，选项被限制为`true`和`false`)。 例如，你可以通过创建具有可能值"COMPACT"，"WIDE"和"COVER"的枚举来指定文章的格式。

枚举值只能包含 **字母数字字符和下划线**，并且需要以大写字母开头。 枚举值的名称可用于查询过滤器和 Mutation。 它们可以包含 **最多 191 个字符**。

以下是枚举定义 datamodel 的示例:

```graphql
enum ArticleFormat {
  COMPACT
  WIDE
  COVER
}
type Article {
  format: ArticleFormat
}
```

当在操作中用作参数时，必须在不包含双引号的情况下指定枚举字段:

```graphql
query {
  article(format: COMPACT) {
    id
  }
}
```

##### Json

有时你可能需要为松散结构化的数据存储任意 JSON 值。 `Json`类型确保它实际上是有效的 JSON 并将值作为解析的 JSON 对象/数组而不是字符串返回。

Json 值目前限制为 256KB。

这是一个`Json`定义的例子:

```graphql
type Item {
  data: Json
}
```

当在操作中用作参数时，必须使用双引号括起来指定的`Json`字段。 特殊字符必须被转义: `json: "{\"int\": 1, \"string\": \"value\"}"`.

```graphql
mutation {
  createItem(data: "{\"int\": 1, \"string\": \"value\"}") {
    data
  }
}
```

##### ID

"ID"值是基于[cuid](https://github.com/prismagraphql/cuid-java)生成的唯一 25 个字符的字符串。 具有"ID"值的字段是[系统字段](#系统字段)并且仅在内部使用，因此无法使用"ID"类型创建新字段。

`ID`字段只能在一个类型上使用一次，并且必须使用`@unique`指令进行注释:

#### 类型修饰符

在字段定义中，可以使用*类型修饰符*注释类型。 GraphQL 支持两种类型修改:

- 必填字段:使用`!`注释类型，例如 `name:String!`
- List:使用一对封闭的`[]`来注释类型，例如: `friends: [User]`

##### List

一般在一对多关系中使用 List。

可以使用列表字段类型标记标量字段。 具有多重性的关系字段也将被标记为列表。

经常会发现列表定义与此类似:

```graphql
type Article {
  tags: [String!]! @scalarList(strategy: RELATION)
}
```

注意两个`!`类型修饰符，这是它们表达的内容:

- 第一个`!`类型修饰符(在`String`之后)意味着列表中的任何项都不能为"null"，例如 `tags`的这个值无效:`["Software"，null，"GraphQL"]`
- 第二个`!`类型修饰符(在结束方括号之后)意味着列表本身永远不能为"null"，但它可能是*empty*。 因此，`null`不是`tags`字段的有效值，而`[]`是。

**记住，所有一对多关系，必须有两个`!`，不然 prisma deploy 时会报错，因为返回值不能为 null，用！后返回值哪怕为空也是`[]`**

##### 必填

字段可以标记为必需(有时也称为"非空")。 创建新节点时，需要为所需的字段提供值，并且没有[默认值](#默认值)。

在字段类型后面使用`!`标记必填字段:

```graphql
type User {
  name: String!
}
```

#### 字段限制

可以使用字段约束配置字段以添加进一步的语义并在数据模型中强制执行某些规则。

##### 唯一

设置*unique*约束可确保所讨论类型的两个节点对于某个字段不能具有相同的值。 唯一的例外是`null`值，这意味着多个节点可以具有值`null`而不违反约束。 唯一字段在底层数据库中应用了唯一的*索引*。

一个典型的例子是`User`类型的`email`字段，其中假设每个`User`应该具有全球唯一的电子邮件地址。

只有 String 字段中的前 191 个字符被认为是唯一性，唯一的检查是*不区分大小写的*。 如果前 191 个字符相同或者它们仅在大小写上不同，则无法存储两个不同的字符串。

要将字段标记为唯一，只需将`@unique`指令附加到其定义:

```graphql
type User {
  id: ID! @id
  email: String! @unique
  name: String!
}
```

对于使用`@unique`注释的每个字段，你都可以通过为该字段提供值作为查询参数来查询相应的数据。

例如，考虑到上面的数据模型，你现在可以通过其`email`地址检索特定的`User`节点:

```graphql
query {
  user(where: { email: "kwc@1wire.com" }) {
    name
  }
}
```

##### 更多限制

将很快添加更多数据库约束。 如果你希望在 Prisma 中看到某些约束，请加入此[功能请求](https://github.com/prisma/prisma/issues/728)中的讨论。

#### 默认值

你可以为非列表标量字段设置*default 值*。 当在`create`-mutation 期间没有提供任何值时，该值将应用于新创建的节点。

要指定字段的默认值，可以使用`@default`指令:

```graphql
type Story {
  isPublished: Boolean @default(value: false)
  someNumber: Int! @default(value: 42)
  title: String! @default(value: "My New Post")
  publishDate: DateTime! @default(value: "2018-01-26")
  status: Status! @default(value: PUBLIC)
}
enum Status {
  PRIVATE
  PUBLIC
}
```

#### 系统字段

三个字段`id`，`createdAt`和`updatedAt`在 Prisma 中有特殊的语义。它们在你的数据模型中是可选的，但始终在基础数据库中存在。这样，你可以随时将字段添加到数据模型中，并且数据仍可用于现有节点。

这些字段的值当前在 Prisma API 中是只读的(导入数据时除外)，但将来可以配置。有关详细信息，请参阅[此提案](https://github.com/prisma/prisma/issues/1278)。

请注意，你不能拥有名为`id`，`createdAt`和`updatedAt`的自定义字段，因为这些字段名称是为系统字段保留的。以下是这三个字段唯一支持的声明:

- `id:ID! @id`
- `createdAt:DateTime! @createdAt`
- `updatedAt: DateTime! @updatedAt`

所有系统字段都需要标记为[必填](#必填)，并且`id`字段还需要使用`@unique`指令进行注释。

##### 系统字段:`id`

节点在创建时将自动分配一个全局唯一标识符，该标识符存储在`id`字段中。

每当你将`id`字段添加到类型定义中以在 GraphQL API 中公开它时，你必须使用`@unique`指令对其进行注释。

`id`具有以下属性:

*由 25 个字母数字字符组成(字母总是小写)
*始终以(小写)字母开头，例如`c` 遵循[cuid](https://github.com/ericelliott/cuid)(_collision resistant unique identifiers_)方案

请注意，Prisma GraphQL schema 中的所有模型类型都将生成`Node`接口。这就是`Node`接口的样子:

```graphql
interface Node {
  id: ID! @id
}
```

`id` 的类型可以为：

- `ID`
- `Int`

比如你要设置 id 为自增字段，则设置为 Int 然后去数据库手动添加序列。

##### 系统字段:`createdAt`和`updatedAt`

数据模型还提供了两个可以添加到类型中的特殊字段:

- `createdAt:DateTime! @createdAt`:存储此对象类型的节点为*created*的确切日期和时间。
- `updatedAt: DateTime! @updatedAt`:存储此对象类型的节点*last updated*的确切日期和时间。

如果希望类型公开这些字段，只需将它们添加到类型定义中，例如:

```graphql
type User {
  id: ID! @id
  createdAt: DateTime! @createdAt
  updatedAt: DateTime! @updatedAt
}
```

不要忘记加`!`

##### `@db`

`@db` 字段定义底层数据库表名:

```graphql
type User @db(name: "user") {
  id: ID! @id
  name: String! @db(name: "full_name")
}
```

这样子表 `User` 会实际生成 `user` 表并且列 `name` 会变为 `full_name`.

##### `@scalarList`

`@scalarList(strategy: STRATEGY!`) 目前仅在 String 列表有用.

```graphql
type Post {
  tags: [String!]! @scalarList(strategy: RELATION)
}
```

#### 生成字段的 API 操作

数据模型中的字段会影响可用的查询参数。

#### 更改多个标量字段的值

你可以使用`updateManyXXX`Mutation 来更改所有节点的标量字段值，或仅更改特定子集。

```graphql
mutation {
  # 将没有电子邮件地址的所有用户的电子邮件更新为空字符串
  updateManyUsers(where: { email: null }, data: { email: "" })
}
```

#### 向数据模型添加必填字段

向必须包含节点的模型添加必填字段时，会收到以下错误消息:"You are creating a required field but there are already nodes present that would violate that constraint.你正在创建必填字段，但已存在违反该约束的节点。"

这是因为所有现有节点都会收到该字段的"null"值。这将违反该字段的约束*必填字段*(或*non-nullable*)。

以下是添加必填字段所需的步骤:

- 把它变为可选字段

- 使用`updateManyXXX`将所有节点的字段从`null`迁移到非 null 值

- 现在你可以将该字段标记为*必填字段*并按预期进行部署

### 关系

*relation*定义两个[类型](#对象类型)之间连接的语义。关系中的两种类型通过[关系字段](#标量和关系字段)连接。当关系不明确时，需要使用[`@relation`](#关系字段)指令对关系字段进行注释以消除歧义。

关系在底层数据库有两种处理方式：

- 关系表：关系之间会有关系表定位两者关系。该方法为默认关系设置。
- 内联关系：关系通过一个表的外键定位。该方法不能适用多对多关系。因为外键对性能的影响，请谨慎设置。

以下是简单双向关系的示例:

```graphql
type User {
  id: ID! @id
  profile: Profile! @relation(link: INLINE)
  articles: [Article!]!
}
type Article {
  id: ID! @id
  author: User!
}
type Profile {
  id: ID! @id
  user: User!
}
```

关系也可以将类型与自身连接起来。 然后将其称为*self-relation*:

```graphql
type User {
  id: ID! @id
  friends: [User!]!
}
```

自我关系也可以是双向的:

```graphql
type User {
  id: ID! @id
  following: [User!]! @relation(name: "Following")
  followers: [User!]! @relation(name: "Followers")
}
```

请注意，在这种情况下，关系需要使用[`@relation`指令](#relation-directive)进行注释。

#### 必需的关系

对于*单向*关系字段，你可以配置它是*必填字段*还是*可选的*。 `!`类型修饰符在 GraphQL 中充当契约，该字段永远不能为"null"。 因此，用户地址的字段将是"Address"或"Address!"类型。

包含所需*单向*关系字段的类型的节点只能使用[嵌套 Mutation]创建，以确保相应字段不为"null"。

再来看以下关系:

```graphql
type User {
  id: ID! @id
  car: Car!
}
type Car {
  id: ID! @id
  owner: User!
  color: String!
}
```

如果没有"用户"，就永远不能创建"Car"，反之亦然，因为这会违反所需的约束。 因此，你需要使用嵌套 Mutation 同时创建两者:

```graphql
mutation {
  createUser(data: { car: { create: { color: "Yellow" } } }) {
    id
    car {
      id
    }
  }
}
```

再次提醒，*一对多*关系字段始终设置为 required。例如，包含许多用户地址的字段总是使用类型`[Address!]!`并且永远不能是`[Address!]`，`[Address]!`或`[Address]`。

#### `@relation`指令

在定义类型之间的关系时，*可以*使用`@relation`指令，该指令提供关于关系的元信息。如果关系不明确，那么你必须使用`@relation`指令来消除它的歧义。

它可以有两个参数:

- `name`(必需):此关系的标识符，以字符串形式提供。
- `link`: 定义底层数据库如何处理关系表（默认为中间表`TABLE`）:
  - `INLINE`: 关系在数据库表中为外键.
  - `TABLE`: 关系在数据库表中为中间表.
- `onDelete`:指定*删除行为 deletion behaviour*并启用*级联删除 cascading deletes*。在具有相关节点的节点被删除的情况下，删除行为确定相关节点应该发生什么。此参数的输入值定义为具有以下可能值的枚举:
     - `SET_NULL`(默认值):将相关节点设置为"null"。
     - `CASCADE`:删除相关节点。请注意，无法将双向关系的*两*端都设置为"CASCADE"。

以下是使用`@relation`指令的数据模型示例:

```graphql
type User {
  id: ID! @id
  stories: [Story!]! @relation(name: "StoriesByUser", onDelete: CASCADE)
}
type Story {
  id: ID! @id
  text: String!
  author: User @relation(name: "StoriesByUser")
}
```

该关系被命名为"StoriesByUser"，删除行为如下:

- 删除"User"节点时，其所有相关的"Story"节点也将被删除。
- 当一个`Story`节点被删除时，它将被简单地从相关的`User`节点上的`stories`列表中删除。

##### 省略`@relation`指令

在最简单的情况下，两个类型之间的关系是明确的并且应该应用默认删除行为(`SET_NULL`)，相应的关系字段不必用`@relation`指令注释。

这里我们定义了`User`和`Story`类型之间的双向*one-to-many*关系。 由于尚未提供`onDelete`，因此使用默认删除行为:`SET_NULL`:

```graphql
type User {
  id: ID! @id
  stories: [Story!]!
}
type Story {
  id: ID! @id
  text: String!
  author: User
}
```

此示例中的删除行为如下:

- 当`User`节点被删除时，其所有相关`Story`节点上的`author`字段将被设置为`null`。 请注意，如果`author`字段被标记为[必填](#必填)，则操作将导致错误。
- 当一个`Story`节点被删除时，它将被简单地从相关的`User`节点上的`stories`列表中删除。

##### 使用`@relation`指令的`name`参数

在某些情况下，你的数据模型可能包含不明确的关系。 例如，考虑到你不仅想要一个关系来表达"用户"和"故事"之间的"作者关系"，而且你还想要一个关系来表达"故事"节点已经被"用户"_点赞_。

在这种情况下，你最终会得到"用户"和"故事"之间的两种不同关系! 为了消除它们的歧义，你需要为该关系指定一个名称:

```graphql
type User {
  id: ID! @id
  writtenStories: [Story!]! @relation(name: "WrittenStories")
  likedStories: [Story!]! @relation(name: "LikedStories")
}
type Story {
  id: ID! @id
  text: String!
  author: User! @relation(name: "WrittenStories")
  likedBy: [User!]! @relation(name: "LikedStories")
}
```

如果在这种情况下没有提供`name`，则无法确定`writtenStories`是否应该与`author`或`likesBy`字段相关。

##### 使用`@relation`指令的`onDelete`参数

如上所述，你可以为相关节点指定专用删除行为。 这就是`@relation`指令的`onDelete`参数。

我们看下面的示例:

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

让我们研究三种类型的删除行为:

- 当`User`节点被删除时，
     - 将删除所有相关的`Comment`节点。
     - 相关的`Blog`节点将被删除。
- 当`Blog`节点被删除时
     - 将删除所有相关的`Comment`节点。
     - 相关的`User`节点将其`blog`字段设置为`null`。
- 删除"Comment"节点时
     - 相关的`Blog`节点继续存在，删除的`Comment`节点从其`comments`列表中删除。
     - 相关的`User`节点继续存在，删除的`Comment`节点从其`comments`列表中删除。

#### 生成关系的 API 操作

schema 中包含的关系会影响[Prisma API](#use-prisma-api)中的可用操作。以下是 Prisma API 中每个关系生成的 CRUD 和实时操作的概述:

- [关系 Query]允许你跨类型查询数据或为关系聚合(请注意，这也可以使用[Relay](https://facebook.github.io/relay/)的[连接模型]。
- [嵌套 Mutation]允许你在同一 Mutation 中创建，连接，更新，升级和删除多个相关节点。
- [关系 Subscriptions]允许你获得关系更改的通知。

### SDL 指令

指令用于在你的数据模型中提供其他信息。它们看起来像这样:`@name(argument:"value")`或者当没有参数时只有`@name`。

#### Datamodel 指令

Datamodel 指令描述了有关 GraphQL schema 中的类型或字段的其他信息。

##### 唯一标量字段

`@unique`指令将标量字段标记为[唯一](#唯一)。唯一字段将在底层数据库中应用唯一的*index*。

```graphql
# `User` 有唯一的 `email`
type User {
  email: String @unique
}
```

查找有关`@unique`[指令](#唯一)的更多信息。

##### 关系字段

指令`@relation(name:String，onDelete:ON_DELETE!= SET_NULL)`可以附加到关系字段。

##### 标量字段的默认值

指令`@default(value:String!)`为标量字段设置[默认值](#默认值)。 请注意，`value`参数对于所有标量字段都是 String 类型(即使字段本身不是字符串):

```graphql
# `title`, `published`,`someNumber` 默认值为 `New Post`, `false` , `42`
type Post {
  title: String! @default(value: "New Post")
  published: Boolean! @default(value: false)
  someNumber: Int! @default(value: "42")
}
```

#### 临时指令

临时指令用于执行一次性迁移操作。 在部署包含临时指令的服务之后，**需要从类型定义文件**中手动删除临时指令。

##### 重命名类型或字段

临时指令`@rename(oldName:String!)`用于重命名类型或字段。

```graphql
# 重命名 `Post` 为 `Story`, 并且它的 `text` 字段改为 `content`
type Story @rename(oldName: "Post") {
  content: String @rename(oldName: "text")
}
```

> 如果未使用重命名指令，Prisma 会在创建新类型和字段之前删除旧类型和字段，从而导致数据丢失!

### 命名约定

你在 Prisma service 中遇到的不同对象(如类型或关系)遵循不同的命名约定，以帮助你区分它们。

#### 类型

类型名称确定派生查询和 Mutation 的名称以及嵌套 Mutation 的参数名称。

以下是命名类型的约定:

- 在 **单个数据**时选择类型名称:
  - **Yes**: `type User { ... }`
  - **No**: `type Users { ... }`

请严格遵守，因为当创建时若为`type Users`，那么自动生成的代码里查询多个用户会成为`Userss`

#### 标量和关系字段

标量字段的名称用于查询和 Mutation 的查询参数中。关系字段的名称遵循相同的约定，并确定关系 Mutation 的参数名称。关联字段名称只能包含 **字母数字字符**，并且需要以大写字母开头。它们可以包含 **最多 64 个字符**。

字段名称每种类型都是唯一的。

以下是命名字段的约定:

- 为列表字段选择复数名称:
  - **Yes**: `friends: [User!]!`
  - **No**: `friendList: [User!]!`
- 为非列表字段选择单数名称:
  - **Yes**: `post: Post!`
  - **No**: `posts: Post!`

### 更多 SDL 功能

在本节中，我们将介绍使用 Prisma 进行数据建模尚不支持的 SDL 功能。

#### 接口

"与许多类型系统一样，GraphQL 支持接口。接口是一种抽象类型，包含一组必须包含的字段才能实现接口。"来自官方[GraphQL 文档](http://graphql.org/learn/schema/#interfaces)

要了解有关接口何时以及如何进入 Prisma 的更多信息，请查看此[功能请求](https://github.com/prisma/prisma/issues/83)。

#### 联合类型

"联合类型与接口非常相似，但它们不能指定类型之间的任何公共字段。"来自官方[GraphQL 文档](http://graphql.org/learn/schema/#union-types)

要了解有关联合类型何时以及如何进入 Prisma 的更多信息，请查看此[功能请求](https://github.com/prisma/prisma/issues/165)。

## MongoDB 的 datamodel

不同于 MySQL 和 PostgreSQL 等关系型数据库，MongoDB 作为 NoSQL 在 datamodel 的定义上与上述有所区别，下面是独特字段的举例：

### datamodel 例子

一个简单的`datamodel.prisma`文件例子:

```graphql
type Tweet {
  id: ID! @id
  createdAt: DateTime! @createdAt
  text: String!
  owner: User!
  location: Location!
}
type User {
  id: ID! @id
  createdAt: DateTime! @createdAt
  updatedAt: DateTime! @updatedAt
  handle: String! @unique
  name: String
  tweets: [Tweet!]! @relation(link: INLINE)
}
type Location @embedded {
  latitude: Float!
  longitude: Float!
}
```

> 此示例基于[datamodel v1.1]格式，该格式当前位于[预览]中。

此示例说明了使用数据模型时的一些重要概念：

- 两种类型`Tweet`和`User`分别映射到 MongoDB 集合。
- `User`和`Tweet`之间存在*双向*关系(通过`owner`和`tweets`字段)。请注意，在底层数据库中，只有`User`文档存储对`Tweet`文档的引用(而不是相反)，因为`User`上的`tweets`字段指定`@relation`directive 上的`link`。但是，Prisma API 仍然允许您直接查询`Tweet`的`owner`。
- 从`Tweet`到`Location`(通过`location`字段)有一个*单向*关系。 `Location`是一个*embedded type*，这意味着没有`Location`文档存储在他们自己的`Location`集合中 - 相反，每个`Location`都存储在`Tweet`集合中的`Tweet`文档中。
- 除了`User`上的`name`字段外，所有字段在数据模型中都是*required*(由类型后面的`！`表示)。
- 使用`@id`，`@reatedAt`和`@updatedAt`-指令注释的字段由 Prisma 管理，并且在公开的 Prisma API 中使用*read-only*，这意味着它们不能通过突变进行更改(除非[使用 NDF 格式导入数据])。
- `@unique`指令表示*唯一约束*，这意味着 Prisma 确保永远不会有两个节点具有相同的注释字段值。

创建和更新数据模型就像编写和保存 datamodel 文件一样简单。一旦对数据模型感到满意，就可以通过运行`prisma deploy`来保存文件并将更改应用到 Prisma 服务：

这些字段的值当前是只读的(除了[在 Prisma API 中使用 NDF 格式导入数据])，但将来可以配置。有关详细信息，请参阅[此提案](https://github.com/prisma/prisma/issues/1278)。

#### 系统字段

MongoDB 的三个系统字段不同：

```graphql
type User {
  id: ID! @id
  created_at: DateTime! @createdAt
  updated_at: DateTime! @updatedAt
}
```

#### 关系

关系定义了两种类型之间连接的语义。关系中的两种类型通过关系字段连接。当关系不明确时，需要使用@relation 指令对关系字段进行注释以消除歧义。

MongoDB 中的关系
文档和关系数据库之间最大的区别之一是如何处理数据类型之间的关系。

虽然关系数据库使用数据库规范化来存储通过密钥相互引用的平面数据记录，但文档数据库能够存储物理上位于同一集合内的相关对象的对象。后者称为嵌入数据(即，集合中的文档可以具有嵌入在同一集合内的子文档/阵列)。

使用 MongoDB，可以通过直接在父文档中嵌入数据或使用引用来表达关系。可以在 MongoDB 文档中找到有关差异的良好概述。在为底层 MongoDB 建模数据时，Prisma 采用嵌入式类型的思想。

嵌入式类型
MongoDB 连接器引入了嵌入式类型的概念。嵌入式......

- ...始终使用@embedded 指令进行注释。
- ...总是(至少)有一种父类型。
- ...始终直接存储在底层 Mongo 数据库的父类型集合中(即嵌入类型永远不会有自己的集合)。
- ...不能有唯一的字段(即用@unique 指令注释的字段)。
- ...不能与其父类型具有(反向)关系(但它可以与其他非嵌入类型有关系)。
- ...不能使用 Prisma API 直接查询，而只能通过父类型的嵌套操作查询。
- ...不能使用 Prisma API 直接创建，更新或删除，而只能通过父类型的嵌套操作创建，更新或删除。

以下是数据模型的示例，其中 Coordinates 被定义为嵌入类型：

```graphql
type City {
  id: ID! @id
  name: String!
  coordinates: Coordinates
}
type Coordinates @embedded {
  latitude: Float!
  longitude: Float!
}
```

以下是基于此数据模型存储在基础 MongoDB 数据库中的数据示例：

![](/prisma1/images/MX4jsQQ.png)

使用此设置，无法直接查询任何坐标实例，因为坐标是嵌入类型。 只能通过城市类型查询坐标。 同样，您无法直接创建，更新或删除坐标，而是需要创建，更新或删除 City 才能在 Coordinates 实例上执行此类操作。

> [拓展解释](https://github.com/prisma/prisma/issues/2836)

#### 连接关系

使用 MongoDB，您可以通过两种方式建立关系模型：

- 使用@embedded，如上所述
- 使用*references*，在 Prisma 术语中称为*links*

与 MongoDB 连接器的*link relation*的工作方式如下：

- 关系的一边(A)存储另一边的文档 ID(B)，这称为*inlined link*
- 该关系的另一方(B)对初始方面的文件完全没有引用*(A)*
- 关系的每一面都由底层 MongoDB 中自己的集合表示，即链接关系总是跨越多个集合。

您可以使用`@relation`指令的`link`参数来表示应该存储 ID 的关系的一面。 在下面的示例中，`User`类型存储与其相关的所有`Post`文档的 ID 值。 然而，`Post`文档不会在底层 Mongo 数据库中存储有关其`author`的任何信息：

```graphql
type User {
  id: ID! @id
  name: String!
  posts: [Post!]! @relation(link: INLINE)
}
type Post {
  id: ID! @id
  title: String!
  author: User!
}
```

以下是基于此数据模型存储在基础 MongoDB 数据库中的数据示例：

![](/prisma1/images/R7pTU1D.png)

虽然这种方法可以直接在 Prisma API 中查询`Post`文档(而不是只能通过嵌套操作通过其父类型查询的嵌入类型)，但在以这种方式建模关系时存在性能方面的考虑。

通过`author`字段从`Post`到`User`的操作有性能问题。 这是因为底层的`Post`对象不知道他们的作者是谁，而 Prisma 需要过滤所有`User`以找到`Post`的`author`是谁。

#### 自引用关系

关系也可以将类型与自身连接起来。 然后将其称为*self-relation*。

请注意，自我关系还需要在`@relation`指令中包含`link`参数：

```graphql
type User {
  id: ID! @id
  friends: [User!]! @relation(link: INLINE)
}
```

自我关系也可以是双向的：

```graphql
type User {
  id: ID! @id
  following: [User!]! @relation(name: "FollowRelation", link: INLINE)
  followers: [User!]! @relation(name: "FollowRelation")
}
```

请注意，在这种情况下，需要使用`@relation`指令注释关系，并且必须提供`name`参数。

#### 必需关系

对于*to-one* relation 字段，您可以配置它是*required*还是*optional*。 `！`类型修饰符在 GraphQL 中充当契约，该字段永远不能为`null`。因此，用户地址的字段将是`Address`或`Address！`类型。

包含所需*to-one* relation 字段的类型的节点只能使用[嵌套 mutation]创建，以确保相应字段不为`null`。

再考虑以下关系：

```graphql
type User {
  id: ID! @id
  car: Car! @relation(link: INLINE)
}
type Car {
  id: ID! @id
  owner: User!
  color: String!
}
```

如果没有`User`，就永远不会创建`Car`，反之亦然，因为这会违反所需的约束。因此，您需要使用声明性嵌套写入同时创建两者：

```javascript
const newUser = await prisma.createUser({
  car: {
    create: {
      color: 'Yellow',
    },
  },
});
```

graphql：

```graphql
mutation {
  createUser(data: { car: { create: { color: "Yellow" } } }) {
    id
    car {
      id
    }
  }
}
```

请注意，_to-many_ relation 字段始终设置为 required。例如，包含许多用户地址的字段总是使用类型`[Address!]!`，并且永远不能是`[Address!]`，`[Address]!`或`[Address]`。

#### `@relation`指令

在定义类型之间的关系时，*可以*使用`@relation`指令，该指令提供关于关系的元信息。有时，可能需要`@relation`指令，例如如果一个关系是模糊的，你*必须*使用`@relation`指令来消除它的歧义。或者，如果要定义[link relation]，则必须使用`@relation`指令对关系的一侧进行注释，以指定`link`参数。

它可能需要两个参数：

- `name`(必需)：此关系的标识符，以字符串形式提供。
- `link`(作为[link relation]是需要的)：指定关系的哪一侧应该存储对另一方的引用。
- `onDelete`：指定*删除行为*并启用*级联删除*。在具有相关节点的节点被删除的情况下，删除行为确定相关节点应该发生什么。此参数的输入值定义为具有以下可能值的枚举：
   -  - `SET_NULL`(默认值)：将相关节点设置为`null`。
   -  - `CASCADE`：删除相关节点。请注意，无法将双向关系的结尾设置为`CASCADE`。

以下是使用`@relation`指令的数据模型示例：

```graphql
type User {
  id: ID! @id
  stories: [Story!]! @relation(name: "StoriesByUser", link: INLINE, onDelete: CASCADE)
}
type Story {
  id: ID! @id
  text: String!
  author: User @relation(name: "StoriesByUser")
}
```

该关系被命名为`StoriesByUser`，删除行为如下：

- 当`User`节点被删除时，其所有相关的`Story`节点也将被删除。
- 当一个`Story`节点被删除时，它将被简单地从相关的`User`节点上的`stories`列表中删除。

##### 使用`@relation`指令的`name`参数

在某些情况下，您的数据模型可能包含不明确的关系。例如，考虑到你不仅想要一个关系来表达`User`和`Story`之间的`StoriesByUser`relation，而且你还想要一个关系来表达`User`已经*liked*的`Story`节点。

在这种情况下，你最终会得到`User`和`Story`之间的两种不同关系！为了消除它们的歧义，您需要为该关系指定一个名称：

```graphql
type User {
  id: ID! @id
  writtenStories: [Story!]! @relation(name: "WrittenStories", link: INLINE)
  likedStories: [Story!]! @relation(name: "LikedStories", link: INLINE)
}
type Story {
  id: ID! @id
  text: String!
  author: User! @relation(name: "WrittenStories")
  likedBy: [User!]! @relation(name: "LikedStories")
}
```

如果在这种情况下没有提供`name`，则无法确定`writtenStories`是否应该与`author`或`likesBy`字段相关。

##### 使用`@relation`指令的`onDelete`参数

如上所述，您可以为相关节点指定专用删除行为。这就是`@relation`指令的`onDelete`参数。

请考虑以下示例：

```graphql
type User {
  id: ID! @id
  comments: [Comment!]! @relation(name: "CommentAuthor", onDelete: CASCADE, link: INLINE)
  blog: Blog @relation(name: "BlogOwner", onDelete: CASCADE, link: INLINE
}
type Blog {
  id: ID! @id
  comments: [Comment!]! @relation(name: "Comments", onDelete: CASCADE, link: INLINE)
  owner: User! @relation(name: "BlogOwner", onDelete: SET_NULL)
}
type Comment {
  id: ID! @id
  blog: Blog! @relation(name: "Comments", onDelete: SET_NULL)
  author: User @relation(name: "CommentAuthor", onDelete: SET_NULL)
}
```

这三种类型的删除行为：

- 当`User`节点被删除时
     - 将删除所有相关的`Comment`节点。
     - 相关的`Blog`节点将被删除。
- 当`Blog`节点被删除时
     - 将删除所有相关的`Comment`节点。
     - 相关的`User`节点将其`blog`字段设置为`null`。
- 删除`Comment`节点时
     - 相关的`Blog`节点继续存在，删除的`Comment`节点从其`comments`列表中删除。
     - 相关的`User`节点继续存在，删除的`Comment`节点从其`comments`列表中删除。

#### 生成关系的 API 操作

架构中包含的关系会影响[Prisma API]中的可用操作。以下是 Prisma API 中每个关系生成的 CRUD 和实时操作的概述：

- [Relation queries]允许您跨类型查询数据或为关系聚合(请注意，这也可以使用[Relay](https://facebook.github.io/) relay /)的[连接模型](qwe1＃connection-queries))。
- [Nested mutations]允许您在同一突变中创建，连接，更新，升级和删除多个相关节点。
- [Relation subscriptions]允许您获得关系更改的通知。

### SDL 指令

指令用于在您的数据模型中提供其他信息。它们看起来像这样：`@name(argument: "value")`或者只有`@name`，当没有参数时。

#### 独特的标量字段

`@unique`指令将标量字段标记为[唯一]。唯一字段将在底层数据库中应用唯一的*索引*。

```graphql
type User {
  email: String @unique
}
```

#### 关系字段

指令`@relation(name: String, onDelete: ON_DELETE! = SET_NULL)`可以附加到关系字段。

[见上文]了解更多信息。

#### 标量字段的默认值

指令`@default(value：<type>！)`为标量字段设置[默认值]：

```graphql
type Post {
  title: String! @default(value: "New Post")
  published: Boolean! @default(value: false)
  someNumber: Int! @default(value: 42)
}
```

### 命名约定

您在 Prisma 服务中遇到的不同对象(如类型或关系)遵循不同的命名约定，以帮助您区分它们。

#### 类型

类型名称确定派生查询和突变的名称以及嵌套突变的参数名称。

以下是命名类型的约定：

- 在**单数**中选择类型名称：
     - **正确**：`type User { ... }`
     - **错误**：`type Users { ... }`

#### 标量和关系字段

标量字段的名称用于查询和突变的查询参数中。关系字段的名称遵循相同的约定，并确定关系突变的参数名称。关联字段名称只能包含**字母数字字符**，并且需要以大写字母开头。它们可以包含**最多 64 个字符**。字段名称每种类型都是唯一的。

以下是命名字段的约定：

- 为列表字段选择复数名称：
     - **正确**：`friends: [User!]!`
     - **错误**：`friendList: [User!]!`
- 为非列表字段选择单数名称：
     - **正确**：`post: Post!`
     - **错误**：`posts: Post!`

## 更多 SDL 功能

在本节中，我们将介绍使用 Prisma 进行数据建模尚不支持的 SDL 功能。

### Interfaces

"与许多类型系统一样，GraphQL 支持接口。接口是一种抽象类型，包含一组必须包含的字段才能实现接口。"来自官方[GraphQL 文档](http://graphql.org/learn/schema/#interfaces)

要了解有关接口何时以及如何进入 Prisma 的更多信息，请查看此[功能请求](https://github.com/prisma/prisma/issues/83)。

### Union types

"联合类型与接口非常相似，但它们不能指定类型之间的任何公共字段。"来自官方[GraphQL 文档](http://graphql.org/learn/schema/#union-types)

要了解有关联合类型何时以及如何进入 Prisma 的更多信息，请查看此[功能请求](https://github.com/prisma/prisma/issues/165)。

## 数据库迁移概述(SQL)

如果将[Prisma service]配置为允许数据库迁移，则可以使用 SDL 定义和迁移数据库。

Prisma 使用 **临时指令**来执行一次性迁移操作。 在部署包含临时指令的服务之后，**需要从类型定义文件**中手动删除临时指令。

### 重命名

临时指令`@rename(oldName:String!)`用于重命名类型和字段。

**如果未使用`@rename`指令，Prisma 会在创建新类型和字段之前删除旧类型和字段，从而导致数据丢失!**

#### 重命名类型

**将`Post`类型重命名为`Story`**

```graphql
type Story @rename(oldName: "Post") {
  content: String
}
```

在执行`prisma deploy`并重命名后，需要手动删除`@rename(oldName:"Post")`指令。

#### 重命名字段

**将`text`字段重命名为`content`**

```graphql
type Story {
  content: String @rename(oldName: "text")
}
```

在执行`prisma deploy`并重命名后，需要手动删除`@rename(oldName:"text")`指令。

## 数据库迁移概述(NoSQL)

MongoDB 是一个*schemaless*数据库，这意味着*possible*将各种结构的数据插入其中。 MongoDB 从不因为一段插入的数据不符合某种预定义的预期格式而报错。这不同于关系数据库，其中插入的数据需要遵守预定义的[数据库模式](https://en.wikipedia.org/wiki/Database_schema)。

将 MongoDB 与 Prisma 一起使用时会发生这种情况。 Prisma 在 MongoDB 之上添加了一个“模式”(即 Prisma [datamodel])。这就是为什么*migrations*现在成为将 MongoDB 与 Prisma 一起使用时的相关主题。

使用 Prisma 执行迁移的一般过程如下：

1.调整[datamodel]文件以反映新的所需模式 1.运行[`prisma deploy`]以应用更改并执行 Prisma API(以及可能的)基础 MongoDB 数据库的迁移

在完成该过程时，Prisma 将只对基础 MongoDB 数据库进行*添加式*结构更改。

在迁移期间，**Prisma 永远不会**：

- 删除现有集合
- 重命名现有集合
- 删除现有数据库
- 删除或更改现有文档上的任何字段名称

> 请注意，这可能会导致*冗余表*，即仍存在于基础 MongoDB 数据库中但无法通过 Prisma API 访问的集合或字段。

在迁移期间，**Prisma 可能**：

- 创建新的集合
- 创建新文档
- 在现有文档上创建新字段

### 例子

#### 重命名集合

场景 1：使用`@db`指令

假设您有以下数据模型：

```graphql
type User @db(name: "users") {
  id: ID! @id
  name: String!
}
```

因为在类型上使用了`@db`指令，所以 Prisma API 中的类型名称是从底层 MongoDB 中的集合名称*解耦的*。

要重命名 Prisma API 中的类型，您需要在 Prisma 数据模型中调整类型的名称：

```graphql
type Person @db(name: "users") {
  id: ID! @id
  name: String!
}
```

要应用更改并更新 Prisma API，请运行`prisma deploy`。

场景 2：没有`@db`指令

假设您有以下数据模型：

```graphql
type User {
  id: ID! @id
  name: String!
}
```

因为没有`@db`指令，所以底层 MongoDB 中的集合也称为`User`。

要重命名 Prisma API 中的类型，您需要在 Prisma 数据模型中调整类型的名称：

```graphql
type Person {
  id: ID! @id
  name: String!
}
```

运行`prisma deploy`时，Prisma 完成了三件事：

- 从 Prisma API 中删除`User`类型的 CRUD 操作
- 在 Prisma API 中为新的`Person`类型公开 CRUD 操作
- 在底层数据库中创建一个新的`Person`集合

底层的`User`集合保持不变，它作为*冗余数据*保留在那里。

如果你仍想在保留的`User`集合中使用 Prisma API 中新的`Person`类型的数据，你需要[手动重命名集合](https://docs.mongodb.com/manual/reference/method/db.collection.renameCollection/) 可能会删除那个空的`Person`集合)。

#### 重命名集合的字段

假设您有以下数据模型：

```graphql
type User {
  id: ID! @id
  name: String!
}
```

现在要将`name`字段重命名为`lastName`。这实际上意味着三件事：

1.您想要在 Prisma API 中仅重命名**字段** 1.您想要在基础 MongoDB 中重命名**字段** 1.您想要重命名 Prisma API **和**底层 MongoDB 中的字段

场景 1：仅在 Prisma API 中重命名

如果只想在 Prisma API 中重命名该字段，可以通过更改数据模型中字段的名称并添加`@db`指令来创建从`lastName` datamodel 字段到`name的映射来实现。底层MongoDB中的`字段：

```graphql
type User {
  id: ID! @id
  lastName: String! @db(name: "name")
}
```

现在运行`prisma deploy`来应用更改。

场景 2：仅在底层 MongoDB 中重命名

因为 Prisma 从不对您的底层 MongoDB 执行任何结构更改，所以实现此目的的唯一方法是[手动重命名字段](https://docs.mongodb.com/manual/reference/operator/update/rename/)。

完成此操作后，您的 Prisma API 当然没有改变。这也意味着当你现在试图通过 Prisma API 检索`User`集合中文档的`name`时，Prisma 将抛出一个错误，因为底层的 MongoDB 中不再存在`name`。

为防止这种情况，您有两种选择：

- 从数据模型中删除`name`字段并运行`prisma deploy`。这意味着无法通过 Prisma 访问新的`lastName`。
- 同样重命名 Prisma API 中的字段，请参阅下面。

场景 3：在 Prisma API 和底层 MongoDB 中重命名

与第二种情况类似，您首先需要[在底层 MonngoDB 中手动重命名字段](https://docs.mongodb.com/manual/reference/operator/update/rename/)。

完成此操作后，您可以在 Prisma API 中重命名该字段。调整 datamodel 如下所示：

```graphql
type User {
  id: ID! @id
  lastName: String!
}
```

最后，运行`prisma deploy`。

> 请注意，Prisma CLI 可能要求您运行`prisma deploy --force`来执行此操作。这是[已在此处报告]的 CLI 中的错误(https://github.com/prisma/prisma/issues/3871)。

#### 删除集合

假设您有以下数据模型：

```graphql
type User {
  id: ID! @id
  name: String!
}
type Post {
  id: ID!
  title: String!
}
```

现在，您想要从 Prisma API 中删除`Post`类型，并在底层 MongoDB 中删除`Post`集合。

首先需要从数据模型中删除`Post`：

```graphql
type User {
  id: ID! @id
  name: String!
}
```

现在运行`prisma deploy`来应用更改。这不会改变底层 MongoDB 中的任何内容，`Post`集合仍然作为*冗余数据*存在。

要摆脱保留集合，您需要[从 MongoDB 数据库中手动删除集合](https://docs.mongodb.com/manual/reference/method/db.collection.remove/)。

下一节是 Prisma 的神奇操作，如何从数据库拿到数据。
