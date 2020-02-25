---
title: Prisma连接已运行数据库
tags: [prisma1]
---

在此页面上，你将学习如何:

- 安装 Prisma CLI
- 使用 Docker 设置 Prisma
- Introspect 现有数据库并派生数据模型
- 使用 datamodel 配置 Prisma API
- 生成 Prisma client
- 使用 Prisma client 读取和写入数据

> 使用 Prisma 连接现有数据库目前仅在使用 **PostgreSQL**数据库时才有效。

<!--truncate-->

## 先决条件

确保手头有数据库的连接详细信息。这包括以下信息:

- **Host**:Postgres 服务器的主机，例如`localhost`。
- **Port**:Postgres 服务器侦听的端口，例如`5432`。
- **User & Password**:Postgres 服务器的凭据。
- **现有*database 的名称***:Postgres *database*的名称。
- **现有*schema 的名称***:Postgres *schema*的名称，例如`public`。

你还需要知道你的数据库服务器是否使用 **SSL**。

## 安装 Prisma CLI

Prisma CLI 用于各种 Prisma 工作流程。你可以使用[Homebrew](https://brew.sh/)或[NPM](https://www.npmjs.com/)安装它:

```
brew tap prisma/prisma
brew install prisma

```

```
npm install -g prisma
```

## 安装 Docker

要在本地使用 Prisma，你需要在计算机上安装[Docker](https://www.docker.com)。如果你还没有 Docker，可以下载适用于你的操作系统的 Docker Community Edition [此处](https://www.docker.com/community-edition)。

> 不想使用 Docker？你现在也可以开始使用[demo database](https://prisma.1wire.com/docs)。

## 设置 Prisma 服务器

### 创建新目录

```
mkdir hello-world
cd hello-world

```

### 创建 Docker Compose 文件

要在你的计算机上启动 Prisma，你需要一个[Docker Compose 文件](https://docs.docker.com/compose/compose-file/)来配置 Prisma 并指定它可以连接到哪个数据库:

```
touch docker-compose.yml
```

### 添加 Prisma Docker 镜像

将以下内容粘贴到刚刚创建的 Docker Compose 文件中:

```yaml
version: '3'
services:
prisma:
image: prismagraphql/prisma:1.33
restart: always
ports: - "4466:4466"
environment:
PRISMA_CONFIG: |
port: 4466
databases:
default:
connector: postgres
host: **YOUR_POSTGRES_HOST**
port: **YOUR_POSTGRES_PORT**
database: **YOUR_POSTGRES_DB**
schema: **YOUR_POSTGRES_SCHEMA**
user: **YOUR_POSTGRES_USER**
password: **YOUR_POSTGRES_PASSWORD**
migrations: false
ssl: **SSL_CONNECTION**
```

### 指定数据库连接

要指定 Prisma 应连接的数据库，请将 Docker Compose 文件中拼写为全大写的占位符替换为数据库的相应值:

- `__YOUR_POSTGRES_HOST__`:Postgres 服务器的主机，例如`localhost`。 (连接到本地数据库时，可能需要使用`host.docker.internal`。)
- `__YOUR_POSTGRES_PORT__`:Postgres 服务器侦听的端口，例如`5432`。
- `__YOUR_POSTGRES_DB__`:Postgres 数据库的名称。
- `__YOUR_POSTGRES_SCHEMA__`:Postgres 架构的名称，例如`public`。
- `__YOUR_POSTGRES_USER__`:数据库用户。
- `__YOUR_POSTGRES_PASSWORD__`:数据库用户的密码。
- `__SSL_CONNECTION__`:数据库服务器是否使用 SSL，可能的值为“true”和“false”。

### 启动 Prisma 服务器

要启动 Prisma 并启动已连接的数据库，请运行以下命令:

```

docker-compose up -d

```

你的本地 Prisma 服务器现在在`http://localhost:4466`上运行。

## 从数据库模式派生 Prisma datamodel

### 创建 prisma.yml

接下来，你需要创建一个`prisma.yml`:

```

touch prisma.yml

```

现在添加以下内容:

```json
endpoint: http://localhost:4466

```

> `endpoint`需要匹配正在运行的 Prisma 服务器的 URL。

### Introspect 数据库

你现在需要内省数据库模式以生成数据模型，这是 Prisma client API 的基础:

```
prisma introspect
```

CLI 生成`datamodel- [TIMESTAMP] .graphql`(例如`datamodel-1533886167692.graphql`)文件，其中包含数据库模式的 SDL 版本。在第一次运行时，它还将`datamodel`属性写入`prisma.yml`。

最后，你需要将文件重命名为`datamodel.prisma`，因为这是你在`prisma.yml`中指定的文件名。

## 部署 Prisma API

你现在可以使用*minimal*设置来部署 Prisma API。运行以下命令(这 **不会**改变数据库中的任何内容):

```
prisma deploy

```

启动 Prisma 服务器可能需要几分钟时间。如果`prisma deploy`命令失败，请等待几分钟再试一次。还运行`docker ps`以确保 Docker 容器实际运行。

## 生成你的 Prisma client

Prisma client 是一个自定义的自定义库，可以连接到你的 Prisma API。将以下行附加到`prisma.yml`的末尾:

```yaml
generate:
  - generator: javascript-client
    output: ./generated/prisma-client/
```

现在使用以下命令生成 client :

```

prisma generate

```

CLI 现在将你的 Prisma client 存储在`prisma. client`目录中，如`prisma.yml`中所指定。

## 准备节点应用程序

运行以下命令以创建空节点脚本:

```

touch index.js

```

接下来，初始化当前目录中的空 NPM 项目并安装所需的依赖项:

```

npm init -y
npm install --save prisma-client-lib graphql@0.13

```

## 使用 Prisma client 读取和写入数据

Prisma client 的 API 操作取决于从数据库内省生成的数据模型。以下示例查询假定数据模型中存在“User”类型，定义如下:

```graphql
type User {
  id: ID! @id
  name: String!
}
```

如果你没有这样的“用户”类型，则需要使用与你的数据模型匹配的类型调整以下代码段。

在`index.js`中添加以下代码并在之后保存:

```javascript
const { prisma } = require('./generated/prisma-client');

async function main() {
  const newUser = await prisma.createUser({ name: 'Alice' });
  console.log('Created new user: ${newUser.name} (ID: ${newUser.id})');
  const allUsers = await prisma.users();
  console.log(allUsers);
}

main().catch(e => console.error(e));
```

使用以下命令执行:

```

node index.js

```

每当使用该命令运行此脚本时，都会在数据库中创建一个新的用户记录(因为调用了`createUser`)。

随意使用 Prisma client API，并通过将以下代码片段添加到文件(在`main`函数的末尾)并重新执行脚本来尝试以下一些操作:

```javascript
const user = await prisma.user({ id: '**USER_ID**' });
```

```javascript
const usersCalledAlice = await prisma.users({
  where: {
    name: 'Alice',
  },
});
```

```javascript
const updatedUser = await prisma.updateUser({
  where: { id: '**USER_ID**' },
  data: { name: 'Bob' },
});
```

```javascript
const deletedUser = await prisma.deleteUser({ id: '**USER_ID**' });
```

> 在某些代码段中，你需要将`__USER__ID__`占位符替换为实际用户的 ID。
