---
title: 使用Prisma Client JS的生成类型
description: 
author: Nan Zhao
author_url: https://github.com/znnan
author_image_url: https://avatars0.githubusercontent.com/u/34448143?s=400&u=949ac05ac4184e0f0e1d842aac4575da66d937cc&v=4
author_title: Full Stacker
---

<!-- # Working with Prisma Client JS' generated types -->

＃ 使用Prisma Client JS的生成类型

<!-- The generated code for Prisma Client JS contains a number of helpful types that you can use to make your application more type-safe. This page describes patterns for leveraging some of the generated types. -->

Prisma Client JS的生成代码包含许多有用的类型，您可以使用它们来使应用程序更安全。本页描述了利用某些生成类型的模式。

<!-- ## Operating against partial structures of your model types -->

## 针对模型类型的部分结构进行操作

<!-- When using Prisma Client JS, every model from your [Prisma schema](../prisma-schema-file.md) is translated into a dedicated TypeScript type. For example, assume you have the following `User` and `Post` models: -->

使用Prisma Client JS时，[Prisma模式](../prisma-schema-file.md)中的每个模型都转换为专用的TypeScript类型。例如，假设您具有以下`User`和`Post`模型：

```prisma
model User {
  id        Int      @id
  email     String   @unique
  name      String?
  posts     Post[]
}

model Post {
  id         Int        @id
  author     User
  title      String
  published  Boolean    @default(false)
}
```

<!-- The Prisma Client JS code that's generated from this schema contains a representation of the `User` type: -->

从该模式生成的Prisma Client JS代码包含`User`类型的表示：

```ts
export declare type User = {
    id: string;
    email: string;
    name: string | null;
};
```

<!-- ### Problem: Using variations of the generated model type -->

### 问题：使用生成的模型类型的变体

<!-- #### Description -->

#### 说明

<!-- In some scenarios, you may need a variation of the generated `User` type. For example, when you have a function that expects an instance of the `User` model that carries the `posts` relation. Or when you need a type to pass only the `User` model's `email` and `name` fields around in your application code. -->

在某些情况下，您可能需要所生成的`User`类型的变体。例如，当您有一个期望带有`posts`关系的`User`模型实例的函数时。或者，当您需要一种类型来在应用程序代码中仅传递`User`模型的`email`和`name`字段时。

<!-- #### Solution -->

#### 解决方案

<!-- As a solution, you can customize the generated model type using Prisma Client JS' helper types. -->

作为解决方案，您可以使用Prisma Client JS的帮助程序类型来自定义生成的模型类型。

<!-- The `User` type only contains the model's [scalar](../data-modeling.md#scalar-types) fields, but doesn't account for any relations. That's because [relations are not included by default](./api.md#the-default-selection-set) in Prisma Client JS' API calls. -->

`User`类型仅包含模型的[scalar](../data-modeling.md#scalar-types)字段，而不考虑任何关系。这是因为Prisma Client JS的API调用中[默认不包含关系](./api.md#the-default-selection-set)。

<!-- However, sometimes it's useful to have a type available that **includes a relation** (i.e. a type that you'd get from an API call that uses [`include`](./api.md#include-additionally-via-include)). Similarly, another useful scenario could be to have a type available that **includes only a subset of the model's scalar fields** (i.e. a type that you'd get from an API call that uses [`select`](./api.md#select-exclusively-via-select).  -->

但是，有时有用的类型包括**包括一个关系**（即，您可以从使用[`include`](./api.md#include-additionally-via-include))。类似地，另一种有用的情况是使类型**仅包含模型标量字段的子集**（您可以从使用[`select`]的API调用中获得的类型(./api.md#select-exclusively-via-select)）。

<!-- One way of achieving this would be to define these types manually in your application code: -->

一种实现方法是在应用程序代码中手动定义这些类型：

```ts
// Define a type that includes the relation to `Post` 
type UserWithPosts = {
  id: string;
  email: string;
  name: string | null;
  posts: Post[]
}

// Define a type that only contains a subset of the scalar fields
type UserPersonalData = {
  email: string;
  name: string | null;
}
```

<!-- While this is certainly feasible, this approach increases the maintenance burden upon changes to the Prisma schema as you need to manually maintain the types. A cleaner solution to this is to use the  `UserGetIncludePayload` and  `UserGetSelectPayload` types that are generated and exposed by Prisma Client JS: -->

尽管这是可行的，但是由于您需要手动维护类型，因此此方法增加了更改Prisma模式的维护负担。一个更干净的解决方案是使用Prisma Client JS生成和公开的`UserGetIncludePayload`和`UserGetSelectPayload`类型：

```ts
// Define a type that includes the relation to `Post` 
type UserWithPosts = UserGetIncludePayload<{
  posts: true
}>

// Define a type that only contains a subset of the scalar fields
type UserPersonalData = UserGetSelectPayload<{
  email: true;
  name: true;
}>
```

<!-- The main benefits of the latter approach are: -->

后一种方法的主要好处是：

<!-- - Cleaner approach as it leverages Prisma Client JS' generated types
- Reduced maintenance burden and improved type-safety when the schema changes -->

- 更干净的方法，因为它利用了Prisma Client JS的生成类型
- 当模型更改时，减少了维护负担并提高了类型安全性

<!-- ### Problem: Getting access to the return type of a partial structure -->

### 问题：访问部分结构的返回类型

<!-- #### Description -->

#### 说明

<!-- When doing [`select`](./api.md#select-exclusively-via-select) or [`include`](./api.md#include-additionally-via-include) operations on your models it is difficult to gain access to the return type, e.g: -->

在模型上执行[`select`](./api.md#select-exclusively-via-select)或[`include`](./api.md#include-additionally-via-include)操作时，很难获得对返回类型的访问权，例如：

```ts
async function getUsersWithPosts() {
  const users = await prisma.user.findMany({ include: { posts: true } })
  return users
}
```

<!-- Extracting the type that represents "users with posts" from the above code snippet requires some advanced TypeScript usage: -->

从上面的代码片段中提取代表“有帖子的用户”的类型需要一些高级TypeScript用法：

```ts
type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;
type UsersWithPosts = ThenArg<ReturnType<typeof getUsersWithPosts>>;
```

<!-- #### Solution -->

#### 解决方案

<!-- With the `PromiseReturnType` that is exposed by Prisma Client, you can solve this more elegantly: -->

使用Prisma Client公开的`PromiseReturnType`，您可以更优雅地解决此问题：

```ts
import { PromiseReturnType } from '@prisma/client'

type UsersWithPosts = PromiseReturnType<typeof getUsersWithPosts>;
```