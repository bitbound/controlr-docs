import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    'getting-started',
    'installation',
    'agent-os-support',
    'configuration',
    'authentication-guide',
    'multi-tenancy',
    'architecture',
    {
      type: 'category',
      label: 'User Guide',
      link: {
        type: 'generated-index',
        description: 'Guides for using ControlR.',
      },
      items: [
        'user-guide/dashboard',
        'user-guide/overview',
        'user-guide/devices',
        {
          type: 'category',
          label: 'Device Access',
          items: [
            'user-guide/device-access/remote-control',
            'user-guide/device-access/terminal',
            'user-guide/device-access/chat',
            'user-guide/device-access/file-system',
            'user-guide/device-access/remote-logs',
            'user-guide/device-access/vnc-relay',
          ],
        },
        'user-guide/deploy',
        'user-guide/installer-keys',
        'user-guide/personal-access-tokens',
        'user-guide/settings',
        'user-guide/permissions',
        'user-guide/invitations',
        'user-guide/tenant-settings',
        'user-guide/headless-remote-control',
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
        'admin/native-installation',
        'admin/reverse-proxy',
        'admin/upgrading',
        'admin/backup-restore',
        'admin/server-alerts',
        'admin/telemetry',
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
        'scalar-api-browser',
        'api-reference/endpoints',
        'api-reference/nuget-packages',
      ],
    },
    'faq',
    // 'contributing', // Hidden — re-enable when ready to accept community contributions
  ],
};

export default sidebars;
