import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import * as fs from 'fs';

const controlrVersion = fs.readFileSync('controlr-version.txt', 'utf-8').trim();

const config: Config = {
  title: 'ControlR Docs',
  tagline: 'Open-source remote control and remote access',
  favicon: 'img/favicon.ico',

  themes: ['@docusaurus/theme-mermaid'],

  future: {
    v4: true,
  },

  // Set the production url of your site here
  url: 'https://docs.controlr.app',
  // Set the /<baseUrl>/ pathname under which your site is served
  baseUrl: '/',

  // GitHub pages deployment config.
  organizationName: 'bitbound',
  projectName: 'ControlR',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  markdown: {
    mermaid: true,
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/bitbound/controlr-docs/edit/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      'docusaurus-lunr-search',
      {
        languages: ['en'],
        excludeRoutes: ['**/scalar-api-browser', '**/api-reference/endpoints'],
      },
    ],
  ],

  themeConfig: {
    // Social card image - use the ControlR logo
    image: 'img/controlr-logo-flat.png',
    colorMode: {
      respectPrefersColorScheme: true,
      defaultMode: 'dark'
    },
    navbar: {
      title: 'ControlR',
      logo: {
        alt: 'ControlR Logo',
        src: 'img/controlr-logo-flat.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          type: 'html',
          position: 'right',
          value: `<span class="navbar-version-badge" title="ControlR ${controlrVersion}">${controlrVersion}</span>`,
        },
        {
          type: 'html',
          position: 'left',
          value: '<span class="navbar-preview-chip">Preview</span>',
        },
        {
          href: 'https://github.com/bitbound/controlr-docs#help-wanted',
          label: 'Help Wanted',
          position: 'left',
          className: 'navbar-help-wanted',
        },
        {
          href: 'https://github.com/bitbound/ControlR',
          label: 'GitHub',
          position: 'right',
        },
        {
          href: 'https://discord.gg/JWJmMPc72H',
          label: 'Discord',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'light',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/getting-started',
            },
            {
              label: 'Installation',
              to: '/docs/installation',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Discord',
              href: 'https://discord.gg/JWJmMPc72H',
            },
            {
              label: 'GitHub Discussions',
              href: 'https://github.com/bitbound/ControlR/discussions',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/bitbound/ControlR',
            },
            {
              label: 'Website',
              href: 'https://controlr.app',
            },
            {
              label: 'Docker Hub',
              href: 'https://hub.docker.com/r/bitbound/controlr',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Jared Goodwin. | Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
