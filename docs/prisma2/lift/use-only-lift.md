# 使用 Lift (无 Photon)

您可以将Lift用作迁移系统，而无需使用Photon来进行数据库访问。当您的应用程序是用Photon尚不支持的编程语言编写的，或者无法换出当前数据访问代码时，此功能很有用。

当使用不带Photon的Lift时，有两种入门方法：

- **从头开始**: 编写数据模型并将其映射到数据库
- **With an existing database**: 内省数据库以获得初始数据模型

## Lift入门

### 1. 安装Prisma CLI

```
npm install -g prisma2
```

### 2. 使用`prisma init`设置项目

运行以下命令以初始化新项目:

```
prisma init hello-world
```

然后按照交互式提示进行操作:

1. 选择你的数据库类型
   - **SQLite**
   - **MySQL**
   - **PostgreSQL**
   - MongoDB (即将推出)
2. 提供你的数据库凭据 ([更多信息](#database-credentials))
3. 选择数据库 (MySQL, MongoDB) 或schema (PostgreSQL)
4. 选择 **Only Lift**

完成交互式提示后，CLI会生成反映当前数据库模式的初始数据模型。数据模型通过将其列为数据源来连接到数据库。

### 3. 使用Lift迁移数据库

使用Lift进行的每个模式迁移都是一个三步过程:

1. **调整数据模型**: 更改 [数据模型定义](../data-modeling.md#data-model-definition) 以匹配所需的数据库模式.
1. **保存迁移**: 运行 `prisma2 lift save` 在文件系统上创建您的 [迁移文件](./migration-files.md)。
1. **运行迁移**: 运行 `prisma2 lift up` 对数据库执行迁移。

## 数据库凭证

<Details><Summary><strong>SQLite</strong>的数据库凭证</Summary>
<br />
使用SQLite时，您需要提供 _file path_ 到现有SQLite数据库文件。

</Details>

<Details><Summary><strong>MySQL</strong>的数据库凭证</Summary>
<br />
使用MySQL时，需要提供以下信息来连接现有的MySQL数据库服务器:

- **Host**: 数据库服务器的IP地址/域，例如`localhost`。
- **Post**: 数据库服务器监听的端口，例如`5432`（PostgreSQL）或`3306`（MySQL）。
- **User**: 数据库用户，例如`admin`。
- **Password**: 数据库用户的密码。
- **SSL**: 您的数据库服务器是否使用SSL。

提供后，CLI将提示您选择MySQL服务器上现有的**数据库**之一进行自省。

</Details>

<Details><Summary><strong>PostgreSQL</strong>的数据库凭证</Summary>
<br />
使用PostgreSQL时，需要提供以下信息来连接现有的MySQL数据库服务器：

- **Host**: 数据库服务器的IP地址/域，例如`localhost`。
- **Port**: 数据库服务器监听的端口，例如`5432`（PostgreSQL）或`3306`（MySQL）。
- **Database**: 包含要内省的schema的数据库的名称。
- **User**: 数据库用户，例如`admin`。
- **Password**: 数据库用户的密码。
- **SSL**: 您的数据库服务器是否使用SSL。

提供后，CLI将提示您选择MySQL服务器上现有的**schemas**之一进行自省。

</Details>

<Details><Summary><strong>MongoDB</strong>的数据库凭据</Summary>
<br />

使用MongoDB时，您需要提供[MongoDB连接字符串](https://docs.mongodb.com/manual/reference/connection-string), 例如`http://user1:myPassword@localhost:27017/admin`。请注意，这必须包括数据库凭据以及用于存储MongoDB `admin` 用户（默认情况下通常称为`admin`）凭据的[`authSource`](https://docs.mongodb.com/manual/reference/connection-string/#authentication-options)数据库。

</Details>
