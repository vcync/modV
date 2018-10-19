module.exports = {
  evergreen: true,
  serviceWorker: true,

  title: 'modV',
  description: 'modular audio visualisation powered by JavaScript',

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'API Reference', link: '/api/' },
      { text: 'GitHub', link: 'https://github.com/2xaa/modV/' },
    ],
    sidebar: {
      '/guide/': [
        {
          title: 'Guide',
          collapsable: false,
          children: [
            '',
            'audioRouting',
            'coreConcepts',
            'mediaManager',
            'writingAModule',
          ],
        },
      ],
      '/api/': [
        {
          title: 'API Reference',
          collapsable: false,
          children: [
            '',
            'module',
            'renderer',
            'plugin',
            'control',
            'palette',
            'contextMenu',
            'mediaManager',
            'mediaManagerClient',
          ],
        },
      ],
    },
  },
};
