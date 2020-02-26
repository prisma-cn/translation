---
title: 事务
description: Prisma 2 事务，通过这篇文章可以了解数据库事务的的特性，以及在 Prisma2 中如何使用事务解决一系列的读/写操作。
author: Chegio
author_url: https://github.com/chegio
author_image_url: https://github.com/chegio.png?size=400
author_title: Prisma 爱好者
---

# 事务(Transactions)

**数据库事务处理**是指一系列的读/写操作，且能够**保证**整体成功或失败。

事务是一个很好的工具，因为它们允许开发人员忽略一些当数据库在短时间内处理多个操作时可能出现的潜在的并发问题。开发人员通过将一系列操作包装在事务中来获取数据库提供的**安全保证**。

这些保证就是人们所俗称的 **ACID** 四种特性，具体如下：

- **原子性(Atomic)**: 确保事务能够**全部**或**全部没有**操作成功， 即事务已**成功提交**或**中止并回滚**了。
- **一致性(Consistent)**: 确保事务之前和之后的数据库状态均为**有效**的（即维护有关数据的任何现有不变）。
- **隔离性(Isolated)**: 确保并发执行的事务不会相互影响,使其与串行执行的事务具有相同的效果。
- **持久性(Durability)**: 确保在事务执行成功之后，对数据的修改是永久的，即便系统故障也不会丢失。

尽管每个特性的都有很多歧义和细微差别（例如，一致性实际上可以被认为是 **应用程序级别的责任**，而不是数据库级别特性；亦或者通常可以通过**隔离级别**来保证更强和更弱的隔离性），但总体而言，它们仍然可以充当开发人员在考虑数据库事务时的高级指南。

> "事务是一个抽象层，它使应用程序可以忽略某些并发问题以及某些类型的硬件和软件故障。大量错误被简化为简单的事务中止，而应用程序只需重试即可。"**[Designing Data-Intensive Applications](https://dataintensive.net/), [Martin Kleppmann](https://twitter.com/martinkl)** 

## Prisma Client JS 现今如何支持事务

Prisma Client JS 提供了一个数据访问 API ，可以从数据库读写数据。对于关系数据库，Prisma Client JS 的 API 是基于 SQL 进行抽象的，其中事务是常见的功能。尽管 Prisma Client JS 不允许 SQL 级事务提供相同的灵活性，但它涵盖了开发人员用于具有[**嵌套写入**](./relations.md#nested-writes)的事务的绝大多数用例。

嵌套写入可让您在执行单个 Prisma Client JS API 中调用多中不同操作，这些代码片段涉及多个[**相关联**](./relations.md#nested-writes)的记录，例如 同时创建 **post** 与 **user** 亦或者在更新 **order** 时一同更新 **invoice**。在执行嵌套写入时，Prisma Client JS 会确保它整体执行成功或失败。

以下是 Prisma Client JS API 中嵌套写入的示例：

```ts
// 在一个事务中创建一个user，并给该user增加两个post
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
})
```

```ts
// 在一个事务中更改一个post的author
const updatedPost: Post = await prisma.post.update({
  where: { id: 42 },
  data: {
    author: {
      connect: { email: 'alice@prisma.io' },
    },
  },
})
```

## Prisma Client JS API 未来将支持的事务方式

事务是关系数据库和非关系数据库中的常用功能，并且 Prisma Client JS 将来可能会支持更多事务机制。具体来说，将支持以下两个用例：

- 批量发送多个操作。
- 启用运行时间更长的事务，其中的操作可以相互依赖。

**批量发送多个操作**的用例可以使用类似于以下的 API 来实现：

```ts
const write1 = prisma.user.create()
const write2 = prisma.orders.create()
const write3 = prisma.invoices.create()

await prisma.transaction([write1, write2, write3])
```

对于多步操作，操作本身先会存储在变量中，然后再通过调用 `prisma.transaction` 方法提交给数据库，而并不是立即等待每个操作的结果。 Prisma Client JS 将确保所有三个 `create` 操作整体成功或失败。

**启用运行时间更长的事务，其中的操作可以相互依赖**用例是： Prisma Client JS 将需要公开一个 **transaction API** ，使开发人员可以自己发起和提交事务，而 Prisma Client JS 负责确保事务相关的安全性。类似于：

```ts
prisma.transaction(async tx => {
  const user = await tx.users.create({
    data: { email: "alice@prisma.io" }
  })
  const order = await tx.orders.create({
    data: {
      customer: {
        connect: { id: user.id }
      }
    }
  })
  await tx.commit()
})
```

在这种情况下，API提供了一种将一系列操作包装在事务中执行的回调方法，因此可以保证整体执行成功或失败。

如果您希望看到将来支持的事务, [请加入Github讨论](https://github.com/prisma/prisma2/issues/312).
