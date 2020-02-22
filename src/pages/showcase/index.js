/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect } from 'react';

import Layout from '@theme/Layout';

import classnames from 'classnames';
import styles from './styles.module.css';
import users from '../../data/users';

const ITEMS_PER_ROW = 3; // Sync up the item col width if this is changed.
const TITLE = '用户案例';
const DESCRIPTION = '以下为部分使用Prisma 的公司或项目';

function chunkArray(array, size) {
  const chunks = [];
  const copied = [...array];
  const numChunks = Math.ceil(copied.length / size); // Round up to the nearest integer.
  for (let i = 0; i < numChunks; i++) {
    chunks.push(copied.splice(0, size));
  }

  return chunks;
}

function Showcase() {
  return (
    <Layout title={TITLE} description={DESCRIPTION}>
      <div className='container margin-vert--xl'>
        <div className='text--center margin-bottom--xl'>
          <h1>{TITLE}</h1>
          <p>{DESCRIPTION}</p>
        </div>
        {chunkArray(users, ITEMS_PER_ROW).map((row, i) => (
          <div key={`row${i}`} className='row margin-vert--lg'>
            {row.map(user => (
              <div key={user.title} className='col col--4 top20'>
                <div className={classnames('card', styles.showcaseUser)}>
                  <div className='card__image'>
                    <img src={user.preview} alt={user.title} />
                  </div>
                  <div className='card__body'>
                    <div className='avatar'>
                      <div className='avatar__intro margin-left--none'>
                        <h4 className='avatar__name'>{user.title}</h4>
                        <small className='avatar__subtitle'>{user.description}</small>
                      </div>
                    </div>
                  </div>
                  {(user.website || user.source) && (
                    <div className='card__footer'>
                      <div className='button-group button-group--block'>
                        {/* {user.website && (
                          <a
                            className='button button--small button--secondary button--block'
                            href={user.website}
                            target='_blank'
                            rel='noreferrer noopener'
                          >
                            网站
                          </a>
                        )} */}
                        {user.source && (
                          <a
                            className='button button--small button--secondary button--block'
                            href={user.source}
                            target='_blank'
                            rel='noreferrer noopener'
                          >
                            网站
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Layout>
  );
}

export default Showcase;
