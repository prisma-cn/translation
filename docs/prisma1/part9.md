---
title: 模式解析
description: 本章为datamodel introspecting
keywords:
  - prisma
  - datamodel introspecting
---

## datamodel introspecting 解析概述

将 Prisma 连接到已具有数据库表/或包含某些数据的现有数据库时，从头开始手动编写数据模型同时确保它与现有数据的结构相匹配可能会非常繁琐。

要自动执行此过程，你可以使用 Prisma CLI 中的[`prisma introspect`]命令，根据现有数据的实际结构生成[datamodel] 。

生成的 SDL 可作为 Prisma service 的基础，但你可以根据需要轻松进行修改。一些常见的修改包括从 GraphQL API 隐藏表或将列赋予其他名称。

### Introspecting Postgres 数据库

Postgres 使用以下模型在内部组织数据库:

![](/prisma1/images/0YJBgbW.png)

**重要**:当 Introspecting Postgres 数据库时，你实际上是根据图示的模型 Introspecting *schema*而不是*database*!

有两种方法可以使用 CLI 来 Introspecting Postgres:

- 使用交互式`prisma init`向导
- 使用专用的`prisma introspect`命令

在这两种情况下，你都需要为正在运行的 Postgres 数据库提供*连接配置*。这包括以下内容:

- **Host**:Postgres 数据库的主机，例如`localhost`。
- **Port**:Postgres 数据库监听的端口，例如`5432`。
- **User & Password**:Postgres 数据库的用户名和密码。
- **Name of existing _database_ **:Postgres *database*的名称(根据上面所示的模型)。
- **Use SSL (Yes/No)**:如果数据库连接使用 SSL，则需要选择"是"，否则选择"否"。
- **Name of existing _schema_ **:Postgres *schema*的名称(根据上面所示的模型)，例如: `public`。

#### 使用`prisma init`向导

在交互式`prisma init`流程中，你可以选择使用数据连接到现有数据库。 CLI 将询问数据库连接详细信息(如上所述)并验证它是否可以建立成功的连接。

如果连接详细信息有效，CLI 将 introspect 数据库并显示摘要。

![](/prisma1/images/cNIeeJf.png)

当`prisma init`终止时，CLI 已为你创建了以下文件，你现在可以使用这些文件*deploy*一个新的 Prisma service:

- `datamodel.prisma`:包含基于现有数据库生成的数据模型(在 SDL 中)。
- `docker-compose.yml`:包含 Prisma service 器配置的 Docker Compose 文件，包括有关如何连接数据库的详细信息
- `prisma.yml`:服务的根配置文件

为了能够使用 GraphQL 查询 Postgres 数据库，你现在需要*deploy*服务并打开 GraphQL Playground:

```
prisma deploy
prisma playground

```

#### 使用`prisma introspect`

`prisma introspect`的工作方式与`prisma init`向导类似，因为你需要提供数据库连接信息。

`prisma init`向导生成一个完整的*service 配置*，`prisma introspect`只生成 datamodel 文件:

- `datamodel-[TIMESTAMP].graghpql`:时间戳组件允许你在不覆盖现有数据模型的情况下对现有 Prisma service 使用 introspect 命令。

