/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';

import ThemeProvider from '@theme/ThemeProvider';
import Navbar from '@theme/Navbar';
import Footer from '@theme/Footer';

import './styles.css';

function Layout(props) {
  const { siteConfig = {} } = useDocusaurusContext();
  const {
    favicon,
    title: siteTitle,
    themeConfig: { image: defaultImage },
    url: siteUrl,
  } = siteConfig;
  const { children, title, noFooter, description, image, keywords, permalink, version } = props;
  const metaTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const metaImage = image || defaultImage;
  const metaImageUrl = siteUrl + useBaseUrl(metaImage);
  const faviconUrl = useBaseUrl(favicon);

  return (
    <ThemeProvider>
      <Head>
        {/* TODO: Do not assume that it is in english language */}
        <html lang='zh-CN' />
        <meta
          content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0'
          name='viewport'
        />
        <link
          rel='apple-touch-icon'
          sizes='180x180'
          href='https://prisma.yoga/apple-touch-icon.png'
        />
        <link
          rel='icon'
          type='image/png'
          sizes='32x32'
          href='https://prisma.yoga/favicon-32x32.png'
        />
        <link
          rel='icon'
          type='image/png'
          sizes='16x16'
          href='https://prisma.yoga/favicon-16x16.png'
        />
        <link rel='manifest' href='/site.webmanifest' />
        <link rel='mask-icon' href='https://prisma.yoga/safari-pinned-tab.svg' color='#5bbad5' />
        <meta name='msapplication-TileColor' content='#da532c' />
        <meta name='theme-color' content='#ffffff' />

        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='white' />
        <meta name='apple-mobile-web-app-title' content='Prisma文档' />

        <meta httpEquiv='x-ua-compatible' content='ie=edge' />
        {metaTitle && <title>{metaTitle}</title>}
        {metaTitle && <meta property='og:title' content={metaTitle} />}
        {favicon && <link rel='shortcut icon' href={faviconUrl} />}
        {description && <meta name='description' content={description} />}
        {description && <meta property='og:description' content={description} />}
        {version && <meta name='docsearch:version' content={version} />}
        {keywords && keywords.length && <meta name='keywords' content={keywords.join(',')} />}
        {metaImage && <meta property='og:image' content={metaImageUrl} />}
        {metaImage && <meta property='twitter:image' content={metaImageUrl} />}
        {metaImage && <meta name='twitter:image:alt' content={`Image for ${metaTitle}`} />}
        {permalink && <meta property='og:url' content={siteUrl + permalink} />}
        <meta name='twitter:card' content='summary' />
      </Head>
      <Navbar />
      <div className='main-wrapper'>{children}</div>
      {!noFooter && <Footer />}
    </ThemeProvider>
  );
}

export default Layout;
