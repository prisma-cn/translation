---
title: PostgreSQL数据的导入和导出
description: Prisma 2 中PostgreSQL数据的导入和导出。
author: zz
author_url: https://github.com/zhylninc
author_image_url: https://avatars2.githubusercontent.com/u/3182099?s=400&v=4
author_title: Prisma 爱好者
---

本文档介绍了如何从 PostgreSQL 数据库导出数据和将数据导入 PostgreSQL 数据库。你可以在官方 [PostgreSQL 文档](https://www.postgresql.org/docs/9.1/backup-dump.html) 了解有关此主题的更多信息。

## 使用 SQL Dump 导出数据

[SQL Dump](https://www.postgresql.org/docs/9.1/backup-dump.html) 是一个本地 PostgreSQL 实用程序，可用于从 PostgreSQL 数据库导出数据。要查看该命令的所有选项，请运行 `pg_dump --help`.

引用 PostgreSQL 文档:

> 这种 dump 方法的思想是使用 SQL 命令生成一个文本文件，当将其反馈给服务器时，它将以与 dump 时相同的状态重新创建数据库。 PostgreSQL 为此提供了实用程序 `pg_dump`。

> `pg_dump` 是一个常规的 PostgreSQL 客户端应用程序（一个优秀的应用程序）。这意味着你可以从任何有权访问数据库的远程主机上执行此备份过程。但是请记住，pg_dump 不能在特殊权限下运行。特别是，它必须对要备份的所有表都具有读取访问权限，因此实际上，你必须以数据库 root 用户身份运行它。

该命令如下所示：

```psql
pg_dump DB_NAME > OUTPUT_FILE
```

你需要将 `DB_NAME` 和 `OUTPUT_FILE` 占位符替换为以下各项的相应值：

- 你的 **数据库名称**
- 所需的 **输出文件** 的名称(应以 `.sql` 结尾)

例如，要将数据从本地 PostgreSQL 服务器从名为 `mydb` 的数据库导出到名为 `mydb.sql` 的文件中，可以使用以下命令：

```
pg_dump mydb > mydb.sql
```

如果你的数据库 使用 [Object 标识符类型](https://www.postgresql.org/docs/8.1/datatype-oid.html) (OIDs), 则需要使用 `pg_dump` 时加入参数项 `--oids` (简称: `-o`) : `pg_dump mydb --oids > mydb.sql`.

#### 提供数据库凭证

你可以添加以下参数来指定 PostgreSQL 数据库服务器的位置：

| 参数项                | 默认值      | 环境变量 | 描述                                        |
| --------------------- | ----------- | -------- | ------------------------------------------- |
| `--host` (简称: `-h`) | `localhost` | `PGHOST` | 服务器主机的地址                            |
| `--port` (简称: `-p`) | -           | `PGPORT` | PostgreSQL 服务器正在侦听的服务器主机的端口 |

要针对 PostgreSQL 数据库服务器进行身份验证，可以使用以下参数：

| 参数项                    | 默认值                 | 环境变量 | 描述               |
| ------------------------- | ---------------------- | -------- | ------------------ |
| `--username` (简称: `-U`) | 你当前的操作系统用户名 | `PGUSER` | 数据库用户的名称。 |

例如，如果要从具有以下 [连接字符串](../core/connectors/postgresql.md) 的 PostgerSQL 数据库中导出数据：

```
postgresql://opnmyfngbknppm:XXX@ec2-46-137-91-216.eu-west-1.compute.amazonaws.com:5432/d50rgmkqi2ipus
```

你可以使用以下 `pg_dump` 命令:

```
pg_dump --host ec2-46-137-91-216.eu-west-1.compute.amazonaws.com --port 5432 --user opnmyfngbknppm d50rgmkqi2ipus > heroku_backup.sql
```

请注意，**此命令将触发提示，提示你需要为提供的用户指定密码**。

#### 控制输出

在某些情况下，你可能不想 dump 整个数据库，例如，你可能希望：

- 仅 dump 实际数据，但不包括 [DDL](https://www.postgresql.org/docs/8.4/ddl.html) (即，定义数据库 schema (如 `CREATE TABLE`，...的 SQL 语句等)
- 仅 dump DDL，但排除实际数据
- 排除特定的 PostgreSQL schema
- 排除大文件
- 排除特殊表

以下是在这些情况下可以使用的一些命令行选项的概述：

| 参数项                         | 默认值                                                                  | 描述                                                                            |
| ------------------------------ | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `--data-only` (简称: `-a`)     | `false`                                                                 | 排除任何 [DDL](https://www.postgresql.org/docs/8.4/ddl.html) 语句，仅导出数据。 |
| `--schema-only` (简称: `-s`)   | `false`                                                                 | 排除数据并仅导出 [DDL](https://www.postgresql.org/docs/8.4/ddl.html) 语句。     |
| `--blobs` (简称: `-b`)         | 除非指定 `-schema`, `--table`, 或仅 `--schema-only` 选项，否则为 `true` | 包括二进制大对象。                                                              |
| `--no-blobs` (简称: `-B`)      | `false`                                                                 | 排除二进制大对象。                                                              |
| `--table` (简称: `-t`)         | 默认包含所有表                                                          | 明确指定要 dump 的表的名称。                                                    |
| `--exclude-table` (简称: `-T`) | -                                                                       | 从 dump 中排除特定的表。                                                        |

## 从 SQL 文件导入数据

使用 SQL Dump 将 PostgreSQL 数据库导出为 SQL 文件后，你可以通过将 SQL 文件输入到 [`psql`](https://www.postgresql.org/docs/9.3/app-psql.html):

```
psql DB_NAME < INPUT_FILE
```

你需要将 `DB_NAME` 和 `INPUT_FILE` 占位符替换为以下各项的相应值：

- 你的 **数据库名称** (必须是一个已经创建成功的数据库名称！)
- 目标 **输入文件** 的名称(可能以 `.sql` 结尾)

要预先创建数据库 `DB_NAME` ，可以使用 [`template0`](https://www.postgresql.org/docs/9.5/manage-ag-templatedbs.html) (这将创建一个不包含任何站点本地添加内容的普通用户数据库):

```sql
CREATE DATABASE dbname TEMPLATE template0;
```
