# 使用 Lift (无 Photon)

你可以将 Lift 用作迁移系统，而无需使用 Photon 来进行数据库访问。当你的应用程序是用 Photon 尚不支持的编程语言编写的，或是暂时无法修改历史代码时，此功能很有用。

当使用不带 Photon 的 Lift 时，有两种入门方法：

- **从头开始**: 编写数据模型并将其映射到数据库
- **已有数据库**: 内省数据库以获得初始数据模型

## Lift 入门

### 1. 安装 Prisma CLI

```
npm install -g prisma2 --registry=https://registry.npm.taobao.org
```

### 2. 使用`prisma init`设置项目

运行以下命令以初始化新项目:

```
prisma2 init hello-world
```

然后按照交互式提示进行操作:

1. 选择你的数据库类型
   - **SQLite**
   - **MySQL**
   - **PostgreSQL**
   - **MongoDB** (即将推出)
2. 提供你的数据库信息
3. 选择 database (MySQL, MongoDB) 或 schema (PostgreSQL)
4. 选择 **Only Lift**

完成交互式提示后，CLI 会生成映射当前数据库 schema 的初始数据模型。数据模型通过将其列为数据源来连接到数据库。

### 3. 使用 Lift 迁移数据库

使用 Lift 进行的每个模式迁移都是一个三步过程:

1. **调整数据模型**: 更改 [数据模型定义](prisma2/data-modeling.md#data-model-definition) 以匹配所需的数据库 schema.
1. **保存迁移**: 运行 `prisma2 lift save` 在文件系统上创建你的 [迁移文件](prisma2/lift/migration-files.md)。
1. **运行迁移**: 运行 `prisma2 lift up` 对数据库执行迁移。

## 数据库凭证

使用 SQLite 时，你需要提供 _file path_ 到现有 SQLite 数据库文件。

使用 MySQL 时，需要提供以下信息来连接现有的 MySQL 数据库服务器:

- **Host**: 数据库服务器的 IP 地址/域，例如`localhost`。
- **Post**: 数据库服务器监听的端口，例如`5432`（PostgreSQL）或`3306`（MySQL）。
- **User**: 数据库用户，例如`admin`。
- **Password**: 数据库用户的密码。
- **SSL**: 你的数据库服务器是否使用 SSL。

提供后，CLI 将提示你选择 MySQL 服务器上现有的**databases**之一进行自省。

---

使用 PostgreSQL 时，需要提供以下信息来连接现有的 PostgreSQL 数据库服务器：

- **Host**: 数据库服务器的 IP 地址/域，例如`localhost`。
- **Port**: 数据库服务器监听的端口，例如`5432`（PostgreSQL）或`3306`（MySQL）。
- **Database**: 包含要内省的 schema 的数据库的名称。
- **User**: 数据库用户，例如`admin`。
- **Password**: 数据库用户的密码。
- **SSL**: 你的数据库服务器是否使用 SSL。

提供后，CLI 将提示你选择 PostgreSQL 服务器上现有的**schemas**之一进行自省。

---

使用 MongoDB 时，你需要提供[MongoDB 连接字符串](https://docs.mongodb.com/manual/reference/connection-string), 例如`http://user1:myPassword@localhost:27017/admin`。请注意，这必须包括数据库凭据以及用于存储 MongoDB `admin` 用户（默认情况下通常称为`admin`）凭据的[`authSource`](https://docs.mongodb.com/manual/reference/connection-string/#authentication-options)数据库。
