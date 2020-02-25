# 使用 MySQL 导入和导出数据

本文档介绍了如何从 MySQL 数据库导出数据或将数据导入 MySQL 数据库。您可以在官方 [MySQL docs](https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html) 中了解有关此主题的更多信息。

## 使用 `mysqldump` 导出数据

[`mysqldump`](https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html) 是本机 MySQL 命令行实用程序，可用于从 MySQL 数据库导出数据。要查看该命令的所有选项，请运行 `mysqldump --help`。

请注意，默认情况下，您的 [MySQL 安装](https://dev.mysql.com/doc/refman/8.0/en/installing.html) 后带有 `mysqldump` 命令，Mac OS 上通常包含在 `/usr/local/mysql/bin` 目录中 。这意味着您可以通过指向该目录 `/usr/local/mysql/bin/mysqldump` 或 [将其添加到 `PATH`](https://stackoverflow.com/questions/30990488/how-do-i-install-command-line-mysql-client-on-mac＃answer-35338119)，以便您无需指定目录就可以运行 `mysqldump`。

引用 MySQL 文档：


> `mysqldump` 客户端实用程序执行逻辑备份，生成一组 SQL 语句，可以执行这些语句来重现原始的数据库对象定义和表数据。它转储一个或多个 MySQL 数据库以进行备份或转移到另一台 SQL 服务器。 `mysqldump` 命令还可以生成 CSV，其他定义文本或 XML 格式的输出。

该命令如下所示：

```psql
mysqldump DB_NAME > OUTPUT_FILE
```

您需要将 `DB_NAME` 和 `OUTPUT_FILE` 占位符替换为以下各项的相应值：

- 您的 **数据库名称**
- 所需的 **输出文件** 的名称(应以 `.sql` 结尾)

例如，要将数据从本地 MySQL 服务器中名为 `mydb` 的数据库导出到名为 `mydb.sql` 的文件，可以使用以下命令：
```
mysqldump mydb > mydb.sql
```

#### 提供数据库凭证

您可以添加以下参数来指定 MySQL 数据库服务器的位置：


| 参数项 | 默认值 | 描述 |  
| --- | --- | --- |
| `--host` (简称: `-h`) | `localhost` | 服务器主机的地址 | 
| `--port` (简称: `-p`) | - | MySQL 服务器正在侦听的服务器主机的端口 | 

要针对 MySQL 数据库服务器进行身份验证，可以使用以下参数：



| 参数项 | 默认值 | 描述 | 
| --- | --- | --- |
| `--user` (简称: `-u`) | - | 数据库用户的名称。| 
| `--password` (简称: `-p`) | - | 触发密码提示。| 


例如，如果要从具有以下 [连接字符串](../core/connectors/mysql.md) 的MySQL数据库中导出数据：

```
mysql://opnmyfngbknppm:XXX@ec2-46-137-91-216.eu-west-1.compute.amazonaws.com:5432/d50rgmkqi2ipus
```


您可以使用以下 `mysqldump` 命令：

```
mysqldump --host ec2-46-137-91-216.eu-west-1.compute.amazonaws.com --port --user opnmyfngbknppm --password d50rgmkqi2ipus > backup.sql
```

请注意，**此命令将触发提示，提示您需要指定用户的密码** 。

#### 控制输出

在某些情况下，您可能不想转储整个数据库，例如，您可能希望：

- 仅转储实际数据，但不包括 [DDL](https://www.postgresql.org/docs/8.4/ddl.html) (即，定义数据库 schema (如 `CREATE TABLE`，...的 SQL 语句等) 
- 仅转储 DDL，但排除实际数据
- 排除特殊表

以下是在这些情况下可以使用的一些命令行选项的概述：

| 参数项 | 默认值 | 描述 |  
| --- | --- | --- |
| `--no-create-db` (简称: `-n`) | `false` | | `--no-create-db` (short: `-n`) | `false` | 排除任何 [DDL](https://www.postgresql.org/docs/8.4/ddl.html) 语句，仅导出数据。| 
| `--no-data` (简称: `-d`) | `false` | 排除数据并仅导出 [DDL](https://www.postgresql.org/docs/8.4/ddl.html) 语句。| 
| `--tables`| 默认包含所有表 | 明确指定要转储的表的名称。 | 
| `--ignore-table` | - | 从转储中排除特定的表。| 


## 从 SQL 文件导入数据


使用 mysqldump 将 MySQL 数据库导出为 SQL 文件后，您可以通过将 SQL 文件输入 [mysql](https://dev.mysql.com/doc/refman/8.0/en/mysql.html) 中来恢复数据库状态：

```
mysql DB_NAME INPUT_FILE
```



请注意，默认情况下，您的 [MySQL安装](https://dev.mysql.com/doc/refman/8.0/en/installing.html) 后带有 `mysql` 命令，Mac OS 上通常包含在 `/usr/local/mysql/bin` 中。这意味着您可以通过指向该目录 `/usr/local/mysql/bin/mysmysqlqldump` 或 [将其添加到 `PATH`](https://stackoverflow.com/questions/30990488/how-do-i-install-command-line-mysql-client-on-mac＃answer-35338119)，以便您无需指定目录即可运行 `mysql` 命令。

您需要将 `DB_NAME` 和 `INPUT_FILE` 占位符替换为以下各项的相应值：


- 您的 **数据库名称** (必须是一个已经创建成功的数据库名称！)
- 目标 **输入文件** 的名称(可能以 `.sql` 结尾)

例如：
```
mysql mydb < mydb.sql
```


要进行身份验证，可以使用上文中的 `--user` 和 `--password` 选项：
```
mysql --user root --password mydb < mydb.sql
```

要预先创建数据库，可以使用以下 SQL 语句：

```sql
CREATE DATABASE mydb;
```



