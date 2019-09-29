/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
  title: 'Prisma中文文档',
  tagline: '下一代的数据库框架',
  organizationName: 'prisma',
  projectName: 'prisma',
  baseUrl: '/',
  url: 'https://prisma.yoga',
  favicon: 'favicon.ico',
  plugins: [
    [
      '@docusaurus/plugin-ideal-image',
      {
        quality: 70,
        max: 1030, // max resized image's size.
        min: 640, // min resized image's size. if original is lower, use that size.
        steps: 2, // the max number of images generated between min and max (inclusive)
      },
    ],
  ],
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          path: 'docs',
          sidebarPath: require.resolve('./sidebars.js'),
        },
        blog: {
          path: './blog',
          postsPerPage: 5,
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  // themes: ['@docusaurus/theme-live-codeblock'],
  themeConfig: {
    prismTheme: require('prism-react-renderer/themes/vsDark'),
    image: 'site/prisma-2.png',
    // gtag: {
    //   trackingID: 'UA-141789564-1',
    // },
    // googleAnalytics: {
    //   trackingID: 'UA-141789564-1',
    // },
    // algolia: {
    //   apiKey: '47ecd3b21be71c5822571b9f59e52544',
    //   indexName: 'prisma-2',
    //   algoliaOptions: {},
    // },
    navbar: {
      title: 'Prisma',
      logo: {
        alt: 'Prisma Logo',
        src: 'prisma-logo.svg',
      },
      links: [
        { to: 'docs/prisma2/readme', label: 'Prisma2', position: 'left' },
        { to: 'docs/prisma2/photon', label: 'Photon', position: 'left' },
        { to: 'docs/prisma2/lift', label: 'Lift', position: 'left' },
        { to: 'docs/yoga2/readme', label: 'Yoga2', position: 'left' },
        { to: 'docs/nexus/readme', label: 'Nexus', position: 'left' },
        { to: 'docs/graphql-js/readme', label: 'GraphQL', position: 'left' },
        { to: 'docs/apollo/readme', label: 'Apollo', position: 'left' },
        { to: 'docs/graphql-code-generator/readme', label: 'Codegen', position: 'left' },
        { to: 'blog', label: 'Blog', position: 'left' },
        { to: 'showcase', label: 'Showcase', position: 'left' },
        {
          href: 'https://prisma.1wire.com',
          label: 'Prisma1',
          position: 'right',
        },
        {
          href: 'https://github.com/prisma/prisma',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Introduction',
              to: 'docs/introduction',
            },
            {
              label: 'Installation',
              to: 'docs/installation',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/prisma',
            },
            {
              label: 'Feedback',
              to: 'feedback',
            },
          ],
        },
        {
          title: 'Social',
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
          ],
        },
      ],
      logo: {
        alt: 'Prisma Logo',
        src: 'prisma-cn.svg',
      },
      copyright: `Copyright © ${new Date().getFullYear()} prisma.yoga`,
    },
  },
};
