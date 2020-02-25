---
title: 起步及学习路径
description: 本章的目的在于能够按照步骤使用prisma成功构建一个 GraphQL API 服务器
keywords:
  - GraphQL API
  - prisma
  - 快速入门
---

目标：成功构建一个 GraphQL API 服务器！Go->

> Prisma 1.17 以前的版本改动较大，历史上也出现很多破坏性更新，请确保你的 prisma 版本为 1.19 及以上，本文档同步官方保持最新。
> 本文档采用 1.34 版本语法，即 datamodel SDL 1.1 。在 id、时间、关系上有所变动，如要使用以前版本，请至官网查看。

### 安装及部署

如果你已使用 Prisma Demo Server 成功部署，可直接跳过到[构建应用](#构建app),另外有[学习路径](#学习路径)可参考。

> 如果你想在本地用 docker 新起一个 Prisma 服务器，参考[这里](https://prisma.1wire.com/blog/newdatabase)。

> 如果你想用 Prisma 连接已运行的数据库，参考[这里](https://prisma.1wire.com/blog/existingdatabase)。

#### 1. 安装

npm 或 yarn 安装，国内推荐使用 cnpm：

```
# 没有cnpm请先安装：npm i -g cnpm
cnpm i -g prisma
# or
yarn global add prisma
# 然后查看版本，出现即安装成功
prisma -v
```

mac 用户也可选择使用 brew 安装：

```
brew tap prisma/prisma

brew install prisma
```

#### 2. 连接数据库和 Prisma

```
# cd到你常用的目录
prisma init hello-world
```

在终端中可以看到各种选项，按上下键选择(windows 用户建议使用 PowerShell):

> 想在本地用 docker 跑的用户选择 new database,参考[这里](https://prisma.1wire.com/blog/newdatabase)

- 选择 **Demo server**
- 此时会打开 app.prisma.io 网页，可以注册登录或使用 github 账户登录，登录后点击授权即可。

**注意此处千万不能用数字开头的邮箱注册(尤其 qq 邮箱)，包括注册 github 的邮箱，如果你的 github 账户邮箱由数字开头，建议用字母开头邮箱注册 app.prisma.io**

- 终端显示 **Authenticating** 后选择你想部署在哪个区域，有两个选择，欧洲和美国，后面有延迟状态，选延迟低的回车确认。如：账户名/demo-us1 即美国地区。
- 填入你想使用的名字，这里我们直接回车，选择 stage 分支，默认是 dev，再次直接回车就行。
- 选择生成 **Prisma Client**的编程语言，这里我们选择 **Prisma JavaScript Client**,如选择 TS，注意后面安装依赖时会多个 graphql-tools。
- 初始文件已生成，按照提示进入目录部署： cd hello-world && prisma deploy
- 此时你的后端 API 已经可以访问，打开终端显示的 http 地址即可看到 Prisma playground

> `prisma.yml`是 Prisma 的根配置文件。
> `datamodel.prisma`定义应用程序的数据库的数据模型(它基本上定义了数据库模式)。
> `generated/prisma-client/`包含了自动生成的 prisma client 代码。
> 如果报错，请`prisma account` 查看名称开头是否为数字。

#### 3. 定义数据模型

打开编辑器编辑 `datamodel.prisma` 使用 SDL 语言风格 [SDL](https://www.prisma.io/blog/graphql-sdl-schema-definition-language-6755bcb9ce51/) 每个模型在数据库里对应一张表:

```graphql
type User {
  id: ID! @id
  email: String @unique
  name: String!
  posts: [Post!]!
}
type Post {
  id: ID! @id
  title: String!
  published: Boolean! @default(value: false)
  author: User
}
```

#### 4. 部署 Prisma API

在终端输入以下命令变更数据库表并生成新 client：

```
prisma deploy
```

Prisma API 基于数据模型进行部署，并为该文件中的每个模型公开 CRUD 和实时操作。

#### 5. 使用 Prisma client (JavaScript)

Prisma client 连接到 Prisma API，允许你对数据库执行读写操作。 本节介绍如何使用 **JavaScript** 中的 Prisma client。

在`hello-world`目录中创建一个新的 Node 脚本：

```
touch index.js
#or 在编辑器中新建index.js
```

编辑如下代码：

```js
const { prisma } = require('./generated/prisma-client');
// 一个main函数，以便我们可以使用async/await
async function main() {
  // 新建一个user，并新建一个post文章
  const newUser = await prisma.createUser({
    name: 'Alice',
    posts: {
      create: {
        title: 'The data layer for modern apps',
      },
    },
  });
  console.log(`Created new user: ${newUser.name} (ID: ${newUser.id})`);
  // 从数据库中读取所有用户user并将其打印到控制台
  const allUsers = await prisma.users();
  console.log(allUsers);
  // 从数据库中读取所有文章post并将其打印到控制台
  const allPosts = await prisma.posts();
  console.log(allPosts);
}
main().catch(e => console.error(e));
```

最后，在终端用初始化项目并启动这个文件：

```
cnpm init -y
cnpm install --save prisma-client-lib graphql
node index.js
```

此时终端显示用户已被存到数据库：

```
Created new user: Alice (ID: cjn70mkjlgnv00b77iyk9zx0e)
[ { id: 'cjn70mkjlgnv00b77iyk9zx0e', email: null, name: 'Alice' } ]
[ { id: 'cjn70mkjrgnv10b77nhqgg2zd',title: 'The data layer for modern apps',published: false } ]
```

```javascript
const usersCalledAlice = await prisma.users({
  where: {
    name: 'Alice',
  },
});
```

```javascript
// 替换下面的 __USER_ID__ 为真实的user ID
const updatedUser = await prisma.updateUser({
  where: { id: '__USER_ID__' },
  data: { email: 'alice@prisma.io' },
});
```

```javascript
// 替换下面的 __USER_ID__ 为真实的user ID
const deletedUser = await prisma.deleteUser({ id: '__USER_ID__' });
```

```javascript
const postsByAuthor = await prisma.user({ email: 'alice@prisma.io' }).posts();
```

### 构建 App

> 以下内容为构建 GraphQL API 应用，如需使用 RESTful API，请参考[RESTful API APP](https://prisma.1wire.com/blog/restful)

#### 配置项目

[`grahpql-yoga`](https://github.com/prisma/graphql-yoga) 是基于 [Express.js](https://expressjs.com/)的 GraphQL 服务器. 先安装它：

```
cnpm install --save graphql-yoga
```

每个 GraphQL API 都基于[GraphQL Schema](https://www.prisma.io/blog/graphql-server-basics-the-schema-ac5e2950214e/)，它指定了所有 API 操作和数据结构。可以理解为 schema 是前端和服务器之间的约定和连接器，schema 指定了前端能取到什么样的后端数据。

创建一个名为`schema.graphql`的新文件：

```
touch schema.graphql
```

要定义 API 操作，需要在 GraphQL schema 中指定`Query`和`Mutation`类型 - 以下操作是简单博客应用程序的示例，输入到 schema.graphql 中：

```grahpql
type Query {
  publishedPosts: [Post!]!
  post(postId: ID!): Post
  postsByUser(userId: ID!): [Post!]!
}

type Mutation {
  createUser(name: String!): User
  createDraft(title: String!, userId: ID!): Post
  publish(postId: ID!): Post
}

type User {
  id: ID!
  email: String
  name: String!
  posts: [Post!]!
}

type Post {
  id: ID!
  title: String!
  published: Boolean!
  author: User
}
```

> `post`和`User`类型是对`datamodel.prisma`中指定的模型的直接重新定义。
> 此时的定义是用于前端应用，前面说了，schema 指定了前端能取到什么样的后端数据，所以要再声明一遍，除了已删除特定于 Prisma 对于数据库的特殊指令。
> 教程里我们会学习到，schema 里是要去掉敏感数据如密码的，因为 schema 里定义的模型，前端用户都能够取到，登录教程我们后面再说。

#### 实现解析器功能

以下是如何为 GraphQL schema 中定义的六个 API 操作实现解析器(resolvers)函数。 用以下代码片段完全替换`index.js`的当前内容：

```javascript
const { prisma } = require('./generated/prisma-client');
const { GraphQLServer } = require('graphql-yoga');

const resolvers = {
  Query: {
    publishedPosts(root, args, context) {
      return context.prisma.posts({ where: { published: true } });
    },
    post(root, args, context) {
      return context.prisma.post({ id: args.postId });
    },
    postsByUser(root, args, context) {
      return context.prisma
        .user({
          id: args.userId,
        })
        .posts();
    },
  },
  Mutation: {
    createDraft(root, args, context) {
      return context.prisma.createPost({
        title: args.title,
        author: {
          connect: { id: args.userId },
        },
      });
    },
    publish(root, args, context) {
      return context.prisma.updatePost({
        where: { id: args.postId },
        data: { published: true },
      });
    },
    createUser(root, args, context) {
      return context.prisma.createUser({ name: args.name });
    },
  },
  User: {
    posts(root, args, context) {
      return context.prisma
        .user({
          id: root.id,
        })
        .posts();
    },
  },
  Post: {
    author(root, args, context) {
      return context.prisma
        .post({
          id: root.id,
        })
        .author();
    },
  },
};
```

每个解析器都在 Prisma client 实例上调用一个名为`prisma`的方法，并附加到`context`对象。

#### 配置 GraphQL 服务器

现在你需要从`graphql-yoga`库中实例化`GraphQLServer`并传递 GraphQL schema 及其解析器函数。导入的`prisma client` 实例附加到`context`，以便解析器可以访问它。

将以下代码段添加到`index.js`的底部：

```javascript
const server = new GraphQLServer({
  typeDefs: './schema.graphql',
  resolvers,
  context: {
    prisma,
  },
});

server.start(() => console.log('Server is running on http://localhost:4000'));
```

#### 启动 GraphQL 服务器

要启动 GraphQL 服务器，请运行以下命令：

```
node index.js
```

#### 在 Playground 中查看应用程序层的 GraphQL API

应用程序层的 GraphQL API 现在公开了`schema.graphql`中定义的六个操作。

要测试这些操作，请将打开浏览器到[GraphQL Playground](https://github.com/prisma/graphql-playground)的`http://localhost:4000`。

> GraphQL Playground 是一个交互式 GraphQL IDE，可让你探索 GraphQL API 的操作。 你可以单击 Playground 窗口右边缘的绿色 **SCHEMA** - 按钮，查看 GraphQL API 的自动生成文档。
> 你可以把它看做是 GraphQL 的 POST man，但是它可以直接查看 API 文档和自动补全输入，用起来你会扔掉别的后端的。

我们在 playground 里随便玩几个操作，写一段然后 run 一下看右边的输出，建议不要复制下面的代码，多用 tab 自动补全写一下：

```grahpql
mutation {
  createUser(name: "Bob") {
    id
  }
}
```

拿到返回的 id 替换下面的 _USER_ID_ 占位符

```grahpql
mutation {
  createDraft(
    title: "GraphQL is great"
    userId: "__USER_ID__"
  ) {
    id
    published
    author {
      id
    }
  }
}
```

```grahpql
mutation {
  publish(postId: "__POST_ID__") {
    id
    title
    published
  }
}
```

```grahpql
query {
  publishedPosts {
    id
    title
    author {
      id
      name
    }
  }
}
```

> 在某些代码段中，你需要将`__USER__ID__`或`__POST_ID__`占位符替换为前面查到的实际用户的 ID。

### 学习路径

我在偶然的机会下接触到了 Prisma，然后对 GraphQL 这项技术茅塞顿开。我从零开始学习它到现在已用于生产环境，这中间也踩过一些坑，而官方其实没有太多资料的，所以我有必要为后来者提供一些便利，从而使 Prisma 能够更好更快地被广大中国开发者掌握和使用。

到目前为止，国内其实没有一篇资料关于 Prisma，但我被它的技术和架构深深感染，Prisma 呈倍数地提升了整个团队的开发效率，它有必要被更多人认可。所以我联系到 Prisma 团队，在他们的支持下（尤其是 Prisma 的联合创始人 Schickling ），搭建了 Prisma 的中文文档页面，并初步翻译了文档。为了配合我的翻译工作，Prisma 团队加班完善了文档最新的版本，非常感谢。

在官方的描述中，Prisma 像是一个 ORM 层，类似 Sequelize 或 mongoose，但我在实际使用和深入理解后，发现并不是，Prisma 不仅仅是 ORM，它整个生态系统和技术栈就是一个框架，一整套完善的技术，集成了更加强大的 ORM 层和数据库。

GraphQL 一直被吵的沸沸扬扬，无数前端工程师翘首以待，但直到今天，依然没有普及开，我觉得其中最重要的一点就是，它需要后端做更大量繁琐的工作，这在很多团队是不可能实现的，前后端团队互相推脱，甚至后端自己都无力推动。所以尽管 GraphQL 能极大提升前端的效率和 APP 的速度，但后端复杂的问题不解决，就没有可能普及。

所以 Prisma 应需而生，它完全把复杂的东西抽离，后端仅仅定义好数据库字段 type 和解析器 resolver，前端就已经可以取到数据了，甚至还有自动生成的标准的 API 文档，没有数十个甚至上百个路由，没有各种判断和联调，也不需要考虑数据库连接，不仅解决原先 GraphQL 后端的复杂度，甚至比以往的 Node 后端更加简单，而且由于强类型系统，还更加可靠，性能更强。

使用 Prisma 不用担心灵活性，Prisma 技术栈里的 GraphQL Yoga 完全兼容 Express，比如说我业余时间开发的一款小程序的后端就完全是 Prisma（仅用一天就开发完成），但其中的微信登录我加了一条 POST 路由来完成微信登录获取 unionId（其实还是可以用 Prisma 的 resolvers 解决，但我复制粘贴图方便），和传统开发没有任何区别，所以不管你是要迁移还是在原先基础上升级，都没有任何问题。

不管是前端还是后端，未来不掌握 Prisma 技术栈，会在效率和先进性上吃很大的亏，越深入越觉得如此。

OK，说完上面一大堆，接下来我试图描述一下学习路径，简化学习成本。

在完成 Get Started 后，你就已经有了一个基础的后端，这时候我们就会明白，开发 Prisma 最重要的两个部分，一是 datamodel，二是 resolver。定义 datamodel 是所有后续操作的第一步，有了数据才能操作嘛，type 的定义很简单，很短的一节[数据模型定义](./part2.md)就可以明白。所以建议先学会，然后就可以自己定义一下了。至于和现有数据库的合并操作，有需求的可以看。

定义好数据模型后用`prisma generate` 自动生成操作数据的代码，然后复制 datamodel.prisma 的模型到 schema.graphql 中，去除数据库特定字符和不需要前端得到的字段，如密码和手机号等，然后复制 generated 中你实际需要的 Query、Mutation 和 Subscription 到 schema.graphql 中，当然也可以自定义创建查询 Query 和突变 Mutation。然后就可以去写 resolver 了。

resolver 翻译过来就是解析器的意思，解析什么呢，解析当后端接收到前端发来的请求后如何执行并返回什么东西。比如说前面这个新建文章：

```grahpql
# 这是前端的操作，可以在playground中写，也可以用ajax、fetch、graphql apollo、甚至wx.request发送过来。
# mutation即操作，这个操作就是createDraft，新建草稿，发给后端标题title“GraphQl is great”和用户的id，后面{}中的就是你想后端返回给你的字段。
//playground中
mutation {
  createDraft(
    title: "GraphQL is great"
    userId: "__USER_ID__"
  ) {
    id
    published
    author {
      id
    }
  }
}
# 这时候我们来看后端干了些什么
//index.js中
const resolvers = {
……
  Mutation: {
    createDraft(root, args, context) {
      return context.prisma.createPost(
        {
          title: args.title,
          author: {
            connect: { id: args.userId }
          }
        },
      )
    },
……
```

这是 resolvers 中的 Mutation 中定义 createDraft 的操作，createDraft 接收了三个参数，这个我们后面细讲，这里我们只有知道，args 包含了你前端传来的所有参数，比如 title 为 args.title，userId 同理。

而 context 就相当于数据库，`context.prisma.createPost`就类似`sequelize.model.Post.create`或`mongoose.model('Post', schema).create`。

而且数据库的包含关系和外键等已经被抽象，这里在 Post 的 author 中，直接 connect 到 author 的唯一字段即 id 就好了。传统数据库的关系操作还是比较繁琐的，Prisma 的 connect 更直观明确。

也不用处理路由，这里定义好 resolvers 后前端就已经可以 createDraft 了，API 接口就一个，比如此处是`localhost:4000`。前端所有请求 url 都是这里。先在 playground 中试试吧。

在 resolvers 中还可以做更多复杂的处理，你可以集成消息队列、grpc 等各种，甚至也可以用 sequelize 和 mongoose 来返回数据到这里从而实现 GraphQL 接口。

比如说此处我们给 Post 添加点赞的功能，在 datamodel 和 schema 中给 Post 加入 liked 字段并设默认值为 0（设默认值参考数据模型定义章节），deploy 一下，然后在 schema 中加入 addPostLike 的 Mutation，再写 resolvers：

```javascript
// 在resolvers函数中
……
async addPostLike(parent, args, context) {
        const l = await context.prisma.post({id: args.where.id})
        return context.prisma.updatePost({
            where:{id: args.postId },
            data: {
                liked: l.liked + 1
            },
        })
      }
……
```

通过以上例子，你应该大概明白 Prisma 的流程了，然后这里的重点就是 datamodel 和 resolvers，schema 算半个重点吧。

所以后面你先完成 datamodel 和 resolvers 中的[Prisma client](./part3.md)也就是上述的`context.prisma.···`的各种方法，最后去[深入理解 Prisma](./part4.md)和[Prisma GraphQL API](./part5.md)

最后把它部署到服务器则需要了解[Prisma 的 CLI 和 Configuration 配置文件](./part6.md)以及[Prisma Server 部署](./part7.md)。

剩下一些更新的操作，登录功能，上传文件，Prisma 中间件等等我会放在最后或是专栏那块。

看完所有文档和专栏后，你就可以去看实际案例，底部有链接，仿 AirBnb 的功能展示 Prisma 所有操作，拿来改一改就能成为自己的后端。

如果在学习和使用中有任何疑问和建议，请加入[Prisma 中国社区](/wechat)讨论。也欢迎广大开发者在 github 提交 pr。

ok，下面我们继续下一节。
