---
title: Prisma Server 部署
description: 本章介绍了Prisma Server 部署,能够学习到如何部署Prisma服务到你的服务器
keywords:
  - Prisma deploy
  - prisma
  - docker compose
---

Prisma services 部署在 *Prisma server*上.

![](/prisma1/images/xMXxsku.png)

本章提供配置，启动，维护和监视 Prisma 服务器所需的所有信息。

### 本地 Prisma 配置

你可以使用 Docker 运行 Prisma 服务的本地实例。

本页介绍如何将 Prisma 与本地数据库实例一起使用。Prisma 服务器和数据库都是通过 Docker 在本地配置的。

### 示例 Docker Compose 设置

#### MySQL

下面的 Docker Compose 文件，配置了两个 Docker 容器:

- `prisma`:容器中运行你的 Prisma 服务器。
- `mysql-db`:容器运行的本地 MySQL 实例，基于[MySQL 的 docker 镜像](https://hub.docker.com/_/mysql/)。

prisma 正在使用 mysql-db 容器作为其数据库。它不是通过 IP 地址或 URL 引用数据库 host，而是简单地将 mysql-db 镜像作为数据库引用 host：

```yaml
version: '3'
services:
prisma:
image: prismagraphql/prisma:1.34
restart: always
ports: - "4466:4466"
environment:
PRISMA_CONFIG: |
managementApiSecret: my-server-secret-123
port: 4466
databases:
default:
connector: mysql
migrations: true
host: mysql-db
port: 3306
user: root
password: prisma
mysql-db:
image: mysql:5.7
restart: always
environment:
MYSQL_ROOT_PASSWORD: prisma
volumes: - mysql:/var/lib/mysql
volumes:
mysql:

```

#### Postgres

下面的 Docker Compose 文件，配置了两个 Docker 容器:

- `prisma`:容器中运行你的 Prisma 服务器。
- `postgres-db`:容器运行的本地 postgres 实例，基于[postgres 多克尔图像]上(https://hub.docker.com/_/postgres/)。

`prisma`使用`postgres-db`容器作为数据库。它不是通过 IP 地址或 URL 引用数据库 host，而是简单地将 postgres-db 镜像作为数据库引用 host：

```yaml
version: '3'
services:
  prisma:
    image: prismagraphql/prisma:1.34
    restart: always
    ports:
      - '4466:4466'
    environment:
      PRISMA_CONFIG: |
        port: 4466
        managementApiSecret: mysecret42
        databases:
          default:
            connector: postgres
            host: postgres-db
            port: 5432
            user: prisma
            password: prisma
            migrations: true
  postgres-db:
    image: postgres
    restart: always
    environment:
      POSTGRES_USER: prisma
      POSTGRES_PASSWORD: prisma
    volumes:
      - postgres:/var/lib/postgresql/data
volumes:
  postgres:
```

#### Mongo

下面的 Docker Compose 文件，配置了两个 Docker 容器:

- `prisma`:容器中运行你的 Prisma 服务器。
- `mongo`:容器运行的本地 mongo 实例，基于[mongo 的 docker 镜像](https://hub.docker.com/_/mongo/)。

prisma 正在使用 mongo 容器作为其数据库。它不是通过 IP 地址或 URL 引用数据库 host，而是简单地将 mongo 镜像作为数据库引用 host：

```yaml
version: '3'
services:
prisma:
image: prismagraphql/prisma:1.34
restart: always
ports: - "4466:4466"
environment:
PRISMA_CONFIG: |
port: 4466 # uncomment the next line and provide the env var PRISMA_MANAGEMENT_API_SECRET=my-secret to activate cluster security # managementApiSecret: my-secret
databases:
default:
connector: mongo
host: mongo
port: 27017
user: prisma
password: prisma
migrations: true
rawAccess: true
mongo:
image: mongo:3.6
restart: always
environment:
MONGO_INITDB_ROOT_USERNAME: prisma
MONGO_INITDB_ROOT_PASSWORD: prisma
ports: - "27017:27017"
volumes: - mongo:/var/lib/mongo
volumes:
mongo:

```

Mongo 的支持目前为 preview，其定义和关系数据库有很大不同，如需了解，请阅读[这里](https://www.prisma.io/docs/releases-and-maintenance/releases-and-beta-access/mongodb-preview-b6o5/)

### Management API

Prisma 服务器的 Management API 用于部署和管理服务器上运行的 Prisma 服务。它可以通过`/management`路径获得，例如`http://localhost:4466/management`。

### API 参考

Management API 公开以下操作（你可以在此处找到 Management API 的完整 GraphQL 架构）。[链接](https://gist.github.com/nikolasburk/a1421fc218f00b6f552cc455ae309af0))。

```graphql
type Query {
  """
  Shows the status of the next migration in line to be applied to the project.
  If no such migration exists, it shows the last applied migration.
  """
  migrationStatus(name: String!, stage: String!): Migration!
  """
  Shows all projects the caller has access to.
  """
  listProjects: [Project!]!
  """
  Shows all migrations for the project. Debug query, will likely be removed in the future.
  """
  listMigrations(name: String!, stage: String!): [Migration!]!
  """
  Gets a project by name and stage.
  """
  project(name: String!, stage: String!): Project!
  """
  Information about the server
  """
  serverInfo: ServerInfo!
  """
  generates a token for the given project
  """
  generateProjectToken(name: String!, stage: String!): String!
}
type Mutation {
  deploy(input: DeployInput!): DeployPayload
  addProject(input: AddProjectInput!): AddProjectPayload
  deleteProject(input: DeleteProjectInput!): DeleteProjectPayload
  setCloudSecret(input: SetCloudSecretInput!): SetCloudSecretPayload
}
```

**注意**

由于遗留原因，Management API 目前使用过时的术语来引用某些 Prisma 概念。最重要的是，**Prisma services**称为**projects**（例如 listProjects），**Prisma servers**在 API 术语中称为**clusters**。

### 身份验证和安全

一旦启动并运行，Prisma 服务器主要通过 Management API 使用。本页介绍了如何保护 Management API 并保护 Prisma 服务器免受不必要的请求的影响。

### Management API 的密码

为了确保只有授权的用户能够通过管理 API 来执行操作，它需要一个*secret*保护。这个密码被称为**Management API secret**。

Management API 密钥在你用于配置 Prisma 服务器的 Docker Compose 文件中设置。它是 PRISMA_CONFIG 环境变量的一部分，并通过 management Api Secret 密钥指定：

```

version: '3'
services:
prisma:
image: prismagraphql/prisma:**LATEST_PRISMA_VERSION**
restart: always
ports: - "4466:4466"
environment:
PRISMA_CONFIG: |
managementApiSecret: **YOUR_PRISMA_MANAGEMENT_API_SECRET**
port: **YOUR_PRISMA_SERVER_PORT**
databases:
default:
connector: **YOUR_DATABASE_CONNECTOR**
migrations: **ENABLE_DB_MIGRATIONS**
host: **YOUR_DATABASE_HOST**
port: **YOUR_DATABASE_PORT**
user: **YOUR_DATABASE_USER**
password: **YOUR_DATABASE_PASSWORD**

```

**注意**

如果 Prisma 服务器的 Docker 配置不包含 management Api Secret，则每个有权访问 Prisma 服务器 URL 的人都可以向其发出任意请求。这包括部署和删除 Prisma 服务以及修改数据。

### Management API token

service toke 遵守[JSON Web Token](https://jwt.io/)(JWT)规范([RFC 7519](https://tools.ietf.org/html/rfc7519)):

一个 JWT 有以下三个部分组成:

- **header**头:通常由两部分组成：令牌的类型，即 JWT 使用的散列算法（在 Prisma 服务令牌的环境下为 HS256）。

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

- **Payload**:包含声明。声明是关于实体（通常是用户）和其他数据的声明。以下是修改调用 demo 部署到 dev 服务的权限时的样子：

```json
{
  "grants": [
    {
      "target": "demo/dev",
      "action": "*"
    }
  ],
  "iat": 1532956915,
  "exp": 1690744915
}
```

- **Signature**签名:签名用于验证消息在此过程中未被更改。要创建签名部分，你必须采用编码 header，编码的 payload，secret，标头中指定的算法，并对其进行签名。例如，如果要使用 HMAC SHA256 算法，将按以下方式创建签名：

```javascript
HMACSHA256(base64UrlEncode(header) + '.' + base64UrlEncode(payload), secret);
```

因此，JWT 通常如下所示： xxxxx.yyyyy.zzzzz

> 了解 JWTs [这里](https://jwt.io/introduction/)。

#### Claims

所述 JWT 必须包含以下的[Claims](https://jwt.io/introduction/#payload):

- **Issued at**: `iat`字段包含一个 Unix 时间戳和当生成所述令牌的确切时间。
- **Expiration date**: `exp`字段包含表示令牌到期日期的 Unix 时间戳。
- **Grants**: 该`grants`字段是具有两个键的对象
- 在`target`字段指定*name*和*stage*指定使用特定操作修改的服务。使用`*/*`通配符来允许 Prisma 服务器上运行的所有服务执行操作。
- 在`action`字段指定允许哪些操作 target。通配符\*允许所有操作。

以下是使用通配符的 JWT 的示例 payload，以允许对所有服务执行所有操作：

```json
{
  "grants": [
    {
      "target": "*/*",
      "action": "*"
    }
  ],
  "iat": 1532956915,
  "exp": 1690744915
}
```

### 对 Management API 进行身份验证

有两种方法可以使用 Management API：

- 使用 Prisma CLI，然后进行实际的 API 请求
- 直接将请求发送到你的 Prisma 服务器的`/management`路径

#### 使用 Prisma CLI

使用 Prisma CLI 来执行 Management API 请求(例如，使用`prisma deploy`)，你无需担心生成 Management API 令牌。CLI 会在每次 API 请求时为你生成它们。因此，CLI 需要知道 Prisma 服务器的 Management API 机密，以便生成 Management API 令牌并验证其请求。

**这就是使用 Prisma CLI 时必须设置环境变量 PRISMA_MANAGEMENT_API_SECRET 的原因。**。

该 CLI 读取来自`PRISMA_MANAGEMENT_API_SECRET`环境变量的密码，并用它来生成 JWT 然后附加到 API 请求。

根据你的 shell，设置环境变量的语法可能会有所不同。标准 Unix shell(linux、mac)使用以下方式设置环境变量：

```

export PRISMA_MANAGEMENT_API_SECRET="my-server-secret-42"

```

#### 直接发送请求

如果要将 HTTP 请求直接发送到 Prisma 服务器的 Management API，则需要生成 JWT 并将其附加到 HTTP 头的 Authorization 字段（前缀 Bearer 和空格）。

**注意**

Prisma CLI 有一个隐藏的帮助器命令，用于生成 Management API 令牌：prisma cluster-token。在运行之前，你需要设置 PRISMA_MANAGEMENT_API_SECRET 环境变量。请注意，此命令未正式记录，可能会更改，恕不另行通知。

### Demo Servers (Prisma Cloud)

Prisma 的 Demo Servers 都在[Prisma cloud](https://www.prisma.io/cloud/)运行 Prisma 服务器。**Demo Servers 的使用是免费的!**

**注意**

> Demo Servers 不能在生产中使用，因为它们受传输速率限制并且在存储方面存在限制。

Prisma 的 Demo Servers 有两种*regions*可供选择:

- 欧盟(爱尔兰)
- 美国西部(俄勒冈)

为了使用 Prisma 的 Demo Servers，你需要在 Prisma cloud 登录。

### Service endpoints

部署到 Prisma Demo 服务器的 Prisma 服务的端点与在“常规”Prisma 服务器上运行的服务的端点略有不同。

部署到 Prisma Demo 服务器的服务在其 URL 中有一个额外的路径组件（前缀为服务的名称和阶段），即 Prisma Cloud 工作区的名称。

以下面的端点为例： `https://eu1.prisma.sh/jane-doe/myservice/dev`

此端点对有关服务的以下信息进行编码：

- `eu1.prisma.sh`:该服务被部署到*EU*区域。(*US*区域使用`us1.prisma.sh`)。
- `jane-doe`:在 Prisma cloud 工作区的名称。
- `myservice`:该服务的名称。
- `dev`:服务版本。

### 使用

目标用户:

- 测试原型
- 学习
- 没有明显的用户群的个人项目

### 限制

#### 速率限制

Prisma 的 Demo Servers 是速率限制为**每 10 秒可发生 10 个请求**(平均)。

如果超过这个速度，请求被排队在内存中。如果队列超过 25 个请求，立即返回一个错误。

header 字段 throttled-by 包含在 HTTP 响应中。它表示请求因节流而延迟了多长时间（以毫秒为单位）。

#### 存储

在 Demo Servers 上运行的服务 Prisma 的存储容量的上限是 100MB。

### 认证

#### 登录

用 Demo Servers 部署 Prisma services 之前，Prisma CLI 需要与 Prisma cloud 进行身份验证。

要用 CLI 登录到 Prisma cloud，使用下面的命令:

```

prisma login

```

此命令会打开需要提供你的 Prisma cloud 凭据的浏览器窗口。如果凭据有效，则 CLI 在`〜/.prisma/config.yml`为`cloudSessionKey`生成 Prisma cloud token，并将其存储。

此 token 在后续请求用于对 Demo Servers 进行身份验证。

#### 退出登录

从 Prisma CLI 注销，使用`PRISMA logout`命令。它只是从`〜/.prisma/config.yml`删除`cloudSessionKey`。

### 价钱

FREE

### Database Connector (MySQL)

数据库连接器是 Prisma 的和底层数据库之间的*link*。

MySQL 的连接器用于将一个 Prisma 服务器连接到[MySQL 的](https://www.mysql.com/)数据库。

数据库连接器的核心是:

- 翻译传入 GraphQL 查询到 SQL 语句
- 根据查询结果生成返回数据
- 执行数据库迁移 Migrations(可选)

使用 Docker 配置 Prisma 服务器时，需要指定要使用哪个连接器才能连接到某个数据库。你可以通过 connector 属性提供此信息：

```yaml
PRISMA_CONFIG: |
managementApiSecret: **YOUR_PRISMA_MANAGEMENT_API_SECRET**
port: 4466
databases:
default:
connector: mysql
migrations: **ENABLE_DB_MIGRATIONS**
host: **YOUR_DATABASE_HOST**
port: **YOUR_DATABASE_PORT**
user: **YOUR_DATABASE_USER**
password: **YOUR_DATABASE_PASSWORD**
connectionLimit: **YOUR_CONNECTION_LIMIT**

```

### 迁移 Migrations

在`PRISMA_CONFIG`环境变量`migrations`属性指定的数据库连接器是否能够更改基础数据库模式。

对于现有的数据库(生产环境)，将 Prisma 服务器配置为不迁移已连接的数据库很有用。这可确保你不会意外地引入不需要的架构更改或丢失数据。

```yaml
PRISMA_CONFIG: |
managementApiSecret: **YOUR_PRISMA_MANAGEMENT_API_SECRET**
port: 4466
databases:
default:
connector: postgres
migrations: false
host: **YOUR_DATABASE_HOST**
port: **YOUR_DATABASE_PORT**
user: **YOUR_DATABASE_USER**
password: **YOUR_DATABASE_PASSWORD**

```

#### 数据库迁移

##### 通过 Prisma 启用迁移

如果`migrations`被设置为 TRUE;则部署 Prisma 服务将改变已连接数据库的结构。在这些情况下，Prisma CLI 将是基于服务的数据模型管理数据库结构的主要接口：

```yaml
PRISMA_CONFIG: |
managementApiSecret: **YOUR_PRISMA_MANAGEMENT_API_SECRET**
port: 4466
databases:
default:
connector: postgres
migrations: true
host: **YOUR_DATABASE_HOST**
port: **YOUR_DATABASE_PORT**
user: **YOUR_DATABASE_USER**
password: **YOUR_DATABASE_PASSWORD**

```

##### 禁用 Prisma 迁移

如果`migrations`设置为`FALSE`，数据库架构被"锁定"，Prisma 将不对其执行任何修改:

```yaml
PRISMA_CONFIG: |
managementApiSecret: **YOUR_PRISMA_MANAGEMENT_API_SECRET**
port: 4466
databases:
default:
connector: postgres
migrations: false
host: **YOUR_DATABASE_HOST**
port: **YOUR_DATABASE_PORT**
user: **YOUR_DATABASE_USER**
password: **YOUR_DATABASE_PASSWORD**

```

### 管理数据库连接

PRISMA_CONFIG 中的 connectionLimit 属性定义 Prisma 服务将使用的数据库连接数。

**注意**

`connectionLimit`需要至少被设定为**2**。始终为 Management API 保留一个连接，所有其他连接用于 Prisma 服务。

### Database Connector

使用 Docker 配置 Prisma 服务器时，需要指定要使用哪个连接器才能连接到某个数据库。你可以通过 connector 属性提供此信息：

```yaml
PRISMA_CONFIG: |
managementApiSecret: **YOUR_PRISMA_MANAGEMENT_API_SECRET**
port: 4466
databases:
default:
connector: mysql | postgres | mongo
migrations: **ENABLE_DB_MIGRATIONS**
host: **YOUR_DATABASE_HOST**
port: **YOUR_DATABASE_PORT**
user: **YOUR_DATABASE_USER**
password: **YOUR_DATABASE_PASSWORD**
connectionLimit: **YOUR_CONNECTION_LIMIT**

```

#### 迁移示例

```yaml
PRISMA_CONFIG: |
managementApiSecret: **YOUR_PRISMA_MANAGEMENT_API_SECRET**
port: 4466
databases:
default:
connector: postgres
migrations: **ENABLE_DB_MIGRATIONS**
host: **YOUR_DATABASE_HOST**
port: **YOUR_DATABASE_PORT**
user: **YOUR_DATABASE_USER**
password: **YOUR_DATABASE_PASSWORD**
connectionLimit: **YOUR_CONNECTION_LIMIT**
```

### Channels & Releases

发布版本可让你使用不同的 Prisma 版本。如果你想在正式发布之前测试新功能，这可能会有所帮助。

有三种*channels*:**stable**, **beta**, **alpha**

> 了解更多关于**Prisma 的发布过程**[这里](https://www.prisma.io/blog/improving-prismas-release-process-yaey8deiwaex/)。

#### Stable

始终运行在生产服务器上的稳定版本。在稳定频道发布遵循双周节奏，相比测试只包括非常小的改动。这可确保版本中的功能组合已在 beta 上进行了全面测试。

#### Beta

测试版版本上的功能经过测试，在最终版本发布之前不太可能发生变化。测试版频道是尝试新功能并在稳定版本中提供反馈之前提供反馈的绝佳方式。

#### Αlpha

alpha 版本非常适合希望尽早尝试新功能的贡献者和开发人员。alpha 版本上的功能尚未经过全面测试，在将它们包含在稳定版本中之前可能会发生重大变化。

### 使用 alpha 和 beta 版本

稳定的版本是你 Prisma 的所做的一切默认。无论是安装 Prisma CLI 还是拉动最新的 Docker 镜像，你都可以下载最新的稳定版本。

要使用 Alpha 和 Beta 版本，请按照下面列出的步骤操作。

#### 测试版

##### Prisma CLI

使用 CNPM 安装**Beta**Prisma CLI:

```sh
cnpm install -g prisma@beta
```

##### Docker image

你可以在 Docker Hub 上找到最新的 beta 镜像，或者在使用 Docker CLI 时使用**VERSION**-beta 标记（**VERSION**是你要定位的 Prisma 版本的占位符）：

```

docker pull prismagraphql/prisma:1.34-beta

```

#### Αlpha

使用 CNPM 安装 Prisma CLI 的 alpha 版本：

##### Prisma CLI

```sh
cnpm install -g prisma@alpha

```

##### Docker image

```

docker pull prismagraphql/prisma:1.34-alpha

```

### 完整的 docker-compose 配置属性示例：

```yaml
version: '3'
services:
  prisma:
    image: prismagraphql/prisma:**LATEST_PRISMA_VERSION**
    restart: always
    ports: - "4466:4466"
    environment:
      PRISMA*CONFIG: |
        managementApiSecret: **YOUR_MANAGEMENT_API_SECRET**
        port: **YOUR_PRISMA_SERVER_PORT**
        databases:
        default:
        connector: **YOUR_DATABASE_CONNECTOR**
        migrations: **ENABLE_DB_MIGRATIONS**是否可以改变数据库表结构
        host: **YOUR_DATABASE_HOST**
        port: **YOUR_DATABASE_PORT**
        user: **YOUR_DATABASE_USER**
        password: **YOUR_DATABASE_PASSWORD**
        connectionLimit: **YOUR_CONNECTION_LIMIT**连接数限制
        database: \_DATABASE_NAME*默认为 prisma
        ssl: *true OR false*是否启用 ssl 连接数据库
```

下一节是一些 Prisma 项目的例子
