---
sidebar_position: 1
title: Reverse Proxy
---

Some ControlR features require [forwarded headers](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/proxy-load-balancer). These concepts are not unique to ASP.NET Core, so it's important to understand them when self-hosting.

## Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name controlr.example.com;

    ssl_certificate /etc/letsencrypt/live/controlr.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/controlr.example.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5120;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Caddy Configuration

```caddy
controlr.example.com {
    reverse_proxy localhost:5120
}
```

## Apache Configuration

```apache
<VirtualHost *:443>
    ServerName controlr.example.com

    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/controlr.example.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/controlr.example.com/privkey.pem

    ProxyPreserveHost On
    ProxyPass / http://localhost:5120/
    ProxyPassReverse / http://localhost:5120/

    RewriteEngine on
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule ^/(.*) "ws://localhost:5120/$1" [P,L]
</VirtualHost>
```

## Cloudflare

If you're using Cloudflare's proxy service, enable the **Cloudflare Proxy Support** option on your server:

```yaml
ControlR_AppOptions__EnableCloudflareProxySupport: true
```

This automatically fetches Cloudflare's IP ranges (`ips-v4` and `ips-v6`) and adds them to the `KnownNetworks` list, so forwarded headers from Cloudflare are trusted.

## Network Trust

If your service is guaranteed to only receive traffic from a trusted reverse proxy (e.g., behind a firewall), you can trust all forwarded headers by setting:

```yaml
ControlR_AppOptions__EnableNetworkTrust: true
```

**Warning:** Only enable this if untrusted clients cannot connect directly to your service.

## Additional Proxy IPs

If you have multiple proxy servers in the chain, add each to the `KnownProxies` list:

```yaml
ControlR_AppOptions__KnownProxies__0: "203.0.113.1"
ControlR_AppOptions__KnownProxies__1: "198.51.100.1"
```

Or add CIDR ranges via `KnownNetworks`:

```yaml
ControlR_AppOptions__KnownNetworks__0: "10.0.0.0/8"
```

When using a reverse proxy, ensure the `ForwardedHeaders` are configured correctly in ControlR. Check the [configuration guide](/docs/configuration) for environment variable settings.
