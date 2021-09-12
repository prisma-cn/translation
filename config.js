const config = {
  gatsby: {
    pathPrefix: '/',
    siteUrl: 'https://prisma.yoga',
    titlePrefix: '',
    titleSuffix: ' - Prisma 中文文档',
  },
  redirects: [
    {
      from: '/reference/tools-and-interfaces/prisma-schema/prisma-schema-file',
      to: '/reference/tools-and-interfaces/prisma-schema',
    },
    {
      from: '/reference/tools-and-interfaces/prisma-schema',
      to: '/concepts/components/prisma-schema',
    },
    {
      from: '/reference/tools-and-interfaces/prisma-client/api',
      to: '/concepts/components/prisma-client',
    },
    {
      from: '/reference/tools-and-interfaces/prisma-schema/models',
      to: '/reference/tools-and-interfaces/prisma-schema/data-model#defining-models',
    },
  ],
  header: {
    secondLevelHeaderMenuItems: [
      {
        text: '开始使用',
        to: '/getting-started',
        type: 'bucket',
        bucketName: '/100-getting-started',
      },
      {
        text: '概念',
        to: '/concepts',
        type: 'bucket',
        bucketName: '/200-concepts',
      },
      {
        text: '指南',
        to: '/guides',
        type: 'bucket',
        bucketName: '/300-guides',
      },
      {
        text: '相关',
        to: '/reference',
        type: 'bucket',
        bucketName: '/400-reference',
      },
      {
        text: '支持',
        to: '/support',
        type: 'bucket',
        bucketName: '/500-support',
      },
      { text: '关于', to: '/about', type: 'bucket', bucketName: '/600-about' },
      { text: 'Prisma 1 文档', to: 'https://v1.prisma.io/docs/1.34', type: 'external-link' },
    ],
    search: {
      indexName: process.env.GATSBY_ALGOLIA_INDEX_NAME,
      algoliaAppId: process.env.GATSBY_ALGOLIA_APP_ID,
      algoliaSearchKey: process.env.GATSBY_ALGOLIA_SEARCH_KEY,
      algoliaAdminKey: process.env.GATSBY_ALGOLIA_ADMIN_API_KEY,
    },
  },
  homepage: {
    SummaryLinkData: {
      gettingStarted: 'getting-started',
      readyToRun: 'https://github.com/prisma/prisma-examples',
      slack: 'https://slack.prisma.io/',
      git: 'https://github.com/prisma',
      buttons: [
        {
          text: '快速开始',
          url: 'getting-started/',
          special: true,
          icon: 'DoubleArrow',
        },
        {
          text: '示例项目',
          url: 'https://github.com/prisma/prisma-examples',
          special: false,
          icon: null,
        },
      ],
    },

    GeneralLinkData: [
      {
        categoryName: '概览',
        icon: 'OverviewIcon',
        links: [
          {
            text: 'Prisma是什么',
            url: 'concepts/overview/what-is-prisma',
            codeBlock: false,
          },
          {
            text: '为什么使用Prisma?',
            url: 'concepts/overview/why-prisma',
            codeBlock: false,
          },
          {
            text: '你应该用Prisma吗?',
            url: 'concepts/overview/should-you-use-prisma',
            codeBlock: false,
          },
          {
            text: 'Prisma在你技术栈的定位',
            url: 'concepts/overview/prisma-in-your-stack',
            codeBlock: false,
          },
          {
            text: 'Prisma底层',
            url: 'concepts/components/prisma-engines',
            codeBlock: false,
          },
        ],
      },
      {
        categoryName: '组件',
        icon: 'ComponentsIcon',
        links: [
          {
            text: 'Prisma schema',
            url: 'concepts/components/prisma-schema',
            codeBlock: false,
          },
          {
            text: 'Prisma Client',
            url: 'concepts/components/prisma-client',
            codeBlock: false,
          },
          {
            text: 'Prisma Migrate',
            url: 'concepts/components/prisma-migrate',
            codeBlock: false,
          },
          {
            text: 'Introspection',
            url: 'concepts/components/introspection',
            codeBlock: false,
          },
          {
            text: 'Prisma CLI',
            url: 'concepts/components/prisma-cli',
            codeBlock: false,
          },
          {
            text: 'Prisma Studio',
            url: 'concepts/components/prisma-studio',
            codeBlock: false,
          },
          {
            text: '预览特性',
            url: 'concepts/components/preview-features',
            codeBlock: false,
          },
        ],
      },
      {
        categoryName: '数据库连接器',
        icon: 'DatabaseIcon',
        links: [
          {
            text: 'PostgreSQL',
            url: 'concepts/database-connectors/postgresql',
            codeBlock: false,
          },
          {
            text: 'MySQL',
            url: 'concepts/database-connectors/mysql',
            codeBlock: false,
          },
          {
            text: 'MongoDB',
            url: 'concepts/database-connectors/mongodb',
            codeBlock: false,
          },
          {
            text: 'SQL Server',
            url: 'concepts/database-connectors/microsoft-sql-server',
            codeBlock: false,
          },
          {
            text: 'SQLite',
            url: 'concepts/database-connectors/sqlite',
            codeBlock: false,
          },
        ],
      },
      {
        categoryName: '更多',
        icon: 'MoreIcon',
        links: [
          {
            text: '编辑器设置',
            url: 'concepts/more/editor-setup',
            codeBlock: false,
          },
          {
            text: 'Codemod',
            url: 'concepts/more/codemod',
            codeBlock: false,
          },
          {
            text: 'Telemetry',
            url: 'concepts/more/telemetry',
            codeBlock: false,
          },
          {
            text: '和Prisma比较',
            url: 'concepts/more/comparisons',
            codeBlock: false,
          },
        ],
      },
    ],
    GuideText: '使用Prisma构建和部署应用程序指南',

    GuideLinkData: [
      {
        title: '使用Prisma Migrate',
        color: '#48BB78',
        small: false,
        content: '开始使用Prisma Migrate',
        url: 'guides/database/developing-with-prisma-migrate',
      },
      {
        title: '性能和优化',
        color: '#38B2AC',
        small: true,
        content: '调整查询并监视应用程序',
        url: 'guides/performance-and-optimization',
      },
      {
        title: '数据库工作流程',
        color: '#4299E1',
        small: true,
        content: '常见数据库的工作流（如配置约束或级联删除）指南',
        url: 'guides/database',
      },
      {
        title: '采用 Prisma',
        color: '#9F7AEA',
        small: true,
        content: '从其他 ORMs 迁移到Prisma',
        url: 'guides/migrate-to-prisma',
      },
      {
        title: '从 Prisma1 升级',
        color: '#ED64A6',
        small: true,
        content: '从Prisma 1 或 Graphcool升级到最新',
        url: 'guides/upgrade-guides',
      },
      {
        title: '部署Prisma 项目',
        color: '#667EEA',
        small: false,
        content:
          '将带有Prisma client的Node.js应用程序部署到Vercel、AWS Lambda、Netlify和Heroku等平台',
        url: 'guides/deployment',
      },
    ],
    ReferenceText:
      'Prisma Client, Prisma Schema Language (PSL), Prisma CLI, 和支持database providers的参考文档',

    ReferenceLinkData: [
      {
        categoryName: 'Prisma 参考文档',
        mainUrl: 'reference',
        icon: 'Schema',
        links: [
          {
            text: 'Prisma Client API reference',
            url: 'reference/api-reference/prisma-client-reference',
            codeBlock: false,
          },
          {
            text: 'Prisma schema reference',
            url: 'reference/api-reference/prisma-schema-reference',
            codeBlock: false,
          },
          {
            text: 'Prisma error reference',
            url: 'reference/api-reference/error-reference',
            codeBlock: false,
          },
        ],
      },
      {
        categoryName: 'CLI 命令行指令',
        mainUrl: 'reference/api-reference/command-reference',
        icon: 'CLI',
        links: [
          {
            text: 'introspect',
            url: 'reference/api-reference/command-reference#introspect',
            codeBlock: true,
          },
          {
            text: 'migrate',
            url: 'reference/api-reference/command-reference#prisma-migrate',
            codeBlock: true,
          },
          {
            text: 'db',
            url: 'reference/api-reference/command-reference#db',
            codeBlock: true,
          },
        ],
      },
      {
        categoryName: '数据库',
        mainUrl: 'reference/database-reference',
        icon: 'DbLink',
        links: [
          {
            text: '特性列表',
            url: 'reference/database-reference/database-features',
            codeBlock: false,
          },
          {
            text: '连接地址',
            url: 'reference/database-reference/connection-urls',
            codeBlock: false,
          },
          {
            text: '支持的数据库',
            url: 'reference/database-reference/supported-databases',
            codeBlock: false,
          },
        ],
      },
    ],

    MoreUsefulLinks: [
      {
        text: `最近更新`,
        url: 'about/whats-new-in-prisma-docs',
        codeBlock: false,
      },
      {
        text: '关于文档 ',
        url: 'about/about-the-docs',
        codeBlock: false,
      },
      {
        text: '风格指南',
        url: 'about/style-guide',
        codeBlock: false,
      },
      {
        text: '在Github提问',
        url: 'support#ask-a-question-about-prisma',
        codeBlock: false,
      },
      {
        text: '提交Bug',
        url: 'support#create-a-bug-report-for-prisma',
        codeBlock: false,
      },
      {
        text: '提交功能建议',
        url: 'support#submit-a-feature-request',
        codeBlock: false,
      },
      {
        text: 'Slack',
        url: 'https://slack.prisma.io/',
        codeBlock: false,
      },
      {
        text: 'FAQ',
        url: 'about/prisma/faq',
      },
      {
        text: '限制',
        url: 'about/limitations',
        codeBlock: false,
      },
      {
        text: '社区',
        url: 'https://www.prisma.io/community',
        codeBlock: false,
      },
      {
        text: 'Roadmap',
        url: 'about/roadmap',
        codeBlock: false,
      },
      {
        text: '版本发布',
        url: 'about/releases',
        codeBlock: false,
      },
    ],
  },
  siteMetadata: {
    title: 'Prisma 官方中文文档 - 下一代Node.js、TypeScript、Go 的数据库 ORM',
    description:
      'Prisma是下一代Node.js、TypeScript、Go 的数据库 ORM，帮助开发者以更快的速度和更少的错误去连接并管理PostgreSQL、MySQL、SQLite、MongoDB、SQLServer等。',
    keywords: 'Docs, prisma, 2.0',
    docsLocation: 'https://github.com/prisma-cn/translation/tree/main/content',
    twitter: {
      site: '@prisma',
      creator: '@prisma',
      image: '/social/docs-social.png',
    },
    og: {
      site_name: 'Prisma',
      type: 'website',
      image: {
        alt: '现代化开发的数据库工具',
        height: '630',
        type: 'image/png',
        url: '/social/docs-social.png',
        width: '1200',
      },
    },
  },
  feedback: {
    sentimentUrl: 'https://prisma2-docs.netlify.app/.netlify/functions/sentiment',
    feedbackUrl: 'https://prisma2-docs.netlify.app/.netlify/functions/feedback',
  },
  sidebar: {
    tablet_menu_split: ['04-guides', '05-more'], // Slugs for top level folders which should appear in right pane on tablet
  },
  footer: {
    newsletter: {
      text: '订阅 Prisma 的功能更新消息',
    },
  },
}

module.exports = config
