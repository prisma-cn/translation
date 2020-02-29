# 与模块捆绑器一起使用

_Module bundlers_ 将JavaScript模块捆绑到一个JavaScript文件中。大多数捆绑程序通过将JavaScript代码从各种源文件复制到目标文件来工作。

由于Prisma Client JS不仅基于JavaScript代码，而且还依赖于**查询引擎二进制文件**可用，因此您需要确保捆绑的代码可以访问二进制文件。

为此，您可以使用插件来复制静态资源

| Bundler | Plugin |
| :-- | :-- |
| Webpack | [`copy-webpack-plugin`](https://github.com/webpack-contrib/copy-webpack-plugin#copy-webpack-plugin) |
| Parcel | [`parcel-plugin-static-files-copy`](https://github.com/elwin013/parcel-plugin-static-files-copy#readme) |