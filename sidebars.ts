import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    'getting-started',
    'installation',
    'configuration',
    {
      type: 'category',
      label: 'Features',
      link: {
        type: 'generated-index',
        description: 'ControlR features and capabilities.',
      },
      items: [
        'features/device-management',
        'features/file-transfer',
        'features/terminal',
        'features/screen-sharing',
      ],
    },
    {
      type: 'category',
      label: 'Administration',
      link: {
        type: 'generated-index',
        description: 'Server administration guides.',
      },
      items: [
        'admin/docker-setup',
        'admin/reverse-proxy',
        'admin/upgrading',
        'admin/backup-restore',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      link: {
        type: 'generated-index',
        description: 'ControlR API documentation.',
      },
      items: [
        'api/overview',
        'api/authentication',
      ],
    },
    'faq',
    'contributing',
  ],
};

export default sidebars;
