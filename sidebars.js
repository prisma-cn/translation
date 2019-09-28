/*
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
  test: {
    'Advanced Guides': ['test1', 'advanced-themes', 'tt/ad2'],
  },
  docs: {
    Docusaurus: ['introduction', /*'motivation', */ 'design-principles', 'contributing'],
    'Getting Started': ['installation', 'configuration'],
    Guides: [
      'creating-pages',
      'styling-layout',
      'static-assets',
      {
        type: 'category',
        label: 'Docs',
        items: ['markdown-features', 'sidebar'],
      },
      'blog',
      'analytics',
      'seo',
      'search',
      'using-plugins',
      'using-themes',
    ],
    'API Reference': ['cli', 'docusaurus-core', 'docusaurus.config.js', 'lifecycle-apis'],
  },
};
