---
title: 打包工具使用须知
description: 和打包工具一起使用的注意事项
author: LiaoEden
author_url: https://juejin.im/user/58b6389aac502e006bb55168
author_image_url: https://avatars1.githubusercontent.com/u/28903167?s=460&v=4
author_title: Prisma 爱好者
---

_Module bundlers_ 将 JavaScript 模块打包到一个 JavaScript 文件中。大多数打包程序通过将 JavaScript 代码从各种源文件复制到目标文件来工作。

由于 Prisma Client JS 不仅基于 JavaScript 代码，而且还依赖于**查询引擎二进制文件**，因此你需要确保打包的代码可以访问二进制文件。

为此，你可以使用插件来复制静态资源

| Bundler | Plugin                                                                                                  |
| :------ | :------------------------------------------------------------------------------------------------------ |
| Webpack | [`copy-webpack-plugin`](https://github.com/webpack-contrib/copy-webpack-plugin#copy-webpack-plugin)     |
| Parcel  | [`parcel-plugin-static-files-copy`](https://github.com/elwin013/parcel-plugin-static-files-copy#readme) |
