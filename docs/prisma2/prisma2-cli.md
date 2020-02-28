---
title: Prisma 2 CLI
description: 本章为Prisma 2 CLI 的命令和使用方式，全面接受CLI终端工具。
author: Victor
author_url: https://kangwenchang.com
author_image_url: https://kangwenchang.com/static/favicon/logocorner.png
author_title: Prisma 爱好者
---

## 安装

Prisma 2 CLI 目前需要 [Node 10](https://nodejs.org/en/download/releases/) (或更高版本的 Node.js).

### 本地安装(推荐)

Prisma 2 CLI 通常是作为**development dependency**安装的，这就是为什么在以下命令中使用`--save-dev`(npm)和`--dev`(Yarn)选项的原因。

#### npm

使用 npm 安装：

```
npm install prisma2 --save-dev
```

执行后`prisma2`会添加到`package.json`中的`devDependencies`中。然后，你可以通过在命令前面添加[`npx`](https://github.com/npm/npx#readme)来调用本地安装的`prisma2` CLI：

```
npx prisma2
```

这是一个调用`generate`命令的例子：

```
npx prisma2 generate
```

#### Yarn

使用 Yarn 安装：

```
yarn add prisma2 --dev
```

执行后`prisma2`会添加到`package.json`中的`devDependencies`中。然后，你可以通过在其前面加上`yarn`来调用本地安装的`prisma2` CLI：

```
yarn prisma2
```

这是一个调用`generate`命令的例子：

```
yarn prisma2 generate
```

### 全局安装

虽然建议[prisma2] CLI 本地安装，但你也可以在计算机上全局安装它。

> **警告**：如果你的计算机上有多个 Prisma 项目，全局安装可能会导致这些项目之间的版本冲突。

#### npm

使用 npm 安装：

```
npm install -g prisma2
```

然后，你可以像下面这样调用全局安装的`prisma2` CLI：

```
prisma2
```

这是一个调用`generate`命令的例子：

```
prisma2 generate
```

#### Yarn

使用 Yarn 安装：

```
yarn global add prisma2
```

然后，你可以像下面这样调用全局安装的`prisma2` CLI：

```
prisma2
```

这是一个调用`generate`命令的例子：

```
prisma2 generate
```

### `postinstall`钩子

安装 Prisma 2 CLI 时，会自动执行[`postinstall`](https://github.com/prisma/prisma2/blob/master/cli/sdk/package.json#L13)钩子。它将下载 Prisma 2 的查询和迁移[引擎二进制文件](https://github.com/prisma/prisma-engine)。查询引擎包含[Prisma schema](./prisma-schema-file.md)解析器，在执行 `prisma2 init` 和 `prisma2 generate` 命令时使用该解析器。执行`prisma2 migration`命令时调用迁移引擎。

## 对 CLI 使用 HTTP 代理

Prisma 2 CLI 支持[自定义 HTTP 代理](https://github.com/prisma/prisma2/issues/506)。在公司防火墙后面或当国内网络有问题时，这尤其重要。

要激活代理，请提供环境变量`HTTP_PROXY` 或 `HTTPS_PROXY`。和[`npm` CLI 处理此问题](https://docs.npmjs.com/misc/config#https-proxy)的方式非常相似。

可以提供以下环境变量：

- `HTTP_PROXY`或`http_proxy`：http 流量的代理 URL，例如`http://localhost:1080`
- `HTTPS_PROXY` 或 `https_proxy`：https 流量的代理 URL，例如 `https://localhost:1080`

> 要获取本地代理，你还可以使用[`proxy`](https://www.npmjs.com/package/proxy)模块：

## 命令

### 设置和开发

#### `prisma2 init`

在当前目录中创建一个`prisma/schema.prisma`文件。请参阅[快速入门](./getting-started/README.md)。

#### `prisma2 generate`

调用 Prisma schema 文件中定义的所有生成器。例如，这将创建 Prisma Client JS 与底层数据库进行交互。在[此处](./prisma-client-js/api.md)了解更多有关 Prisma Client JS 及其功能的信息。

#### `prisma2 introspect`

内省(introspect)数据库并从中生成数据模型。基本上，它分析你(已经存在的)的数据库并自动为你创建 Prisma schema 文件。比较适合你已经有一个现有的应用程序并想开始使用 Prisma 2 的情况。请注意，此命令将根据你的数据库结构同步 Prisma schema 文件。这通常适用于不使用 Prisma Migrate 构建数据库的情况。

### Migrations

> **警告**：Prisma Migrate 目前处于**experimental**状态。当使用任何`prisma2 migrate`命令时，你需要通过`--experimental`参数显式执行该功能，例如`prisma2 migrate save --experimental`。

#### `prisma2 migrate save`

根据数据模型 data model 的更改创建新的迁移 migration。在这种情况下，它会自动记录所有更改(类似于`git diff`)。所有更改仅在本地执行，而会直接改变数据库。但是，迁移记录已经写入数据库的`_Migration` 表中(该表存储了项目的迁移历史记录)。

#### `prisma2 migrate up`

运行尚未应用到数据库的所有迁移 migration。该命令真正执行`prisma2 migrate save`时对数据库的所有更改。

#### `prisma2 migrate down`

此命令将还原数据库迁移，也就是回滚数据库更改。反过来，它会创建“compensation”迁移 migration，从而撤消之前的更改。
