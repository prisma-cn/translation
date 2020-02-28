/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
  title: 'Prisma中文文档',
  tagline: '现代化数据库工具集，读写、迁移、构建你的数据库',
  organizationName: 'prisma',
  projectName: 'prisma',
  baseUrl: '/',
  url: 'https://prisma.yoga',
  favicon: 'https://prisma.yoga/favicon.ico',
  customFields: {
    description:
      'Prisma 是新一代的数据库工具集，ORM框架，能够管理复杂的数据库构建和读写，拥有优异的开发体验，快速开发GraphQL、REST、gRRC等服务。适用于任意语言和数据库。',
  },
  themes: ['@docusaurus/theme-live-codeblock'],
  plugins: [],
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          path: 'docs',
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/prisma-cn/translation/',
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
        },
        blog: {
          path: 'blog',
          postsPerPage: 10,
          feedOptions: {
            type: 'all',
            copyright: `Copyright © ${new Date().getFullYear()} prisma.yoga`,
          },
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  themeConfig: {
    prism: {
      theme: require('prism-react-renderer/themes/vsDark'),
      darkTheme: require('prism-react-renderer/themes/dracula'),
    },
    image: 'site/og-image.png',
    // gtag: {
    //   trackingID: '',
    // },
    // algolia: {
    //   apiKey: '',
    //   indexName: 'prisma-cn',
    //   algoliaOptions: {
    //     facetFilters: [`version:${versions[0]}`],
    //   },
    // },
    navbar: {
      hideOnScroll: true,
      title: 'Prisma',
      logo: {
        alt: 'prisma Logo',
        src: 'prisma-logo.svg',
        srcDark: 'prisma-logo-white.svg',
      },
      links: [
        { to: 'docs/prisma2/getting-started/README', label: 'Prisma2', position: 'left' },
        { to: 'docs/prisma1/start', label: 'V1', position: 'left' },
        { to: 'blog', label: '博客', position: 'left' },
        { to: 'showcase', label: '用户案例', position: 'left' },
        {
          href: 'https://github.com/prisma/prisma',
          label: 'GitHub',
          position: 'right',
        },
        {
          to: 'wechat',
          label: '微信群',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: '文档',
          items: [
            {
              label: 'Prisma2',
              to: 'docs/prisma2/getting-started/README',
            },
            {
              label: 'Prisma1',
              to: 'docs/prisma1/start',
            },
            {
              label: '从 v1 升级到 v2',
              to: 'docs/prisma2/upgrade-guides/upgrading-from-prisma-1',
            },
          ],
        },
        {
          title: '社区',
          items: [
            {
              label: '微信群',
              to: 'wechat',
            },
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/prisma',
            },
            {
              label: '帮助',
              to: 'help',
            },
          ],
        },
        {
          title: '更多',
          items: [
            {
              label: '博客',
              to: 'blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/prisma/prisma',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/prisma',
            },
          ],
        },
      ],
      logo: {
        alt: 'Prisma Open Source Logo',
        src: '/prisma-logo-white.svg',
        href: 'https://prisma.io/',
      },
      copyright: `Copyright © ${new Date().getFullYear()} prisma.yoga`,
    },
  },
};
