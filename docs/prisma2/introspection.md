---
title: 内省Introspection
description: 内省Introspection数据库的使用方法
author: Victor
author_url: https://kangwenchang.com
author_image_url: https://kangwenchang.com/static/favicon/logocorner.png
author_title: Prisma 爱好者
---

当已经有一个现成的数据库时，使用 Prisma 2 的第一步是获取与你的数据库 schema(或数据库 schema 的 subset)匹配的[Pri​​sma schema](./prisma-schema-file.md)。你可以手动创建此 schema 文件并手写出所有必需的[models](./data-modeling.md#models)，也可以使用 Prisma 的*introspection 内省*功能自动生成 Prisma schema。

Prisma 可以对数据库进行内省 introspection 从当前数据库 schema 中导出数据模型定义。通过以下两个 CLI 命令之一进行 introspection：

- `prisma2 init`：在当前目录中设置一个`prisma/schema.prisma`文件。参见[getting-started](./getting-started/quickstart-existing-project.md)
- `prisma2 introspect`：假设 Prisma 已经连接到你的数据库，并为你(重新)introspection 了它。通常用于只使用“Prisma Client`的项目，这种项目不通过 Prisma 的`migrate`命令执行迁移，因此在每次数据库 schema 更改后，都需要手动更新数据模型。 **请注意，此命令将覆盖你当前的`schema.prisma`文件。在数据库里未定义的所有注释或[attributes](./data-modeling.md#attributes)都将被删除。\*\*

需要注意的是`prisma2 introspect`需要内省的数据库的连接字符串。因此，你需要在包含有效`datasource`定义(包含连接字符串)的[Prisma schema](./prisma-schema-file.md)目录中运行命令。

## 仅内省数据库 schema 的一个子集

[Prisma 尚不支持](https://github.com/prisma/prisma2/issues/807)。但是，你可以通过创建一个新的数据库用户来实现此目的，该用户仅有权访问你希望在 Prisma schema 中表示的表，然后使用该用户进行自省。然后，内省将仅包括新用户有权访问的表。

## 约定

由于可能每个项目的数据库 schema 都非常不同，因此 Prisma 采用了许多约定将数据库 schema 转换为数据模型定义：

- 字段，模型和枚举名称(标识符)必须以字母开头，并且通常只能包含下划线，字母和数字。
- 如果无效字符出现在标识符中字母的前面，则会被丢弃。如果它们出现在首字母之后，则由下划线代替。另外，使用`@map`或`@@map`将转换后的名称映射到数据库，以保留原始名称。
- 如果导致标识符重复，则不会立即进行错误处理。你稍后会收到错误，可以手动修复。
- 模型 A 和 B 之间的关系的关系名称生成为`AToB`(按字母顺序排在最前面的模型在生成的关系名称中也首先出现)。如果由于模型`A`和`B`之间存在多个关系而导致关系名称不明确，则将带有外键的列的字段名称附加在模型名称后，以消除歧义，例如： `A_FieldWithFKToB`
- 反向关系字段的名称基于相反的模型。它可以通过缺省和多元方式获取驼峰式名称(除非带有外键的列也具有唯一约束)。如果反向关系字段不明确，则将关系名称添加到歧义错误。

## 局限性

- 每个列都需要在单个列上具有主键约束([尚不支持多列主键](https://github.com/prisma/prisma-client-js/issues/339))。如果不是这种情况，自省将失败。请注意，这通常使得无法对使用关系表(有时也称为`中间表`)的 schema 进行内部检查，因为这些关系表通常没有单列主键。
- 通过自省已支持`TIMESTAMP WITH TIMEZONE`类型(并映射到 Prisma 的`DateTime`类型)，但[当前无法通过 Prisma Client 查询](https://github.com/prisma/prisma2/issues/1386)。

## 常见的解决方法

### 没有唯一标识符的表

Prisma 只能将具有*unique identifier*的表从数据库映射到 Prisma model。可以是以下两种情况之一：

- 该表包含具有 UNIQUE 约束的列
- 该表包含具有`PRIMARY KEY`约束的列

如果存在不符合此要求的表，则会将它们作为注释添加到 Prisma schema 中。

看以下 SQL 表：

```sql
CREATE TABLE countries (
  name VARCHAR(255),
  population INT
);
```

该表既没有带有 UNIQUE 的列，也没有带有 PRIMARY KEY 约束的列。因此，它将出现在通过自省生成的 Prisma schema 中，如下所示：

```prisma
// model countries {
//   name       String
//   population Int
// }
```

为了解决这个问题，你可以在表中添加`PRIMARY KEY`或`UNIQUE`约束。

#### 添加`PRIMARY KEY`约束

解决该问题的一种直接方法是在表中添加一个 serial/auto-incrementing 的主键列。

```sql
-- PostgreSQL
ALTER TABLE "public"."countries"
  ADD COLUMN "id" serial,
  ADD PRIMARY KEY ("id");

-- MySQL
ALTER TABLE countries
  ADD COLUMN id bigint PRIMARY KEY NOT NULL SERIAL DEFAULT VALUE;
```

请注意，使用 SQLite，你不能将主键列添加到现有表中，而必须删除并使用所需的约束重新创建它。

#### 添加一个 UNIQUE 约束

这个例子展示了如何添加一个 UNIQUE 约束(假设该列实际上只包含唯一值)：

```sql
-- PostgreSQL
ALTER TABLE "public"."countries" ADD UNIQUE ("population");

-- MySQL
ALTER TABLE countries ADD UNIQUE (population);
```

请注意，使用 SQLite 时[你不能直接更改列](https://stackoverflow.com/questions/4007014/alter-column-in-sqlite)，必须删除并重新创建具有所需约束的列。

## PostgreSQL 类型和 Prisma 的映射

| PostgreSQL type | Prisma type | Note                                       |
| :-------------- | :---------- | :----------------------------------------- |
| `int2`          | `Int`       |                                            |
| `int4`          | `Int`       |                                            |
| `int8`          | `Int`       |                                            |
| `float4`        | `Float`     |                                            |
| `float8`        | `Float`     |                                            |
| `bool`          | `Boolean`   |                                            |
| `text`          | `String`    |                                            |
| `varchar`       | `String`    |                                            |
| `date`          | `DateTime`  |                                            |
| `DateTime`      | `String`    |                                            |
| `json`          | `String`    | 一旦被支持，将被映射到`Json`               |
| `Stringb`       | `String`    | 一旦被支持，将被映射到 `Json`              |
| `uuid`          | `String`    | 一旦被支持，将被映射到 `Uuid`              |
| `bit`           | `String`    | 一旦被支持，将被映射到 `Binary`            |
| `varbit`        | `String`    | 一旦被支持，将被映射到 `Binary`            |
| `box`           | `String`    | 一旦被支持，将被映射到 `Geometric`         |
| `circle`        | `String`    | 一旦被支持，将被映射到 `Geometric`         |
| `line`          | `String`    | 一旦被支持，将被映射到 `Geometric`         |
| `lseg`          | `String`    | 一旦被支持，将被映射到 `Geometric`         |
| `path`          | `String`    | 一旦被支持，将被映射到 `Geometric`         |
| `polygon`       | `String`    | 一旦被支持，将被映射到 `Geometric`         |
| `bpchar`        | `String`    |                                            |
| `interval`      | `DateTime`  |                                            |
| `numeric`       | `Float`     |                                            |
| `pg_lsn`        | `String`    | 一旦被支持，将被映射到 `LogSequenceNumber` |
| `time`          | `DateTime`  |                                            |
| `timetz`        | `DateTime`  |                                            |
| `timestamp`     | `DateTime`  |                                            |
| `timestamptz`   | `DateTime`  |                                            |
| `tsquery`       | `String`    | 一旦被支持，将被映射到 `TextSearch`        |
| `tsvector`      | `String`    | 一旦被支持，将被映射到 `TextSearch`        |
| `txid_snapshot` | `String`    | 一旦被支持，将被映射到 `TransactionId`     |
| `_bytea`        | `String`    | 一旦被支持，将被映射到 `Binary`            |
| `_bool`         | `Boolean`   |                                            |
| `_date`         | `DateTime`  |                                            |
| `_float8`       | `Float`     |                                            |
| `_float4`       | `Float`     |                                            |
| `_int4`         | `Int`       |                                            |
| `_text`         | `String`    |                                            |
| `_varchar`      | `String`    |                                            |

您可以在此处找到所有 PostgreSQL 类型的概述。[文档](https://www.mysqltutorial.org/mysql-data-types.aspx).

## MySQL 类型和 Prisma 的映射

| MySQL type           | Prisma type | Note                               |
| :------------------- | :---------- | :--------------------------------- |
| `int`                | `Int`       |                                    |
| `smallint`           | `Int`       |                                    |
| `tinyint(1)`         | `Boolean`   |                                    |
| `tinyint`            | `Int`       |                                    |
| `mediumint`          | `Int`       |                                    |
| `bigint`             | `Int`       |                                    |
| `decimal`            | `Float`     |                                    |
| `double`             | `Float`     |                                    |
| `date`               | `DateTime`  |                                    |
| `time`               | `DateTime`  |                                    |
| `datetime`           | `DateTime`  |                                    |
| `timestamp`          | `DateTime`  |                                    |
| `year`               | `DateTime`  |                                    |
| `char`               | `String`    |                                    |
| `varchar`            | `String`    |                                    |
| `text`               | `String`    |                                    |
| `tinytext`           | `String`    |                                    |
| `mediumtext`         | `String`    |                                    |
| `longtext`           | `String`    |                                    |
| `enum`               | `String`    |                                    |
| `set`                | `String`    |                                    |
| `binary`             | `String`    | 一旦被支持，将被映射到 `Binary`    |
| `varbinary`          | `String`    | 一旦被支持，将被映射到 `Binary`    |
| `blob`               | `String`    | 一旦被支持，将被映射到 `Binary`    |
| `tinyblob`           | `String`    | 一旦被支持，将被映射到 `Binary`    |
| `mediumblob`         | `String`    | 一旦被支持，将被映射到 `Binary`    |
| `longblob`           | `String`    | 一旦被支持，将被映射到 `Binary`    |
| `geometry`           | `String`    | 一旦被支持，将被映射到 `Geometric` |
| `point`              | `String`    | 一旦被支持，将被映射到 `Geometric` |
| `linestring`         | `String`    | 一旦被支持，将被映射到 `Geometric` |
| `polygon`            | `String`    | 一旦被支持，将被映射到 `Geometric` |
| `multipoint`         | `String`    | 一旦被支持，将被映射到 `Geometric` |
| `multilinestring`    | `String`    | 一旦被支持，将被映射到 `Geometric` |
| `multipolygon`       | `String`    | 一旦被支持，将被映射到 `Geometric` |
| `geometrycollection` | `String`    | 一旦被支持，将被映射到 `Geometric` |
| `json`               | `String`    | 一旦被支持，将被映射到 `Json`      |

您可以在此处找到所有 MySQL 类型的概述。[文档](https://www.mysqltutorial.org/mysql-data-types.aspx).

## SQLite 类型和 Prisma 的映射

| SQLite type  | Prisma type | Note                            |
| :----------- | :---------- | :------------------------------ |
| `integer`    | `Int`       |                                 |
| `real`       | `Float`     |                                 |
| `float`      | `Float`     |                                 |
| `serial`     | `Int`       |                                 |
| `boolean`    | `Boolean`   |                                 |
| `text`       | `String`    |                                 |
| `date`       | `DateTime`  |                                 |
| `datetime`   | `DateTime`  |                                 |
| `binary`     | `String`    | 一旦被支持，将被映射到 `Binary` |
| `double`     | `Float`     |                                 |
| `binary[]`   | `String`    | 一旦被支持，将被映射到 `Binary` |
| `boolean[]`  | `Boolean`   |                                 |
| `date[]`     | `DateTime`  |                                 |
| `datetime[]` | `DateTime`  |                                 |
| `float[]`    | `Float`     |                                 |
| `double[]`   | `Float`     |                                 |
| `integer[]`  | `Int`       |                                 |
| `text[]`     | `String`    |                                 |
| `timestamp`  | `DateTime`  |                                 |

您可以在此处找到所有 SQLite 类型的概述。[文档](https://www.sqlite.org/datatype3.html#datatypes_in_sqlite).
