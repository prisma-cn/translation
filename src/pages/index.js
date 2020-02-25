/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';

import Layout from '@theme/Layout';

import classnames from 'classnames';

import styles from './styles.module.css';

function Home() {
  const QUOTES = [
    {
      thumbnail: 'site/clientjs.svg',
      name: '数据读写(ORM)',
      title: 'Prisma Client',
      description:
        'Prisma client是自动生成的代码，提供对数据库的类型安全访问。 它可以替代API服务器或微服务架构中的传统ORM。',
      text: (
        <>
          自动生成类型安全的代码 <div />
          无缝 JOIN & 链式 API <div />
          原生访问数据库 <div />
          强大的过滤 API <div />
          支持 SQL & NoSQL 数据库 <div />
          实时事件系统 <div />
          连接池 <div />
          高级分页 <div />
          <div />
        </>
      ),
    },
    {
      thumbnail: 'site/migrate.svg',
      name: '数据库建模',
      title: 'Prisma Magrate',
      description: '使用强大的SDL语法进行直观的数据建模和无缝的数据库迁移。',
      text: (
        <>
          使用schema统一所有数据库模型 <div />
          对数据库模型进行版本管理 <div />
          灵活并能简单集成 <div />
          强大的数据定义语言 <div />
          简洁并声明性地定义数据库 <div />
          Relay-style 分页 <div />
          数据导入导出 <div />
          自动变更 <div />
          优异的开发体验 <div />
          <div />
        </>
      ),
    },
    {
      thumbnail: 'site/studio.svg',
      name: '数据库管理',
      title: 'Prisma Admin',
      description:
        'Prisma Admin是开发者的数据库GUI。 创建数据库视图，使用表格轻松读取和写入数据，同时能开发基于UI的自定义数据工作流。',
      text: (
        <>
          漂亮的UI界面 <div />
          直观的工作流程 <div />
          使用GraphQL读写数据 <div />
          可扩展 <div />
          支持自定义插件 <div />
          多重权限鉴权 <div />
          <div />
        </>
      ),
    },
  ];
  const context = useDocusaurusContext();
  const { siteConfig: { customFields = {} } = {} } = context;

  return (
    <Layout permalink='/' description={customFields.description}>
      <div className='page-header'>
        <div className='squares square1' />
        <div className='squares square2' />
        <div className='squares square3' />
        <div className='squares square4' />
        <div className='squares square5' />
        <div className='squares square6' />
        <div className='squares square7' />
        <div className={styles.hero}>
          <div className={styles.heroInner}>
            {/* <h1 className='padding-top--md'>Prisma2</h1> */}
            <img alt='logo hero' className={styles.heroLogo} src={'/prisma-cn.svg'} />
            <div className={styles.heroContainer}>
              <a href='https://www.prisma.io' target='_blank' rel='noopener noreferrer'>
                官网
              </a>
              <a href='https://github.com/prisma/prisma' target='_blank' rel='noopener noreferrer'>
                GitHub
              </a>
              <Link to={useBaseUrl('docs/directory')}>文档</Link>
            </div>
          </div>
        </div>
      </div>
      <div className={classnames(styles.section, styles.sectionAlt, styles.quotes)}>
        <div className='container'>
          <h2 className='text--center'>Prisma是什么</h2>
          <div className='row'>
            {QUOTES.map(quote => (
              <div className='col' key={quote.name}>
                <div className='avatar avatar--vertical margin-bottom--sm top20'>
                  <img alt={quote.name} src={quote.thumbnail} style={{ padding: '40px 20px' }} />
                  <div className='avatar__intro padding-top--sm'>
                    <h4 className='avatar__name'>{quote.name}</h4>
                    <small className='avatar__subtitle  pd20'>{quote.title}</small>
                    <p className='avatar__subtitle'>{quote.description}</p>
                  </div>
                </div>
                <div className='text--center padding-horiz--md'>{quote.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className='text--center'>Prisma适用于什么</h2>
        <div className='container text--center margin-bottom--xl'>
          <div className='row pt70'>
            <div className='col'>
              <img className={styles.featureImage} alt='auto' src={'site/gql-api.png'} />
              <h3 className='padding-top--md'>GraphQL API</h3>
              <p className='padding-horiz--md left'>
                Prisma弥合了数据库和GraphQL
                resolvers之间的鸿沟，让实现生产级别的GraphQL服务器变得更加容易。
                除了强大的查询引擎和API，Prisma在开发体验方面尤为突出。
              </p>
              <div className={styles.feature}>开箱即用的CRUD操作</div>
              <div className={styles.feature}>高性能查询解析</div>
              <div className={styles.feature}>集成GraphQL subscriptions</div>
              <div className={styles.feature}>与GraphQL生态系统紧密</div>
              <div className={styles.feature}>类型安全的resolvers</div>
              <div className={styles.feature}>Relay-style分页</div>
            </div>
          </div>
          <div className='row pt70'>
            <div className='col'>
              <img
                alt='shop'
                className={styles.featureImage}
                src={useBaseUrl('site/rest-api.png')}
              />
              <h3 className='padding-top--md'>REST API</h3>
              <p className='padding-horiz--md left'>
                Prisma替代了传统的ORM，为数据访问提供了一种类型安全并现代化的API，以确保开发者可以用方便、高效且安全的方式读取和写入数据，节省大量时间。
              </p>
              <div className={styles.feature}>实时API，轻松集成WebSocket</div>
              <div className={styles.feature}>高性能查询解析</div>
              <div className={styles.feature}>无需CRUD样板代码</div>
              <div className={styles.feature}>端到端类型安全</div>
              <div className={styles.feature}>与OpenAPI/Swagger兼容</div>
              <div className={styles.feature}>高级分页</div>
            </div>
          </div>
          <div className='row pt70'>
            <div className='col'>
              <img alt='im' className={styles.dbImage} src={'site/db-sm.png'} />
              <h3 className='padding-top--md'>数据库微服务</h3>
              <p className='padding-horiz--md left'>
                Prisma通过在数据库之上添加schemaful服务使构建微服务架构变得更加容易。
                数据库会自动转换为可轻松访问数据的服务，并可通过API网关进行使用。
              </p>
              <div className={styles.feature}>实现面向服务架构</div>
              <div className={styles.feature}>支持OpenAPI, gRPC, Thrift</div>{' '}
              <div className={styles.feature}>自动生成DB service & client</div>{' '}
              <div className={styles.feature}>专为云原生基础架构而建</div>{' '}
              <div className={styles.feature}>高性能查询解析</div>
              <div className={styles.feature}>多数据库支持</div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.section}>
        <h2 className='text--center'>Prisma的未来</h2>
        <img src='site/prisma-overview.png' alt='prisma future' />
        <div className='container text--center margin-bottom--xl'>
          <div className='row'>
            <div className='col'>
              <h3 className='padding-top--md'>任何语言任何数据库</h3>
              <p className='padding-horiz--md left'>
                Prisma的目标是提供一种与数据库无关的抽象，以供任何编程语言使用。{' '}
              </p>
            </div>{' '}
            <div className='col'>
              <h3 className='padding-top--md'>跨数据库操作</h3>
              <p className='padding-horiz--md left'>
                Prisma API将能够一次抽象多个数据库，从而实现跨数据库操作（例如JOIN）。
              </p>
            </div>
            <div className='col'>
              <h3 className='padding-top--md'>高性能智能数据层</h3>
              <p className='padding-horiz--md left'>
                作为应用程序中的data layer，Prisma将能够智能推测，做出最好性能的数据读写。
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Home;
