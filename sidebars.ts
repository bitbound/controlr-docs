import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    'getting-started',
    'installation',
    'agent-os-support',
    'configuration',
    'authentication-guide',
    'permission-system',
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
        'user-guide/headless-remote-control',
        'user-guide/deploy',
        'user-guide/installer-keys',
        'user-guide/personal-access-tokens',
        'user-guide/settings',
        'user-guide/permissions',
        'user-guide/invitations',
        'user-guide/tenant-settings',
      ],
    },
    {
      type: 'category',
      label: 'Subscriber Portal',
      link: {
        type: 'generated-index',
        description: 'Guides for sponsors using the ControlR Subscriber Portal.',
      },
      items: [
        'subscriber-portal/overview',
        'subscriber-portal/sign-in',
        'subscriber-portal/sponsorship-and-build-slots',
        'subscriber-portal/sponsorship-changes-and-lapse',
        'subscriber-portal/manage-a-build-slot',
        'subscriber-portal/slot-configuration',
        'subscriber-portal/build-lifecycle',
        'subscriber-portal/getting-your-image',
        'subscriber-portal/connect-to-controlr',
        'subscriber-portal/organization-access',
        'subscriber-portal/notifications',
        'subscriber-portal/settings',
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
        'admin/troubleshooting',
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
        'api/service-accounts',
        'scalar-api-browser',
        'api-reference/endpoints',
        'api-reference/nuget-packages',
      ],
    },
    'faq',
  ],
};

export default sidebars;
