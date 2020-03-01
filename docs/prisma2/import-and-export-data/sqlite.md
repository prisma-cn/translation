---
title: SQLite数据的导入和导出
description: Prisma 2 中SQLite数据的导入和导出。
author: zz
author_url: https://github.com/zhylninc
author_image_url: https://avatars2.githubusercontent.com/u/3182099?s=400&v=4
author_title: Prisma 爱好者
---

本文档介绍了如何从 SQLite 数据库导出数据以及将数据导入 SQLite 数据库。你可以在官方 [SQLite 文档](https://www.sqlitetutorial.net/sqlite-dump/)中了解有关此主题的更多信息。

## 使用 `sqlite3` 导出数据

[`sqlite3`](https://www.sqlite.org/cli.html) 是一个本地 SQLite 命令行实用程序，可用于整个 SQLite 数据库的各种工作流程。要查看此命令的所有选项，请运行 `sqlite3 --help`。导出数据通常是在 `sqlite3` 提示符下使用 `.dump` 命令完成的。

要导出数据，你需要输入 `sqlite3` 提示符并将其指向你的 SQLite 数据库文件的位置(以 `.db` 结尾)：

```
sqlite3 ./dev.db
```

出现提示后，可以按以下方式导出数据：

```
sqlite> .output ./backup.sql
sqlite> .dump
sqlite> .exit
```

另外，你可以通过在提示中的 `.dump` 命令之后添加表名来导出特定表。例如，以下命令仅 dump `users` 表:

```
sqlite> .output ./backup_users.sql
sqlite> .dump users
sqlite> .exit
```

如果要排除所有数据而仅导出 _数据库 schema_ ( [DDL](https://en.wikipedia.org/wiki/Data_definition_language) ), 则可以使用 `.schema` 而不是 `.dump`:

```
sqlite> .output ./backup_schema.sql
sqlite> .schema
sqlite> .exit
```

## 从 SQL 文件导入数据

使用 `.dump` 命令插入 `sqlite3` 提示符以将 SQLite 数据库导出为 SQL 文件后，你可以通过使用 `.read` 命令将 SQL 文件返回到 `sqlite3` 中来恢复数据库的状态。 。

在使用 `.read` 命令之前，你需要输入 `sqlite3` 提示符并将其指向你的 SQLite 数据库文件：

```
sqlite3 ./restore.db
```

现在，你可以按照以下步骤从 SQL 文件导入数据：

```
.read ./backup.sql
.exit
```
