---
title: MySQL connector
description: 本章为Prisma 2 核心组件 MySQL 数据库连接器
author: wsafight
author_url: https://github.com/wsafight
author_title: Prisma 爱好者
---

MySQL 数据库连接器将 Prisma 连接到 MySQL 数据库。

## 例子

要连接到 MySQL 数据库，你需要在 [schema 文件](../../prisma-schema-file.md)中配置一个 [`datasource 数据源`](../../prisma-schema-file.md#数据源)：

```prisma
datasource mysql {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// ... 文件还应该包含数据模型定义和(可选的)生成器
```

`datasource` 定义如下:

- `provider`: 使用 `mysql` 数据库连接器。
- `url`: 指定 MySql 数据库的[连接字符串](#connection-string)。在这种情况下，我们[使用环境变量](../../prisma-schema-file.md#使用环境变量)来提供连接字符串。

可以在配置项 `datasource` 中找到更多信息 [点击这里](../../prisma-schema-file.md#数据源)。

## 数据模型映射

MySQL 连接器将[标量类型](../../data-modeling.md#标量类型)从[数据模型](../../data-modeling.md)映射到原生数据类型，如下所示：

| 数据模型   | MySQL       |
| ---------- | ----------- |
| `String`   | `TEXT`      |
| `Boolean`  | `BOOLEAN`   |
| `Int`      | `INT`       |
| `Float`    | `FLOAT`     |
| `Datetime` | `TIMESTAMP` |

## 连接细节

### 连接字符串

MySQL 提供两种形式的连接字符串：

- 键值对字符串: `{user:'user', host:'localhost', schema:'world'}`
- 连接 URI: `mysql://user@localhost:3333`

请参考[MySQL 官方文档](https://dev.mysql.com/doc/refman/8.0/en/connecting-using-uri-or-key-value-pairs.html)了解更多详细信息。

### 配置选项

- `host`: 数据库服务器的 IP 地址/域, 例如 `localhost`。
- `port`: 数据库监听端口，例如 `5432`。
- `database`: 数据库名称。
- `user`: 数据库用户， 例如 `admin`。
- `password`: 数据库用户密码。
- `ssl`: 服务器是否使用 SSL。
- `connection_limit`: 指定限制 Prisma 连接数据库的的最大连接数。
- `socket`: 如果想要使用 sockets 连接，则参数必须指定 socket 文件路径, 例如: `"mysql://root@localhost/dbname?socket=(/tmp/mysql.sock)"`。
- `connect_timeout`: 等待新连接最大的秒数。 **默认**: `5`。
- `socket_timeout`: 等待单个查询终止的最大秒数。**默认**: `5`。
