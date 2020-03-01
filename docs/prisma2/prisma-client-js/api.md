---
title: 生成Prisma客户端API(JavaScript/TypeScript)
description: 
author: Nan Zhao
author_url: https://github.com/znnan
author_image_url: https://avatars0.githubusercontent.com/u/34448143?s=400&u=949ac05ac4184e0f0e1d842aac4575da66d937cc&v=4
author_title: Full Stacker
---
<!-- # Generated Prisma Client API (JavaScript/TypeScript) -->

# 生成Prisma客户端API(JavaScript/TypeScript)

<!-- Prisma Client JS is a type-safe database client auto-generated based on your [data model definition](../data-modeling.md#data-model-definition) (which is a declarative representation of your database schema). This page explains the generated API operations you have available when using Prisma Client JS. -->

Prisma Client JS是基于 [数据模型定义](../data-modeling.md＃data-model-definition) (它是数据库架构的声明性表示)自动生成的类型安全的数据库客户端。 本页说明使用Prisma Client JS时可用的生成的API操作。

<!-- - [Overview](#overview)
- [CRUD](#crud)
- [Aggregations](#aggregations)
- [Field selection](#field-selection)
- [Relations](#relations)
- [Raw databases access](#raw-database-access)
- [Scalar lists](#scalar-lists)
- [Bring your own ID](#bring-your-own-id)
- [API Reference](#api-reference)
- [Filtering](#filtering)
- [Logging and debugging](#logging-and-debugging)
- [Reusing query sub-parts](#reusing-query-sub-parts)
- [Managing connections](#managing-connections)
- [Error formatting](#error-formatting) -->

- [概述](＃overview)
- [CRUD](＃crud)
- [聚合](＃aggregations)
- [字段选择](＃field-selection)
- [关系](＃relations)
- [原始数据库访问](＃raw-database-access)
- [标量列表](＃scalar-lists)
- [带上自己的ID](＃bring-your-own-id)
- [API参考](＃api-reference)
- [过滤](＃filtering)
- [记录和调试](＃logging-and-debugging)
- [重用查询子部分](＃reusing-query-sub-parts)
- [管理连接](＃managing-connections)
- [错误格式](＃error-formatting)

<!-- ## Overview -->
## 概述

<!-- Using Prisma Client JS typically follows this high-level workflow: -->

使用Prisma Client JS通常遵循以下高级工作流程

<!-- 1. Add Prisma Client JS to your project using: `npm install @prisma/client`
2. Define/update your data model definition (e.g. by manually adding a new model or by (re)introspecting your database)
3. Generate your Prisma Client JS based on the changes in the data model definition -->

1. 使用以下命令将Prisma Client JS添加到您的项目中：`npm install @prisma/client`
2. 定义/更新数据模型定义(例如，通过手动添加新模型或(重新)自检数据库)
3. 根据数据模型定义中的更改生成您的Prisma Client JS

<!-- Note that steps 2. and 3. might happen repeatedly as you evolve your application. -->

请注意，步骤2和3.在开发应用程序时可能会重复发生。

<!-- The `PrismaClient` constructor can then be imported from `node_modules/@prisma/client`. -->

然后可以从node_modules / @ prisma / client导入 `PrismaClient` 构造函数。

<!-- Assume you have the following data model definition: -->

假设您具有以下数据模型定义：

```prisma
model User {
  id    Int    @id @default(autoincrement())
  name  String
  role  Role
  posts Post[]
}

model Post {
  id     Int    @id @default(autoincrement())
  title  String
  author User
}

enum Role {
  USER
  ADMIN
}
```

<!-- ## CRUD -->

## CRUD

<!-- Your generated Prisma Client JS API will expose the following CRUD operations for the `User` and `Post` models: -->

生成的Prisma Client JS API将为User和Post模型公开以下CRUD操作：

- [`findOne`](#findOne)
- [`findMany`](#findMany)
- [`create`](#create)
- [`update`](#update)
- [`updateMany`](#updateMany)
- [`upsert`](#upsert)
- [`delete`](#delete)
- [`deleteMany`](#deleteMany)

<!-- You can access each function via the respective model property on your generated `PrismaClient` instance, e.g. `user` for the `User` model: -->

您可以通过生成的 `PrismaClient` 实例上的相应模型属性访问每个函数，例如 用户模型的用户：

```ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.connect()
  const result = await prisma.user.findOne({
    where: { id: 1 },
  })
  // result = { id: 1, name: "Alice", role: "USER" }
  await prisma.disconnect()
}
```

<!-- ## Aggregations -->

## 聚合

<!-- In addition to CRUD operations, Prisma Client JS also allows for [_aggregation_ queries](https://github.com/prisma/prisma-client-js/issues/5).  -->

除CRUD操作外，Prisma Client JS还允许[_聚合_查询](https://github.com/prisma/prisma-client-js/issues/5)。

<!-- ### `count` -->

### `count`

<!-- To return the number of elements in a list, you can the `count()` method on any model property on your `PrismaClient` instance, for example: -->

要返回列表中的元素数量，可以在 `PrismaClient` 实例的任何模型属性上使用 `count()` 方法，例如：

```ts
const userCount = await prisma.user.count()
// userCount = 42
```

<!-- ## Field selection -->

## 字段选择

<!-- This section explains how to predict and control which fields of a model are returned in a Prisma Client JS API call. -->

本节说明如何预测和控制Prisma Client JS API调用中返回模型的哪些字段。

<!-- ### Selection sets -->

### 选择集

<!-- To understand which fields are being returned by a certain API call, you need to be aware of its **selection set**. -->

要了解某个API调用返回的字段，您需要了解其 **选择集**。

<!-- The selection set defines the **set of fields on a model instance that is returned in a Prisma Client JS API call**. -->

选择集定义 **在Prisma Client JS API调用中返回的模型实例上的字段集**。

<!-- For example, in the `findOne` API call from above, the selection set includes the `id`, `name` and `role` fields of the model `User`. In that example, the selection set has not been manipulated and the API call therefore returns the _default selection set_ (read below). -->

例如，在上面的 `findOne` API调用中，选择集包括模型 `User` 的 `id`，`name` 和 `role` 字段。 在该示例中，选择集尚未被操纵，因此API调用返回_默认选择集_（请参见下文）。

<!-- ### The default selection set -->

### 默认选择集

<!-- If the selection set is not manipulated (via `select` or `include`), a Prisma Client JS API call returns the **default selection set** for a model. It includes all [_scalar_](./data-modeling.md#scalar-types) fields (including [enums](./data-modeling.md#enums)) fields of the model. -->

如果未对选择集进行操作（通过 `select` 或 `include`），则Prisma Client JS API调用将返回模型的“默认选择集”。 它包括模型的所有[_scalar_]（./ data-modeling.md＃scalar-types）字段（包括模型的[enums]（./ data-modeling.md＃enums））字段。

<!-- Considering the sample datamodel from above: -->

对于上面的示例模型

<!-- - The default selection set for the `User` model includes `id`, `name`, `role`. It does **not** include `posts` because that's a _relation_ and not a scalar field. -->
- 为 `User` 模型设置的默认选择包括 `id`, `name`, `role`。 它不包括 `posts`，因为这是一个_关系_而不是一个标量字段。
<!-- - The default selection set for the `Post` model includes `id`, `title`. It does **not** include `author` because that's a _relation_ and not a scalar field. -->
- `Post` 模型的默认选择集包括 `id`，`title`。 它不包括 `author`，因为这是一个_关系_而不是标量字段。

<!-- ### Manipulating the selection set -->

### 操作选择集

<!-- There are two ways how the _default selection set_ can be manipulated to specify which fields should be returned by a Prisma Client JS API call: -->

可以通过两种方式操纵_默认选择集_来指定Prisma Client JS API调用应返回哪些字段：

<!-- - **Select exclusively** (via `select`): When using `select`, the selection set only contains the fields that are explicitly provided as arguments to `select`. -->
- **仅选择** (通过`select`)：使用 `select` 时，选择集仅包含作为 `select` 的参数显式提供的字段。
<!-- - **Include additionally** (via `include`): When using `include`, the default selection set gets extended with additional fields that are provided as arguments to `include`. -->
- **包括其他** (通过`include`)：使用 `include` 时，默认选择集会扩展为包含为 `include` 参数的其他字段。

<!-- Note that you can not combine `select` and `include` in the following ways: -->

请注意，您不能通过以下方式组合 `select` 和 `include`：

<!-- - Within a `select` statement, you can't use `include`. -->
- 在 `select` 语句中，不能使用 `include`。
<!-- - Within an `include` statement, you can't use `select`. -->
- 在 `include` 语句中，不能使用 `select`。

<!-- #### Select exclusively via `select` -->

#### 仅通过 `select` 选择

<!-- In this example, we're using `select` to exclusively select the `name` field of the returned `User` object: -->

在这个例子中，我们使用 `select` 来专门选择返回的 `User` 对象的 `name` 字段：

```ts
const result = await prisma.user.findOne({
  where: { id: 1 },
  select: { name: true },
})
// result = { name: "Alice" }
```

<!-- #### Include additionally via `include` -->

#### 通过 `include` 另外包含

<!-- Sometimes you want to directly include a relation when retrieving data from a database. To eagerly load and include the relations of a model in an API call right away, you can use `include`: -->

有时，当您从数据库中检索数据时，您想直接包含一个关系。要立即将模型的关系加载并包含在API调用中，可以使用 `include` :

```ts
const result = await prisma.user.findOne({
  where: { id: 1 },
  include: { posts: true },
})
// result = {
//   id: 1,
//   name: "Alice",
//   role: "USER",
//   posts: [
//     { id: 1, title: "Hello World"},
//   ]
// }
```

<!-- ## Relations -->

## 关系

<!-- Learn more about relations in the generated Prisma Client JS API [here](../relations.md#relations-in-the-generated-prisma-client-js-api). -->

在生成的Prisma Client JS API [此处](../ relations.md＃relations-in-the-generation-prisma-client-js-api) 中了解有关关系的更多信息。

<!-- ## Bring your own ID -->

## 带上自己的ID

<!-- With Prisma Client JS, you can set your own values for fields that are annotated with the `@id` attribute. This attribute express that the respective field is considered a _primary key_. Consider the following model: -->

使用Prisma Client JS，您可以为带有 `@id` 属性注释的字段设置自己的值。该属性表示相应的字段被视为 `_primary key_` 。考虑以下模型：

```prisma
model User {
  id    Int    @id
  name  String
}
```

<!-- You can provide the `id` as input value in [`create`](#create) and [`update`](#update) operations, for example: -->

您可以在[`create`](＃create)和[`update`](＃update)操作中提供 `id` 作为输入值，例如：

```ts
const user = await prisma.user.create({
  data: {
    id: 1
  }
})
```

<!-- Note that Prisma Client JS will throw an error if you're trying to create/update a record with an `id` value that already belongs to another record since the `@id` attribute always implies _uniqueness_. -->

请注意，如果您尝试创建/更新具有已经属于另一条记录的 `id` 值的记录，Prisma Client JS将抛出错误，因为 `@id` 属性始终表示_uniqueness_。

<!-- ## Raw database access -->

## 原始数据库访问

<!-- You can send raw SQL queries to your database using the `raw` function that's exposed by your `PrismaClient` instance. It returns the query results as plain old JavaScript objects: -->

您可以使用 `PrismaClient` 实例公开的 `raw` 函数将原始SQL查询发送到数据库。它将查询结果作为简单JavaScript对象（plain old JavaScript object)返回：

```ts
const result = await prisma.raw('SELECT * FROM User;')
// result = [
//   { "id":1, "email":"sarah@prisma.io", "name":"Sarah" },
//   { "id":2, "email":"alice@prisma.io", "name":"Alice" }
// ]
```

<!-- ### Tagged templates -->

### 标记模板

<!-- Note that `raw` is implemented as a [tagged template](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_templates). Therefore, you can also call `raw` as follows: -->

请注意，`raw` 被实现为[tagged模板](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_templates)。 因此，您也可以按以下方式调用 `raw` ：

```ts
const result = await prisma.raw`SELECT * FROM User;`
```

<!-- ### Setting variables -->

### 设置变量

<!-- To include variables in your SQL query, you can use JavaScript string interpolation with [template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals): -->

要将变量包含在SQL查询中，可以将JavaScript字符串插值与[模板文字](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)结合使用：

```ts
const userId = 42
const result = await prisma.raw`SELECT * FROM User WHERE id = ${userId};`
```

<!-- ### Typing `raw` results -->

### 输入 `raw` 结果

<!-- The `raw` function has the following function signature: -->

`raw` 函数具有以下函数签名：

```ts
raw<T = any>(query: string | TemplateStringsArray): Promise<T>;
```

<!-- The return type of `raw` is a `Promise` for the [generic](https://www.typescriptlang.org/docs/handbook/generics.html) type parameter `T`. This means you can type the result manually by providing `T` when you invoke `raw`. If you don't provide any type, the return type of `raw` defaults to `any`. -->

`raw` 的返回类型是[generic](https://www.typescriptlang.org/docs/handbook/generics.html) 类型参数 `T` 的Promise。 这意味着您可以在调用 `raw` 时通过提供 `T` 来手动键入结果。 如果您不提供任何类型，则 `raw` 的返回类型默认为 `any` 。

```ts
// import the generated `User` type from the `@prisma/client` module
import { User } from '@prisma/client'

const result = await prisma.raw<User[]>('SELECT * FROM User;')
// result is of type: `User[]`
```

<!-- Now, `result` is statically typed to the generated `User` type (or rather an array thereof) from Prisma Client. -->

现在，将结果从Prisma Client中静态键入为生成的 `用户` 类型（或更确切地说是其数组）。

![](https://imgur.com/H2TCRc5.png)

<!-- If you're selecting only specific fields of the model or want to include relations, read the documentation about [leveraging Prisma Client's generated types](./generated-types.md) if you want to ensure that the query results are properly typed. -->

如果您仅选择模型的特定字段或要包含关系，则要确保正确键入查询结果，请阅读有关[利用Prisma Client的生成类型](./ generated-types.md)的文档。

<!-- Note that calls to `SELECT` always return arrays of type `T`, but other SQL operations (like `INSERT` or `UPDATE`) might return single objects. -->

注意，对 `SELECT` 的调用总是返回类型 `T` 的数组，但是其他SQL操作（如 `INSERT` 或 `UPDATE` ）可能返回单个对象。

<!-- ## Scalar lists -->

## 标量列表

<!-- Prisma Client JS provides a dedicated API for (re)setting _scalar lists_ using a `set` field inside the `data` argument when creating or updating a [Prisma model](../data-modeling.md#models), for example: -->

例如，Prisma Client JS提供了专用的API，用于在创建或更新[Prisma模型](../ data-modeling.md＃models) 时使用data变量内的set字段来（重新）重置 _标量列表_。 ：

```prisma
model User {
  id        Int       @id
  coinFlips Boolean[]
}
```

<!-- When creating or updating a `User` record, you can create a new list or replace the current one with a new list like so: -->

在创建或更新 `User` 记录时，您可以创建一个新列表或将当前列表替换为新列表，如下所示：

```ts
await  prisma.user.create({
  data: {
    coinFlips: {
      set: [true, false]
    }
  }
})

await  prisma.user.update({
  where: { id: 42 ,}
  data: {
    coinFlips: {
      set: [true, false]
    }
  }
})
```

<!-- ## API reference -->

## API参考

<!-- For simplicity, we're assuming the `User` model from above as foundation for the generated code. -->

为了简单起见，我们假设上面的 `User` 模型是生成代码的基础。

<!-- ### Constructor -->

### 构造函数

<!-- Creates a new `PrismaClient` instance. -->

创建一个新的 `PrismaClient` 实例。

<!-- #### Options -->

#### 选项

<!--
| Name          | Type          | Required | Description                                                                                                                                                                                                                         |
| ------------- | ------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `debug`       | `boolean`     | No       | When set to `true`, the `PrismaClient` instance prints additional logging output to the console when sending requests to Prisma's query engine. **Default**: `false`.                                                                     |
| `log` | `boolean | LogOption[]` | No | This allows to specify one of the following log levels: `INFO`, `WARN`, `QUERY`. If set to `true`, all log levels are applied. If set to `false`, no log levels are applied. **Default**: `true`.  

-->

| 名称          | 类型          | 必要 | 描述                                                                                                                                                                                                                         |
| ------------- | ------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `debug`       | `boolean`     | 否       | 设置为 `true` 时，`PrismaClient` 实例在向Prisma的查询引擎发送请求时将其他日志输出打印到控制台。 **默认**：`false` 。                                                                    |
| `log` | `boolean | LogOption[]` | 否 | 这允许指定以下日志级别之一：`INFO` ，`WARN` ，`QUERY` 。 如果设置为 `true` ，则将应用所有日志级别。 如果设置为 `false` ，则不应用任何日志级别。 **默认**：`true` 。  

<!-- #### Examples -->

##### 例子

```ts
const prisma = new PrismaClient({ debug: true })
```

<!-- ### `findOne` -->

### `findOne`

<!-- Returns a single object identified by a _unique_ value (e.g. `id` or `email`). You can use the `select` and `include` arguments to determine which fields should be included on the returned object. -->

返回由 _unique_ 值标识的单个对象（例如，`id` 或 `email`）。 您可以使用 `select` 和 `include` 参数来确定应该在返回的对象上包括哪些字段。

<!-- #### Options -->

#### 选项

<!--  
| Name     | Type                   | Required | Description                                                                      |
| -------- | ---------------------- | -------- | -------------------------------------------------------------------------------- |
| `where`  | `UserWhereUniqueInput` | **Yes**  | Wraps all _unique_ fields of a model so that individual records can be selected. |
| `select` | `UserSelect`           | No       | Specifies which fields to include in the [selection set](#selection-sets).       |
-->

| 名称     | 类型                   | 必要 | 描述                                                                      |
| -------- | ---------------------- | -------- | -------------------------------------------------------------------------------- |
| `where`  | `UserWhereUniqueInput` | **是**  | 包裹模型的所有 _unique_ 字段，以便可以选择单个记录。 |
| `select` | `UserSelect`           | 否       | 指定要包括在 [选择集](＃selection-sets) 中的字段。      |

<!-- #### Examples -->

#### 例子

```ts
const user = await prisma.user.findOne({
  where: { id: 1 },
})
```

### `findMany`

<!-- Returns a list of objects. The list can be altered using _pagination_, _filtering_ and _ordering_ arguments. You can use the `select` and `include` arguments to determine which fields should be included on each object in the returned list. -->

返回对象列表。 可以使用 _pagination_ ，_ iltering_ 和 _ordering_ 参数更改该列表。 您可以使用 `select` 和`include` 参数来确定应该在返回列表中的每个对象上包括哪些字段。

<!-- For more filtering examples, look [here](#filtering). -->

有关更多过滤示例，请参见[这里](＃filtering)。

<!-- #### Options -->

#### 选项

<!--
| Name      | Type               | Required | Description                                                                                                 |
| --------- | ------------------ | -------- | ----------------------------------------------------------------------------------------------------------- |
| `where`   | `UserWhereInput`   | No       | Wraps _all_ fields of a model so that the list can be filtered by any model property.                       |
| `orderBy` | `UserOrderByInput` | No       | Lets you order the returned list by any model property.                                                     |
| `skip`    | `string`           | No       | Specifies how many of the returned objects in the list should be skipped.                                   |
| `after`   | `string`           | No       | Specifies the starting object for the list (the value typically specifies an `id` or another unique value). |
| `before`  | `string`           | No       | Specifies the last object for the list (the value typically specifies an `id` or another unique value).     |
| `first`   | `number`           | No       | Specifies how many elements should be returned in the list (as seen from the _beginning_ of the list).      |
| `last`    | `number`           | No       | Specifies how many elements should be returned in the list (as seen from the _end_ of the list).            |
| `select`  | `UserSelect`       | No       | Specifies which fields to include in the [selection set](#selection-sets).                                  |
-->

| 名称      | 类型               | 必要 | 描述                                                                                                 |
| --------- | ------------------ | -------- | ----------------------------------------------------------------------------------------------------------- |
| `where`   | `UserWhereInput`   | 否       | 包裹模型的 _all_ 字段，以便可以由任何模型属性过滤列表。                      |
| `orderBy` | `UserOrderByInput` | 否       | 您可以通过任何模型属性对返回的列表进行排序。                                                    |
| `skip`    | `string`           | 否       | 指定应跳过列表中返回的对象的数量。                                  |
| `after`   | `string`           | 否       | 指定列表的起始对象（该值通常指定一个 `id` 或另一个唯一值）。 |
| `before`  | `string`           | 否       | 指定列表的最后一个对象（该值通常指定一个 `id` 或另一个唯一值）。  |
| `first`   | `number`           | 否       | 指定应在列表中返回多少个元素（从列表的 _beginning_ 中可以看到）。      |
| `last`    | `number`           | 否       | 指定应在列表中返回多少个元素（从列表的 _end_ 可以看到）。            |
| `select`  | `UserSelect`       | 否       | 指定要包含在[选择集](＃selection-sets)中的字段。                                  |

<!-- #### Examples -->

#### 例子

```ts
const user = await prisma.user.findMany({
  where: { name: 'Alice' },
})
```

<!-- ### `create` -->

### `create`

<!-- Creates a new record and returns the corresponding object. You can use the `select` and `include` arguments to determine which fields should be included on the returned object. `create` also lets you perform transactional _nested inserts_ (e.g. create a new `User` and `Post` in the same API call). -->

创建一个新记录并返回相应的对象。 您可以使用 `select` 和 `include` 参数来确定应该在返回的对象上包括哪些字段。 `create` 还可让您执行事务性的嵌套插入（例如，在同一API调用中创建新的 `User` 和 `Post`）。

<!-- #### Options -->

#### 选项

<!--
| Name     | Type              | Required | Description                                                                                                                                                                                                                                                                          |
| -------- | ----------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `data`   | `UserCreateInput` | **Yes**  | Wraps all the fields of the model so that they can be provided when creating new records. It also includes relation fields which lets you perform (transactional) nested inserts. Fields that are marked as optional or have default values in the datamodel are optional on `data`. |
| `select` | `UserSelect`      | No       | Specifies which fields to include in the [selection set](#selection-sets).                                                                                                                                                                                                           |
-->

| 名称     | 类型              | 必要 | 描述                                                                                                                                                                                                                                                                          |
| -------- | ----------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `data`   | `UserCreateInput` | **是**  | 包裹模型的所有字段，以便在创建新记录时可以提供它们。 它还包括允许您执行（事务性）嵌套插入的关系字段。 在 `data` 模型中标记为可选或在数据模型中具有默认值的字段是可选的。 |
| `select` | `UserSelect`      | 否       | 指定要包括在[选择集](#selection-sets)中的字段。|

<!-- #### Examples -->

#### 例子

```ts
const user = await prisma.user.create({
  data: { name: 'Alice' },
})
```

<!-- ### `update` -->

### `update`

<!-- Updates an existing record and returns the corresponding object. You can use the `select` and `include` arguments to determine which fields should be included on the returned object. -->

更新现有记录并返回相应的对象。您可以使用 `select` 和 `include` 参数来确定应该在返回的对象上包括哪些字段。

<!-- #### Options -->

#### 选项

<!--
| Name     | Type                   | Required | Description                                                                                                                                                                                         |
| -------- | ---------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data`   | `UserUpdateInput`      | **Yes**  | Wraps all the fields of the model so that they can be provided when updating an existing record. Fields that are marked as optional or have default values in the datamodel are optional on `data`. |
| `where`  | `UserWhereUniqueInput` | **Yes**  | Wraps all _unique_ fields of a model so that individual records can be selected.                                                                                                                    |
| `select` | `UserSelect`           | No       | Specifies which fields to include in the [selection set](#selection-sets).                                                                                                                          |
-->

| 名称     | 类型                   | 必要 | 描述                                                                                                                                                                                         |
| -------- | ---------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data`   | `UserUpdateInput`      | **是**  | 包裹模型的所有字段，以便在更新现有记录时可以提供它们。 在 `data` 模型中标记为可选或在数据模型中具有默认值的字段是可选的。 |
| `where`  | `UserWhereUniqueInput` | **是**  | 包裹模型的所有 _unique_ 字段，以便可以选择单个记录。                                                                                                                    |
| `select` | `UserSelect`           | 否       | 指定要包括在[选择集](#selection-sets)中的字段。                                                                                                                         |

<!-- #### Examples -->

#### 例子

```ts
const user = await prisma.user.update({
  where: { id: 1 },
  data: { name: 'ALICE' },
})
```

<!-- ### `updateMany` -->

### `updateMany`

<!-- Updates a batch of existing records in bulk and returns the number of updated records. -->

批量更新一批现有记录，并返回更新的记录数。

<!-- #### Options -->

#### 选项

<!--
| Name    | Type                          | Required | Description                                                                                                                                                                                         |
| ------- | ----------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data`  | `UserUpdateManyMutationInput` | **Yes**  | Wraps all the fields of the model so that they can be provided when updating an existing record. Fields that are marked as optional or have default values in the datamodel are optional on `data`. |
| `where` | `UserWhereInput`              | No       | Wraps _all_ fields of a model so that the list can be filtered by any model property.                                                                                                               |
-->

| 名称     | 类型                   | 必要 | 描述                                                                                                                                                                                         |
| ------- | ----------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data`  | `UserUpdateManyMutationInput` | **是**  | 包裹模型的所有字段，以便在更新现有记录时可以提供它们。 在 `data` 模型中标记为可选或在数据模型中具有默认值的字段是可选的。 |
| `where` | `UserWhereInput`              | 否       | 包裹模型的 _all_ 字段，以便可以由任何模型属性过滤列表。                                                                                                               |

<!-- #### Examples -->

#### 例子

```ts
const updatedUserCount = await prisma.user.updateMany({
  where: { name: 'Alice' },
  data: { name: 'ALICE' },
})
```

<!-- ### `upsert` -->

### `upsert`

<!-- Updates an existing or creates a new record and returns the corresponding object. You can use the `select` and `include` arguments to determine which fields should be included on the returned object. -->

更新现有记录或创建新记录并返回相应的对象。 您可以使用 `select` 和 `include` 参数来确定应该在返回的对象上包括哪些字段。

<!-- #### Options -->

#### 选项

<!--
| Name     | Type                   | Required | Description                                                                                                                                                                                                                                                                          |
| -------- | ---------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `create` | `UserCreateInput`      | **Yes**  | Wraps all the fields of the model so that they can be provided when creating new records. It also includes relation fields which lets you perform (transactional) nested inserts. Fields that are marked as optional or have default values in the datamodel are optional on `data`. |
| `update` | `UserUpdateInput`      | **Yes**  | Wraps all the fields of the model so that they can be provided when updating an existing record. Fields that are marked as optional or have default values in the datamodel are optional on `data`.                                                                                  |
| `where`  | `UserWhereUniqueInput` | **Yes**  | Wraps all _unique_ fields of a model so that individual records can be selected.                                                                                                                                                                                                     |
| `select` | `UserSelect`           | No       | Specifies which fields to include in the [selection set](#selection-sets).                                                                                                                                                                                                           |
-->

| 名称     | 类型                   | 必要 | 描述                                                                                                                                                                                         |
| -------- | ---------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `create` | `UserCreateInput`      | **是**  | 包裹模型的所有字段，以便在创建新记录时可以提供它们。 它还包括允许您执行（事务性）嵌套插入的关系字段。 在 `data` 模型中标记为可选或在数据模型中具有默认值的字段是可选的。 |
| `update` | `UserUpdateInput`      | **是**  | 包裹模型的所有字段，以便在更新现有记录时可以提供它们。 在 `data` 模型中标记为可选或在数据模型中具有默认值的字段是可选的。                                                                                  |
| `where`  | `UserWhereUniqueInput` | **是**  | 包裹模型的所有 _unique_ 字段，以便可以选择单个记录                                                                                                                                                                                                     |
| `select` | `UserSelect`           | 否       | 指定要包括在[选择集](#selection-sets)中的字段。                                                                                                                                                                                                          |

<!-- #### Examples -->

#### 例子

```ts
const user = await prisma.user.upsert({
  where: { id: 1 },
  update: { name: "ALICE" },
  create: { name: "ALICE" }
})
```

<!-- ### `delete` -->

### `delete`

<!-- Deletes an existing record and returns the corresponding object. You can use the `select` and `include` arguments to determine which fields should be included on the returned object. -->

删除现有记录并返回相应的对象。 您可以使用 `select` 和 `include` 参数来确定应该在返回的对象上包括哪些字段。

<!-- #### Options -->

#### 选项

<!--
| Name     | Type                   | Required | Description                                                                      |
| -------- | ---------------------- | -------- | -------------------------------------------------------------------------------- |
| `where`  | `UserWhereUniqueInput` | **Yes**  | Wraps all _unique_ fields of a model so that individual records can be selected. |
| `select` | `UserSelect`           | No       | Specifies which fields to include in the [selection set](#selection-sets).       |
-->

| 名称     | 类型                   | 必要 | 描述                                                                                                                                                                                         |
| -------- | ---------------------- | -------- | -------------------------------------------------------------------------------- |
| `where`  | `UserWhereUniqueInput` | **是**  | 包裹模型的所有 _unique_ 字段，以便可以选择单个记录。 |
| `select` | `UserSelect`           | 否       | 指定要包括在[选择集](#selection-sets)中的字段。     |

<!-- #### Examples -->

#### 例子

```ts
const user = await prisma.user.delete({
  where: { id: 1 },
})
```

<!-- ### `deleteMany` -->

### `deleteMany`

<!-- Deletes a batch of existing records in bulk and returns the number of deleted records. -->

批量删除一批现有记录，并返回已删除记录的数量。

<!-- #### Options -->

#### 选项

<!--
| Name    | Type             | Required | Description                                                                           |
| ------- | ---------------- | -------- | ------------------------------------------------------------------------------------- |
| `where` | `UserWhereInput` | No       | Wraps _all_ fields of a model so that the list can be filtered by any model property. |
-->

| 名称     | 类型             | 必要 | 描述                                                                                                                                                                                         |
| ------- | ---------------- | -------- | ------------------------------------------------------------------------------------- |
| `where` | `UserWhereInput` | 否       | 包裹模型的 _all_ 字段，以便可以由任何模型属性过滤列表。 |

<!-- #### Examples -->

#### 例子

```ts
const deletedUserCount = await prisma.user.deleteMany({
  where: { name: 'Alice' },
})
```

<!-- ### `count` -->

### `count`

<!-- Returns the number of elements in a list as a value of type `number`. -->

以数字类型 `number` 的形式返回列表中的元素数量。

<!-- #### Options -->

#### 选项

<!-- The `count()` method doesn't take any input arguments. -->

`count()` 方法不接受任何输入参数。

<!-- #### Examples -->

#### 例子

```ts
const userCount = await  prisma.user.count()
// userCount = 42
```

<!-- ## Filtering -->

## 过滤

<!-- The Prisma Client JS API offers filtering options for constraining the items that are returned from API calls that return lists via the `where` argument. -->

Prisma Client JS API提供了用于限制从API调用返回的项目的过滤选项，这些API调用通过 `where` 参数返回列表。

<!-- The following examples are based on this data model: -->

以下示例基于此数据模型：

```prisma
model User {
  id     Int    @id
  name   String
  email  String
  role   String
  active Boolean
}

enum Role {
  USER
  ADMIN
}
```

<!-- Filtering can be applied to this data model. It is not the same as manipulating the selection set. Based on the `User` model, Prisma Client JS generates the `UserWhereInput` type, which holds the filtering properties. -->

过滤可以应用于此数据模型。 它与操作选择集不同。 Prisma Client JS基于`User` 模型，生成 `UserWhereInput` 类型，该类型保留了过滤属性。

```ts
export declare type UserWhereInput = {
  id?: number | IntFilter | null
  name?: string | StringFilter | null
  email?: string | StringFilter | null
  role?: Role | RoleFilter | null
  active?: boolean | BooleanFilter | null
  AND?: Enumerable<UserWhereInput>
  OR?: Enumerable<UserWhereInput>
  NOT?: Enumerable<UserWhereInput>
}
```

<!-- For example, to get the record for the user with the `id` 1, `where` is used in combination with the `id` `IntFilter`: -->

例如，要获取具有 `id` 1的用户的记录，将 `where` 与 `id` `IntFilter` 结合使用：

```ts
const result = await prisma.user.findMany({
  where: { id: 1 },
})
// result = [{
//   id: 1,
//   name: "Alice",
//   email: "alice@prisma.io",
//   role: "USER",
//   active: true
// }]
```

<!-- > Note: As a recap, the `findMany` API returns a list of objects which can be filtered by any model property. -->

>注意：回顾一下，`findMany` API返回的对象列表可以被任何模型属性过滤。

<!-- To get the record for the user with the `name` Alice with a USER `role`, `where` is used in combination with the `name` `StringFilter` and the `role` `RoleFilter`: -->

为了获得USER为 `role`, `name`为Alice的记录，将 `where` 与 `name` `StringFilter` 和 `role`  `RoleFilter` 结合使用：

```ts
const result = await prisma.user.findMany({
  where: {
    name: 'Alice',
    role: 'USER',
  },
})
// result = [{
//   id: 1,
//   name: "Alice",
//   email: "alice@prisma.io",
//   role: "USER",
//   active: true
// }]
```

<!-- To apply one of the operator filters (`AND`, `OR`, `NOT`), filter for the record where the user with the `name` Alice has a non-active status. Here, `where` is used in combination with the `name` `StringFilter`, the `active` `BooleanFilter`, and the `NOT` operator: -->

要应用运算符过滤器之一（`AND`, `OR`, `NOT`），过滤名称为Alice的用户处于非活动状态的记录。 这里，`where` 与 `name` `StringFilter` ，`active` `BooleanFilter` 和 `NOT` 运算符结合使用：

```ts
const result = await prisma.user.findMany({
  where: {
    name: 'Alice',
    NOT: {
      active: true,
    },
  },
})
```

<!-- ## Logging and debugging -->

## 日志和调试

<!-- You can view the generated database queries that Prisma Client JS sends to your database by setting the `debug` option to `true` when instantiating `PrismaClient`: -->

实例化 `PrismaClient` 时，可以通过将 `debug` 选项设置为 `true` 来查看Prisma Client JS发送到数据库的生成的数据库查询：

```ts
const prisma = new PrismaClient({ debug: true })
```

<!-- You can also configure log levels via the `log` option: -->

您也可以通过 `log` 选项配置日志级别：

```ts
const prisma = new PrismaClient({ 
  debug: true,
  log: true
})
```

<!-- This logs all log levels: -->
这将记录所有日志级别：

<!-- - `INFO`: Logs general information -->
- `INFO`：记录常规信息
<!-- - `WARN`: Logs warnings -->
- `WARN`：记录警告
<!-- - `QUERY`: Logs the queries that generated by a Prisma Client JS API call -->
- `QUERY`：记录由Prisma Client JS API调用生成的查询

<!-- To specify more fine-grained log-levels, you can pass an array of log options to `log`: -->

要指定更细粒度的日志级别，可以将一系列日志选项传递给 `log`：

```ts
const prisma = new PrismaClient({
  debug: true,
  log: [{
    level: 'QUERY'
  }]
})
```

<!-- ## Reusing query sub-parts -->

## 重用查询子部分

<!-- You can reuse subparts of a Prisma Client JS query by not immediately evaluating the promise that's returned by any Prisma Client JS API call. Depending on your evaluating the promise, you can do this either by leaving out the prepended `await` keyword or the appended call to `.then()`.  -->

您可以通过不立即评估任何Prisma Client JS API调用返回的承诺来重用Prisma Client JS查询的子部分。 根据对诺言的评估，您可以通过省略前缀的  `await` 关键字或对 `.then()` 的追加调用来实现。

```ts
// Note the missing `await` here.
const currentUserQuery = prisma.user.findOne({ where: { id: prismarId } })

// Now you have the sub-part of a query that you can reuse.
const postsOfUser = await currentUserQuery.posts()
const profileOfUser = await currentUserQuery.profile()
```

<!-- ## Managing connections -->

## 连接管理

<!-- Prisma Client JS connects and disconnects from your data sources using the following two methods: -->

Prisma Client JS使用以下两种方法连接和断开数据源：

<!--
- `connect(): Promise<void>`
- `disconnect(): Promise<void>`
-->

- `connect(): Promise<void>`
- `disconnect(): Promise<void>`

<!-- Unless you want to employ a specific optimization, calling `prisma.connect()` is not necessary thanks to the _lazy connect_ behavior: The `PrismaClient` instance connects lazily when the first request is made to the API (`connect()` is called for you under the hood). -->

除非您要进行特定的优化，否则由于 _懒连接_ 行为而无需调用 `prisma.connect()`：当第一个请求发送到API时，`PrismaClient` 实例会延迟连接（在幕后为您调用 `connect()` ）。

<!-- If you need the first request to respond instantly and can't wait for the lazy connection to be established, you can explicitly call `prisma.connect()` to establish a connection to prisme data source. -->

如果您需要第一个请求立即响应并且不能等待懒连接建立，则可以显式调用 `prisma.connect()` 建立与prisme数据源的连接。

<!-- **IMPORTANT**: It is recommended to always explicitly call `prisma.disconnect()` in your code. Generally the `PrismaClient` instance disconnects automatically. However, if your program terminates but still  prismas an unhandled promise rejection, the port will keep the connection to the data source open beyond the lifetime of your program! -->

**重要**：建议始终在代码中显式调用`prisma.disconnect()`。通常，`PrismaClient` 实例会自动断开连接。 但是，如果您的程序终止但仍未处理的承诺被拒绝，则该端口将在程序的生存期之外保持与数据源的连接！

<!-- ## Error formatting -->

## 错误格式

<!-- By default, Prisma Client uses ANSI escape characters to pretty print the error stack and give recommendations on how to fix a problem. While this is very useful when using Prisma Client from the terminal, in contexts like a GraphQL API, you only want the minimal error without any additional formatting. -->

默认情况下，Prisma Client使用ANSI转义字符漂亮地打印错误堆栈，并提供有关如何解决问题的建议。 尽管从终端使用Prisma Client时这非常有用，但是在诸如GraphQL API这样的上下文中，您只需要最小的错误而无需任何其他格式。

<!-- This is how error formatting can be configured with Prisma Client. -->

以下是如何使用Prisma Client配置错误格式的方式。

<!-- There are 3 error formatting levels: -->

有3种错误格式级别：

<!-- 1. **Pretty Error** (default): Includes a full stack trace with colors, syntax highlighting of the code and extended error message with a possible solution for the problem. -->
<!-- 2. **Colorless Error**: Same as pretty errors, just without colors. -->
<!-- 3. **Minimal Error**: The raw error message. -->

1. **Pretty Error**（默认）：包括带有颜色的完整堆栈跟踪，代码的语法高亮显示和扩展的错误消息，以及可能的问题解决方案。
2. **Colorless Error**：与 `Pretty Error` 相同，只是没有颜色。
3. **Minimal Error**：原始错误消息。

<!-- In order to configure these different error formatting levels, we have two options:  -->

为了配置这些不同的错误格式级别，我们有两个选择：

<!--
- Setting the config options via environment variables
- Providing the config options to the `PrismaClient` constructor
 -->

- 通过环境变量设置配置选项
- 向`PrismaClient`构造函数提供配置选项

<!-- ### Environment variables -->

### 环境变量

<!--
- `NO_COLOR`: If this env var is provided, colors are stripped from the error message. Therefore you end up with a **colorless error**. The `NO_COLOR` environment variable is a standard described [here](https://no-color.org/). We have a tracking issue [here](https://github.com/prisma/prisma2/issues/686).
- `NODE_ENV=production`: If the env var `NODE_ENV` is set to `production`, only the **minimal error** will be printed. This allows for easier digestion of logs in production environments.
-->

-`NO_COLOR`：如果提供了这个环境变量，错误消息中的颜色将被去除。 因此，您最终会遇到**Colorless Error** `NO_COLOR` 环境变量是[此处](https://no-color.org/)中描述的标准。 我们有一个跟踪问题[此处](https://github.com/prisma/prisma2/issues/686)。
-`NODE_ENV = production`：如果将环境变量 `NODE_ENV` 设置为 `production`，则仅会显示**Minimal Error**。 这样可以简化生产环境中的日志摘要。

<!-- ### Constructor -->

### 构造函数

<!-- The constructor argument to control the error formatting is called `errorFormat`. It can have the following values: -->

控制错误格式的构造函数参数称为 `errorFormat`。 它可以具有以下值：

<!--
- `undefined`: If it's not defined, the default is `pretty`.
- `pretty`: Enables pretty error formatting.
- `colorless`: Enables colorless error formatting.
- `minimal`: Enables minimal error formatting.
-->

-`undefined`：如果未定义，则默认为`pretty`。
-`pretty`：启用 `Pretty Error` 误格式。
-`colorless`：启用 `Colorless Error` 格式化。
-`minimal`：启用 `Minimal Error` 格式化。

<!-- It can be used like so: -->

可以这样使用：

```ts
const prisma = new PrismaClient({
  errorFormat: 'minimal',
})
```

<!-- As the `errorFormat` property is optional, you still can just instantiate Prisma Client like this: -->

由于 `errorFormat` 属性是可选的，因此您仍然可以像这样实例化Prisma Client：

```ts
const prisma = new PrismaClient()
```