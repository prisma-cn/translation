---
title: Prisma CLI&配置文件
description: 本章介绍了Prisma CLI&配置文件,能够对开发prisma的工作流起到一个清晰的认知
keywords:
  - Prisma CLI
  - prisma
  - Prisma config
---

### 使用 Prisma CLI

Prisma 的命令行界面(CLI)是部署和管理你的 Prisma services 的主要工具。

Prisma CLI 可以在以下地方帮助你:

- 为新 services 生成服务配置文件
- 部署 services 到 Prisma 的*服务器*
- 生成认证令牌 token
- 导入种子数据，导入和导出数据
- ...云服务等更多

获取有关所有的 CLI 命令的相关详细信息，请参阅下文**命令参考**

### 安装

Prisma CLI 可从[NPM]安装(https://docs.npmjs.com/misc/registry)。

#### NPM

```
cnpm install -g prisma

```

#### Yarn

```
yarn global add prisma
```

### Synopsis

```

# PRISMA

#

# GraphQL Database Gateway (https://www.prisma.io)

#

# Usage: prisma COMMAND

#

# Service:

# init Initialize a new service

# deploy Deploy service changes (or new service)

# introspect Introspect database schema(s) of service

# info Display service information (endpoints, cluster, ...)

# token Create a new service token

# list List all deployed services

# delete Delete an existing service

#

# Data workflows:

# playground Open service endpoints in GraphQL Playground

# seed Seed a service with data specified in the prisma.yml

# import Import data into a service

# export Export service data to local file

# reset Reset the stage data

#

# Cloud:

# login Login or signup to the Prisma Cloud

# logout Logout from Prisma Cloud

# console Open Prisma Console in browser

# account Display account information

#

# Use prisma help [command] for more information about a command.

# Docs can be found here: https://bit.ly/prisma-cli-commands

#

# Examples:

#

# - Initialize files for a new Prisma service

# prisma init

#

# - Deploy service changes (or new service)

# prisma deploy

```

### 快速开始

一旦安装，执行下面的命令，让你的 Prisma API 跑起来，并开始发送 Query 和 Mutation 给它:

```
prisma init hello-world
# 按part1示例
cd hello-world
prisma deploy
prisma playground
```

### `graphql-config`用法

Prisma CLI 与[`graphql-config`]集成(https://github.com/prismagraphql/graphql-config)。如果你的项目使用了`.graphqlconfig`文件，你可以使用`prisma`扩展，它指向你的 prisma.yml:

```yaml
projects:
prisma:
schemaPath: prisma.graphql
extensions:
prisma: prisma.yml
```

### 使用 HTTP 代理的 CLI

Prisma CLI 支持[定制 HTTP 代理(https://github.com/graphcool/prisma/issues/618)。在企业防火墙后面时，这一点尤为重要。

要激活代理，所提供的环境变量`HTTP_PROXY`和`HTTPS_PROXY`。该行为非常类似于如何[`npm` handles this](https://docs.npmjs.com/misc/config#https-proxy)。

可以提供以下环境变量:

- `HTTP_PROXY`或`http_proxy`:HTTP 流量代理 URL，例如通过`http://localhost:8080`
- `HTTPS_PROXY`或`https_proxy`:为 HTTPS 流量代理 URL，例如`的https://localhost:8080`
- `NO_PROXY`或`no_proxy`:要禁用某些 URL 的代理，请为'NO_PROXY`提供glob，例如`\*`。

为了得到一个简单的本地代理，则可以使用[`proxy`模块](https://www.npmjs.com/package/proxy):

```
npm install -g proxy
DEBUG="*" proxy -p 8080
HTTP_PROXY=http://localhost:8080 HTTPS_PROXY=https://localhost:8080 prisma deploy

```

### PRISMA INIT

起新 Prisma services 的服务配置。该命令将通过默认启动交互式 CLI 向导，帮助你决定在何处部署(即哪个 Prisma 服务器)。

如果你已经知道端点，则可以使用该--endpointflags 传递它并跳过交互式向导。

生成的文件有:

- prisma.yml
- datamodel.prisma
- docker-compose.yml(可选)

如果你提供一个目录名作为参数传递给命令，生成的文件将被放置在该名称的新目录中。

#### Flags

```
-e, --endpoint The endpoint to be written into prisma.yml

```

#### 用法

```
prisma init DIRNAME

```

#### 例子

**在一个叫做'myapp`的目录使用向导创建 Prisma services 服务配置**

```
prisma init myapp

```

**跳过向导，并在一个叫`myapp`目录创建 Prisma services 服务配置**

```
prisma init myapp --endpoint http://localhost:4466/myapp/dev

```

### prisma deploy

部署服务配置到服务器。

每当你改变服务配置的时候，你需要将这些变化与运行的 Prisma services 同步。

在第一次部署服务时，如果提供 prisma.yml 的`seed`属性，命令将执行初始数据导入。你可以通过传递`--no-seed`选项防止这一点。

如果 endpoint 在 prisma.yml 中未指定任何属性，则该命令将提示你以交互方式选择 Prisma 服务器作为服务的部署目标。选择 Prisma 服务器后，CLI 会将 endpointprisma.yml 写入未来部署的默认设置。要再次调出交互式提示，只需 endpoint 手动从 prisma.yml 中删除该属性或传递--new 参数。

#### 用法

```
prisma deploy [flags]

```

#### flags

```
-d，--dry                 干跑执行部署
-e，--env-file ENV-FILE   注入ENV的.ENV文件路径
-f，--force               强制deploy，接受由数据更改造成的数据丢失
-j，--json                JSON输出
-n，--new                 强制交互模式来选择集群
-w，--watch               监视更改
--no-seed                 禁止种子数据导入
```

#### 例子

**部署当前目录服务配置**

```
prisma deploy

```

**部署服务和交互式选择 Prisma 服务器作为部署目标**:

```
prisma deploy --new
```

**在`.env.prod`指定的环境变量部署服务**

```
prisma deploy --env-file .env.prod

```

### prisma generate

在调用`prisma.yml`指定的*generators*。可用生成器是:

以下生成器内置到 Prisma CLI:

- Prisma client in JavaScript: `javascript-client`
- Prisma client in TypeScript: `typescript-client`
- Prisma client in Flow: `flow-client`
- Prisma client in Go: `go-client`
- GraphQL schema of the Prisma API: `graphql-schema`

#### 用法

```
prisma generate [flags]
```

#### flags

```
 -e, --env-file ENV-FILE    Path to .env file to inject env vars
```

#### 例子

**生成 TypeScript client 并将生成的文件存储在`./generated/prisma`**

`prisma.yml`:

```yaml
generate: - generator: typescript-client
output: ./generated/prisma

```

```
prisma generate

```

**Go client 和 GraphQL schema 并存储生成的文件在`./generated/prisma`**

`prisma.yml`:

```yaml
generate: - generator: go-client
output: ./generated/prisma - generator: graphql-schema
output: ./generated/prisma

```

```
prisma generate

```

### prisma introspect

由现有数据库的模式*introspecting*创建一个数据模型。

该命令启动交互式向导，要求你提供你的数据库连接的详细信息:

- **Host**: The host of your Database server, e.g. `localhost`.
- **Port**: The port where your Database server listens, e.g. `5432`.
- **User & Password**: The credentials for your Database server.
- **Name of existing _database_**: The name of the Database _database_.
- **Use SSL (Yes/No)**: If your database connection is using SSL, you need to select `Yes`, otherwise `No`.
- **Name of existing _schema_**: The name of the Database _schema_, e.g. `public`.

#### 用法

```
prisma introspect

```

#### 例子

**Introspect 现有的数据库**

```sh
prisma introspect

```

这里是通过向导提供的数据库连接细节:

```

# ? What kind of database do you want to introspect? Postgres

# ? Enter database host localhost

# ? Enter database port 5432

# ? Enter database user prisma

# ? Enter database password ****

# ? Enter name of existing database prisma-db

# ? Enter name of existing schema public

#

# Introspecting database 402ms

# Created datamodel mapping based on 7 database tables.

#

# Created 1 new file:

#

# datamodel-[TIMESTAMP].graphql GraphQL SDL-based datamodel (derived from existing database)

```

所生成的数据模型文件将包含时间戳的名称，以避免重写现有的`datamodel.prisma`文件。

### prisma info

显示服务信息:

- 服务名称
- 服务版本
- API 端点(HTTP 和的 WebSocket)

#### 用法

```

prisma info

```

#### flags

```

-e, --env-file ENV-FILE Path to .env file to inject env vars
-j, --json JSON Output
-s, --secret Print secret in JSON output (requires --json option)

```

#### 例子

**打印关于当前服务的信息**

```

prisma info

```

**打印有关 JSON 当前服务信息**

```

prisma info --json

```

**打印有关 JSON 当前服务信息，包括服务密码**

```

prisma info --json --secret

```

> 提供两个`--json`和`--secret`flags 的时，服务密码才会打印。

### prisma token

生成一个新的 service token。service token 是用[JWT](https://jwt.io)与 service token 签名加密的。

#### 用法

```

prisma token [flags]

```

#### flags

```

-c, --copy Copy token to clipboard
-e, --env-file ENV-FILE Path to .env file to inject env vars

```

#### 例子

**打印 service toke**

```

prisma token

```

**复制 service toke 到剪贴板**

```

prisma token --copy

```

### prisma list

列出所有部署的服务。

#### 用法

```sh
prisma list

```

#### 例子

**列出所有部署的服务**

```sh
prisma list

```

#### prisma delete

从 Prisma 服务器删除的其上运行现有服务。

这个命令需要在 Prisma services 的根目录中执行。

#### 用法

```sh
prisma delete [flags]

```

#### flags

```
-e, --env-file ENV-FILE Path to .env file to inject env vars
-f, --force Force delete, without confirmation

```

#### 例子

**删除现有的服务(与确认提示)**

```sh
prisma delete

```

**删除现有的服务(没有确认提示)**

```sh
prisma delete --force

```

### prisma playground

打开一个[GraphQL Playground](https://github.com/prismagraphql/graphql-playground)用于当前的服务。

默认情况下，这将打开 Playground 的*Desktop version*(如果已安装)。基于浏览器的 Playground 可以通过传递`--web`flags 被打开。

Playground 运行在`3000`端口上。

#### 用法

```sh
prisma playground [flags]

```

#### flags

```

--dotenv DOTENV Path to .env file to inject env vars
-w, --web Open browser-based Playground

```

#### 例子

**打开 Playground(桌面版本，如果已安装)**

```sh
prisma playground

```

**打开 Playground(基于浏览器的版本)**

```sh
prisma playground --web

```

### prisma seed

服务的种子数据。

此命令需要在 prisma.yml 中[`seed`]属性已设置。

##### 用法

```sh
prisma seed [flags]

```

##### flags

```
-e, --env-file ENV-FILE Path to .env file to inject env vars
-r, --reset Reset the service before seeding

```

##### 例子

**与初始数据种子**

```sh
prisma seed

```

**删除所有服务的数据后先初始数据种子**

```sh
prisma seed --reset

```

### `prisma import`

将数据导入到你的 Prisma services 的数据库。

数据需要根据[归一化数据格式](#归一化数据格式)进行格式化。欲了解更多信息，请阅读[数据导入和导出]。

#### 用法

```sh
prisma import [flags]

```

#### flags

```

-d, --data PATH (required) Path to zip or directory with import data (NDF)
-e, --env-file ENV-FILE Path to .env file to inject env vars

```

### `prisma export`

导出你的业务数据到本地的 zip 目录。欲了解更多信息，请阅读[数据导入和导出]。

#### 用法

```sh
prisma export [flags]

```

#### flags

```
-e, --env-file ENV-FILE Path to .env file to inject env vars
-p, --path PATH Path to export .zip file

```

#### 例子

**导出数据到默认名称(`export-<timestamp>.zip`)文件**

```sh
prisma export

```

**数据导出到文件称为`mydata.zip` **

```sh
prisma export --path mydata.zip

```

### prisma reset

删除所有业务数据。

#### 用法

```sh
prisma reset

```

#### flags

```

-e, --env-file ENV-FILE Path to .env file to inject env vars
-f, --force Force reset data without confirmation

```

#### 例子

**删除所有服务的数据(确认提示)。**

```sh
prisma reset

```

**删除所有服务的数据(没有确认提示)。**

```sh
prisma reset --force

```

### prisma login

与[Prisma cloud](https://www.prisma.io/cloud)进行认证。

该命令打开[Prisma cloud 端控制台](https://app.prisma.io/)，你需要注册或登录。

在浏览器中成功认证后，CLI 写入`cloudSessionKey`到`〜/.prisma/config.yml`。从那里，它被用于通过对 Prisma cloud CLI 所做的所有后续请求。

请注意，不仅是通过`--key`flags 提供你的云会话密钥，你还可以设置`PRISMA_CLOUD_SESSION_KEY`环境变量，这在 CI 的环境中尤其有用。

#### 用法

```sh
prisma login [flags]

```

#### flags

```
-k, --key KEY Cloud session key

```

#### 例子

**与 Prisma cloud 验证(打开浏览器)**

```sh
prisma login

```

**通过手动传递云会话密钥与 Prisma cloud 验证**

```sh
prisma login --key KEY

```

> 在上面的命令中，`KEY`需要与你的有效的云会话密钥的值来代替。你可以在`〜/.prisma/config.yml`了`cloudSessionKey`。

### prisma logout

从[Prisma cloud](https://www.prisma.io/cloud)注销。

这个命令只是从`〜/.prisma/config.yml`删除`cloudSessionKey`。

#### 用法

```sh
prisma logout

```

#### 例子

**登录 Prisma cloud 出**

```sh
prisma logout

```

### prisma console

在浏览器中打开[Prisma cloud 端控制台](https://app.prisma.io/)。

#### 用法

```sh
prisma console

```

#### 例子

**打开 Prisma cloud 端控制台在浏览器**

```sh
prisma console

```

### prisma account

显示当前帐户[Prisma cloud](https://www.prisma.io/cloud)(基于`〜/.prisma/config.yml`的`cloudSessionKey`)的信息。

显示的信息包括:

- 用户名
- 电子邮件地址

#### 用法

```sh
prisma account

```

#### 例子

**Prisma cloud 用户显示帐户信息**

```sh
prisma account

```

### prisma.yml

prisma.yml 为 Prisma services 的配置*根 *文件。每个 Prisma services 由一个 prisma.yml 定义。你可以认为 prisma.yml 是一个 Prisma services 的*地基*。

prisma.yml 指定了许多有关 Prisma services 的属性，例如:

- 服务的*endpoint*(包括*name*和*stage*)
- 如何以及在何处生成 Prisma client
- *Service secret*用于验证服务的 API 的请求
- *datamodel*文件的位置(一个或多个)
- *hooks*指定 shell 命令在*deployment 过程中*哪些点要被执行

### 例子

#### 最小示例

有效的 prisma.yml 至少包含两个属性:

- `datamodel`
- `endpoint`

为了能够指定一个`endpoint`，你需要访问 Prisma 服务器。如果你没有 Prisma 服务器，在这种情况下，CLI 向导将引导你完成创建本地 Prisma 服务器的过程或可以部署 Prisma cloud 的 Demo Servers。然后为你提供的服务被部署之前将`endpoint`写入到 prisma.yml:

```yaml
datamodel: datamodel.prisma
```

/

#### 标准的例子

在 prisma.yml 最常用的属性是:

- `datamodel`
- `endpoint`
- `secret`
- `hooks`
- `generate`

下面是具有这些特性的标准 prisma.yml:

```yaml
datamodel: datamodel.prisma
endpoint: http://localhost:4466/myservice/dev
secret: mysecret42
generate:
  - generator: javascript-client
    output: ./generated/prisma
hooks:
  post-deploy:
    - prisma generate
```

#### 全部示例

这里就是展示 prisma.yml 所有属性的例子:

```yaml
#该服务是基于这两个文件类型定义
#databasetypes.graphql 和 database/enums.graphql
datamodel:

- database/types.graphql
- database/enums.graphql
  #endpoint 代表了你的 Prisma API 的 HTTP endpoint。 #它表示了几条信息:
  #-*Prisma 服务器('localhost:4466'在这个例子中)
  #-*服务名称('myservice'在这个例子中)
  #-*阶段('dev'在这个例子中) #注:服务名称和阶段被设置为'default'时，他们可被省略。 #http://myserver.com/default/default可以写成http://myserver.com。
  endpoint: http://localhost:4466/myservice/dev #密码用于创建 JSON Web Token(JWTs)。这些令牌需要在 Prisma 的 endpoint 发出的 HTTP 请求加上'Authorization'头。 #警告:如果不提供密码，在 Prisma API 可以无需验证访问!
  secret: mysecret123 #生成一个 JavaScript Prisma client 并储存在 output 指定的目录
  generate: - generator: javascript-client
  output: ./generated/prisma #在部署时执行命令生成 Prisma client
  hooks:
  post-deploy: - prisma generate #这个服务有一个事件 Subscriptions 配置。相应的 Subscriptions 查询位于'database/subscriptions/welcomeEmail.graphql'。 #当 Subscriptions 被触发，指定'webhook'经由 HTTP 调用。
  subscriptions:
  sendWelcomeEmail:
  query: database/subscriptions/sendWelcomeEmail.graphql
  webhook:
  url: https://${self:custom.serverlessEndpoint}/sendWelcomeEmail
  headers:
  Authorization: ${env:MY_ENDPOINT_SECRET} #初次部署时会用该文件中的数据导入种子数据
  seed:
  import: database/seed.graphql #此服务只定义了一个自定义变量，是'subscription'的'webhook'引用地址
  custom:
  serverlessEndpoint: https://bcdeaxokbj.execute-api.eu-west-1.amazonaws.com/dev

```

该 prisma.yml 定义的目录结构:

```
.
│ .graphqlconfig
├── prisma.yml
└── database
├── subscriptions
│ └── welcomeEmail.graphql
├── types.graphql
└── enums.graphql

```

### 使用变量

变量允许你动态地更换你的 prisma.yml 配置值。当为你服务设置*secrets*时特别有用的，或者在多个开发人员共同开发时。

要使用 prisma.yml 变量，需要引用括在'{}'括号内的值:

```yaml
yamlKeyXYZ: ${variableSource}
```

一个*variable source*可以是以下两种:

- 自引用值
- 环境变量

> 你只能在属性值中使用变量- 而不是在属性键中。因此，你无法使用变量来例如在自定义资源部分中生成动态逻辑 ID。

#### 递归自引用

你可以递归引用同一 prisma.yml 文件中的其他属性值。

使用递归自引用作为变量时，放入括号中的值由以下内容组成：

- 前缀 self:
- (可选)引用属性的路径 ; 如果未指定路径，则变量的值将是整个 YAML 文件。

```yaml
subscriptions:
  sendWelcomeEmail:
    query: database/subscriptions/sendWelcomeEmail.graphql
    webhook:
      url: https://${self:custom.serverlessEndpoint}/sendWelcomeEmail
custom:
  serverlessEndpoint: example.org
```

> 这适用于 prisma.yml 内任何属性，不只是`custom`。

#### 环境变量

你可以在 prisma.yml 中引用[环境变量](https://en.wikipedia.org/wiki/Environment_variable)。

使用环境变量时，放入括号中的值由以下内容组成：

- 前缀 env:
- 环境变量的*name*

在以下示例中，引用了一个环境变量来指定 webhook 的 URL 和身份验证令牌：

```yaml
subscriptions:
sendWelcomeEmail:
query: database/subscriptions/sendWelcomeEmail.graphql
webhook:
url: https://example.org/sendWelcomeEmail
headers:
Authorization: ${env:MY_TOKEN}
```

### 参考

#### 根属性

服务定义文件 prisma.yml 具有以下根属性:

- `datamodel`(必需):数据库模型，关系，枚举和其他类型的类型定义。
- `endpoint`:HTTP endpoint 的 Prisma API。可以省略 CLI 部署向导。
- `secret`:用于固定 API endpoint 的服务密码。
- `hooks`:定义 CLI 命令之前/Prisma CLI 的特定动作之后执行。
- `subscriptions`:订阅 webhooks 的配置。
- `seed`:指向包含种子数据的 Mutation 文件。
- `custom`:用于提供可在其他地方被 prisma.yml 引用的变量。

prisma.yml 的确切结构是使用 JSON 模式定义的。你可以找到相应的模式定义[这里](https://github.com/prisma/prisma-json-schema/blob/master/src/schema.json)。JSON schem 定义还允许提升你的工具，让你的代码编辑器和 IDE 帮助你完成 prisma.yml 的正确结构。

#### 数据模型(必需)

datamodel 指向.graphql 包含用 GraphQL SDL 编写的模型定义的一个或多个文件的点。如果提供了多个文件，CLI 只会在部署时连接其内容。

##### Type

该 datamodel 属性需要一个字符串或一个字符串列表。

##### 例子

数据模型是在一个名为'types.graphql`文件中定义。

```yaml
datamodel: types.graphql
```

数据模型在称为`types.graphql`和`enums.graphl`的两个文件定义。当服务被部署时，这两个文件的内容将通过 CLI 进行关联。

```yaml
datamodel:
  - types.graphql
  - enums.graphql
```

#### endpoint(可选)

你 Prisma API 的 HTTP 端点由以下几部分组成:

- **Prisma server**:将承载你的 Prisma services 的服务器。
- **Workspace**(仅适用于 Prisma cloudDemo Servers):你通过 Prisma cloud 配置的工作区的名称。
- **Service name**:你 Prisma 的 SERVICE 中的描述性名称。
- **Service stage**:你集群的版本(比如'dev`，`staging`，`prod`)。

请注意，部署 Prisma 服务时 endpoint 实际上是必填的。但是，如果在运行 prisma deploy 之前未在 prisma.yml 中指定它，CLI 会提示你使用向导来帮助你确定 Prisma 服务器作为部署目标，然后将 endpoint 写入 prisma.yml。

##### Type

该`endpoint`属性需要一个字符串。

##### 例子

下面的示例端点编码以下信息:

- **Prisma server**:`HTTP://localhost:4466`意味着你的机器上运行的服务器 Prisma 在本地(例如，使用 docker)。
- **Service name**: `default`
- **Stage**: `default`

> 当服务名称和阶段都被设置为'default`，它们可以被省略。这意味着本实施例中的端点是相当于:`http://localhost:4466/`

```yaml
endpoint: http://localhost:4466/default/default
```

下面的示例端点编码以下信息:

- **Prisma server**:`https://eu1.prisma.sh`意味着你使用的是 Prisma 的 Demo Servers 作为你的 Prisma services 部署目标。
- **Workspace**:jane-doe 是 Prisma Cloud 工作区的名称。
- **Service name**:`myservice`
- **Stage**:`dev`

```yaml
终点:https://eu1.prisma.sh/jane-doe/myservice/dev
```

下面的示例端点编码以下信息:

- **Prisma server**: `http://my-pr-Publi-1GXX8QUZU3T89-413349553.us-east-1.elb.amazonaws.com` 表示你正在使用 AWS 上的 Prisma 服务器来部署你的 Prisma 服务。
- **Service name**: `cat-pictures`
- **Stage**: `prod`

```yaml
endpoint: http://my-pr-Publi-1GXX8QUZU3T89-413349553.us-east-1.elb.amazonaws.com/cat-pictures/prod
```

#### 密码(可选)

所述服务密码被用于生成(或*sign*)认证令牌([JWT](https://jwt.io))。token 需要附加到服务公开的针对 Prisma API 的 HTTP 请求（在 Authorization 头字段中）。

密码必须遵循以下要求:

- 必须是[UTF8](https://en.wikipedia.org/wiki/UTF-8)编码
- 不能包含空格
- 最多 256 个字符

**注意**

如果 Prisma services 部署没有`secret`，其 API 不需要验证。这意味着每个人都可以访问到`endpoint`发送 Query 和 Mutation API，因此可以任意读取和写入数据库!

##### Type

`secret`属性需要一个**字符串**(不是字符串列表)。如果要指定多个密码，你需要为他们提供一个逗号分隔列表(空格被忽略)，但仍然作为一个字符串值。

##### 例子

定义一个密码`moo4ahn3ahb4phein1eingaep`。

```yaml
secret: moo4ahn3ahb4phein1eingaep
```

定义三个密码的值`myFirstSecret`，`SECRET_NUMBER_2`和`3-secret`。需要注意的是第二个密码之前的空格将被忽略。

```yaml
secret: myFirstSecret,    SECRET_NUMBER_2,3rd-secret
```

使用环境变量`MY_SECRET`的密码(一个或多个)的值。

```yaml
secret: ${env:MY_SECRET}
```

#### generate(可选)

`generate`属性用于指定如何以及在何处应该生成 Prisma client(或其他文件)。

以下生成器内置到 Prisma CLI:

- Prisma client in JavaScript: `javascript-client`
- Prisma client in TypeScript: `typescript-client`
- Prisma client in Flow: `flow-client`
- Prisma client in Go: `go-client`
- GraphQL schema of the Prisma API: `graphql-schema`

##### Type

`generate`属性需要一个对象列表。这些对象有两个属性：

- `generator`:从上面的列表中提供的生成器中的其中一个。
- `output`:指定生成的文件应在哪个位置。

##### 例子

```yaml
generate:
  - generator: javascript-client
    output: ./generated/prisma
  - generator: graphql-schema
    output: ./generated/prisma
```

#### hooks(可选)

`hooks`属性用于定义终端命令，这些命令将由 Prisma CLI 在某些命令之前或之后执行。

目前提供以下钩子：

- `post-deploy`:将在命令后调用 prisma deploy

##### Type

该`hooks`属性需要一个对象。该对象的属性与当前可用挂钩的名称匹配。

##### 例子

以下是执行`prisma deploy`后先执行三个命令的例子:

1.打印"Deployment finished" 1.下载在`.graphqlconfig`指定的`db`项目的 GraphQL schema 1.调用代码生成

```yaml
hooks:
post-deploy: - echo "Deployment finished" - graphql get-schema --project db - graphql codegen

```

请注意，此设置假设的`.graphqlconfig`类似这样:

```yaml
projects:
  db:
    schemaPath: generated/prisma.graphql
    extensions:
      prisma: prisma.yml
      codegen:
        - generator: prisma-binding
          language: typescript
          output:
            binding: src/generated/prisma.ts
```

#### Subscriptions(可选)

该`subscriptions`属性用于定义 Prisma 服务的所有订阅 webhook。订阅需要（至少）两条信息：

- 一个*subscription query*定义在哪个事件的函数被调用，Payload 的样子
- 一旦事件发生，其通过 HTTP 调用的*webhook*的网址
- (任选)要附加到发送到 URL 的请求的多个 HTTP header

##### Type

`subscriptions`属性需要一个具有以下属性的**对象**:

- `query`(必需):该文件路径的*subscription query*(存储在一个`.graphql`文件)。
- `webhook`(必需):有关要调用的 webhook 的信息（URL 和可选的 HTTP header）。如果没有 header，你可以直接向此属性提供 URL（请参阅下面的第一个示例）。否则，webhook 需要另一个对象的 url 和 headers（见下文第二示例）。

##### 例子

没有指定的 HTTP 头的一个 Subscriptions。

```yaml
subscriptions:
sendWelcomeEmail:
query: database/subscriptions/sendWelcomeEmail.graphql
webhook: https://bcdeaxokbj.execute-api.eu-west-1.amazonaws.com/dev/sendWelcomeEmail
```

`

指定一个 Subscriptions 事件有两个 HTTP header。

```yaml
subscriptions:
  sendWelcomeEmail:
    query: database/subscriptions/sendWelcomeEmail.graphql
    webhook:
      url: https://bcdeaxokbj.execute-api.eu-west-1.amazonaws.com/dev/sendWelcomeEmail
      headers:
        Authorization: ${env:MY_SECRET}
        Content-Type: application/json
```

#### seed(可选)

填充数据库初始数据，测试数据的标准方法。

##### Type

`seed`属性需要一个**对象**，具有以下两个子属性之一：

- `import`:导入数据的说明。你可以参考两种文件中的任何一种：
  - .graphql 具有 GraphQL 操作的文件的路径。
  - .zip 包含规范化数据格式（NDF）中的数据集的文件的路径
- `run`:导入时将要执行的 Shell 命令。这适用于未涵盖的更复杂的 seed 设置的 import。

首次部署服务时(除非使用上`PRISMA deploy`的`--no-seed`flags 明确禁用)seed 被隐式执行。

##### 例子

含有 Mutation 的`.graphql`文件:

```yaml
seed:
import: database/seed.graphql
```

与 NDF 数据集的`.zip`文件:

```yaml
seed:
  import: database/backup.zip
```

seed 时运行节点脚本:

```yaml
seed:
run: node script.js
```

#### 自定义(可选)

该`custom`属性用于指定你想在你的 prisma.yml 其他地方重用值的任何种类。因此，它没有一个预定义的结构。可以参考使用与[`self`可变源]的变量，例如:`${self:custom.myVariable}`。

##### Type

该`custom`属性需要一个**对象**。没有关于物体的形状假设。

##### 例子

定义两个自定义值，并在事件 Subscriptions 的定义中重用他们。

```yaml
custom:
  serverlessEndpoint: https://bcdeaxokbj.execute-api.eu-west-1.amazonaws.com/dev
  subscriptionQueries: database/subscriptions/
subscriptions:
  sendWelcomeEmail:
    query: ${self:custom.subscriptionQueries}/sendWelcomeEmail.graphql
    webhook: https://${self:custom.serverlessEndpoint}/sendWelcomeEmail
```

### 数据导入

要导入的数据需要遵循规范化数据格式（NDF）。截至今天，必须手动执行从任何具体数据源（如 MySQL，MongoDB 或 Firebase）到 NDF 的转换。在未来，该 Prisma 的 CLI 将支持直接从这些数据源导入。

下面是数据导入过程的概述:

```
+--------------+ +----------------+ +------------+
| +--------------+ | | | |
| | | | | | | |
| | SQL | | (1) transform | NDF | (2) chunked upload | Prisma |
| | MongoDB | | +--------------> | | +-------------------> | |
| | JSON | | | | | |
| | | | | | | |
+--------------+ | +----------------+ +------------+
+--------------+

```

如上所述，步骤 1 必须手动执行。然后，可以使用原始导入 API 或 prisma importCLI 中的命令来完成步骤 2 。

> 要在 CLI 中查看支持的转换的当前状态并提交所需的转换，你可以查看[这个](https://github.com/prisma/prisma/issues/1410)GitHub 的讨论。

当用 NDF 格式上传文件，你需要将导入数据拆分提供三个不同*种类的*文件:

- `nodes`:数据单个节点(即数据库记录)
- `lists`:数据节点的列表
- `relations`:数据的关系节点

你可以为每种类型上传无限数量的文件，但建议每个文件最多 1 MB。否则你可能会遇到超时。

#### 重要注意事项

##### 一般约束

导入数据时，所述`id`字段最多 25 个字符。

##### 幂等

请注意，导入操作不是幂等的。这意味着运行导入始终会向你的服务添加数据。它永远不会更新现有节点。这意味着多次导入相同的数据集将导致未知的错误。

例如，导入节点具有相同`id`多次将导致不确定的行为，并有可能弄挂掉你的服务!

##### 数据验证

[导入 API]不执行对数据的任何验证检查。当使用[CLI]导入数据时，将执行基本验证检查。

导入无效的数据会导致不确定的行为，并可能会破坏你服务!作为服务的维护者，你有责任确保导入数据的有效性。

**提示**:导入时确保有效数据的一种好方法是检查具有相同数据模型的服务上先前导出的数据。

#### 使用 CLI 导入数据

Prisma CLI 提供了`PRISMA import`命令。它接受一个选项:

- `--data`(简写:`-d`):包含要导入数据的目录的文件路径（可以是常规文件或压缩文件）

在底层，CLI 使用下一节中描述的导入 API。但是，使用 CLI 提供了一些主要好处：

- 一次上传多个文件（而不是必须单独上传每个文件）
- 利用 CLI 的身份验证机制（即你无需手动发送身份验证令牌）
- 能够暂停和恢复正在进行的导入
- 从 MySQL，MongoDB 或 Firebase 等各种数据源导入（尚不可用）

##### 输入格式

使用 CLI 导入数据时，包含 NDF 中数据的文件需要位于其类型后调用的目录中：nodes，lists 和 relations。

NDF 文件是遵循特定结构的 JSON 文件，因此每个包含导入数据的文件都需要后缀.json。当放置在各自的目录（nodes，lists 或 relations）中时，.json-files 需要逐步编号，从 1 开始，例如 1.json。文件名可以添加任意数量的零，例如 01.json 或 0000001.json。

##### 实例

考虑定义一个 Prisma services 下列文件结构:

```
.
├── data
│   ├── lists
│   │   ├── 0001.json
│   │   ├── 0002.json
│   │   └── 0003.json
│   ├── nodes
│   │   ├── 0001.json
│   │   └── 0002.json
│   └── relations
│       └── 0001.json
├── datamodel.prisma
└── prisma.yml
```

`data`包含文件中要导入的数据。此外，在`.json`结尾的文件都秉承 NDF。从这些文件中导入数据，你可以简单地在终端运行下面的命令:

```sh
prisma import --data data

```

#### 使用原始导入 API 进行数据导入

原始导入 API 在 HTTP 端点的`/import`路径下公开。例如：

- `http://localhost:4466/my-app/dev/import`
- `https://eu1.prisma.sh/my-app/prod/import`

一个请求可以上传最多 10 MB 大小的 JSON 数据（在 NDF 中）。请注意，你需要在请求的 HTTP 标头中提供 Authorization 身份验证令牌！

下面是一个例子`curl`命令上传一些 JSON 数据(NDF 类型的`nodes`):

```sh
curl 'http://localhost:4466/my-app/dev/import' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE1MTM1OTQzMTEsImV4cCI6MTU0NTEzMDMxMSwiYXVkIjasd3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsIkdpdmVuTmFtZSI6IkpvaG5ueSIsIlN1cm5hbWUiOiJSb2NrZXQiLCJFbWFpbCI6Impyb2NrZXRAZXhhbXBsZS5jb20iLCJSb2xlIjpbIk1hbmFnZXIiLCJQcm9qZWN0IEFkbWluaXN0cmF0b3IiXX0.L7DwH7vIfTSmuwfxBI82D64DlgoLBLXOwR5iMjZ_7nI' \
-d '{"valueType":"nodes","values":[{"_typeName":"Model0","id":"0","a":"test","b":0,"createdAt":"2017-11-29 14:35:13"},{"_typeName":"Model1","id":"1","a":"test","b":1},{"_typeName":"Model2","id":"2","a":"test","b":2,"createdAt":"2017-11-29 14:35:13"},{"_typeName":"Model0","id":"3","a":"test","b":3},{"_typeName":"Model3","id":"4","a":"test","b":4,"createdAt":"2017-11-29 14:35:13","updatedAt":"2017-11-29 14:35:13"},{"_typeName":"Model3","id":"5","a":"test","b":5},{"_typeName":"Model3","id":"6","a":"test","b":6},{"_typeName":"Model4","id":"7"},{"_typeName":"Model4","id":"8","string":"test","int":4,"boolean":true,"dateTime":"1015-11-29 14:35:13","float":13.333,"createdAt":"2017-11-29 14:35:13","updatedAt":"2017-11-29 14:35:13"},{"_typeName":"Model5","id":"9","string":"test","int":4,"boolean":true,"dateTime":"1015-11-29 14:35:13","float":13.333,"createdAt":"2017-11-29 14:35:13","updatedAt":"2017-11-29 14:35:13"}]}' \
-sSv
```

对于`curl`(使用占位符)的通用版本将如下所示:

```sh
curl '**SERVICE_ENDPOINT**/import' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer **JWT_AUTH_TOKEN**' \
-d '{"valueType":"**NDF_TYPE**","values": **DATA** }' \
-sSv

```

### 数据导出

可以使用 CLI 或原始导出 API 导出数据。在这两种情况下，下载的数据都以 JSON 格式化，并遵循规范化数据格式（NDF）。由于导出的数据位于 NDF 中，因此可以直接将其导入具有相同模式的服务。当服务需要测试数据时，例如在 dev 阶段中，这可能是有用的。

#### 使用 CLI 导出数据

Prisma CLI 提供了`prisma export`命令。它接受两个选项:

- `--env-file`(简写:`-e`):导出环境变量

- `--path`(简写: `-p`):指向.zip 目录的文件路径，该目录将由 CLI 创建并存储导出的数据

在底层，CLI 使用下一节中描述的导出 API。但是，使用 CLI 提供了一些主要好处：

- **CLI 的身份验证机制**(即你不需要手动发送你的 token)
- **直接下载数据到文件系统**
- **光标管理**以防需要多个请求来导出所有应用程序数据(手动这样做时你需要发送多个请求，并调整记录位置)

##### 输出格式

以 NDF 格式执行数据导出，将被放置在被不同类型的 NDF 格式命名的三个目录:`nodes`，`lists`和`relations`。

#### 使用原始导出 API 进行数据导出

原始导出 API 在服务的 HTTP 端点的路径`/export`下公开。例如：

- `http://localhost:4466/my-app/dev/export`
- `https://database.prisma.sh/my-app/prod/export`

一个请求可以下载最大 10 MB 的 JSON 数据（在 NDF 中）。请注意，你需要在请求的 HTTP header 的 Authorization 中提供身份验证令牌！

端点需要一个 POST 请求，其中正文为 JSON，其中包含以下内容：

```json
{
  "fileType": "nodes",
  "cursor": {
    "table": 0,
    "row": 0,
    "field": 0,
    "array": 0
  }
}
```

`cursor`描述了数据库中应从何处导出数据的偏移量。请注意，导出请求的每个响应都将返回一个具有以下两种状态之一的新游标：

- Terminated (_not full_): 如果`table`所有的值，`row`，`field`和`array`返回为`-1`这意味着出口已完成。
- Non-terminated (\__full_): 如果对于任何`table`，`row`，`field`或`array`是与`-1`不同的值的，这意味着 10 个 MB 用于该响应的最大尺寸已经到达。如果发生这种情况，你可以使用返回`cursor`值作为输入你的下一个 export 的参数。

##### 实例

下面是一个`curl`命令上传一些 JSON 数据(NDF 类型`nodes`)的例子:

```sh
curl 'http://localhost:4466/my-app/dev/export' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE1MTM1OTQzMTEsImV4cCI6MTU0NTEzMDMxMSwiYXVkIjasd3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsIkdpdmVuTmFtZSI6IkpvaG5ueSIsIlN1cm5hbWUiOiJSb2NrZXQiLCJFbWFpbCI6Impyb2NrZXRAZXhhbXBsZS5jb20iLCJSb2xlIjpbIk1hbmFnZXIiLCJQcm9qZWN0IEFkbWluaXN0cmF0b3IiXX0.L7DwH7vIfTSmuwfxBI82D64DlgoLBLXOwR5iMjZ_7nI' \
-d '{"fileType":"nodes","cursor":{"table":0,"row":0,"field":0,"array":0}}' \
-sSv

```

`curl`(使用占位符)的通用版本将如下所示:

```sh
curl '__SERVICE_ENDPOINT__/export' \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer __JWT_AUTH_TOKEN__' \
-d '{"fileType":"__NDF_TYPE__","cursor": {"table":__TABLE__,"row":__ROW__,"field":__FIELD__,"array":__ARRAY__}} }' \
-sSv
```

### 规范化数据格式

规范化数据格式（NDF）用作 Prisma 服务中导入和导出的中间数据格式。NDF 描述了 JSON 的特定结构。

#### NDF 值类型

当使用 NDF，数据会拆分三个不同的"值类型":

- **Nodes**: Contains data for the _scalar fields_ of nodes
- **Lists**: Contains data for _list fields_ of nodes
- **Relations**: Contains data to connect two nodes via a relation by their _relation fields_

#### 结构

在 NDF JSON 文档的结构是具有以下两个键的对象:

- `valueType`:表示文档中数据的值类型（可以是"nodes"，"lists"或者"relations"）
- `values`:包含作为数组的实际数据（遵循值类型）

在下面的例子都是基于这个数据模型:

```graphql
type User {
  id: String! @unique
  firstName: String!
  lastName: String!
  hobbies: [String!]! @scalarList(strategy: RELATION)
  partner: User
}
```

##### 节点

如果 valueType 是"nodes"，则 values 数组内对象的结构如下：

```javascript
{
"valueType": "nodes",
"values": [
{ "_typeName": STRING, "id": STRING, "<scalarField1>": ANY, "<scalarField2>": ANY, ..., "<scalarFieldN>": ANY },
...
]
}

```

该符号表示的字段`_typeName`和`id`都是字符串类型的。`_typeName`是指从你的数据模型的 SDL 类型的名称。在`<scalarFieldX>`-placeholders 将是 SDL 类型的字段的名称。

例如，下面的 JSON 文档可用于导入两个`User`节点的标量值:

```json
{
  "valueType": "nodes",
  "values": [
    { "_typeName": "User", "id": "johndoe", "firstName": "John", "lastName": "Doe" },
    { "_typeName": "User", "id": "sarahdoe", "firstName": "Sarah", "lastName": "Doe" }
  ]
}
```

##### Lists

如果 valueType 是"lists"，则 values 数组内对象的结构如下：

```javascript
{
  "valueType": "lists",
  "values": [
    { "\_typeName": STRING, "id": STRING, "<scalarListField>": [ANY] },
    ...
  ]
}
```

该符号表示的字段`_typeName`和`id`都是字符串类型的。`_typeName`是指你的数据模型的 SDL 类型的名称。在`<scalarListField>`-placeholder 是那个 SDL 类型的列表中的字段名称。需要注意的是对比的是标量 list 字段，每个对象只能有一个字段。

例如，下面的 JSON 文档可以用于导入值两个`User`节点的`hobbies`列表字段:

```json
{
  "valueType": "lists",
  "values": [
    { "_typeName": "User", "id": "johndoe", "hobbies": ["Fishing", "Cooking"] },
    { "_typeName": "User", "id": "sarahdoe", "hobbies": ["Biking", "Coding"] }
  ]
}
```

##### relations

如果 valueType 是"relations"，则 values 数组内对象的结构如下：

```javascript
{
"valueType": "relations",
"values": [
[
{ "_typeName": STRING, "id": STRING, "fieldName": STRING },
{ "_typeName": STRING, "id": STRING, "fieldName": STRING }
],
...
]
}
```

该符号表示的字段`_typeName`，`id`和`fieldName`都是字符串类型的。

`_typeName`是指从你的数据模型的 SDL 类型的名称。在`<relationField>`-placeholder 是那个 SDL 类型的关系字段的名称。由于关系数据的目标是通过关系连接两个节点，因此 values 数组中的每个元素本身都是一对（写成一个总是包含两个元素的数组），而不是像"nodes"和的情况那样的单个对象"lists"。

例如，以下 JSON 文档可用于 User 通过 partner 关系字段在两个节点之间创建关系：

```json
{
  "valueType": "relations",
  "values": [
    [
      { "_typeName": "User", "id": "johndoe", "fieldName": "partner" },
      { "_typeName": "User", "id": "sarahdoe", "fieldName": "partner" }
    ]
  ]
}
```

下一节来学习 Prisma Server 部署
