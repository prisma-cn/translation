# 升级到 `preview019`

在`2.0.0-preview019`版本中，对 MySQL 和 SQLite 的标量列表到支持已被删除。对于 PostgreSQL，Prisma 的底层当前使用 [PostgreSQL native scalar lists(_arrays_)](https://www.postgresql.org/docs/9.1/arrays.html)

在以前的 Prisma 版本中支持标量列表的方式如下，例如这个 Prisma schema:

```prisma
datasource db {
  provider = "postgresql"
  url      = "postgresql://nikolasburk:nikolasburk@localhost:5432/coinflips"
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        Int       @id
  name      String    @default("")
  coinflips Boolean[]
}
```

这是在映射到数据库时生成的SQL schema:

```sql
-- Table Definition ----------------------------------------------

CREATE TABLE "User" (
    id integer DEFAULT nextval('"User_id_seq"'::regclass) PRIMARY KEY,
    name text NOT NULL DEFAULT ''::text
);

-- Indices -------------------------------------------------------

CREATE UNIQUE INDEX "User_pkey" ON "User"(id int4_ops);

-- Table Definition ----------------------------------------------

CREATE TABLE "User_coinflips" (
    "nodeId" integer REFERENCES "User"(id) ON DELETE CASCADE,
    position integer,
    value boolean NOT NULL,
    CONSTRAINT "User_coinflips_pkey" PRIMARY KEY ("nodeId", position)
);

-- Indices -------------------------------------------------------

CREATE UNIQUE INDEX "User_coinflips_pkey" ON "User_coinflips"("nodeId" int4_ops,position int4_ops);
```

这意味着 Prisma schema 中的`coinflips: Boolean[]`列表的数据实际上存储在另一个名为`User_coinflips`的表中，该表包含指向`nodeId`记录的外键`User`。

## 升级到`preview-019`的变通方法

### PostgreSQL、MySQL 和 SQLite

以下是对 MySQL 和 SQLite 的设想解决方案 (注意，PostgreSQL用户也可以将他们的数据迁移到一个本地 PostgreSQL 数组中，更多信息[如下](#only-postgresql)):

1. 复制`User_coinflips`表，例如:
    ```sql
    CREATE TABLE "User_coinflips_COPY" AS 
    TABLE "User_coinflips"; 
    ```

2. 添加一个主键，使它符合当前的 Prisma 约定:
    ```sql
    ALTER TABLE "User_coinflips_COPY" ADD COLUMN ID SERIAL PRIMARY KEY;
    ```

3. 通过自省重新映射到你的 Prisma schema
    ```
    prisma2 introspect --url="postgresql://nikolasburk:nikolasburk@localhost:5432/coinflips"
    ```

    Prisma schema 结果如下:

    ```prisma
    generator client {
      provider = "prisma-client-js"
    }

    datasource db {
      provider = "postgresql"
      url      = "postgresql://nikolasburk:nikolasburk@localhost:5432/coinflips"
    }

    model User {
      id   Int    @id
      name String @default("")
    }

    model User_coinflips_COPY {
      id       Int      @id
      nodeId   Int?
      position Int?
      value    Boolean?
    }
    ```

4. 手动添加`coinflips`关系:
    ```diff
    model User {
      id        Int                   @id
      name      String                @default("")
    +  coinflips User_coinflips_COPY[]
    }
    ```

5. 手动将`nodeId`类型改为`User?`
    ```diff
    model User_coinflips_COPY {
      id       Int      @id
    +  nodeId   User?
      position Int?
      value    Boolean?
    }
    ```

6. 重新生成 Prisma Client JS:

    ```
    prisma2 generate
    ```

在您的应用程序代码中，现在可以调整 Prisma Client JS API 的调用。未来访问 `coinflips` 数据，您现在必须总是把它[`包含`](https://github.com/prisma/prisma2/blob/master/docs/prisma-client-js/api.md#include-additionally-via-include)在 API 调用中:

```ts
const user = await prisma.user.findOne({ 
  where: { id: 1 },
  include: {
    coinflips: {
      orderBy: { position: "asc" }
    }
  }
})
```

> `orderBy`对于保持列表的顺序很重要。

API 调用结果如下:

```js
{
  id: 1,
  name: 'Alice',
  coinflips: [
    { id: 1, position: 1000, value: false },
    { id: 2, position: 2000, value: true },
    { id: 3, position: 3000, value: false },
    { id: 4, position: 4000, value: true },
    { id: 5, position: 5000, value: true },
    { id: 6, position: 6000, value: false }
  ]
}
```

若只想访问列表中 coinflips 的 boolean 值，可以在`user`中执行`coinflips`的`map`:

```ts
const currentCoinflips = user!.coinflips.map(cf => cf.value)
```

> 上面的感叹号表示我们正在强制展开`user`值。这是必要的，因为前一个API调用返回的`user`可能是`null`。

执行完`map`操作后`currentCoinflips`的值如下:

```js
[ false, true, false, true, true, false ]
```

### Only PostgreSQL

由于标量列表(i.e. [arrays](https://www.postgresql.org/docs/9.1/arrays.html))是PostgreSQL的一个本地特性，所以您可以在 Prisma schema 中继续使用相同的`coinflips: Boolean[]`。

但是，为了做到这一点，您需要手动将底层数据从`User_coinflips`表迁移到PostgreSQL数组中。可以这样做:

1. 在`User`表中新增`coinflips`列:
    ```sql
    ALTER TABLE "User" ADD COLUMN coinflips BOOLEAN[];
    ```

1. 将数据从`"User_coinflips".value`迁移到`"User.coinflips"`:
    ```sql
    UPDATE "User"
      SET coinflips = t.flips
    FROM (
      SELECT "nodeId", array_agg(VALUE ORDER BY position) AS flips
      FROM "User_coinflips"
      GROUP BY "nodeId"
    ) t
    where t."nodeId" = "User"."id";
    ```

1. 要清除，可以删除`User_coinflips`表:
    ```sql
    DROP TABLE "User_coinflips"
    ```

您可以继续像之前那样使用 Prisma Client JS :

```ts
const user = await prisma.user.findOne({ 
  where: { id: 1 },
})
```

API 调用结果如下:

```js
{
  id: 1,
  name: 'Alice',
  coinflips: [ false, true, false, true, true, false ]
}
```
