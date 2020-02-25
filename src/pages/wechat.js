/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect } from 'react';
import Layout from '@theme/Layout';

import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';

function Wechat() {
  return (
    <Layout permalink='/wechat' description='Docusaurus 2 Wechat page'>
      <div className='container margin-vert--xl'>
        <div className='text--center margin-bottom--xl'>
          <h1>加入微信群</h1>
          <p>
            现已建立微信群，聚集Pirsma和GraphQL的爱好者一起交流，因人数限制添加我的微信拉你进入，麻烦备注prisma。
          </p>
        </div>
        <div className='row text--center'>
          <img
            style={{ marginLeft: 'auto', marginRight: 'auto' }}
            alt='wechat'
            src='site/kwc.png'
          />
        </div>
      </div>
    </Layout>
  );
}

export default Wechat;
