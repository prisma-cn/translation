---
title: FAQ问答
description: 本章为关于对一些常见问题的解答。
author: Victor
author_url: https://kangwenchang.com
author_image_url: https://kangwenchang.com/static/favicon/logocorner.png
author_title: Prisma 爱好者
---

## Prisma Client JS

### 我是否仍然可以直接访问我的数据库(例如使用原始 SQL)？

可以，Prisma 2 暴露了 raw api 接口用于执行原始 SQL。

同时，你可以将 Prisma Client JS 与其他轻量级查询库(例如[knex](https://www.github.com/tgriesser/knex))一起使用。

### Prisma Client JS 是 ORM 吗？

ORMs 通常是数据库表类型的面向对象式映射层。记录被表示为一个对象，它不仅承载数据，而且实现各种行为以进行存储，检索，
对自己的数据进行序列化和反序列化，有时还实现业务逻辑。
Prisma Client JS 更像是一个“查询生成器”，返回简单对象，重点是结构化类型而不是丰富对象的行为。

### Prisma Client JS 将来会支持更多数据库(和其他数据源)吗？

会。Prisma Client JS 基于 Prisma 的查询引擎 query engine，可以连接到提供适当连接器实现的任何数据源。目前有内置的连接器例如[PostgreSQL](./core/connectors/postgresql.md)，[MySQL](./core/connectors/mysql.md)和[SQLite](./core/connectors/sqlite.md)。

但是，你也可以构建自己的连接器，有关该主题的更多文档将很快发布。

### 如何查看 Prisma Client JS 发送到数据库的查询语句？

Prisma Client JS 很快将提供丰富的查询分析。现在，你可以在实例化 Prisma Client 实例时将`debug`选项设置为`true`。在[这里](./prisma-client-js/api.md#debugging)了解更多信息。

### 模式迁移(schema migrations)如何与 Prisma Client JS 一起使用？

Prisma Client JS 不影响你现有的 DDL 系统。你可以保留现有的迁移系统，在每次 migration 后重新 introspect 数据库 schema 更新 Prisma Client JS 即可。在[这里](./prisma-client-js/use-only-prisma-client-js.md)了解更多信息。你还可以始终使用 Prisma 的`migrate` CLI 根据 Prisma 的声明性[数据模型定义](./data-modeling.md)执行 migration。

### Prisma Client JS 是否已适合生产？我应该开始使用它吗？

Prisma Client JS 尚未投入生产，它具有许多严重的[局限性](./limitations.md)，不适合用于生产用途和重负载。你可以在[isprisma2ready.com](https://www.isprisma2ready.com)上跟踪发布过程的进度。尽管它不应该用于关键应用程序，但是 Prisma Client JS 肯定处于可用状态。你可以通过使用它并与我们[共享你的反馈](./prisma2-feedback.md)来帮助我们加快发布过程。

### Prisma Client JS 是否支持 GraphQL schema delegation 和 GraphQL binding？

GraphQL [schema delegation](https://www.prisma.io/blog/graphql-schema-stitching-explained-schema-delegation-4c6caf468405/)通过传递[`info`](https://www.prisma.io/blog/graphql-server-basics-demystifying-the-info-argument-in-graphql-resolvers-6f26249f613a/)对象从第一个 GraphQL 模式的解析器到第二个 GraphQL 模式的解析器。模式委托也是[GraphQL binding](https://github.com/graphql-binding/graphql-binding)的基础。

Prisma 1 支持 schema delegation 和 GraphQL binding，因为它通过[Prisma server](https://www.prisma.io/docs/prisma-server/)公开了 GraphQL CRUD API。该 API 可以用作使用 GraphQL binding 创建的应用程序层 GraphQL API 的基础。

使用 Prisma 2 时，Prisma 的查询引擎不再公开[spec 兼容的](https://graphql.github.io/graphql-spec/June2018/)GraphQL 端口，因此 prisma2 和 schema delegation 或 GraphQL binding 一起使用不受官方支持。要使用 Prisma 2 构建 GraphQL 服务器，可以使用[GraphQL Nexus](https://nexus.js.org/)及其[`nexus-prisma`](https://nexus.js.org/docs/database-access-with-prisma-v2)插件集成。GraphQL Nexus 提供了一种代码优先和类型安全的方式来构建可扩展的 GraphQL 服务器。

### 如何在无服务器 Serverless 环境中处理 Prisma Client JS 的连接池？

为 Prisma Client JS API 提供支持的查询引擎维护数据库连接池。在无服务器的环境中(或者在容器中运行应用程序(例如使用 Kubernetes))时，此连接池可能由于其部署的基础架构而失去其有效性。你可以在[docs](./prisma-client-js/deployment.md)中阅读有关此主题的更多信息。

到目前为止，建议的解决方法是使用类似[PgBouncer](https://pgbouncer.github.io/faq.html)的工具。我们正在进一步探索一些选项，例如[启用“数据库代理服务器”](https://github.com/prisma/prisma2/issues/370)(例如，在正常服务器上托管 Prisma Client JS 的查询引擎)为你管理连接池(类似于 Prisma 1 架构)。

还请注意，有些云产品开始提供现成的连接池解决方案，例如[AWS Aurora](https://aws.amazon.com/blogs/aws/new-data-api-for-amazon-aurora-serverless/)。

而在阿里云或腾讯云的函数计算中，会暴露初始化函数来提前启动和管理函数，将 prisma client 实例化到其中将解决部分问题。

## Migrations 迁移

### 使用 Prisma 的迁移工具时，我是否被锁定？迁移起来容易吗？

Prisma 的迁移工具绝对没有锁定。要停止使用 Prisma 进行迁移，你可以删除[Prisma schema file](./prisma-schema-file.md)和现有的`migrations`文件夹以及数据库中的`migrations`表。

### 如何查看有关 Prisma 迁移数据库架构的详细信息？

每次迁移都通过文件夹里的目录表示。每个目录的名称都包含一个时间戳，以便可以维护项目历史记录中所有迁移的顺序。这些迁移目录中的每一个里都包含有关各个迁移的详细信息，例如，执行了哪些步骤(以什么顺序执行)以及易读的 markdowm 文件，该文件总结了有关迁移的重要信息，例如源代码和迁移的目标[data model definition](./data-modeling.md#data-model-definition)。这些信息也可以在数据库的`migrations` 表中找到。

另外，`migrate` CLI 在运行命令时会不断打印迁移语句和更多信息。

### Prisma 的迁移工具是否已准备好投入生产？我应该开始使用它吗？

Prisma 的迁移工具尚未投入生产，它有许多[limitations](./limitations.md)使其不适合生产使用。你可以在[isprisma2ready.com](https://www.isprisma2ready.com)上跟踪发布过程的进度。

尽管它不应该用于关键应用程序，但 Prisma 的迁移工具肯定处于可用状态。你可以通过使用它并与我们[共享你的反馈](./prisma2-feedback.md)来帮助我们加快发布过程。

## 其他

### 由于 Prisma 2 已发布，Prisma 1 是否仍将得到维护？

是的，Prisma 1 将继续保持。但是，大多数 Prisma 的工程师将投入[Prisma 2](https://github.com/prisma/prisma2)的开发。

Prisma 1 将不会开发任何新功能。

### 在哪里可以获取有关 Prisma 2 计划的更多信息？

查看[`specs`](https://github.com/prisma/specs)存储库，其中包含未来 Prisma 2 功能的技术规范。通过[创建 issue](https://github.com/prisma/prisma2/issues)和[提交反馈](./prisma2-feedback.md)参与进来！

### Prisma 2 的价格是多少？

Prisma 2 是开源的，免费使用！将来，Prisma 将提供其他云服务，以促进各种与数据库和 Prisma 相关的工作流程。请注意，这些是可选的，Prisma 2 可以继续使用而不会绑定任何商业服务。
