---
title: prisma2 版本发布策略
description: Prisma 2 版本发布策略和周期，每周发布预览版，滚动更新alpha版本。
author: Victor
author_url: https://kangwenchang.com
author_image_url: https://kangwenchang.com/static/favicon/logocorner.png
author_title: Prisma 爱好者
---

本页说明 Prisma 2 的发布过程。

## 发布日志

你可以在[此处](https://github.com/prisma/prisma2/releases)中找到 Prisma 2 的所有版本。

注意现在的版本调整为如下形式 [`2.0.0-preview014`](https://github.com/prisma/prisma2/releases/tag/2.0.0-preview014) ，和 [semver](https://semver.org/) 格式标准兼容。

## 发布渠道

有两个主要的发布渠道：

- **Preview**：每周四发布
- **Alpha**：滚动/连续发布

除非你对 Alpha 版本有特殊要求，否则建议始终使用最新的 Preview 版本。

### Preview

Prisma 2 固定发布周期单位为周，其中新的预览版本通常在**星期四**发布(但可能会延迟)。

预览版本的名称为 `2.0.0-preview014`, `2.0.0-preview015`, `2.0.0-preview016`, ...或者你可以简称为它们： `preview014`, `preview015`, `preview016` ...

你可以通过 npm 安装最新的预览版：

```
npm install -g prisma2
```

注意 Prisma 2 CLI 目前需要 [Node 8](https://nodejs.org/en/download/releases/) (或更高版本). 并且执行 [`postinstall`](./prisma2-cli.md#the-postinstall-hook) 钩子。

### Alpha(latest)

Alpha 版本包含 Prisma 2 的最新更改。由于 Alpha 基于开发分支，因此 Alpha 发行版中发生故障或异常行为的可能性更大。

仅当你具有最新的预览版无法满足的特定要求时，才应该使用 Alpha 版。

你可以通过 npm 安装最新的 Alpha 版本：

```
npm install -g prisma2@alpha
```
