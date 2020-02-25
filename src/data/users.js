/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const users = [
  // Please add in alphabetical order of title.
  {
    title: '阿迪达斯',
    description: '阿迪达斯已在部分业务采用Prisma作为数据接入层，以下为阿迪达斯工程师的演讲。',
    preview: '/site/users/adidas.jpg',
    website: 'https://www.adidas.com.cn/',
    source: 'https://www.bilibili.com/video/av61220208',
  },
  {
    title: '爱彼迎',
    description: 'Airbnb与GraphQL社区长期保持着紧密的关系，在部分业务上也采用了Prisma。',
    preview: '/site/users/airbnb.jpg',
    website: 'https://zh.airbnb.com/',
    source: '',
  },
  {
    title: 'HyreCar',
    description: '上市公司Hyrecar用 prisma 在上市前60天内重构整个系统【从hell到graphql】',
    preview: '/site/users/hyrecar.jpg',
    website: 'https://hyrecar.com/',
    source: 'https://www.bilibili.com/video/av47703040/',
  },
  {
    title: 'LabelBox',
    description:
      'Labelbox这个机器学习平台在整个组织中使用Prisma来改善大数据工作流，支撑数百万个数据点的管理和存储。',
    preview: '/site/users/labelbox.jpg',
    website: 'https://labelbox.com/',
    source: 'https://www.prisma.io/blog/labelbox-simnycbotiok',
  },
  {
    title: 'Splunk',
    description:
      '大数据和AI行业的领先者，全球估值最高的创业公司之一。以下有Splunk首席工程师在Prisma Day的演讲。',
    preview: '/site/users/splunk.jpg',
    website: 'https://www.splunk.com/',
    source: 'https://www.bilibili.com/video/av61220208?p=6',
  },
  {
    title: 'Simmons & Simmons',
    description:
      '西盟斯律师事务所在主要商业和金融中心拥有1,500多名员工负责重大的跨境和高度复杂的事务和交易。',
    preview: '/site/users/simmons.jpg',
    website: 'https://www.simmons-simmons.com/',
    source: '',
  },
  {
    title: 'Coursera',
    description: '全球最大的在线教育平台。',
    preview: '/site/users/coursera.jpg',
    website: 'https://www.coursera.org/',
    source: '',
  },
  {
    title: 'Stripe',
    description: '国际领先的在线支付平台。',
    preview: '/site/users/stripe.jpg',
    website: 'https://stripe.com/',
    source: 'https://www.bilibili.com/video/av61220208?p=7',
  },
  {
    title: 'CodeSandbox',
    description: '在线代码编辑器和原型制作工具。',
    preview: '/site/users/codesandbox.jpg',
    website: 'https://codesandbox.io/',
    source: 'https://www.bilibili.com/video/av61220208?p=5',
  },
];

export default users;
