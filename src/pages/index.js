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
      thumbnail: 'https://yixiansrc.oss-cn-hangzhou.aliyuncs.com/wemo/workflow00019.png',
      name: '效率',
      title: '',
      text: (
        <>
          前所未有地提高开发效率，扩大市场规模。 <div />
          可从零搭建您的应用程序 <div />
          轻松接入已有应用 <div />
          快速实现众多功能 <div />
          海量数据维护 <div />
          零运维
          <div />
          <div />
        </>
      ),
    },
    {
      thumbnail: 'https://yixiansrc.oss-cn-hangzhou.aliyuncs.com/wemo/workflow00016.png',
      name: '可靠',
      title: '',
      text: (
        <>
          支持PB级数据量，千万级别并发。 <div />
          多容灾系统，保障服务0停机 <div />
          数据三备份，不丢失任何数据 <div />
          无需考虑分库分表，自动迁移 <div />
          完善的服务支持 <div />
          <div />
        </>
      ),
    },
    {
      thumbnail: 'https://yixiansrc.oss-cn-hangzhou.aliyuncs.com/wemo/workflow00017.png',
      name: '安全',
      title: '',
      text: (
        <>
          全链路数据加密。 <div />
          防SQL注入 <div />
          抵御DDoS攻击 <div />
          全域HTTPS <div />
          数据快照支持 <div />
          多重权限鉴权
          <div />
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
            <h1 className='padding-top--md'>Prisma2</h1>
            <img
              alt='Wemo hero'
              className={styles.heroLogo}
              src={'https://yixiansrc.oss-cn-hangzhou.aliyuncs.com/wemo/logo.png'}
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className='container text--center margin-bottom--xl'>
          <div className='row'>
            <div className='col'>
              <img
                className={styles.featureImage}
                alt='auto'
                src={'https://yixiansrc.oss-cn-hangzhou.aliyuncs.com/wemo/workflow00018.svg'}
              />
              <h3 className='padding-top--md'>自动化编辑器</h3>
              <p className='padding-horiz--md left'>
                使用强大的自动化工作流快速集成进您的企业。
                使用可视化工作流编辑器和丰富的RPA节点轻松构建和简化流程。
                可以与任何基于API的软件集成。
              </p>
            </div>
            <div className='col'>
              <img
                alt='shop'
                className={styles.featureImage}
                src={useBaseUrl(
                  'https://yixiansrc.oss-cn-hangzhou.aliyuncs.com/wemo/workflow00001.png',
                )}
              />
              <h3 className='padding-top--md'>商城</h3>
              <p className='padding-horiz--md left'>
                采用灵活可配置的小程序插件，无缝接入到您的小程序中，使每个小程序都拥有商城能力。
                丰富的功能配置，自主支付账户，多SKU商品，完善的订单系统，支持亿级用户和电商大促高并发。
              </p>
            </div>
            <div className='col'>
              <img
                alt='im'
                className={styles.featureImage}
                src={'https://yixiansrc.oss-cn-hangzhou.aliyuncs.com/wemo/workflow00010.jpg'}
              />
              <h3 className='padding-top--md'>IM</h3>
              <p className='padding-horiz--md left'>
                丰富可靠的群聊功能，支撑您自己的社交应用和社区活动。插件配置，内容安全，高可靠高可用。
                采用多读多写双模型，支持十万人大群级别。
              </p>
            </div>
          </div>
        </div>
        <div className='container text--center'>
          <div className='row'>
            <div className='col col--4 col--offset-2'>
              <img
                alt='订单'
                className={styles.featureImage}
                src={'https://yixiansrc.oss-cn-hangzhou.aliyuncs.com/wemo/workflow00009.jpg'}
              />
              <h3 className='padding-top--md'>订单</h3>
              <p className='padding-horiz--md left'>
                高可靠的订单系统，支撑千亿级的数据量，保障您的订单安全不丢失。
                订单系统支持多元搜索，你可以任意查询关键字、全文检索、时间范围等，强大的搜索功能保障百毫秒以内的响应时间。
              </p>
            </div>
            <div className='col col--4'>
              <img
                alt='更多'
                className={styles.featureImage}
                src={'https://yixiansrc.oss-cn-hangzhou.aliyuncs.com/wemo/workflow00003.png'}
              />
              <h3 className='padding-top--md'>更多</h3>
              <p className='padding-horiz--md left'>
                云还提供更多的PaaS服务和SaaS服务，积分系统、会员系统、支付系统以及可定制化服务，详情请见文档。
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className={classnames(styles.section, styles.sectionAlt, styles.quotes)}>
        <div className='container'>
          <div className='row'>
            {QUOTES.map(quote => (
              <div className='col' key={quote.name}>
                <div className='avatar avatar--vertical margin-bottom--sm'>
                  <img
                    alt={quote.name}
                    className='avatar__photo avatar__photo--xl'
                    src={quote.thumbnail}
                    style={{ overflow: 'hidden' }}
                  />
                  <div className='avatar__intro padding-top--sm'>
                    <h4 className='avatar__name'>{quote.name}</h4>
                    <small className='avatar__subtitle'>{quote.title}</small>
                  </div>
                </div>
                <div className='text--center padding-horiz--md'>{quote.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Home;
