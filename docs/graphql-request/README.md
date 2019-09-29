# graphql-request

[![CircleCI](https://circleci.com/gh/prisma/graphql-request.svg?style=shield)](https://circleci.com/gh/prisma/graphql-request) [![npm version](https://badge.fury.io/js/graphql-request.svg)](https://badge.fury.io/js/graphql-request)

📡 支持脚本或简单应用的 Node 和浏览器的最小 GraphQL 客户端

## 特点

- 最简单和轻量级的 GraphQL 客户端
- 基于Promise 的 API (与`async` / `await`)
- 支持Typescript脚本(Flow版本即将推出)

## 安装

```sh
npm install graphql-request
```

## 快速开始

用一行代码发送一个 GraphQL 查询。 ▶️ [Try it out](https://runkit.com/593130bdfad7120012472003/593130bdfad7120012472004).

```js
import { request } from 'graphql-request';

const query = `{
  Movie(title: "Inception") {
    releaseDate
    actors {
      name
    }
  }
}`;

request('https://api.graph.cool/simple/v1/movies', query).then(data => console.log(data));
```

## 使用

```js
import { request, GraphQLClient } from 'graphql-request';

// Run GraphQL queries/mutations using a static function 使用静态函数运行graphql queries(查询)/mutations(突变)
request(endpoint, query, variables).then(data => console.log(data));

// ... or create a GraphQL client instance to send requests 或者创建一个graphql客户端实例来发送请求
const client = new GraphQLClient(endpoint, { headers: {} });
client.request(query, variables).then(data => console.log(data));
```

## 例子

### 通过 HTTP 头进行身份验证

```js
import { GraphQLClient } from 'graphql-request';

async function main() {
  const endpoint = 'https://api.graph.cool/simple/v1/cixos23120m0n0173veiiwrjr';

  const graphQLClient = new GraphQLClient(endpoint, {
    headers: {
      authorization: 'Bearer MY_TOKEN',
    },
  });

  const query = /* GraphQL */ `
    {
      Movie(title: "Inception") {
        releaseDate
        actors {
          name
        }
      }
    }
  `;

  const data = await graphQLClient.request(query);
  console.log(JSON.stringify(data, undefined, 2));
}

main().catch(error => console.error(error));
```

[TypeScript Source](examples/authentication-via-http-header.ts)

### 传递更多的配置参数

```js
import { GraphQLClient } from 'graphql-request';

async function main() {
  const endpoint = 'https://api.graph.cool/simple/v1/cixos23120m0n0173veiiwrjr';

  const graphQLClient = new GraphQLClient(endpoint, {
    credentials: 'include',
    mode: 'cors',
  });

  const query = /* GraphQL */ `
    {
      Movie(title: "Inception") {
        releaseDate
        actors {
          name
        }
      }
    }
  `;

  const data = await graphQLClient.request(query);
  console.log(JSON.stringify(data, undefined, 2));
}

main().catch(error => console.error(error));
```

[TypeScript Source](examples/passing-more-options-to-fetch.ts)

### 使用变量

```js
import { request } from 'graphql-request';

async function main() {
  const endpoint = 'https://api.graph.cool/simple/v1/cixos23120m0n0173veiiwrjr';

  const query = /* GraphQL */ `
    query getMovie($title: String!) {
      Movie(title: $title) {
        releaseDate
        actors {
          name
        }
      }
    }
  `;

  const variables = {
    title: 'Inception',
  };

  const data = await request(endpoint, query, variables);
  console.log(JSON.stringify(data, undefined, 2));
}

main().catch(error => console.error(error));
```

[TypeScript Source](examples/using-variables.ts)

### 错误处理

```js
import { request } from 'graphql-request';

async function main() {
  const endpoint = 'https://api.graph.cool/simple/v1/cixos23120m0n0173veiiwrjr';

  const query = /* GraphQL */ `
    {
      Movie(title: "Inception") {
        releaseDate
        actors {
          fullname # "Cannot query field 'fullname' on type 'Actor'. Did you mean 'name'?"
        }
      }
    }
  `;

  try {
    const data = await request(endpoint, query);
    console.log(JSON.stringify(data, undefined, 2));
  } catch (error) {
    console.error(JSON.stringify(error, undefined, 2));
    process.exit(1);
  }
}

main().catch(error => console.error(error));
```

[TypeScript Source](examples/error-handling)

###  使用 `require` 而不是 `import` (支持多种模块导入方式)

```js
const { request } = require('graphql-request');

async function main() {
  const endpoint = 'https://api.graph.cool/simple/v1/cixos23120m0n0173veiiwrjr';

  const query = /* GraphQL */ `
    {
      Movie(title: "Inception") {
        releaseDate
        actors {
          name
        }
      }
    }
  `;

  const data = await request(endpoint, query);
  console.log(JSON.stringify(data, undefined, 2));
}

main().catch(error => console.error(error));
```

###  支持使用Cookie

```sh
npm install fetch-cookie
```

```js
require('fetch-cookie/node-fetch')(require('node-fetch'));

import { GraphQLClient } from 'graphql-request';

async function main() {
  const endpoint = 'https://api.graph.cool/simple/v1/cixos23120m0n0173veiiwrjr';

  const graphQLClient = new GraphQLClient(endpoint, {
    headers: {
      authorization: 'Bearer MY_TOKEN',
    },
  });

  const query = /* GraphQL */ `
    {
      Movie(title: "Inception") {
        releaseDate
        actors {
          name
        }
      }
    }
  `;

  const data = await graphQLClient.rawRequest(query);
  console.log(JSON.stringify(data, undefined, 2));
}

main().catch(error => console.error(error));
```

[TypeScript Source](examples/cookie-support-for-node)

### 接收raw的响应

The `request` method will return the `data` or `errors` key from the response.
If you need to access the `extensions` key you can use the `rawRequest` method:
`request` 方法将从响应中返回数据或错误。 如果你需要访问扩展键，你可以使用 rawRequest 方法:

```js
import { rawRequest } from 'graphql-request';

async function main() {
  const endpoint = 'https://api.graph.cool/simple/v1/cixos23120m0n0173veiiwrjr';

  const query = /* GraphQL */ `
    {
      Movie(title: "Inception") {
        releaseDate
        actors {
          name
        }
      }
    }
  `;

  const { data, errors, extensions, headers, status } = await rawRequest(endpoint, query);
  console.log(JSON.stringify({ data, errors, extensions, headers, status }, undefined, 2));
}

main().catch(error => console.error(error));
```

[TypeScript Source](examples/receiving-a-raw-response)

### 更多的例子即将来临... ..

- Fragments
- Using [`graphql-tag`](https://github.com/apollographql/graphql-tag)

## 常见问题

### `graphql-request` 和 `Apollo` 和 `Relay` 之间有什么区别？

`Graphql-request` 是使用 GraphQL 客户端最简单的方法。 它非常适合小脚本或者简单的应用程序。
与 Apollo 或 Relay 这样的 GraphQL 客户机相比，`GraphQL-request` 没有内置的缓存，也没有前端框架的集成。 我们的目标是保持包和 API 尽可能最小化。

### So what about Lokka? 
`Lokka`很棒，但它仍然需要大量的[代码配置](https://github.com/kadirahq/lokka-transport-http)才能发送一个简单的 GraphQL 查询。 `Graphql-request` 与`Lokka`相比工作量更小，但使用起来更简单。

## 帮助和社区 [![Slack Status](https://slack.prisma.io/badge.svg)](https://slack.prisma.io) 

加入我们的[Slack 社区](http://slack.prisma.io/)，如果你遇到问题或有问题。我们喜欢与你交谈！

<p align="center"><a href="https://oss.prisma.io"><img src="https://imgur.com/IMU2ERq.png" alt="Prisma" height="170px"></a></p>
