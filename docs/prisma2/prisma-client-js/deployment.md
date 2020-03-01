---
title: 部署
description: 本章提供了Prisma Client JS的部署方法
author: Nan Zhao
author_url: https://github.com/znnan
author_image_url: https://avatars0.githubusercontent.com/u/34448143?s=400&u=949ac05ac4184e0f0e1d842aac4575da66d937cc&v=4
author_title: Full Stacker
---

<!-- # Deployment -->

# 部署

<!-- Prisma Client JS depends on a query engine that's running as a binary on the same host as your application. When deploying your Prisma-based application to production, you need to ensure that the binary used by Prisma Client JS can run in your production environment, i.e. it needs to be compatible with the runtime of your deployment provider. -->

Prisma Client JS依赖于作为二进制文件在与应用程序相同的主机上运行的查询引擎。将基于Prisma的应用程序部署到生产中时，需要确保Prisma Client JS使用的二进制文件可以在生产环境中运行，即，它必须与部署提供程序的运行时兼容。

<!-- The query engine binary is downloaded when you run `prisma2 generate`, it is then stored alongside the generated Prisma Client JS code inside `node_modules/@prisma` (or the [custom `output` path](./codegen-and-node-setup.md) you specified). -->

查询引擎二进制文件是在您运行`prisma2 generate`时下载的，然后与生成的Prisma Client JS代码一起存储在`node_modules/@prisma`（或您指定的[自定义`output`路径](./codegen-and-node-setup.md)。

