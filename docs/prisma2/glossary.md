---
title: 术语
description: 文档中涉及的相关术语。
author: fred8617
author_url: https://lsz8617.com
author_image_url: https://www.lsz8617.com/static/img/about-me/about-me1.jpg
author_title: 代码小白
---

## 目录

- [数据源-Data source]()
- [数据源客户端-Data source client]()
- [数据源连接器-Data source connector](#data-source-connector)
- [Prisma Schema 语言-Prisma Schema Language (PSL)](#prisma-schema-language-psl)
- [生成器-Generator](#generator)
- [迁移-Migration](#migration)
- [迁移引擎-Migration engine](#migration-engine)
- [模型-Model](#model)
- [数据模型定义-Data model definition](#data-model-definition)
- [嵌套写入-Nested write](#nested-write)
- [Prisma 客户端-Prisma Client](#prisma-client)
- [Prisma schema 文件-Prisma schema file](#prisma-schema-file)
- [标量类型-Scalar type](#scalar-type)
- [选择集合-Selection set](#selection-set)
- [类型修饰符-Type modifier](#type-modifier)
- [查询引擎-Query engine](#query-engine)

## 术语

### 数据源-Data source

数据源可以是 Prisma 通过[连接器](#data-source-connector)访问到的任何东西，比如:数据库，Graphql API，REST API 或者一个第三方服务。

### 数据源客户端-Data source client

数据源客户端为数据源提供类型安全的数据访问 API。根据数据源的不同，这个 API 可以是只读的，也可以是只写的，或两者都允许。值得注意的是，常见的数据源连接器都支持这两种方式。

### 数据源连接器-Data source connector

有时也被称为:

- 连接器-Connector

数据源连接器将 Prisma 与[数据源](#data-source)相连

Prisma 目前内置以下几种连接器：

- [`sqlite`](./core/connectors/sqlite.md): SQLite 数据库连接器
- [`postgresql`](./core/connectors/postgresql.md): PostgreSQL 数据库连接器
- [`mysql`](./core/connectors/mysql.md): MySQL 数据库连接器

### Prisma Schema 语言-Prisma Schema Language (PSL)

PSL 是书写[schema 文件](#prisma-schema-file)的语法的名字。

> [更多 PSL 相关](https://github.com/prisma/specs/tree/master/prisma-schema-language).

### 生成器-Generator

生成器决定了从[数据模型](#data-model-definition)能生成什么样的代码。举个例子, 你可以指定 _Prisma Client JS generator_ 生成 Prisma JS 客户端去作为一个基于数据模型的类型安全客户端。

你的 [schema 文件](#prisma-schema-file)可以包含多种生成器。 当你执行 `prisma2 generate`, Prisma CLI 从你的 Prisma schema 读取指定的多种/一种生成器去生成客户端。

### 迁移-Migration

有时也被成为:

- 数据库迁移-Database migration
- Schema 迁移-Schema migration

迁移是指从一个数据模型状态到另一个数据模型状态的转换。

### 迁移引擎-Migration engine

迁移引擎会生成即将被迁移到的数据库的所需操作。

### 模型-Model

[模型](./data-modeling.md#models) 代表 _应它们直接映射到底层数据源中的结构_，比如关系型数据库中的*表*，文档型数据库中的*集合* 。 [生成的 Prisma Client JS API](./prisma-client-js/api.md) 会为你[数据模型](#data-model-definition)中的每个模型暴露 CRUD 操作。

### 数据模型定义-Data model definition

有时又叫:

- Data model (或 datamodel)
- Prisma schema
- Application schema
- Model schema

包含你所有模型的定义。[数据模型定义](./data-modeling.md#data-model-definition) 也是[schema 文件](#prisma-schema-file)的一部分。

### 嵌套写入-Nested write

Prisma Client JS 允许你执行嵌套创建, 嵌套更新和相关模型的嵌套连接。[嵌套写法](./relations.md#nested-writes) 都是带有原子性事务的。 [了解更多相关 Prisma Client JS API](./prisma-client-js/api.md).

### Prisma 客户端-Prisma Client

> **注意**: Prisma 客户端之前被叫做 Photon。为了简化 Prisma 2 的包，我们把它重命名为 Prisma Client。

一个自动生成的类型安全的数据库客户端。 Prisma 客户端是根据你指定的[schema 文件](#prisma-schema-file) 用[生成器](#generator)生成的。 [生成的 Prisma Client JS API](./prisma-client-js/api.md)会以编程的方式去访问你的数据库并暴露出强大的 CRUD 操作。

Prisma 目前支持以下几种语言的 Prisma 客户端:

- JavaScript (Node.js)
- TypeScript

Go 语言生成器即将到来！

### Prisma schema 文件-Prisma schema file

也被称为:

- Schema file
- Project file
- Prisma file
- Prisma schema

[Prisma schema 文件](./prisma-schema-file.md) 指定了 Prisma 设置的主要部分:

- [**数据源**](#data-source): 指定 Prisma 需要连接的数据源的细节(比如要连接 PostgreSQL 数据库)
- [**数据模型定义**](#data-model-definition): 指定每个数据源的数据结构
- [**生成器**](#generator): 指定应该生成什么种类的客户端 (比如 Prisma Client JS)

### 标量类型-Scalar type

有时也称为:

- 标量-Scalar

### 选择集合-Selection set

有时也称为:

- Payload

决定了 Prisma Client JS API 被调用时返回模型中的哪些字段。 默认的[选择集合](./prisma-client-js/api.md#selection-sets)中包含如下类型：

- 无延迟的[标量字段](./data-modeling.md#scalar-types)-non-lazy scalar fields
- 枚举类型-enums
- 内置字段-[embed](./data-modeling.md#embeds) fields

Prisma Client JS API 被调用时，选择集合可以通过 [`select`](./prisma-client-js/api.md#select-exclusively-via-select) 或 [`include`](./prisma-client-js/api.md#include-additionally-via-include)选择性的操作。

### 类型修饰符-Type modifier

[类型修饰符](./data-modeling.md#type-modifiers) 让你在模型上转换字段类型。有两个类型修饰符:'[]'用于数组，'?'字段可为空。

### 查询引擎-Query engine

查询引擎根据来自 Prisma Client JS 的请求生成和优化数据库查询。
