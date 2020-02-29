---
title: 迁移文件 Migration Files
description: Prisma 2 迁移文件，介绍了如何在 Prisma 2 中进行 Schema 的迁移。
author: Zander
author_url: https://xuezenghui.com
author_image_url: https://xuezenghui.com/images/avatar.jpeg
author_title: 能饮一杯无？
---

使用`prisma2 migrate save --experimental`命令可保存迁移，Prisma 会为你创建以下三个迁移文件：

- `README.md`
- `datamodel.prisma`
- `steps.json`

## `README.md`

README 以易于理解的 Markdown 格式记录迁移的有关信息：

- 当你运行 `prisma2 migrate up --experimental` 命令时 Prisma 将会执行 SQL 语句的概述。
- 你的 [Prisma schema](../prisma-schema-file.md) 迁移前后的变化及差异。

## `schema.prisma`

`schema.prisma` 文件为迁移完成后的 [Prisma schema](../prisma-schema-file.md)。

## `steps.json`

当你使用 `prisma2 migrate up --experimental` 命令进行 Prisma 的迁移操作时，执行的步骤也会记录在 `steps.json` 文件中，你可以在 [spec](https://github.com/prisma/specs/tree/master/lift#step) 中了解相关的更多信息。
