---
title: 当前限制
description: 目前在使用prisma2 的过程中需要注意一些限制
author: Victor
author_url: https://kangwenchang.com
author_image_url: https://kangwenchang.com/static/favicon/logocorner.png
author_title: Prisma 爱好者
---

在 Prisma 2 的预览期间，你应注意缺少的功能和其他限制。

## 功能限制

- Embedded 类型目前没有支持 ([相关 issue](https://github.com/prisma/migrate/issues/43)).
- 许多其他类型尚未完全实现 (例如 PostgreSQL 中的 `citext` 或 `varchar(n)` ).
- Models 必须拥有 `@id` 属性并且必须为如下形式之一:
  - `Int @id @default(autoincrement())`
  - `String @id @default(uuid())`
  - `String @id @default(cuid())`
- 当 [introspecting](./introspection.md) 数据库时, 目前 Prisma 仅识别遵循 Prisma 约定的关系表的多对多关系 [relation tables](./relations.md).
- Prisma2 CLI 当前不支持非交互式终端（例如 Windows 上的 Git Bash） ([相关 issues](https://github.com/prisma/prisma2/issues/554)).

## 超出范围的功能

以下功能当前不属于 Prisma 的一部分，很可能不会在 GA 之前添加：

- 实时 API 或订阅 subscriptions（将来，Prisma 将可能有一个启用此功能的事件引擎，但尚无此功能的预计完成时间）（[相关问题]（https://github.com/prisma/prisma2/issues/298）。
- Go client（“Prisma Client Go”）（[相关问题]（https://github.com/prisma/prisma2/issues/571））。
- 与 Prisma server/集群结合使用 Prisma tools（例如 Prisma Client JS 或 Migrate） ([相关 issue](https://github.com/prisma/prisma2/issues/370)).
