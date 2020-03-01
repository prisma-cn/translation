---
title: 从Sequelize迁移到Prisma Client JS
description: 本章提供了从Sequelize迁移到Prisma Client JS的流程
author: LiaoEden
author_url: https://juejin.im/user/58b6389aac502e006bb55168
author_image_url: https://avatars1.githubusercontent.com/u/28903167?s=460&v=4
author_title: Prisma 爱好者
---

<!-- [Sequelize](https://sequelize.org/) and [Prisma Client JS](https://photonjs.prisma.io/) both act as abstraction layers between your application and your database, but each works differently under the hood and provides different types of abstractions. -->

[Sequelize](https://sequelize.org/)和 [Prisma Client JS](https://photonjs.prisma.io/)都充当应用程序和数据库之间的抽象层，但是它们的执行方式不同，并且提供的抽象不是同一类型。

<!-- In this tutorial, we will compare both approaches for working with databases and walk through how to migrate from a Sequelize project to a Prisma Client JS one. -->

在本教程中，我们将比较两种使用数据库的方法，并逐步介绍如何从 Sequelize 项目迁移到 Prisma Client JS。

<!-- > **Note**: If you encounter any problems with this tutorial or any parts of Prisma 2, this is how you can get help: **create an issue on [GitHub](https://github.com/prisma/prisma2/issues)** or join the [`#prisma2-preview`](https://prisma.slack.com/messages/CKQTGR6T0/) channel on [Slack](https://slack.prisma.io/) to share your feedback directly. We also have a community forum on [Spectrum](https://spectrum.chat/prisma). -->

> **注意**：如果你在本教程或 Prisma 2 的任何部分遇到任何问题，可以通过以下方法获得帮助：**在[微信群](/wechat)提问**，**在[GitHub](https://github.com/prisma/prisma2/issues)上创建问题**，或在 **[Slack](https://slack.prisma.io/)** 上加入[`#prisma2-preview`](https://prisma.slack.com/messages/CKQTGR6T0/) 频道以直接分享你的反馈。我们也有一个关于 **[Spectrum](https://spectrum.chat/prisma)** 的社区论坛。

<!-- ## Goals -->

## 目标

<!-- This tutorial will show you how to achieve the following in your migration process: -->

本教程将向你展示如何在迁移过程中实现以下目标：

<!-- 1. [Obtaining the Prisma schema from your database](#1-Introspecting-the-existing-database-schema-from-the-Sequelize-project)
2. [Setting up your TypeScript project](#2-Setting-up-your-TypeScript-project)
3. [Specifying the data source](#3-Specifying-the-data-source)
4. [Installing and importing the library](#4-Installing-and-importing-the-library)
5. [Setting up a connection](#5-Setting-up-a-connection)
6. [Modelling data](#6-Creating-models)
7. [Querying the database](#7-Querying-the-database)
8. [Running the project](#8.-Running-the-project)
9. [Other migration considerations](#9-Other-considerations) -->

1. [从数据库中获取 Prisma schema](#1-Introspecting-the-existing-database-schema-from-the-Sequelize-project)
2. [设置你的 TypeScript 项目](#2-Setting-up-your-TypeScript-project)
3. [指定数据源](#3-Specifying-the-data-source)
4. [安装和导入库](#4-Installing-and-importing-the-library)
5. [建立连接](#5-Setting-up-a-connection)
6. [数据建模](#6-Creating-models)
7. [查询数据库](#7-Querying-the-database)
8. [运行项目](#8.-Running-the-project)
9. [其他迁移注意事项](#9-Other-considerations)

## 前提条件

本教程假定你已基本了解：

- TypeScript
- Node.js
- PostgreSQL

<!-- You will use **TypeScript** with a **PostgreSQL** database in this tutorial. You can set up your PostgreSQL database [locally](https://www.robinwieruch.de/postgres-sql-macos-setup) or use a hosting provider such as [Heroku](https://elements.heroku.com/addons) or [Digital Ocean](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-postgresql-on-ubuntu-18-04). -->

你将在本教程中使用 TypeScript 和 PostgreSQL 数据库。你可以在[本地](https://www.runoob.com/postgresql/windows-install-postgresql.html) 创建一个数据库，也可以在阿里云、腾讯云等云服务商创建一个数据库。

<!-- - Make sure that your database server is [running](https://tableplus.com/blog/2018/10/how-to-start-stop-restart-postgresql-server.html)
- Know your database server credentials
- Have a database created for the tutorial -->

- 确保你的数据库服务器正在 [运行](https://tableplus.com/blog/2018/10/how-to-start-stop-restart-postgresql-server.html)
- 得到你的数据库服务器地址和用户名密码
- 为本教程创建数据库

<!-- You will be migrating a REST API built with the [Express](https://expressjs.com/) framework. The example project can be found in this [repository](https://github.com/infoverload/migration_sequelize_photon). -->

你将使用[Express](https://expressjs.com/)框架构建迁移的 REST API。可以在此[github 库](https://github.com/infoverload/migration_sequelize_photon)中找到示例项目。

<!-- Clone the repository and navigate to it: -->

克隆这个仓库并进入文件夹

```
git clone https://github.com/infoverload/migration_sequelize_photon
cd migration_sequelize_photon
```

<!-- The Sequelize version of the project can be found in the [`sequelize`](https://github.com/infoverload/migration_sequelize_photon/tree/sequelize) branch. To switch to the branch, type: -->

Prisma Client JS 的 Sequelize 版本 可在[`sequelize`](https://github.com/infoverload/migration_sequelize_photon/tree/sequelize)分支中找到。要切换到分支，请输入：

```
git checkout sequelize
```

<!-- The finished Prisma Client JS version of the project is in the [`master`](https://github.com/infoverload/migration_sequelize_photon/tree/master) branch. To switch to this branch, type: -->

Prisma Client JS 的 Master 版本 位于 [`master`](https://github.com/infoverload/migration_sequelize_photon/tree/master) 分支中。要切换到该分支，请输入：

```
git checkout master
```

<!-- ## 1. Introspecting the existing database schema from the Sequelize project -->

## 1. 通过这个 Sequelize 项目来内省已经存在的数据库

<!-- Follow the instructions in the [README file](https://github.com/infoverload/migration_sequelize_photon/blob/sequelize/README.md) in the [`sequelize`](https://github.com/infoverload/migration_sequelize_photon/tree/sequelize) branch and get the project running against your PostgreSQL database. This sets up your database and defines the schema as defined in the TypeORM [entities](https://github.com/infoverload/migration_typeorm_photon/tree/typeorm/src/entity) of the project. -->

首先执行 `git checkout sequelize`进入分支,按照 [`sequelize`](https://github.com/infoverload/migration_sequelize_photon/tree/sequelize) 分支中 [README 文件](https://github.com/infoverload/migration_sequelize_photon/blob/sequelize/README.md)中的说明进行操作，使项目在 PostgreSQL 数据库上运行。这将建立你的数据库，并定义项目的 TypeORM [实体](https://github.com/infoverload/migration_typeorm_photon/tree/typeorm/src/entity)中定义的架构。

<!-- Prisma lets you [introspect](https://github.com/prisma/prisma2/blob/master/docs/introspection.md) your database to derive a data model definition from the current database schema. -->

Prisma 允许你对数据库进行[内省](../introspection.md)，以从当前数据库中导出数据模型定义。

<!-- Now you are ready to introspect the database from the Sequelize project. Navigate outside of the current project directory so you can start a new project. In your terminal, type the command: -->

现在，你可以从 Sequelize 项目中对数据库进行内省了。退出到当前项目目录之外，以便你可以开始一个新项目。在你的终端中，输入命令:

```
npx prisma2 init photonjs_app
```

这将初始化一个新的 Prisma 项目名称`photonjs_app`并启动初始化过程：

1. "Languages for starter kits": **Blank project**
2. "Supported databases": **PostgreSQL**
3. "PostgreSQL database credentials": fill in your database credentials and select **Connect**
4. "Database options": **Use existing PostgreSQL schema**
5. "Non-empty schemas": **public**
6. "Prisma 2 tools": confirm the default selections
7. "Prisma Client JS is available in these languages": **TypeScript**
8. **Just the Prisma schema**

<!-- The introspection process is now complete. You should see a message like: -->

自省过程现已完成。你应该看到类似以下的消息：

```
 SUCCESS  The photonjs_app directory was created!
 SUCCESS  Prisma is connected to your database at localhost
```

如果浏览项目目录，将看到：

```
prisma
└── schema.prisma
```

<!-- The [Prisma schema file](https://github.com/prisma/prisma2/blob/master/docs/prisma-schema-file.md) is the main configuration file for your Prisma setup. It holds the specifications and credentials for your database, your data model definition, and generators. The migration process to Prisma Client JS will all begin from this file. -->

[Prisma schema 文件](../prisma-schema-file.md)是 Prisma 设置的主要配置文件。它包含数据库，数据模型定义和生成器的规范和凭证。到 Prisma Client JS 的迁移过程都将从此文件开始。

<!-- Have a look at the file that was generated. -->

看看生成的文件:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = "postgresql://user:password@127.0.0.1:5432/database?schema=public"
}

model Task {
  id        Int      @id
  createdAt DateTime @default(now())
  title     String?
  updatedAt DateTime @updatedAt
  userId    User?

  @@map("tasks")
}

model User {
  id        Int      @id
  createdAt DateTime @default(now())
  tasks     Task[]
  updatedAt DateTime @updatedAt
  username  String   @unique

  @@map("users")
}
```

<!-- Now in your terminal, type: -->

现在在终端中，输入：

```
cd photonjs_app
npx prisma2 migrate save --experimental
npx prisma2 migrate up --experimental
npx prisma2 generate
```

<!-- Note that you'll need to re-execute `npx prisma2 generate` whenever you make changes to your [Prisma schema](../prisma-schema-file.md).
Once you're happy with the changes you made to your data model to develop a certain feature, you can persist your migration using migrate. -->

请注意，每当对[Prisma schema](../prisma-schema-file.md)进行更改时，都需要重新执行`npx prisma2 generate`。对数据模型所做的更改感到满意后，就可以使用`migrate`来保持迁移。

<!-- You can explore the current content of your database using Prisma Studio with `npx prisma2 studio --experimental`. Open the endpoint that's shown in your terminal (in most cases this will be [`http://localhost:5555/`](http://localhost:5555/)): -->

你可以使用 Prisma Studio 和`npx prisma2 studio --experimental`探索数据库的当前内容。打开终端中显示的端点(在大多数情况下，都是[`http://localhost:5555/`](http://localhost:5555/))：

![](/prisma2/4h9nk7i.png)

<!-- > **Note**: Please share any feedback you have about Prisma Studio in the [`studio`](https://github.com/prisma/studio) repository. -->

> **注意**：请在[`studio`](https://github.com/prisma/studio)git 仓库中分享你对 Prisma Studio 的任何反馈。

<!-- ## 2. Setting up your TypeScript project -->

## 2. 设置你的 TypeScript 项目

<!-- ### 2.1. Initialize your project and install dependencies -->

### 2.1. 初始化项目并安装依赖项

<!-- In your project root, initialize a new npm project: -->

在你的项目根目录中，初始化一个新的 npm 项目：

```
npm init -y
```

<!-- Install the `typescript` and `ts-node` packages locally: -->

在本地安装`typescript`和`ts-node`软件包：

```
npm install --save-dev typescript ts-node
```

安装`express`和`body-parser`：

```
npm install express body-parser
```

<!-- ### 2.2. Add TypeScript configuration -->

### 2.2. 添加 TypeScript 配置

<!-- Create a [tsconfig.json](https://github.com/infoverload/migration_sequelize_photon/blob/master/tsconfig.json) file in your project root and add: -->

在项目根目录中创建一个 [tsconfig.json](https://github.com/infoverload/migration_sequelize_photon/blob/master/tsconfig.json) 文件，并添加：

```json
{
  "compilerOptions": {
    "sourceMap": true,
    "outDir": "dist",
    "strictFunctionTypes": true,
    "noImplicitAny": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "lib": ["esnext", "dom"]
  }
}
```

<!-- ### 2.3. Add a postinstall script to `package.json` -->

### 2.3. 将 postinstall 添加到 package.json 中

<!-- In your [package.json](https://github.com/infoverload/migration_sequelize_photon/blob/master/package.json) file, add a postinstall script: -->

在你的 [package.json](https://github.com/infoverload/migration_sequelize_photon/blob/master/package.json) 文件中，添加一个 postinstall 钩子：

```diff
//...
"scripts": {
+ "postinstall": "prisma2 generate"
}
//...
```

<!-- It is considered best practice to add Prisma Client JS generation as a `postinstall` script because if you clone and install the project for the first time, the script will automatically generate Prisma Client JS and you can start running the code, reducing an extra step. -->

将 prisma2 generate 添加为`postinstall`脚本被认为是最佳实践，因为如果你是第一次克隆并安装项目，该脚本将自动生成 Prisma Client JS，你可以开始运行代码，减少了额外的步骤。

<!-- ## 3. Specifying the data source -->

## 3. 指定数据源

<!-- To connect to the database with Sequelize, you must create a Sequelize instance. This can be done by either passing the connection parameters separately to the Sequelize constructor or by passing a single connection URI: -->

要使用 Sequelize 连接到数据库，你必须创建一个 Sequelize 实例。这可以通过将连接参数分别传递到 Sequelize 构造器或通过传递单个连接 URI 来完成：

```ts
const Sequelize = require('sequelize');
const sequelize = new Sequelize('postgres://user:password@localhost:5432/database');
```

<!-- Sequelize is independent from specific dialects. This means that you'll have to install the respective connector library to your project yourself. For PostgreSQL, two libraries are needed, `pg` and `pg-hstore`. -->

Sequelize 只是一个独立的数据对象关系映射器(ORM)。即你必须自己将相应的数据库连接器库安装到项目中。比如 PostgreSQL 就需要 npm 安装 pg、pg-hstore 这两个包.

<!-- In your Prisma Client JS project, the data source and connection string was automatically generated when you ran through the `prisma2 init` process and is located in your [schema.prisma](https://github.com/infoverload/migration_typeorm_photon/blob/master/prisma/schema.prisma) file: -->

在你的 Prisma Client JS 项目中，当你运行`prisma2 init`过程时，数据源和连接字符串是自动生成的，并且位于[schema.prisma](https://github.com/infoverload/migration_typeorm_photon/blob/master/prisma/schema.prisma)文件中：

```prisma
//...
datasource db {
  provider = "postgresql"
  url      = "postgresql://user:password@localhost:5432/database?schema=public"
}
//...
```

<!-- ## 4. Installing and importing the library -->

## 4. 安装和导入库

<!-- Sequelize is installed as a [node module](https://www.npmjs.com/package/sequelize) with `npm install`, whereas Prisma Client JS is generated by the Prisma CLI (which invokes a Prisma Client JS generator) and provides a type-safe data access API for your data model. -->

Sequelize 通过 `npm install` 命令来安装 [node module](https://www.npmjs.com/package/sequelize)，而 Prisma Client JS 由 Prisma CLI(调用 Prisma Client JS 生成器)生成。为你的数据模型提供类型安全的数据访问 API。

<!-- ### Installing the Prisma depedencies -->

### 安装 Prisma 依赖项

<!-- Be sure to add the `@prisma/client` package to your project dependencies as well as the `prisma2` package as a development dependency. Note that both package versions must be kept in sync: -->

确保将`@prisma/client`软件包添加到你的项目依赖(dependencies)项中，并将`prisma2`软件包添加为开发依赖项(devDependencies)。请注意，两个软件包版本必须保持同步:

```
npm install @prisma/client
npm install prisma2 --save-dev
```

<!-- ### Using the `PrismaClient` constructor -->

### 使用`PrismaClient`构造器

<!-- Make sure you are in your `photonjs_app` project directory. Then, in your terminal, run: -->

确保你位于`photonjs_app`项目目录中。然后，在你的终端中运行：

```
npx prisma2 generate
```

<!-- This parses the Prisma schema file to generate the right data source client code (from reading the `generator` definition): -->

这将解析 Prisma schema 文件以生成正确的数据源客户端代码(通过读取`generator`定义)：

```prisma
generator client {
  provider = "prisma-client-js"
}
```

<!-- and generates Prisma Client JS and a `prisma` directory inside `node_modules/@prisma`: -->

并在`node_modules/@prisma`内部生成 Prisma Client JS 和一个`prisma`目录：

```
node_modules
└── @prisma
    └── client
        └── runtime
            ├── index.d.ts
            └── index.js
```

<!-- This is the default path but can be [customized](https://github.com/prisma/prisma2/blob/master/docs/prisma-client-js/codegen-and-node-setup.md). It is best not to change the files in the generated directory because it will get overwritten every time `prisma2 generate` is invoked. -->

这是默认路径，也可以[自定义](https://github.com/prisma/prisma2/blob/master/docs/prisma-client-js/codegen-and-node-setup.md)。最好不要更改生成目录中的文件，因为每次调用`prisma2 generate`时就会被覆盖。

<!-- Now you can import Prisma Client JS in your project. Create a main application file, `index.ts`, inside the `src` directory and import the `PrismaClient` constructor: -->

现在，你可以在项目中导入 Prisma Client JS。在`src`目录中创建一个主应用程序文件`index.ts`，并导入`PrismaClient`：

```ts
import { PrismaClient } from '@prisma/client';
```

<!-- ## 5. Setting up a connection -->

## 5. 建立连接

<!-- In Sequelize, the database connection has been set up with the Sequelize constructor and a connection string. If you want Sequelize to automatically create tables (or modify them as needed) according to your model definition, you can use the `sync` method, as follows: -->

在 Sequelize 中，已使用 Sequelize 构造器和连接字符串建立了数据库连接。如果希望 Sequelize 根据模型定义自动创建表(或根据需要修改表)，你可以使用 `sync` 方法，如下所示：

```ts
//...
const eraseDatabaseOnSync = true;

sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
  if (eraseDatabaseOnSync) {
    console.log(`Database & tables created!`);
    //...
  }
  //...
});
```

<!-- ### Migrating the connection -->

### 6. 迁移连接

<!-- To achieve this in your Prisma Client JS project, in your `index.ts` file, import `PrismaClient` and create a new instance of it like this: -->

要在 Prisma Client JS 项目中实现此目的，请在`index.ts`文件中，导入`PrismaClient`并为其创建一个新实例，如下所示：

```ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
```

<!-- Now you can start using the `prisma` instance and interact with your database programmatically with the generated Prisma Client JS API. -->

现在，你可以开始使用 `prisma` 实例，并使用生成的 Prisma Client JS API 与你的数据库进行编程交互。

<!-- The `PrismaClient` instance connects [lazily](https://github.com/prisma/prisma2/blob/master/docs/prisma-client-js/api.md#managing-connections) when the first request is made to the API (`connect()` is called for you under the hood). -->

当发送第一个请求时，`PrismaClient`实例会[自动连接](https://github.com/prisma/prisma2/blob/master/docs/prisma-client-js/api.md#managing-connections)(在幕后为你调用`connect()`)。

<!-- ## 6. Creating models -->

## 6. 建立模型

<!-- In Sequelize, a model is a class that extends `Sequelize.Model`. Models can be defined in two equivalent ways, with `Sequelize.Model.init(attributes, options)` or `sequelize.define`. To define mappings between a model and a table, use the `define` method. Each column must have a datatype. -->

在 Sequelize 中，模型是扩展`Sequelize.Model`的类。可以用两种等效的方式定义模型，即`Sequelize.Model.init(attributes, options)` or `sequelize.define`。要定义模型与表之间的映射，请使用`define`方法。每列必须具有一个数据类型。

[task.ts](https://github.com/infoverload/migration_sequelize_photon/blob/sequelize/src/models/task.ts)

```ts
const task = (sequelize, DataTypes) => {
  const Task = sequelize.define('task', {
    title: DataTypes.STRING,
  });
  Task.associate = models => {
    Task.belongsTo(models.User, {
      onDelete: 'CASCADE',
      foreignKey: {
        allowNull: false,
      },
    });
  };
  return Task;
};

export default task;
```

[user.ts](https://github.com/infoverload/migration_sequelize_photon/blob/sequelize/src/models/user.ts)

```ts
const user = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    username: {
      type: DataTypes.STRING,
      unique: true,
    },
  });
  User.associate = models => {
    User.hasMany(models.Task, { onDelete: 'CASCADE' });
  };
  return User;
};

export default user;
```

<!-- The above code tells Sequelize to expect a table named `users` in the database with the field `username` and a table named `tasks` with the field `title`. -->

上面的代码告诉 Sequelize 期望在数据库中有一个名为`users`的表，该表具有`username`字段，而一个名为`task`的表则具有字段`task`。

<!-- Sequelize also defines by default the fields `id` (primary key), `createdAt` and `updatedAt` to every model. -->

默认情况下，Sequelize 还定义每个模型的字段`id`(主键)、`createdAt`和`updatedAt`。

<!-- You can store your model definitions in separate files and use the `import` method to import them. The returned object is exactly the same as defined in the imported file's function. -->

你可以将模型定义存储在单独的文件中，并使用`import`方法导入它们。返回的对象与导入文件的函数中定义的对象完全相同。

[models/index.ts](https://github.com/infoverload/migration_sequelize_photon/blob/sequelize/src/models/index.ts)

```ts
const models = {
  User: sequelize.import('./user'),
  Task: sequelize.import('./task'),
};

Object.keys(models).forEach(key => {
  if ('associate' in models[key]) {
    models[key].associate(models);
  }
});

export default models;
```

<!--
In your Prisma Client JS project, the models above were auto-generated from the introspection process. These model definitions are located in the Prisma schema. Models represent the entities of your application domain, define the underlying database schema, and are the foundation for the auto-generated CRUD operations of the database client. -->

在你的 Prisma Client JS 项目中，以上模型是通过自省过程自动生成的。这些模型定义位于 Prisma schema 中。schema 代表你的应用程序的实体，定义了基础数据库结构，并且是数据库客户端自动生成的 CRUD 操作的基础。

<!-- Take a look at your generated Prisma schema file ([example here](https://github.com/infoverload/migration_sequelize_photon/blob/master/prisma/schema.prisma)). The `task` and `user` models from the Sequelize project are translated to `Task` and `User` models here: -->

查看你生成的 Prisma schema 文件([example here](https://github.com/infoverload/migration_sequelize_photon/blob/master/prisma/schema.prisma))。 Sequelize 项目中的`task`和`user`模型在此处转换为`Task`和`User`模型：

```prisma
model Task {
  id        Int      @id
  createdAt DateTime @default(now())
  title     String?
  updatedAt DateTime @updatedAt
  userId    User?

  @@map("tasks")
}

model User {
  id        Int      @id
  createdAt DateTime @default(now())
  tasks     Task[]
  updatedAt DateTime @updatedAt
  username  String   @unique

  @@map("users")
}
```

<!-- `Task` and `User` are mapped to database tables. The fields are mapped to columns of the tables. -->

`Task`和 `User` 映射到数据库表。字段映射到表的列。

<!-- Things to note: -->

注意事项：

- `@default` 指令 - 设置默认值
- `@id` 和 `@updatedAt` 指令 - 由 Prisma 管理，并且在公开的 Prisma API 中为只读
- `@id` 指令 - 表示此字段用作主键 _primary key_
- `@unique` 指令 - 表示唯一约束，这意味着 Prisma 会保证该字段的任何两个记录都不会具有相同的值

<!-- If you change your datamodel, you can regenerate Prisma Client JS and all typings will be updated. -->

如果更改数据模型，则可以重新生成 Prisma Client JS，所有类型都会更新。

<!-- #### Note about the auto-generated Prisma schema -->

#### 关于自动生成的 Prisma schema 的说明

<!-- 1. The field that points to the `User` model in the `Task` model is called `userId`. The naming occurred from the introspection process but is a bit misleading because it doesn't refer to the actual ID of the user. A solution may be to rename `userID` to `user`. This can avoid naming confusions when using the Prisma Client JS API. -->

1. 在`Task`模型中指向`User`模型的字段称为`userId`。命名是从自省过程发生的，但是有点误导，因为它没有关联到用户的实际 ID。一个解决方案可能是将`userID`重命名为`user`。这样可以避免在使用 Prisma Client JS API 时命名混乱。

<!-- 2. There is some mismatch between the `DateTime` types of Prisma and the ones of Postgres, so you may want to remove the `createdAt` and `updatedAt` fields for now. A [GitHub issue](https://github.com/prisma/prisma2/issues/552) has been created. -->

2. Prisma 的`DateTime`类型与 PostgreSQL 的类型之间存在一些不匹配，因此你可能现在要删除`createdAt` 和 `updatedAt` 字段。这个 [GitHub issue](https://github.com/prisma/prisma2/issues/552) 已创建。

<!-- 3. The resulting schema after these changes may look like this. -->

3. 这些 schema 更改之后的结果可能看起来像这样。

   ```prisma
   generator client {
     provider = "prisma-client-js"
   }

   datasource db {
     provider = "postgresql"
     url      = "postgresql://user:password@localhost:5432/database?schema=public"
   }

   model Task {
     id        Int      @id
     title     String?
     user      User?

     @@map("tasks")
   }

   model User {
     id        Int      @id
     tasks     Task[]
     username  String   @unique

     @@map("users")
   }
   ```

<!-- ## 7. Querying the database -->

## 7. 查询数据库

<!-- ### Migrating the  route (`GET`) -->

### 迁移`/users`路由(`GET`)

<!-- Sequelize has a lot of options for querying your database, which you can learn more about [here](https://sequelize.org/master/manual/querying.html). -->

Sequelize 有很多用于查询数据库的选项，你可以在此处了解[更多信息](https://sequelize.org/master/manual/querying.html)。

<!-- In the sample project, you first import the `sequelize` constructor and the models you defined earlier. Then, in your Express application route for the `/users` endpoint, use the `User` model's `findAll()` method to fetch all the users from the database and send the result back. -->

在示例项目中，首先导入 `sequelize` 构造器和之前定义的模型。然后，在 `/users` 路径的 Express 应用程序路由中，使用 `User` 模型的 `findAll()` 方法从数据库中获取所有用户并将结果发送回去。

[app.ts](https://github.com/infoverload/migration_sequelize_photon/blob/sequelize/src/app.ts)

```ts
import * as express from 'express';
import * as bodyParser from 'body-parser';
import models, { sequelize } from './models';

const app = express();
app.use(bodyParser.json());

// Define routes
app.get('/users', async (req, res) => {
  const users = await models.User.findAll();
  return res.send(users);
});
//...
```

<!-- Your generated Prisma Client JS API will expose the following [CRUD operations](https://github.com/prisma/prisma2/blob/master/docs/prisma-client-js/api.md#crud) for the `Task` and `User` models: -->

生成的 Prisma Client JS API 将为`Task` 和 `User`模型公开以下[CRUD 操作](https://github.com/prisma/prisma2/blob/master/docs/prisma-client-js/api.md#crud)：

- `findOne`
- `findMany`
- `create`
- `update`
- `updateMany`
- `upsert`
- `delete`
- `deleteMany`

<!-- So to implement the same route and endpoint in your Prisma Client JS project, go to your `index.ts` file, and in the `/users` endpoint for the `app.get` route, fetch all the posts from the database with [`findMany`](https://github.com/prisma/prisma2/blob/master/docs/prisma-client-js/api.md#findMany), a method exposed for the `User` model with the generated Prisma Client JS API. Then send the results back. Note that the API calls are asynchronous so we can `await` the results of the operation. -->

因此，要在 Prisma Client JS 项目中实现相同的路由，请转到 `index.ts` 文件，并在 `app.get` 路由的 `/users` 端点中，使用[`findMany`](../prisma-client-js/api.md#findMany)从数据库中获取所有数据，该方法暴露了生成的 Prisma Client JS API 的用户模型。请注意，API 调用是异步的，因此我们可以 `await` 操作结果。

```ts
import * as express from 'express';
import * as bodyParser from 'body-parser';
import { PrismaClient } from '@prisma/client';

const app = express();
app.use(bodyParser.json());

const prisma = new PrismaClient();

app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

//...

app.listen(3000, () => console.log('Server is running on http://localhost:3000'));
```

### 迁移 `/users/:id` 路由 (`GET`)

<!-- Let's migrate another route. In the Sequelize project, this is the endpoint to retrieve a user by it's id: -->

让我们迁移另一条路由。在 Sequelize 项目中，这是通过 id 查询某个用户的路径：

```ts
//...
app.get('/users/:userId', async (req, res) => {
  const user = await models.User.findByPk(req.params.userId);
  return res.send(user);
});
//...
```

<!-- So to implement the same route and endpoint in your Prisma Client JS project, go to your `index.ts` file, and in the `/users/:id` endpoint, save the `id` of the post we want from the request parameter, use the `findOne` method generated for the `user` model to fetch a post identified by a unique value and specify the unique field to be selected with the `where` option. Then send the results back. -->

现在要在 Prisma Client JS 项目中实现相同的路由，请转至 `index.ts` 文件，然后在 `/users/:id` 路由中，通过查询参数获取 `id` ，使用 `findOne` 方法查询 `user` ，这里用 `where` 选项指定 user 的唯一字段。最后将结果返回。

```ts
//...
app.get(`/users/:id`, async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findOne({
    where: {
      id: Number(id),
    },
  });
  res.json(user);
});
//...
```

<!-- ### Migrating the `/tasks` route (`POST`) -->

### 迁移`/tasks`路由(`POST`)

<!-- Let's migrate the route that handles POST requests. In the Sequelize project, this is the endpoint to create and save a new task: -->

让我们迁移处理 POST 请求的路由。在 Sequelize 项目中，这是创建和保存新任务的 endpoint：

```ts
//...
app.post('/tasks', async (req, res) => {
  const task = await models.Task.create({
    title: req.body.title,
  });

  return res.send(task);
});
//...
```

<!-- To implement the same route and endpoint in your Prisma Client JS project, go to your `index.ts` file, and in the `/tasks` endpoint for the `app.post` route, save the user input from the request body, use the `create` method generated for the `task` model to create a new record with the requested data, and return the newly created object. -->

要在 Prisma Client JS 项目中实现相同的路由，请转到 `index.ts` 文件，在 `/tasks` 路由中，保存来自请求 body 的用户输入，使用给 `task` 模型生成的 `create` 方法，创建带有请求数据的新记录，并返回新创建的对象。

```ts
//...
app.post(`/tasks`, async (req, res) => {
  const { title } = req.body;
  const post = await prisma.task.create({
    data: {
      title,
    },
  });
  res.json(post);
});
//...
```

<!-- ### Migrating the `/tasks/:id` route (`DELETE`) -->

### 迁移 `/tasks/:id` 路由(`DELETE`)

<!-- Let's migrate one last route. In the Sequelize project, this is the endpoint to delete a task by it's id: -->

让我们迁移最后一条路由。在 Sequelize 项目中，这是通过 ID 删除任务的路径：

```ts
//...
app.delete('/tasks/:taskId', async (req, res) => {
  const result = await models.Task.destroy({
    where: { id: req.params.taskId },
  });

  return res.send(true);
});
//...
```

<!-- To implement the same route and endpoint in your Prisma Client JS project, go to your `index.ts` file, and in the `/posts/:id` endpoint for the `app.delete` route, save the `id` of the post we want to delete from the request body, use the `delete` method generated for the `post` model to delete an existing record `where` the `id` matches the requested input, and return the corresponding object. -->

要在 Prisma Client JS 项目中实现相同的路由，请转到 `index.ts` 文件，然后在`/posts/:id` 中，获取我们要删除的帖子的 `id`，使用为 `post` 模型生成的 `delete` 方法删除用`where`中`id`相同的对应的数据，并返回结果。

```ts
//...
app.delete(`/tasks/:id`, async (req, res) => {
  const { id } = req.params;
  const task = await prisma.task.delete({
    where: {
      id: Number(id),
    },
  });
  res.json(task);
});
//...
```

<!-- Now you can migrate the other routes following this pattern or create new routes. If you get stuck, refer back to the `master` branch of the project. -->

现在，你可以按照此模式迁移其他路由或创建新路由。如果遇到问题，请返回项目的 `master` 分支。

<!-- ## 8. Running the project -->

## 8. 运行项目

<!-- In your [package.json](https://github.com/infoverload/migration_sequelize_photon/blob/master/package.json) file, add a start script: -->

在你的[package.json](https://github.com/infoverload/migration_sequelize_photon/blob/master/package.json)文件中，添加一个启动脚本：

```diff
//...
"scripts": {
+ "start": "ts-node src/index.ts"
  "postinstall": "prisma2 generate"
}
//...
```

<!-- When finished with your project, run it like this: -->

完成项目后，按以下方式运行它：

```
npm start
```

<!-- ## 9. Other considerations -->

## 9. 其他注意事项

<!-- The sample project that was used demonstrated the fundamental capabilities of both Sequelize and Prisma Client JS but there are more things to consider when migrating, such as transactions and working with relations, which may be covered in a future tutorial. The main thing to note is that while Prisma Client JS is comparable to an ORM, it should rather be considered as an auto-generated database client. -->

所使用的示例项目演示了 Sequelize 和 Prisma Client JS 的基本功能，但是在迁移时还有更多的事情要考虑，例如事务和关系表，这将在以后的教程中进行介绍。要注意，虽然 Prisma Client JS 与 ORM 类似，但应将其视为自动生成的数据库客户端。

<!-- ## Next steps -->

## 下一步

- 学习更多关于 [Prisma Client JS' relation API](https://github.com/prisma/prisma2/blob/master/docs/prisma-client-js/api.md#relations) 的东西
- 参与我们的 [社区](/wechat)!

<!-- If you run into problems with this tutorial or spot any mistakes, feel free to make a pull request. -->
