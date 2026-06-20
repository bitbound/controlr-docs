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

## Important

When using a reverse proxy, ensure the `ForwardedHeaders` are configured correctly in ControlR. Check the [configuration guide](/docs/configuration) for environment variable settings.
