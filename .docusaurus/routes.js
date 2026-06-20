import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/markdown-page',
    component: ComponentCreator('/markdown-page', '53a'),
    exact: true
  },
  {
    path: '/docs',
    component: ComponentCreator('/docs', '822'),
    routes: [
      {
        path: '/docs',
        component: ComponentCreator('/docs', '0b4'),
        routes: [
          {
            path: '/docs',
            component: ComponentCreator('/docs', '011'),
            routes: [
              {
                path: '/docs/',
                component: ComponentCreator('/docs/', '66a'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/admin/backup-restore',
                component: ComponentCreator('/docs/admin/backup-restore', '19f'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/admin/docker-setup',
                component: ComponentCreator('/docs/admin/docker-setup', 'bc0'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/admin/reverse-proxy',
                component: ComponentCreator('/docs/admin/reverse-proxy', '89e'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/admin/upgrading',
                component: ComponentCreator('/docs/admin/upgrading', '148'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/api/authentication',
                component: ComponentCreator('/docs/api/authentication', '8fd'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/api/overview',
                component: ComponentCreator('/docs/api/overview', 'e02'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/category/administration',
                component: ComponentCreator('/docs/category/administration', 'fc4'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/category/api-reference',
                component: ComponentCreator('/docs/category/api-reference', '789'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/category/features',
                component: ComponentCreator('/docs/category/features', 'f8f'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/configuration',
                component: ComponentCreator('/docs/configuration', '06c'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/contributing',
                component: ComponentCreator('/docs/contributing', '26f'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/faq',
                component: ComponentCreator('/docs/faq', 'ec8'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/features/device-management',
                component: ComponentCreator('/docs/features/device-management', 'f9d'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/features/file-transfer',
                component: ComponentCreator('/docs/features/file-transfer', '69c'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/features/screen-sharing',
                component: ComponentCreator('/docs/features/screen-sharing', 'f1e'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/features/terminal',
                component: ComponentCreator('/docs/features/terminal', 'a7b'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/getting-started',
                component: ComponentCreator('/docs/getting-started', '3fb'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/installation',
                component: ComponentCreator('/docs/installation', '034'),
                exact: true,
                sidebar: "docsSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/',
    component: ComponentCreator('/', 'e5f'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
