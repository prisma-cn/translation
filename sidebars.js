/*
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
  all: { 总目录: ['directory'] },
  prisma2: {
    快速入门: [
      {
        type: 'doc',
        id: 'prisma2/getting-started/README',
      },
      {
        type: 'doc',
        id: 'prisma2/getting-started/quickstart-existing-project',
      },
      {
        type: 'category',
        label: '从零开始',
        items: [
          {
            type: 'doc',
            id: 'prisma2/getting-started/start-from-scratch-with-empty-db/quickstart-sql',
          },
          {
            type: 'doc',
            id:
              'prisma2/getting-started/start-from-scratch-with-empty-db/quickstart-prisma-migrate',
          },
        ],
      },
      {
        type: 'doc',
        id: 'prisma2/tutorial',
      },
    ],
    概念: [
      {
        type: 'doc',
        id: 'prisma2/prisma-schema-file',
      },
      {
        type: 'doc',
        id: 'prisma2/data-sources',
      },
      {
        type: 'doc',
        id: 'prisma2/data-modeling',
      },
      {
        type: 'doc',
        id: 'prisma2/relations',
      },
      {
        type: 'doc',
        id: 'prisma2/transactions',
      },
    ],
    'Prisma CLI': [
      {
        type: 'doc',
        id: 'prisma2/prisma2-cli',
      },
      {
        type: 'doc',
        id: 'prisma2/introspection',
      },
    ],
    'Prisma Core': [
      {
        type: 'doc',
        id: 'prisma2/core/README',
      },
      {
        type: 'doc',
        id: 'prisma2/core/connectors/mysql',
      },
      {
        type: 'doc',
        id: 'prisma2/core/connectors/postgresql',
      },
      {
        type: 'doc',
        id: 'prisma2/core/connectors/sqlite',
      },
      {
        type: 'doc',
        id: 'prisma2/core/generators/prisma-client-js',
      },
    ],
    'Prisma Client': [
      {
        type: 'doc',
        id: 'prisma2/prisma-client-js/api',
      },
      {
        type: 'doc',
        id: 'prisma2/prisma-client-js/codegen-and-node-setup',
      },
      {
        type: 'doc',
        id: 'prisma2/prisma-client-js/deployment',
      },
      {
        type: 'doc',
        id: 'prisma2/prisma-client-js/generated-types',
      },
      {
        type: 'doc',
        id: 'prisma2/prisma-client-js/usage-with-bundlers',
      },
      {
        type: 'doc',
        id: 'prisma2/prisma-client-js/migrating-from-sequelize',
      },
      {
        type: 'doc',
        id: 'prisma2/prisma-client-js/migrating-from-typeorm',
      },
    ],
    'Prisma Migrate': [
      {
        type: 'doc',
        id: 'prisma2/prisma-migrate/README',
      },
      {
        type: 'doc',
        id: 'prisma2/prisma-migrate/migration-files',
      },
    ],
    导入导出数据: [
      {
        type: 'doc',
        id: 'prisma2/import-and-export-data/README',
      },
      {
        type: 'doc',
        id: 'prisma2/import-and-export-data/mysql',
      },
      {
        type: 'doc',
        id: 'prisma2/import-and-export-data/postgresql',
      },
      {
        type: 'doc',
        id: 'prisma2/import-and-export-data/sqlite',
      },
    ],
    升级指南: [
      {
        type: 'doc',
        id: 'prisma2/upgrade-guides/upgrading-from-prisma-1',
      },
      {
        type: 'doc',
        id: 'prisma2/upgrade-guides/upgrading-to-preview019',
      },
    ],
    其他: [
      {
        type: 'doc',
        id: 'prisma2/limitations',
      },
      {
        type: 'doc',
        id: 'prisma2/supported-databases',
      },
      {
        type: 'doc',
        id: 'prisma2/telemetry',
      },
      {
        type: 'doc',
        id: 'prisma2/prisma2-feedback',
      },
      {
        type: 'doc',
        id: 'prisma2/releases',
      },
      {
        type: 'doc',
        id: 'prisma2/glossary',
      },
      {
        type: 'doc',
        id: 'prisma2/faq',
      },
    ],
  },
  prisma1: {
    'Prisma V1.34.10': [
      'prisma1/start',
      'prisma1/part1',
      'prisma1/part2',
      'prisma1/part3',
      'prisma1/part4',
      'prisma1/part5',
      'prisma1/part6',
      'prisma1/part7',
      'prisma1/part8',
      'prisma1/part9',
      'prisma1/part10',
    ],
  },
};
