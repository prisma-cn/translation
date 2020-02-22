/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
  title: 'Prisma2中文文档',
  tagline: '新一代ORM框架，快速开发GraphQL服务、REST API和微服务等',
  organizationName: 'prisma',
  projectName: 'prisma2',
  baseUrl: '/',
  url: 'https://prisma.yoga',
  favicon: 'https://prisma.yoga/favicon.ico',
  customFields: {
    description:
      'Prisma 是新一代的ORM框架，能够管理复杂的数据库构建和读写，拥有优异的开发体验，快速开发GraphQL、REST、gRRC等服务。适用于任意语言和数据库。',
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
          editUrl: 'https://github.com/prisma/prisma2/edit/master/website/',
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
        },
        blog: {
          path: 'blog',
          postsPerPage: 3,
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
    image: 'site/prisma-2.png',
    // gtag: {
    //   trackingID: 'UA-141789564-1',
    // },
    // algolia: {
    //   apiKey: '47ecd3b21be71c5822571b9f59e52544',
    //   indexName: 'docusaurus-2',
    //   algoliaOptions: {
    //     facetFilters: [`version:${versions[0]}`],
    //   },
    // },
    navbar: {
      hideOnScroll: true,
      title: 'Prisma2',
      logo: {
        alt: 'prisma Logo',
        src: 'prisma1/favicon/prisma-cn.svg',
      },
      links: [
        { to: 'docs/getting-started/README', label: 'Docs', position: 'left' },
        { to: 'blog', label: 'Blog', position: 'left' },
        { to: 'showcase', label: 'Showcase', position: 'left' },
        {
          href: 'https://github.com/prisma/prisma2',
          label: 'GitHub',
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
              label: '介绍',
              to: 'docs/introduction',
            },
            {
              label: '理解',
              to: 'docs/installation',
            },
            {
              label: '从 v1 升级到 v2',
              to: 'docs/migrating-from-v1-to-v2',
            },
          ],
        },
        {
          title: '社区',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/prisma',
            },
            {
              label: 'Help',
              to: 'help',
            },
          ],
        },
        {
          title: '更多',
          items: [
            {
              label: 'Blog',
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
            {
              html: `
                <a href="https://www.netlify.com" target="_blank" rel="noreferrer noopener" aria-label="Deploys by Netlify">
                  <img src="https://www.netlify.com/img/global/badges/netlify-color-accent.svg" alt="Deploys by Netlify" />
                </a>
              `,
            },
          ],
        },
      ],
      logo: {
        alt: 'Prisma Open Source Logo',
        src: 'https://prisma.yoga/prisma-logo.svg',
        href: 'https://prisma.io/',
      },
      copyright: `Copyright © ${new Date().getFullYear()} prisma.yoga`,
    },
  },
};