在使用生成的数据模型部署服务之前，应确保 Docker Compose 文件中指定 Prisma service 器配置的`migrations`属性(PRISMA_CONFIG`环境变量)设置为"false":

```yaml
PRISMA_CONFIG: |
port: 4466
databases:
default:
connector: postgres
migrations: false # 确保这里为 false
host: localhost
port: 5432
user: postgres
password: postgres
database: postgres
schema: public
```

将`migrations`设置为`false`可确保 Prisma 仅基于数据模型更新服务器的 GraphQL API，但它不会执行基础 Postgres 数据库的合并和初始化。

#### 生成的数据模型中的关系

根据你在 SQL 数据库中对表之间的关系建模的方法，生成的数据模型中的关系可能看起来不同。 以下是 Prisma 如何解释 SQL 中指定的关系的概述:

| SQL 中的关系       | 由 Prisma(SDL)生成的关系 |
| ------------------ | ------------------------ |
| 内联关系列         | 一对多                   |
| 关系表             | 多对多                   |
| 带有额外列的关系表 | 用于表达关系的专用类型   |

#### 内联关系列

表示 SQL 数据库中关系的常用方法是通过*foreign key*约束:

```sql
CREATE TABLE product (
id serial PRIMARY KEY UNIQUE
, description text NOT NULL
);
CREATE TABLE bill (
id serial PRIMARY KEY UNIQUE
, notes text NOT NULL
, product_id int REFERENCES product (id) ON UPDATE CASCADE
);

```

在这种情况下，`bill`使用外键来引用`product`表的`id`，从而在两个表之间创建一个*relation*。 基于此表结构，Prisma 生成两个 SDL 模型，`Product`和`Bill`，具有*双向*关系(通过`product`和`bills`字段):

```graphql
type Product @pgTable(name: "product") {
  description: String!
  id: Int! @unique
  bills: [Bill!]!
}
type Bill @pgTable(name: "bill") {
  notes: String!
  id: Int! @unique
  product: Product @pgRelation(column: "product_id")
}
```

以下是 Prisma 如何为生成的字段生成名称:

- `type Product`
     - `description:String`以`product`表中的`description`列命名
     - `id:Int!`以`product`表的`id`列命名
     - `bills:[Bill!]!`以`bill`表的*复数*版本命名
- `type Bill`
     - `notes:String`以`bill`表上的`notes`列命名
     - `id:Int!`以`bill`表上的`id`列命名
     - `product:Product`以`bill`表上的`product_id`列命名; Prisma 剥离了这些外键字段的后缀:`_ id`，`ID`和`Id`

#### 关系表

另一种在 SQL 数据库中表示关系的常用方法是通过专用的*relation table*来"连接"两个相关的表:

```sql
CREATE TABLE product (
id serial PRIMARY KEY UNIQUE
, product text NOT NULL
);
CREATE TABLE bill (
id serial PRIMARY KEY UNIQUE
, bill text NOT NULL
);
CREATE TABLE bill_product (
bill_id int REFERENCES bill (id) ON UPDATE CASCADE ON DELETE CASCADE
, product_id int REFERENCES product (id) ON UPDATE CASCADE
);

```

在这种情况下，关系表称为`bill_product`，简单地......只包含两列，它们都是`bill`和`product`表的`id`列的外键。

#### 与额外列的关系

有时，使用关于关系本身的元信息来丰富关系表是有帮助的:

```sql
CREATE TABLE product (
id serial PRIMARY KEY UNIQUE
, product text NOT NULL
);
CREATE TABLE bill (
id serial PRIMARY KEY UNIQUE
, bill text NOT NULL
);
CREATE TABLE bill_product (
bill_id int REFERENCES bill (id) ON UPDATE CASCADE ON DELETE CASCADE
, product_id int REFERENCES product (id) ON UPDATE CASCADE
, some_other_column text NOT NULL
);

```

如果关系表包含此类额外信息，则 Prisma 会将关系表视为*dedicated type*:

```graphql
type Bill @pgTable(name: "bill") {
  bill: String!
  id: Int! @unique
  bill_products: [Bill_product]
}

type Bill_product @pgTable(name: "bill_product") {
  bill: Bill @pgRelation(column: "bill_id")
  product: Product @pgRelation(column: "product_id")
  some_other_column: String!
}

type Product @pgTable(name: "product") {
  id: Int! @unique
  product: String!
  bill_products: [Bill_product]
}
```

这样，你可以充分灵活地使用常规查询和嵌套 Mutation 来设置和读取额外的列。

### Introspecting Mongo 数据库

MonogDB 使用以下模型在内部组织数据：

![](/prisma1/images/OHZBaw6.png)

有两种方法可以使用 CLI 来解析 MongoDB 数据库：

- 使用交互式`prisma init`向导
- 使用专用的`prisma introspect`命令

在这两种情况下，您都需要为正在运行的 MongoDB 实例提供*connection details*。 这包括以下内容：

- 可以连接到 MongoDB 服务器的 MongoDB[连接字符串](https://docs.mongodb.com/manual/reference/connection-string/)。
- 要连接的 MongoDB[数据库](https://docs.mongodb.com/manual/core/databases-and-collections/#databases)的名称。

#### 使用`prisma init`向导

在交互式`prisma init`流程中，您可以选择使用数据连接到现有数据库。 CLI 将询问数据库连接详细信息(如上所述)并验证它是否可以建立成功连接。

如果连接详细信息有效，CLI 将自省数据库并显示摘要。

![](/prisma1/images/cNIeeJf.png)

当`prisma init`终止时，CLI 为您创建了以下文件，您现在可以使用这些文件*deploy*一个新的 Prisma 服务：

- `datamodel.prisma`：包含基于现有数据库生成的数据模型(在 SDL 中)。
- `docker-compose.yml`：包含 Prisma 服务器配置的 Docker Compose 文件，包括有关如何连接数据库的详细信息
- prisma.yml：服务的根配置文件

为了能够使用 Prisma 查询 MongoDB 数据库，您现在需要*deploy*服务并打开 GraphQL Playground：

```

prisma deploy
prisma playground

```

#### 使用`prisma introspect`

`prisma introspect`的工作方式与`prisma init`向导类似，因为您需要提供数据库连接信息。

`prisma init`向导生成一个完整的*service*配置，`prisma introspect`只生成 datamodel 文件：

- `datamodel-[TIMESTAMP] .prisma`：时间戳组件允许您在不覆盖现有数据模型的情况下对现有 Prisma 服务使用 introspect 命令。
