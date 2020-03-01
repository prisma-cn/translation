---
title: Prisma 2 的 schema 文件
description: 这篇从宏观上讲解 Prisma schema 文件组成结构, 还包括注释、环境变量、格式化等相关规则。
author: HaveF
author_url: https://havef.github.io/
author_image_url: https://avatars1.githubusercontent.com/u/54462?s=460&v=4
author_title: 数据分析、机器学习、JS/TS技术爱好者
---

schema 文件 (简称: _schema file_, _Prisma schema_ 或 _schema_) 是 Prisma 的主要配置文件. 它通常叫做 `schema.prisma`, 且由以下部分构成:

- [**数据源**](./data-sources.md): 用来说明 Prisma 如何连接到数据源(例如 PostgreSQL 数据库)
- [**数据模型定义**](./data-modeling.md): 用来说明你的应用程序模型(即每个数据源中数据的形态(shape))
- [**生成器(Generators)**](#generators-optional) (可选): 用来说明基于数据模型生成哪些客户端(比如 Prisma Client JS 这个 javascript 客户端)

当执行 `prisma2` 命令时，CLI 会从 schema 文件中读取内容并进行相关操作，比如:

- `prisma2 generate`: 从 schema 文件中读取 _所有的_ 上述信息，然后生成数据源客户端代码(比如 Prisma Client JS).
- `prisma2 migrate save --experimental`: 读取数据源和数据模型定义，然后进行一次迁移 migration。

在使用 CLI 命令时，你还可以在 schema 文件中[使用环境变量](#使用环境变量)。

## 举例

下面是一个 schema 文件的例子，它指定了一个数据源(SQLite)、一个生成器(Prisma Client JS)和数据模型定义:

```prisma
// schema.prisma

datasource sqlite {
  url      = "file:data.db"
  provider = "sqlite"
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        Int      @id
  createdAt DateTime @default(now())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  post      Post[]
}

model Post {
  id         Int        @id
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
  author     User
  title      String
  published  Boolean    @default(false)
}

enum Role {
  USER
  ADMIN
}
```

## 命名

schema 文件的默认名称是 `schema.prisma`。当你有一个这样的 schema 文件时，Prisma 2 CLI 将在命令调用的目录中自动检测并使用它。

如果你的 schema 文件不叫 `schema.prisma`，那么可以在 CLI 运行时指定你的 schema 文件名。

> **注**: 指定 schema 文件路径的 CLI 选项尚未实现(译: 只能指定文件名)。你可以在[这里追踪这个问题的进展](https://github.com/prisma/prisma2/issues/225)。

## 语法

schema 文件是用 Prisma Schema Language(PSL)编写的。 你可以在[规范](https://github.com/prisma/specs/tree/master/schema)中找到完整的参考资料。

## 组成部分

### 数据源

数据源在 schema 文件中使用 `datasource` 代码块来指定。

#### 配置数据源的字段

| 名称       | 是否必需 | 类型                                   | 说明                                                                                                                      |
| ---------- | -------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `provider` | **是**   | Enum (`postgresql`, `mysql`, `sqlite`) | 说明要使用的数据源连接器.                                                                                                 |
| `url`      | **是**   | String (URL)                           | 包含认证信息的连接 URL. 每个数据源连接器文档中都有对应的 URL 构成语法。大多数连接器的 URL 语法就是对应数据库 URL 的语法。 |
| `enabled`  | 否       | Boolean                                | 是否能使用环境变量配置数据源. **默认**: `true`.                                                                           |

数据源连接器可以带有自己的字段，这样可以让用户根据所连接数据源的特定功能定制其数据模型。

#### 命名约定

数据源通常是以(`provider`)的名字命名(比如下面使用数据库名来命名):

```prisma
datasource sqlite {
  provider  = "sqlite"
  url       = env("SQLITE_URL")
}

datasource mysql {
  provider  = "mysql"
  url       = env("MYSQL_URL")
}

datasource postgresql {
  provider  = "postgresql"
  url       = env("POSTGRESQL_URL")
}
```

这是一个通用的约定，从技术上讲，数据源可以命名为任何东西。 其拼写通常使用小写字母。

### 生成器(可选)

生成器用来配置生成什么样的数据源客户端以及如何生成它们。语言偏好和配置都是放在这里的。

#### 字段

| 名称            | 是否必需 | 类型                                                                                                                            | 说明                                                                                                |
| --------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `provider`      | **是**   | 字符串(是一个文件路径)或 枚举类型(Enum (`prisma-client-js`))                                                                    | 描述要使用哪个生成器。这可以指向实现生成器的文件，也可以直接指定内置生成器(比如 `prisma-client-js`) |
| `output`        | _(可选)_ | 字符串(是一个文件路径)                                                                                                          | 决定了生成的客户端的位置                                                                            |
| `binaryTargets` | _(可选)_ | 枚举类型的列表 (预构建的二进制文件 [在这里](https://github.com/prisma/specs/blob/master/binaries/Readme.md#table-of-binaries)). | 用声明的方式下载所需的二进制文件                                                                    |

- 生成器可以有自己的字段，允许用户自定义的生成行为
- Both `binaryTargets`.(译: 这一部分可忽略, Prisma 现在会根据不同的操作系统自动下载需要的二进制文件)

#### 例子

```prisma
generator js {
  provider = "prisma-client-js"
}

generator js_custom_output {
  provider = "prisma-client-js"
  output   = "../src/generated/client"
}

generator ts {
  provider = "./path/to/custom/generator"
}

generator ts {
  provider      = "./path/to/custom/generator"
  binaryTargets = ["native", "debian-openssl-1.0.x"]
}
```

> **注**: prisma-client-js 默认的输出路径是你的 `node_modules` 目录。也可以像上面代码片段中的第二个示例一样, 指定输出路径。

### 数据模型定义

在 schema 文件中，有几个代码块(blocks)可以用于数据建模:

- `model`
- `enum`
- `type`

还有一些 _属性_ 和 _函数_ 可以用来增强数据模型定义的能力。

[在这里](./data-modeling.md)详细了解数据建模组件。

## 使用环境变量

在使用 CLI 命令时, 可以使用环境变量进行配置. 这有助于:

- 不用在 schema 文件中保留密文(secrets)信息
- 提高 schema 文件的可移植性

### 通过 `env` 函数使用环境变量

环境变量是通过 `env` 函数使用的:

```prisma
datasource pg {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

目前, 对于 `env` 有一些限制:

- 不能使用字符串连接(concat)操作 (比如, 构造数据库连接字符串).
- 在 `datasource` 和 `generator` 定义的 `provider` 字段中, 是不能使用的.

### 使用 `.env` 文件

对很多开发工具而言, 使用 [`.env`](https://github.com/motdotla/dotenv) 来定义环境变量是一种最佳实践.

Prisma 对 `.env` 文件提供原生支持. 这意味着当运行 Prisma CLI 命令时，`.env` 文件将自动加载。**但需要注意，`.env`文件要和 schema 文件放在同一目录。**

比如，通常情况下，你可以通过环境变量来设置数据库连接 URL:

```prisma
// schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

这只需要在 `.env` 文件中设置 `DATABASE_URL`:

```
# .env
DATABASE_URL=postgresql://test:test@localhost:5432/test?schema=public
```

当运行任何需要访问通过 `datasource` 定义的数据库的命令时(例如 Prisma 2 introspect)，Prisma CLI 会自动从 `.env` 文件读取加载 `DATABASE_URL` 环境变量。

> **警告**: 不要把你的 `.env` 文件提交到版本控制系统如 github 里面去.

### 通过环境变量切换数据源

你可以通过环境变量使用不同的环境, 比如:

```prisma
datasource mysql {
  provider = "mysql"
  url      = env("MYSQL_URL")
}

datasource postgres {
  provider = "postgresql"
  url      = env("POSTGRES_URL")
}
```

根据环境变量的不同(在这个例子中是 `MYSQL_URL` 或 `POSTGRES_URL` 环境变量), prisma 会使用不同的数据源. 你可以使用 `.env` 文件或是在 shell 中使用 `export` 定义环境变量.

可以使用 `source` 命令来切换不同的环境(source 的文件中会有 `export` 命令).

```bash
// dev_env
export POSTGRES_URL=postgresql://test:test@localhost:5432/test?schema=public
```

然后运行如下命令:

```bash
source ./dev_env
```

### 在 Prisma Client JS 中使用环境变量

虽然 Prisma 2 CLI 会自动使用 `.env` 文件，但 Prisma Client JS 不能原生支持 [`dotenv`](https://github.com/motdotla/dotenv) 或类似的库. 如果你想要在运行时使用不同的环境变量, 你需要在代码中实例化 `PrismaClient` 之前手动读入环境变量, 比如使用 `dotenv`:

```ts
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config(); // 读入环境变量
console.log(`The connection URL is ${process.env.DATABASE_URL}`);
const prisma = new PrismaClient();
```

## 注释

schema 文件中有两种类型的注释:

- `// 注释`: 这种注释是为了 schema 文件的可读性，它并不会存在于 schema 的抽象语法树(AST)中.
- `/// 注释`: 这种注释会出现在 schema 文件的抽象语法树(AST)中, 可以用来对 AST 的节点进行描述, 也可以是自由、浮动的注释. 其他工具可以使用这些注释向用户提供额外的信息.

这有几个不同的例子:

```prisma
/// 这句注释将会附加在AST中的 `User` 节点上
model User {
  /// 这句注释将会附加在AST中的 `id` 节点上
  id      Int
  // 这句注释只是为了方便你理解
  weight  Float /// 这句注释将会附加在AST中的 `weight` 节点上
}

// 这句注释只是为了方便你理解. 它不会出现在 AST 中.

/// 这句自由、浮动的注释会以 `Comment` 节点出现在 AST 中,
/// 但是它不会附加到任何其他的节点上. 我们在其他地方可以使用它的注释内容, 就像
/// godoc.org 做的那样.

model Customer {}
```

## 自动格式化

在 [gofmt](https://golang.org/cmd/gofmt/) 和 [prettier](https://github.com/prettier/prettier) 工具的带领下, PDL 语法提供了对
`.prisma` 文件格式化的能力.

有点像 `gofmt`, 但不像 `prettier`, 这里没有办法配置具体怎样格式化. **只能以一种固定方式格式化 prisma 文件**.

这种严格的方式有两个好处:

1. 不会有屎色自行车棚的问题(译: 参见[由屎色自行车棚引发的思考](https://juejin.im/post/5aa882eaf265da23923607bd)). Go 社区有这么一句话, "Gofmt 的风格没人会喜欢, 但是 Gofmt 的风格是每个人的最爱."
2. 版本控制系统中, 不会有 schema 中"空格不同"这种类型的提交.

### 格式化规则

#### 配置块按照它们的 `=` 对齐

```prisma
block _ {
  key      = "value"
  key2     = 1
  long_key = true
}
```

格式可以被新行重置(下面两段中的 `=` 位置不一样):

```prisma
block _ {
  key   = "value"
  key2  = 1
  key10 = true

  long_key   = true
  long_key_2 = true
}
```

多行对象遵循他们自己的嵌套格式规则:

```prisma
block _ {
  key   = "value"
  key2  = 1
  key10 = {
    a = "a"
    b = "b"
  }
  key10 = [
    1,
    2
  ]
}
```

#### 字段定义会由一个空格以上分隔的列进行对齐

```prisma
block _ {
  id          String       @id
  first_name   LongNumeric  @default
}
```

多行字段的属性与其余字段属性对齐:

```prisma
block _ {
  id          String       @id
                           @default
  first_name   LongNumeric  @default
}
```

格式可以通过新行重置:

```prisma
block _ {
  id  String  @id
              @default

  first_name  LongNumeric  @default
}
```
