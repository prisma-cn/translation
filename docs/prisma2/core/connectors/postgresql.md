---
title: Prisma 2 Core PostgreSQL connector
description: 本章为Prisma 2 核心组件 PostgreSql 数据连接器
author: wsafight
author_url: https://github.com/wsafight
author_title: Prisma 爱好者
---

# PostgreSQL 数据源连接器

PostgreSQL 数据源连接器将 Prisma 连接到 PostgreSQL 数据。

## 例子

要连接到 PostgreSQL 数据库服务，您需要在 [schema 文件](../../prisma-schema-file.md)中配置一个 [`datasource` 数据源](../../prisma-schema-file.md#d数据源):

```prisma
datasource postgresql {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ... 文件还应该包含数据模型定义和(可选的)生成器
```

`datasource` 定义如下：

- `provider`: 用 `postgresql` 指定 PostgreSQL 数据源连接器。
- `url`: 指定 PostgreSQL 数据库的[连接字符串](#connection-string)。在这种情况下，我们 [使用环境变量](../../prisma-schema-file.md#使用环境变量) 来提供连接字符串。


可以在配置项 `datasource` 中找到更多信息 [点击这里](../../prisma-schema-file.md#数据源)。

## 数据模型映射

PostgreSQL 连接器将[标量类型](../../data-modeling.md#标量类型)从[数据模型](../../data-modeling.md)映射到原生数据类型，如下所示：


| 数据模型  | PostgreSQL  |
| -------- | --------- | 
| `String`   | `text`      | 
| `Boolean`  | `boolean`   |
| `Int`      | `integer`   |
| `Float`    | `real`      |
| `Datetime` | `timestamp` |

## 连接细节

### 连接字符串

PostgreSQL 提供两种方式的连接字符串：

- 键值对字符串: `host=localhost port=5432 database=mydb connect_timeout=10`
- 连接 URI:
  ```
  postgresql://
  postgresql://localhost
  postgresql://localhost:5433
  postgresql://localhost/mydb
  postgresql://user@localhost
  postgresql://user:secret@localhost
  postgresql://other@localhost/otherdb?connect_timeout=10&application_name=myapp
  postgresql://host1:123,host2:456/somedb?target_session_attrs=any&application_name=myapp
  ```

请参考[官方文档](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)了解更多详细信息。

连接 URI 必须遵循PostgreSQL连接字符串的[正式格式](https://www.postgresql.org/docs/10/libpq-connect.html#id-1.7.3.8.3.6)：

```
postgresql://[user[:password]@][netloc][:port][,...][/database][?param1=value1&...]
```

### 配置选项

- `host`: 数据库服务器的 IP address/domain， e.g. `localhost`.
- `port`: 数据库监听端口， e.g. `5432`。
- `database`: 数据库名称以及目标 schema。 
- `schema`: 目标 schema 名称。 **默认**: `public`.
- `user`: 数据库用户, e.g. `admin`.
- `password`: 数据库用户密码。
- `connection_limit`: 指定限制 Prisma 连接数据库的的最大连接数。 **默认值** 计算公式: `物理 cpu 数量 * 2 + 1`。
- `connect_timeout`: 等待新连接的最大秒数。 **默认**: `5`。 
- `socket_timeout`: 等待单个查询终止的最大秒数。 **默认**: `5`。 

请参阅下一节以了解如何配置SSL连接。

### 配置 SSL 连接

如果你需要在数据库服务连接使用中使用 SSL，可以在连接字符串中添加各种参数，以下是可能使用的参数概述：

- `sslmode=(disable|prefer|require)`: 
  - `prefer` (默认): 尽可能使用 TLS，接受纯文本连接。
  - `disable`: 不使用 TLS。
  - `require`: 必须 TLS 或者在不可能使用 TLS 时失败。
- `sslcert=<PATH>`: 服务器证书的路径。这是数据库服务器用来签署客户端证书的根证书。 如果系统的受信任证书存储中不存在证书，则需要提供此信息。对于 Google Cloud 则类似于 `server-ca.pem`。
- `sslidentity=<PATH>`: 通过客户端证书和密钥创建的PKCS12证书数据库的路径。这是PKCS12格式的SSL身份文件，您将使用客户机密钥和客户机证书生成该文件。 它将这两个文件合并为一个文件，并通过密码保护它们（请参阅下一个参数）。.您可以使用以下命令（`openssl`）根据客户端密钥和客户端证书来创建此文件：
    ```
    openssl pkcs12 -export -out client-identity.p12 -inkey client-key.pem -in client-cert.pem
    ```
- `sslpassword=<PASSWORD>`: 用于保护PKCS12文件的密码。 上一步中列出的 `openssl` 命令在创建PKCS12文件时会要求输入密码，您需要在此处提供相同的确认密码。
- `sslaccept=(strict|accept_invalid_certs)`: 
  - `strict`: 证书中的任何缺失值都将导致错误。 对于Google Cloud 来说，如果数据库没有域名，证书可能会丢失 domain/ IP address，造成在连接时错误。
  - `accept_invalid_certs` (默认): 绕过此检查。 请注意该设置的安全后果。

回顾一下，为了创建到数据库的SSL连接，您需要：

- A root [CA](https://docs.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2003/cc778623(v=ws.10)?redirectedfrom=MSDN) file
- A [PKCS12](https://en.wikipedia.org/wiki/PKCS_12) client file
- A [PKCS12](https://en.wikipedia.org/wiki/PKCS_12) password

您的数据库连接 URL 看起来像这样：

```
postgresql://user:password@host?sslidentity=client-identity.p12&sslpassword=mypassword&sslcert=rootca.cert
```

### 通过 sockets 连接

要通过 socket 连接到 PostgreSQL 数据库，必须将 `host` 作为查询参数添加到连接字符串中（而不是将其设置为 URl 一部分）。 然后此参数的值必须指向包含套接字的目录， e.g.: `postgresql://user:password@/database?host=/var/run/postgresql/`. 

在该 [GitHub issue](https://github.com/prisma/prisma2/issues/525) 下可以了解更多。
