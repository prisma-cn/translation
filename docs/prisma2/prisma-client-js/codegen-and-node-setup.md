---
title: 代码生成和Node.js设置
description: 本章介绍了如何自动生成prisma client js，并且说明了它在nodejs项目中如何进行设置
author: Nan Zhao
author_url: https://github.com/znnan
author_image_url: https://avatars0.githubusercontent.com/u/34448143?s=400&u=949ac05ac4184e0f0e1d842aac4575da66d937cc&v=4
author_title: Full Stacker
---

<!-- ## TLDR -->

## 长话短说

<!-- In order to use Prisma Client JS in your application, you must install the `@prisma/client` package in your application: -->

为了在你的应用程序中使用 Prisma Client JS，必须在应用程序中安装 `@prisma/client` ：

```
npm install @prisma/client
```

<!-- The `@prisma/client` package itself is a [_facade package_](https://github.com/prisma/prisma-client-js/issues/261) (basically a _stub_) that doesn't contain any functional code, such as types or the Prisma Client JS runtime. When installing the `@prisma/client` package, its `postinstall` hook is being executed to invoke the `prisma2 generate` command and generate the actual Prisma Client JS code into the facade package at `node_modules/@prisma/client`. -->

`@prisma/client` 本身是[_facade package_](https://github.com/prisma/prisma-client-js/issues/261)(基本上是*stub*)，其中不包含任何功能代码，例如类型或 Prisma Client JS 运行时。安装`@prisma/client`软件包时，将执行其`postinstall`钩子以调用`prisma2 generate`命令，并将实际的 Prisma Client JS 代码生成到位于`node_modules/@prisma/client`的 Facade 软件包中。

<!-- This means the `prisma2` CLI needs to be available as well. It is typically installed as a development dependency: -->

这意味着 `prisma2` CLI 已经提前装好。它通常作为开发依赖项安装：

```
npm install prisma2 --save-dev
```

<!-- ## Why is the facade package needed if Prisma Client JS is generated? -->

## 如果生成 Prisma Client JS，为什么需要 Facade 软件包？

<!-- The facade package is necessary to enable typical build and deployment workflows of Node.js applications. As an example, the facade package ensures that Prisma Client JS survives the ["pruning"](https://docs.npmjs.com/cli/prune.html) that's often employed by Node.js package managers. -->

Facade 软件包对于启用 Node.js 应用程序的典型构建和部署工作流是必需的。例如，facade 程序包可确保 Prisma Client JS 幸免于 Node.js 程序包管理器经常使用的[“裁剪”](https://docs.npmjs.com/cli/prune.html)功能。

<!-- Note that you'll need to re-execute `prisma2 generate` whenever you make changes to your [Prisma schema](../prisma-schema-file.md) (or perform the changes while are you're running Prisma's [development mode](../development-mode.md).  -->

请注意，每当对[Prisma schema](../prisma-schema-file.md)进行更改时，都需要重新执行`prisma2 generate`(或在运行 Prisma 的[开发模式](../development-mode.md)时执行更改)。

<!-- > **Note**: While this approach has a number of [benefits](#why-is-prisma-client-js-generated-into-node_modulesgenerated-by-default), it is also unconventional and can be a source of confusion for developers new to Prisma Client JS. Using `node_modules/@prisma/client` as the default `output` for Prisma Client JS is still experimental. Please share your feedback and tell us whether you think this is a good idea or any other thoughts you have on this topic by joining the [discussion on GitHub](https://github.com/prisma/prisma-client-js/issues/88). -->

> **注意**：尽管此方法具有许多[好处](#why-is-prisma-client-js-generated-into-node_modulesgenerated-by-default)，但它也是比较少见的，可能对使用 Prisma Client JS 的新手带来困惑。 Prisma Client JS 使用 `node_modules/@prisma/client` 作为默认 `output` 仍处于试验阶段。请分享你的反馈，并通过加入[在 GitHub 上的讨论](https://github.com/prisma/prisma-client-js/issues/88)，告诉我们你认为这是个好主意还是对这个功能有其他想法。

<!-- ## Specifying the target location for Prisma Client JS -->

## 指定 Prisma Client JS 的目标位置

<!-- `prisma2 generate` invokes the [generators](../prisma-schema-file.md#generators-optional) specified in the [Prisma schema file](../prisma-schema-file.md) and generates the respective packages on the respective output path(s).  -->

`prisma2 generate` 会调用[Prisma schema 文件](../prisma-schema-file.md)中指定的[generator](../prisma-schema-file.md#generators-optional)，在设置的输出路径上生成相应的代码。

<!-- The default Prisma Client JS generator can be specified as follows in your schema file: -->

默认的 Prisma Client JS 生成器可以在模型文件中指定如下：

```prisma
generator client {
  provider = "prisma-client-js"
}
```

<!-- Note that this is equivalent to specifying the default `output` path: -->

注意，这等效于指定默认的 `output` 路径：

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "./node_modules/@prisma/client"
}
```

<!-- When running `prisma2 generate` for either of these schema files, Prisma Client JS package will be located in: -->

当为这两个模型文件之一运行 `prisma2 generate` 时，Prisma Client JS 软件包都将位于：

```
node_modules/@prisma/client
```

<!-- You can also specify a custom `output` path on the `generator` configuration, for example: -->

你还可以在 `generator` 配置中指定自定义的 `output` 路径，例如:

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "./src/generated/client"
}
```

<!-- ## Prisma Client JS should be viewed as an npm package -->

## Prisma Client JS 应该被视为 npm 软件包

<!-- Node.js libraries are typically installed as npm dependencies using `npm install`. The respective packages are then located inside the [`node_modules`](https://docs.npmjs.com/files/folders#node-modules) directory from where they can be imported into application code. -->

通常使用 `npm install` 将 Node.js 库安装为 npm 依赖项，然后将相应的软件包放在[`node_modules`](https://docs.npmjs.com/files/folders#node-modules)目录中，可以将它们导入到应用程序代码中。

<!-- Because Prisma Client JS is a custom API for _your specific database setup_, it can't follow that model. It needs to be generated locally instead of being installed from a central repository like npm. However, the mental model for Prisma Client JS should still be that of an Node.js module. -->

由于 Prisma Client JS 是用于*特定数据库设置*的自定义 API，因此无法遵循该模型。它需要在本地生成，而不是从 npm 之类的中央存储库中安装。但是，Prisma Client JS 的思维模型应该仍然是 Node.js 模块的思维模型。

<!-- ## Why is Prisma Client JS generated into `node_modules/@prisma/client` by default? -->

## 为什么默认情况下将 Prisma Client JS 生成到`node_modules/@prisma/client`中？

<!-- ### Importing Prisma Client JS -->

### 导入 Prisma Client JS

<!-- By generating Prisma Client JS into `node_modules/@prisma/client`, you can import it into your code: -->

通过将 Prisma Client JS 生成到`node_modules/@prisma/client`中，可以将其导入代码中：

```js
import { PrismaClient } from '@prisma/client';
```

或

```js
const { PrismaClient } = require('@prisma/client');
```

<!-- ### Keeping the query engine binary out of version control by default -->

### 默认情况下使查询引擎二进制文件脱离版本控制

<!-- Prisma Client JS is based on a _query engine_ that's running as a binary alongside your application. This binary is downloaded when `prisma2 generate` is invoked and stored in the `output` path (right next to the generated Prisma Client JS API). -->

Prisma Client JS 基于 _查询引擎_，查询引擎作为二进制文件与应用程序一起运行。当调用`prisma2 generate`时，将下载此二进制文件并将其存储在`output`路径中(在生成的 Prisma Client JS API 旁边)。

<!-- By generating Prisma Client JS into `node_modules`, the query engine is kept out of version control by default (since `node_modules` is typically ignored for version control). If it was not generated into `node_modules`, then developers would need to explicitly ignore it, e.g. for Git they'd need to add the `output` path to `.gitignore`. -->

通过将 Prisma Client JS 生成为`node_modules`，查询引擎默认不受版本控制(因为版本控制通常会忽略`node_modules`)。如果未将其生成到`node_modules`中，则开发人员将需要显式忽略它，例如对于 Git，他们需要在`.gitignore`中添加`output`路径。

<!-- ## Generating Prisma Client JS in the `postinstall` hook of `@prisma/client` -->

## 在`@prisma/client`的`postinstall`钩子中生成 Prisma Client JS

<!-- The `@prisma/client` package defines its own `postinstall` hook that's being executed whenever the package is being installed. This hook invokes the `prisma2 generate` command which in turn generates the Prisma Client JS code into the default location `node_modules/@prisma/client`. Notice that this requires the `prisma2` CLI to be available, either as local dependency or as a global installation (it is recommended to always install the `prisma2` package as a development dependency, using `npm install prisma2 --save-dev`, to avoid versioning conflicts though). -->

`@prisma/client`软件包定义了自己的`postinstall`钩子，只要安装了该软件包，钩子就会被执行。这个钩子调用`prisma2 generate`命令，该命令又将 Prisma Client JS 代码生成到默认位置`node_modules/@prisma/client`。注意，这要求`prisma2` CLI 可以作为本地依赖项或作为全局依赖项使用(建议始终使用`npm install prisma2 --save-dev`将`prisma2`软件包作为开发依赖项安装，避免版本冲突)。
