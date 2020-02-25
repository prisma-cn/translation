---
title: Prisma 用 docker 和新数据库初始化
tags: [prisma1]
---

## 目标

在此页面上，你将学习如何：

- 安装 Prisma CLI
- 使用 Docker 设置 Prisma
- 配置 Prisma API
- 生成 Prisma client
- 使用 Prisma client 读取和写入数据

<!--truncate-->

## 安装 Prisma CLI

Prisma CLI 用于各种 Prisma 工作流程。你可以使用[Homebrew](https://brew.sh/)或[NPM](https://www.npmjs.com/)安装它：

```
brew tap prisma/prisma
brew install prisma

```

```
cnpm install -g prisma
```

## 安装 Docker

要在本地使用 Prisma，你需要在计算机上安装[Docker](https://www.docker.com)。如果你还没有 Docker，可以下载适用于你的操作系统的 Docker Community Edition [此处](https://www.docker.com/community-edition)。

> 不想使用 Docker？你现在也可以开始使用[demo database](https://prisma.1wire.com/docs)。

## 设置数据库和 Prisma 服务器

### 创建新目录

```
mkdir hello-world
cd hello-world

```

### 创建 Docker Compose 文件

要在你的计算机上启动 Prisma，你需要一个[Docker Compose 文件](https://docs.docker.com/compose/compose-file/)来配置 Prisma 并指定它可以连接到的数据库。

```
touch docker-compose.yml
```

### 添加 Prisma 和数据库 Docker 镜像

将以下内容粘贴到刚刚创建的 Docker Compose 文件中：

> 你可以随意选择 **MySQL**和 **PostgreSQL**。

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
connector: mysql
host: mysql
port: 3306
user: root
password: prisma
migrations: true
mysql:
image: mysql:5.7
restart: always
environment:
MYSQL_ROOT_PASSWORD: prisma
volumes: - mysql:/var/lib/mysql
volumes:
mysql:
```

```yaml
version: '3'
services:
  prisma:
    image: prismagraphql/prisma:1.33
    restart: always
    ports:
      - '4466:4466'
    environment:
      PRISMA_CONFIG: |
        port: 4466
        databases:
          default:
            connector: postgres
            host: postgres
            port: 5432
            user: prisma
            password: prisma
            migrations: true
  postgres:
    image: postgres:10.5
    restart: always
    environment:
      POSTGRES_USER: prisma
      POSTGRES_PASSWORD: prisma
    volumes:
      - postgres:/var/lib/postgresql/data
volumes:
  postgres:
```

### 启动数据库和 Prisma 服务器

要启动 Prisma 并启动已连接的数据库，请运行以下命令：

```
docker-compose up -d

```

你的本地 Prisma 服务器现在在`http://localhost:4466`上运行。

## 配置你的 Prisma API

要为 Prisma client 引导配置文件，请运行以下命令：

```
prisma init --endpoint http://localhost:4466
```

> `endpoint`需要匹配正在运行的 Prisma 服务器的 URL。

## 部署 Prisma API

`prisma init`命令创建了部署 Prisma API 所需的最基本配置：`prisma.yml`和`datamodel.prisma`。

使用这些配置文件，你现在可以部署 Prisma API：

```
prisma deploy

```

恭喜，你已成功设置 Prisma。你现在可以开始使用 Prisma client 从代码与数据库通信。

## 生成你的 Prisma client

Prisma client 是一个自定义的自定义库，可以连接到你的 Prisma API。将以下行附加到`prisma.yml`的末尾：

```yaml
generate:
  - generator: javascript-client
    output: ./generated/prisma-client/
```

现在使用以下命令生成 client ：

```

prisma generate

```

CLI 现在将你的 Prisma client 存储在`prisma.client`目录中，由`prisma.yml`中所指定。

## 准备节点应用程序

运行以下命令以创建空节点脚本：

```

touch index.js

```

接下来，初始化当前目录中的空 npm 项目并安装所需的依赖项：

```

cnpm init -y
cnpm install --save prisma-client-lib graphql@0.13

```

## 使用 Prisma client 读取和写入数据

现在将以下代码添加到`index.js`并在之后保存：

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

使用以下命令执行：

```
node index.js

```

每当使用该命令运行此脚本时，都会在数据库中创建一个新的用户记录(因为调用了`createUser`)。

随意使用 Prisma client API，并通过将以下代码片段添加到文件(在`main`函数的末尾)并重新执行脚本来尝试以下一些操作：

```javascript
const user = await prisma.user({ id: 'USER ID' });
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
  where: { id: 'USER ID' },
  data: { name: 'Bob' },
});
```

```javascript
const deletedUser = await prisma.deleteUser({ id: 'USER ID' });
```

> 在某些代码段中，你需要将 USER ID 占位符替换为实际用户的 ID。
