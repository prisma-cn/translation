---
id: prisma2/lift/steps
title: 迁移步骤
description: 当使用 prisma lift 时所需要的迁移步骤
---

> 翻译：[赵南](https://github.com/znnan)

# 迁移步骤

> 你可以在[此处](https://github.com/prisma/prisma/blob/alpha/server/prisma-rs/migration-engine/connectors/migration-connector/tests/steps_tests.rs)找到迁移步骤的实现并在[测试](https://github.com/prisma/prisma/blob/alpha/server/prisma-rs/migration-engine/connectors/migration-connector/tests/steps_tests.rs)中详细了解其行为。

## 步骤类型

### `建立模型`

#### 特性

- `name` (string): 新模型的名字.
- `embedded` (boolean): 定义模型是否为一个 _embedded_ 类型.
- `db_name` (string, optional): 待定

#### 例子

##### 添加一个新模型

假设以下模型被添加到数据模型中:

```groovy
model User {
  id: Int @id
  name: String?
}
```

这将生成以下类型为 `CreateModel` 的迁移步骤

```json
{
  "stepType": "CreateModel",
  "name": "User",
  "embedded": false
}
```

> 为简洁起见，省略了其他步骤类型的生成步骤.

### `UpdateModel`

### `DeleteModel`

### `CreateField`

### `UpdateField`

### `DeleteField`

### `CreateEnum`

### `UpdateEnum`

### `DeleteEnum`
