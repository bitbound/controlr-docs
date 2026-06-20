import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';

function HomepageHeader() {
  return (
    <header style={{textAlign: 'center', marginTop: '2rem'}}>
      <img
        src="/img/logo-transparent-dark.png"
        alt="ControlR Logo"
        style={{maxWidth: '300px', width: '100%', height: 'auto', marginBottom: '1.5rem'}}
      />
      <span style={{fontSize: '1.2rem', color: '#666', display: 'block', marginTop: '0.5rem'}}>
        Open-source remote control and remote access.
      </span>
    </header>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Welcome to ControlR"
      description="Open-source remote control and remote access.">
      <HomepageHeader />
      <main style={{maxWidth: '800px', margin: '0 auto', padding: '2rem'}}>
        <div style={{marginBottom: '2rem'}}>
          <p>
            ControlR is a powerful, open-source remote control application for managing and
            controlling devices over a network. It provides a unified web-based interface for
            remote desktop access, file transfer, terminal management, and device monitoring
            across Windows, macOS, and Linux.
          </p>
        </div>

        <h2>Why ControlR?</h2>
        <ul style={{marginBottom: '2rem'}}>
          <li><strong>Cross-platform</strong> &mdash; Web dashboard works in any modern browser; agents run on Windows, macOS, and Linux</li>
          <li><strong>Real-time control</strong> &mdash; Low-latency remote desktop with screen streaming and input forwarding</li>
          <li><strong>Secure by default</strong> &mdash; Multi-tenant isolation, token-based authentication, and TLS-encrypted communications</li>
          <li><strong>Self-hosted</strong> &mdash; Full control over your data with Docker deployment</li>
          <li><strong>Open source</strong> &mdash; MIT licensed, community-driven</li>
        </ul>

        <h2>Quick Links</h2>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem'}}>
          <Link className="button button--primary button--lg" to="/docs/getting-started">
            Getting Started &rarr;
          </Link>
          <Link className="button button--secondary button--lg" to="/docs/installation">
            Installation &rarr;
          </Link>
          <Link className="button button--secondary button--lg" to="https://github.com/bitbound/ControlR">
            GitHub &rarr;
          </Link>
        </div>

        <div style={{marginBottom: '2rem'}}>
          <Link className="button button--secondary button--lg" to="https://demo.controlr.app">
            Live Demo
          </Link>
          {' '}
          <Link className="button button--secondary button--lg" to="https://discord.gg/JWJmMPc72H">
            Discord
          </Link>
        </div>

        <div style={{textAlign: 'center', color: '#666', marginTop: '2rem'}}>
          <p>New here? Head over to the <Link to="/docs/getting-started">Getting Started guide</Link> to learn the basics, or jump straight to <Link to="/docs/installation">Installation</Link> to deploy ControlR with Docker.</p>
        </div>
      </main>
    </Layout>
  );
}
