---
title: Prisma Client JS 生成器
description: 本章为Prisma 2 核心组件文档目录
author: wsafight
author_url: https://github.com/wsafight
author_title: Prisma 爱好者
---

Prisma Client JS 生成器可以在 [Prisma schema 文件](../../prisma-schema-file.md)中设置，生成 Node.js 和 TypeScript 的 Prisma 数据库客户端。这是介绍 Prisma Client JS 的 [API 文档](../../prisma-client-js/api.md) 。

## Node.js 版本要求

`prisma-client-js` 生成器生成的数据访问代码以 ES2016 为目标，这意味着你需要 [Node.js 10.x](https://nodejs.org/en/download/releases/) 或更高版本才可以使用。

## 给 Prisma Client JS 指定运行平台

Prisma Client JS 依赖于与应用程序一起运行的查询引擎二进制文件。将基于 Prisma 的应用程序部署到生产环境中时，需要确保 Prisma Client JS 使用的二进制文件可以在生产环境中运行，即，它必须与部署提供程序的运行时兼容。

当你执行 `prisma2 generate` 时将会下载查询引擎二进制文件，然后会和生成的 Prisma Client JS 代码一起存储在 `node_modules/@prisma` 中(或者你指定的 [自定义 outpot 路径下](../../prisma-client-js/codegen-and-node-setup.md))。本节会说明如何设置 `prisma generate` 执行时下载哪个二进制文件来兼容环境。

你可以在[规范中](https://github.com/prisma/specs/blob/master/binaries/Readme.md)阅读有关此主题的更多信息。

### 术语

**平台**是指代码运行的机器环境。其中包括类似于 Serverless，函数计算，容器等部署服务环境和 Mac OS 、Linux、 Windows 等操作系统。总的来说平台代表一个运行时环境，包括操作系统的具体版本和运行时可用的已安装软件包等等。

### 生成器选项

要确定运行 Prisma Client JS 的平台，可以为 `prisma-client-js` 生成器提供两个选项。

| 名称            | 必需 | 描述                                                                                                                                                          | 目的                               |
| --------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `binaryTargets` | 不是 | 应用程序所需的二进制文件名称的数组： 二进制文件的 _文件路径_, [可用的二进制文件](#可用的二进制文件)包名 _或者_ 特殊值 `"native"`。 **默认是**: `["native"]`。 | 以声明的方式下载所需的二进制文件。 |

如果 `binaryTargets` 包含二进制文件的 _文件路径_ ，则需要通过环境变量提供二进制文件的路径：

- 如果你将自定义二进制文件用于 **查询引擎**（Prisma Client JS），则将其文件路径设置为`PRISMA_QUERY_ENGINE_BINARY` 的环境变量。

- 如果你将自定义二进制文件用于 **迁移引擎**（Prisma Client JS），则将其文件路径设置为`PRISMA_MIGRATION_ENGINE_BINARY` 的环境变量。

### 默认： `native` 平台

当你的 [Prisma schema 文件](../../prisma-schema-file.md)没有指定任何[生成器选项](#生成器选项)时，执行 `prisma2 generate` 时 Prisma CLI 将下载针对当前操作系统的二进制文件。因此以下两配置是相等的。因为 `binaryTargets` 的默认值为 ["native"]

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native"]
}
```

以下代码和上面的**相同**:

```prisma
generator client {
  provider = "prisma-client-js"
}
```

在这两种情况下，当执行 `prisma2 generate` 时， Prisma CLI 都会下载和当前操作系兼容的二进制文件并将其存储在`node_modules` 中。

### 可用的二进制文件

我们提供预先构建好的二进制文件。你可以在[二进制库](https://github.com/prisma/specs/blob/master/binaries/Readme.md#binary-build-targets)中查找。

### 例子

此示例展示了 Prisma Client JS 用于本地环境和 AWS Lambda（node 10）的配置。

```prisma
generator client {
    provider = "prisma-client-js"
    binaryTargets = ["native", "debian-openssl-1.0.x"]
}
```

## 手动编译查询引擎二进制文件

你可以在[此处](https://github.com/prisma/prisma-engine#building-prisma-engines)找到有关手动编译查询引擎二进制文件的说明。

## 例子

要调用生成器，你需要在 schema 文件中添加 [`generator`](../../prisma-schema-file.md#generators-optional) 块，并指定 provider 为 `prisma-client-js`：

```prisma
generator client {
  provider = "prisma-client-js"
}

// ... 文件还应该包含数据模型定义和(可选的)生成器
```

添加后，你可以使用以下命令来调用生成器

```
prisma2 generate
```

然后它将 Prisma Client JS 生成的 API 存储在目录默认位置`node_modules/@prisma/client` 中。了解有关[自动生成的 Prisma Client JS API](../../prisma-client-js/api.md) 的信息。

## 数据模型中的映射类型

Prisma Client JS 生成器提供了以下从数据模型[标量类型](../../data-modeling.md#scalar-types)到 JavaScript/TypeScript 类型的映射：

| 类型       | JS / TS   |
| ---------- | --------- |
| `String`   | `string`  |
| `Boolean`  | `boolean` |
| `Int`      | `number`  |
| `Float`    | `number`  |
| `DateTime` | `Date`    |

## 保留模型名称

根据你的[数据模型定义](./data-modeling.md#data-model-definition)生成 Prisma Client JS 时，有许多保留名称无法用于模型。这里是保留名称的列表：

- `String`
- `Int`
- `Float`
- `Subscription`
- `DateTime`
- `WhereInput`
- `IDFilter`
- `StringFilter`
