---
title: 遥测
description: Prisma 2 遥测，用于收集错误信息提高prisma 2 的软件质量
author: Victor
author_url: https://kangwenchang.com
author_image_url: https://kangwenchang.com/static/favicon/logocorner.png
author_title: Prisma 爱好者
---

术语**遥测**是指收集某些使用情况数据来 _帮助提高软件的质量_。Prisma2 在发生**错误报告**时使用遥测技术。 Prisma 2 在以下两方面使用了遥测:

- 收集使用数据
- 提交错误报告

本页介绍了 Prisma 2 的整体遥测方法，收集了哪些数据以及如何选择不收集数据。

在预览期间，如果发生意外错误，系统将始终提示你是否要提交错误报告，以帮助提高 Prisma 2 库的质量。未经你的明确同意，绝不会发送错误报告，也不会包含任何个人或其他敏感信息。此数据收集的唯一目的是完善 Prisma 2 的开发。

以下是错误报告中不会包含的信息列表：

- 用户凭证（密钥，密码等）
- 数据库连接详细信息（IP，端口，数据库名称等）

## 为什么收集数据?

遥测有助于我们更好地了解有多少用户在使用我们的产品以及他们使用我们的产品的频率。 与许多遥测服务不同，我们的遥测实现有意限制范围，实际上对开发人员有用：

- **范围有限**：我们使用遥测技术回答一个问题：每月有多少活跃的开发人员正在使用 Prisma？
- **提供价值**：我们的遥测服务还会检查版本更新并提供安全通知。

## 数据什么时候被收集?

有以下两种情况会收集数据：

### 使用情况数据

prisma2 CLI 的调用将信息发送到位于https://checkpoint.prisma.io的遥测服务器。 请注意，这种情况最多仅每 48 小时就会发生一次（即，在进行任何调用后，将数据发送到遥测服务器的时间会暂停 48 小时）。

以下是正在提交的数据的概述：

|          Field | Attributes | Description                                                                            |
| -------------: | :--------: | :------------------------------------------------------------------------------------- |
|      `product` |  _string_  | Name of the product (e.g. `prisma`)                                                    |
|      `version` |  _string_  | Currently installed version of the product (e.g. `1.0.0-rc0`)                          |
|         `arch` |  _string_  | Client's operating system architecture (e.g. `amd64`).                                 |
|           `os` |  _string_  | Client's operating system (e.g. `darwin`).                                             |
| `node_version` |  _string_  | Client's node version (e.g. `v12.12.0`).                                               |
|    `signature` |  _string_  | Random, non-identifiable signature UUID (e.g. `91b014df3-9dda-4a27-a8a7-15474fd899f8`) |
|   `user_agent` |  _string_  | User agent of the checkpoint client (e.g. `prisma/js-checkpoint`)                      |
|    `timestamp` |  _string_  | When the request was made in RFC3339 format (e.g. `2019-12-12T17:45:56Z`)              |

You can opt-out of this behaviour by setting the `CHECKPOINT_DISABLE` environment variable to `1`, e.g.:

```bash
export CHECKPOINT_DISABLE=1
```

### 错误报告

在预览期间，可能会根据以下条件收集数据：

- CLI 崩溃
- Prisma Studio 中的崩溃或意外错误

在提交错误报告之前，总是会提示您确认或拒绝错误报告的提交！ 未经您的明确同意，绝不会提交错误报告！

## 如何选择退出数据收集？

### 使用数据

您可以通过将环境变量`CHECKPOINT_DISABLE`设置为 1 来退出使用情况数据收集，例如：

```bash
export CHECKPOINT_DISABLE = 1
```

### 错误报告

您可以通过在响应交互式提示中选择*no*来选择退出数据收集。
