---
title: Prisma 2 Core SQLite connector
description: 本章为Prisma 2 核心组件 SQLite 数据连接器
author: wsafight
author_url: https://github.com/wsafight
author_title: Prisma 爱好者
---

# SQLite

PostgreSQL 数据源连接器将 Prisma 连接到 [SQLite](https://www.sqlite.org) 数据库文件。这些文件的文件名都已 `.db` 结尾(例如： `dev.db`)。 

## 例子

要连接到 SQLite 数据库文件，您需要在 [schema 文件](../../prisma-schema-file.md) 中配置一个[`datasource 数据源`](../../prisma-schema-file.md#数据源):

```prisma
datasource sqlite {
  provider = "sqlite"
  url      = "file:./dev.db"
}

// ... 文件还应该包含数据模型定义和(可选的)生成器
```

`datasource` 配置定义如下:

- `provider`: 使用 `sqlite` 指定 SQLite  数据源连接器。
- `url`: 指定SQLite数据库的[连接字符串](#连接字符串)。 连接字符串始终以 `file:` 开头：然后包含指向 SQLite 数据库的文件路径。 在当前的配置中，文件在当前目录中且名称为 `dev.db`。

可以在配置项 `datasource` 中找到更多信息 [点击这里](../../prisma-schema-file.md#数据源)。

## 数据模型映射

SQLite 连接器将[标量类型](../../data-modeling.md#标量类型)从[数据模型](../../data-modeling.md)映射到原生数据类型，如下所示：

| 数据模型 | SQLite    |
| ---------- | --------- |
| `String`   | `TEXT`    |
| `Boolean`  | `BOOLEAN` |
| `Int`      | `INTEGER` |
| `Float`    | `REAL`    |

## 连接细节

### 连接字符串

SQLite 连接器的连接 URL 指向文件系统上的文件。例如，在相同的目录中，则以下两个配置是等效的，

```prisma
datasource sqlite {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

等同于:

```prisma
datasource sqlite {
  provider = "sqlite"
  url      = "file:dev.db"
}
```

您还可以从根目录或者文件系统的其他位置来定位文件：

```prisma
datasource sqlite {
  provider = "sqlite"
  url      = "file:/Users/janedoe/dev.db"
}
```