<!-- **IMPORTANT**: To ensure the query engine binary is compatible with your production environment, you have to [specify the right platform for Prisma Client JS](../core/generators/prisma-client-js.md#specifying-the-right-platform-for-prisma-client-js). -->

**重要**：为了确保查询引擎二进制文件与您的生产环境兼容，您必须[指定Prisma Client JS的正确平台](../core/generators/prisma-client-js.md#specifying-the-right-platform-for-prisma-client-js)。

<!-- ## Prisma Client JS in FaaS environment (e.g. AWS Lambda, Netlify, ...) -->

## FaaS环境中的Prisma Client JS（例如AWS Lambda，Netlify等）

<!-- ### Database connection handling -->

### 数据库连接的处理方法

<!-- Nuances around handling database connections in Lambda are not new and most of those nuances also apply to Prisma Client JS. -->

在Lambda中处理数据库连接的细微差别并不是什么新鲜事，其中大多数细微差别也适用于Prisma Client JS。

<!-- Lambda has the concept of [reusing a container](https://aws.amazon.com/blogs/compute/container-reuse-in-lambda/) which means that for subsequent invocations of the same function it may use an already existing container that has the allocated processes, memory, file system (`/tmp` is writable in Lambda), and even DB
connection still available. -->

Lambda具有[重复使用容器](https://aws.amazon.com/blogs/compute/container-reuse-in-lambda/) 的概念，这意味着对于后续调用同样的函数，它可以使用已分配进程，内存，文件系统（在Lambda中可写`/tmp`）的现有容器，甚至已有的数据库连接也仍然可用。

<!-- Any piece of code [outside the handler](https://docs.aws.amazon.com/lambda/latest/dg/programming-model-v2.html) remains initialized. This is a great place for `PrismaClient` to call `connect` or at least call `PrismaClient` constructor so that subsequent invocations can share a connection. There are some implications though that are not directly related to Prisma Client JS but any system that would require a DB connection from Lambda: -->

[handler之外](https://docs.aws.amazon.com/lambda/latest/dg/programming-model-v2.html)的任何代码段都将保持初始化。这是一个很棒的地方，用来使`PrismaClient`调用`connect`或调用`PrismaClient`的构造函数，以便后续调用可以共享连接。尽管存在某些与Prisma Client JS不直接相关的含义，但是任何需要Lambda进行数据库连接的系统都可以：

<!--
| Implication               | Description                                                                                                                                                                                                                                                                                                                           | Potential Solution                                                                                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Container reuse           | It is not guaranteed that subsequent nearby invocations of a function will hit the same container. AWS can choose to create a new container at any time.                                                                                                                                                                              | Code should assume the container to be stateless and create a connection only if it does not exist. Prisma Client JS already implements that logic.                        |
| Zombie connections        | The containers that are marked to be removed and are not being reused still keep a connection open and can stay in that state for some time (unknown and not documented from AWS), this can lead to a sub-optimal utilization of the DB connections                                                                                   | One potential solution is to use a lower idle connection timeout. Another solution can be to clean up the idle connections in a separate service<sup>1, 2</sup>. |
| Connection pooling issues | Concurrent requests might spin up separate containers i.e. new connections. This makes connection pooling a bit difficult to manage because if there is a pool of size N and C concurrent containers, the effective number of connections is N \* C. It is very easy to exhaust `max_connection` limits of the underlying data source | Prisma Client JS does not implement connection pooling right now. This can also be handled by limiting the concurrency levels of a Lambda function.                        |
-->

| 含义 |描述 | 潜在解决方案  |
| ------------------------- | -------------------------------------------- | ---------------------------------------------------------------------- |
| 容器重用| 不能保证随后的某个函数的后续调用将命中相同的容器。 AWS可以随时选择创建一个新容器。| 代码应假定容器是无状态的，并且仅在不存在时才创建连接。 Prisma Client JS已经实现了该逻辑。|
| 僵尸连接 | 标记为已删除且未重用的容器仍保持连接打开状态，并且可以保持该状态一段时间（AWS未知且未记录），这可能导致对数据库连接的利用欠佳 | 一种可能的解决方案是使用较低的空闲连接超时。 另一个解决方案可以是清理单独服务中的空闲连接<sup>1, 2</sup>. |
| 连接池问题 | 并发请求可能会启动单独的容器，即新的连接。 这使得连接池的管理有点困难，因为如果存在一个大小为N和C的并发容器池，则连接的有效数量为N \* C。很容易耗尽基础数据源的`max_connection`限制 | Prisma Client JS现在不实现连接池。这也可以通过限制Lambda函数的并发级别来处理。|

<!--
<br />
<sup>
1. Note that these are recommendations and not best practices. These would vary from system to system.
</sup>
<br />
<sup>
2. <a href="https://github.com/jeremydaly/serverless-mysql"><code>serverless-mysql</code></a> is a library that implements this idea.
</sup>
-->

<br />
<sup>
1.请注意，这些只是建议而非最佳做法。 这些因系统而异。
</sup>
<br />
<sup>
2. <a href="https://github.com/jeremydaly/serverless-mysql"><code>serverless-mysql</code></a>是实现此想法的库。
</sup>

<!-- ### Cold starts -->

### 冷启动

<!-- A serverless function container may be recycled at any point. There is no official documented amount of time on when that happen but running a function warmer does not work, containers are recycled regardless. -->

无服务器功能容器可能随时被回收。没有官方日志记录相应的发生时间，但是运行功能预热器无效，容器无论如何都会被回收。

<!-- ## Examples -->

## 例子

<!-- Here are a number of example projects demonstrating how to deploy Prisma Client JS to various deployment providers: -->

以下是一些示例项目，展示了如何将Prisma Client JS部署到各种部署提供程序：

<!-- - [Google Cloud Functions](https://github.com/prisma/prisma-examples/tree/prisma2/deployment-platforms/google-cloud-functions)
- [Netlify](https://github.com/prisma/prisma-examples/tree/prisma2/deployment-platforms/netlify)
- [Serverless](https://github.com/prisma/prisma-examples/tree/prisma2/deployment-platforms/serverless)
- [Up](https://github.com/prisma/prisma-examples/tree/prisma2/deployment-platforms/up)
- [ZEIT Now](https://github.com/prisma/prisma-examples/tree/prisma2/deployment-platforms/zeit-now) -->

- [Google Cloud Functions](https://github.com/prisma/prisma-examples/tree/prisma2/deployment-platforms/google-cloud-functions)
- [Netlify](https://github.com/prisma/prisma-examples/tree/prisma2/deployment-platforms/netlify)
- [Serverless](https://github.com/prisma/prisma-examples/tree/prisma2/deployment-platforms/serverless)
- [Up](https://github.com/prisma/prisma-examples/tree/prisma2/deployment-platforms/up)
- [ZEIT Now](https://github.com/prisma/prisma-examples/tree/prisma2/deployment-platforms/zeit-now)

<!-- ## Deployment providers -->

## 部署提供商

<!-- ### AWS Lambda -->

### AWS Lambda 

<!-- In order to not exhaust the connection limits of your database, you should set the `connection_limit` parameter of your database connection string in the Prisma schema to `1` when deploying your Prisma-based application to [AWS Lambda](). -->

为了不耗尽数据库的连接限制，在将基于Prisma的应用程序部署到[AWS Lambda]()时，应将Prisma模式中数据库连接字符串的`connection_limit`参数设置为`1`。

<!-- **PostgreSQL** -->

**PostgreSQL**

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?connection_limit=1
```

<!-- **MySQL** -->

**MySQL**

```
mysql://USER:PASSWORD@HOST:PORT/DATABASE?connection_limit=1
```

<!-- Note that depending on your Lambda concurrency limit, you might still exhaust your database's connection limit. This can happen when too many Lambdas are invoked concurrently (i.e. the number of concurrent Lambdas that each hold a DB connection exceeds the connection limit of your database). To prevent this, you should [set your Lambda concurrency limit](https://docs.aws.amazon.com/lambda/latest/dg/configuration-concurrency.html) to number that represents the connection limit of your database. -->

请注意，根据Lambda并发限制，您可能仍然会耗尽数据库的连接限制。当同时调用太多Lambda时（即每个拥有数据库连接的并发Lambda数超过数据库的连接限制），可能会发生这种情况。为了防止这种情况，您应该[设置Lambda并发限制](https://docs.aws.amazon.com/lambda/latest/dg/configuration-concurrency.html)表示数据库连接限制的数字。

<!--
| Instance size | Connection limit |
| :----------- | :------------ |
|   t2.micro    |       77       |
|   t2.small    |      188       |
|   t2.medium   |      403       |
|   t2.large    |      846       |
|   t2.xlarge   |      1733      |
|  t2.2xlarge   |      3508      |
|   m5.large    |      813       |
|   m5.xlarge   |      1681      |
|  m5.2xlarge   |      3419      |
|  m5.4xlarge   |      4990      |
-->

| 实例容量 | 连接数限制 |
| :----------- | :------------ |
|   t2.micro    |       77       |
|   t2.small    |      188       |
|   t2.medium   |      403       |
|   t2.large    |      846       |
|   t2.xlarge   |      1733      |
|  t2.2xlarge   |      3508      |
|   m5.large    |      813       |
|   m5.xlarge   |      1681      |
|  m5.2xlarge   |      3419      |
|  m5.4xlarge   |      4990      |

<!-- This means that if you're e.g. using a `m5.large` PostgreSQL instance, you need to set your Lambda concurrency limit to `813`. -->

这意味着如果您使用`m5.large`的PostgreSQL实例，您需要将Lambda并发限制设置为`813`。

<!-- ### ZEIT Now -->

### ZEIT Now

<!-- You can deploy your Prisma-based application to [ZEIT Now](https://zeit.co/now). -->

您可以将基于Prisma的应用程序部署到[ZEIT Now](https://zeit.co/now)。

<!-- When deploying to ZEIT Now, you must configure the following in your `now.json`: -->

部署到ZEIT Now时，必须在`now.json`中配置以下内容：

<!-- - `use`: `@now/node@canary`
- `maxLambdaSize`: `25mb` -->

- `use`: `@now/node@canary`
- `maxLambdaSize`: `25mb`

<!-- Here is an example `now.json`: -->

以下是`now.json`的示例：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@now/node@canary",
      "config": {
        "maxLambdaSize": "25mb"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "index.js"
    }
  ]
}
```

<!-- You can find an example for a ZEIT Now deployment [here](https://github.com/prisma/prisma-examples/tree/prisma2/deployment-platforms/zeit-now). -->

您可以在[这里](https://github.com/prisma/prisma-examples/tree/prisma2/deployment-platforms/zeit-now)找到ZEIT Now部署的示例。
