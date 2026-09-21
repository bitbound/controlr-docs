---
sidebar_position: 2
title: Reverse Proxy
---

Some ControlR features require [forwarded headers](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/proxy-load-balancer). The ideas are not specific to ASP.NET Core. They apply to whatever you run in front of the server.

The examples below proxy to port 5120 on the proxy host, which is the host port the shipped `docker-compose.yml` maps to the container's port 8080. Adjust the upstream address and port if your deployment publishes the server differently.

## Which Proxies ControlR Trusts by Default

The server consumes four headers: `X-Forwarded-For`, `X-Forwarded-Host`, `X-Forwarded-Proto`, and `X-Forwarded-Prefix`. It applies them only when the immediate connection comes from a trusted address. Chain depth is unlimited, so every proxy between the client and the server needs to be in that trust list before the client address in `X-Forwarded-For` is read.

`X-Real-IP` is not one of the headers the server reads. The nginx example below sends it because that is the common convention, and ControlR ignores it.

The trust list starts from ASP.NET Core's own defaults, which already cover loopback (`127.0.0.0/8` and `::1`). A proxy running on the same host as the server process is trusted with no configuration. `appsettings.json` ships `KnownProxies`, `KnownNetworks`, and `DockerGatewayIp` empty. The shipped `docker-compose.yml` sets `ControlR_AppOptions__DockerGatewayIp` to the compose network's gateway, which is needed because a published container sees a same-host proxy arriving from the Docker bridge address rather than from loopback. Anything else, including a proxy on another host or a proxy container on a different Docker network, has to be added yourself with the options below.

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

If Cloudflare's proxy sits in front of the server, turn on the Cloudflare option in `AppOptions`. It has no user interface, so set it through configuration:

```yaml
ControlR_AppOptions__EnableCloudflareProxySupport: true
```

This makes the server fetch Cloudflare's published IP ranges over HTTPS during startup and add them to the forwarded-header middleware's trusted networks, so forwarded headers arriving from a Cloudflare edge address are trusted. The loopback defaults stay in place, and the trust lists are not cleared.

The option depends on that outbound request. Both range lists are fetched with a status check, so if `www.cloudflare.com` cannot be reached from the server, startup fails. Do not enable this on a deployment that cannot make that request.

Known issue: when parsing the fetched ranges, the server reuses the `ips-v4` response body for the `ips-v6` list, so Cloudflare IPv6 addresses are never added. The IPv4 ranges end up in the list twice, which is harmless. If Cloudflare fronts your server over IPv6, also add the ranges from `https://www.cloudflare.com/ips-v6` to `KnownNetworks` yourself.

## Network Trust

If your service is guaranteed to only receive traffic from a trusted reverse proxy (e.g., behind a firewall), you can trust all forwarded headers by setting:

```yaml
ControlR_AppOptions__EnableNetworkTrust: true
```

This turns on every forwarded header and clears the trust list entirely. The server then believes `X-Forwarded-For` from whichever address it can actually be reached on, and `KnownProxies`, `KnownNetworks`, and `DockerGatewayIp` are ignored.

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

All of these are `AppOptions` settings. See the [configuration guide](/docs/configuration) for the environment variable names.

An address or range that does not parse is skipped rather than rejected, and the reason is written to the console at startup. Read that output when a proxy you added seems not to be taking effect.

## What Goes Wrong When Forwarded Headers Are Not Trusted

Nothing rejects the connection. Agents and viewers authenticate with tokens, not IP addresses, so device connections and remote-control relays keep working even with a misconfigured proxy. What silently degrades is anything that reads the client address or the request scheme:

- **Device public IPs**: the address recorded for a connected device comes from the TCP connection. When forwarded headers are ignored, every device looks like it connects from your proxy's address.
- **Anonymous-auth rate limiting**: `/api/auth/interactive-login`, `/api/auth/complete-password-reset`, and `/api/auth/change-password-with-credentials` are limited to 20 requests per minute, partitioned by client address and endpoint. Behind an untrusted proxy all of your users land in the proxy's buckets, so ordinary sign-ins start failing with HTTP 429.
- **Email links**: the account-confirmation link in a registration email is built from the request scheme and host. If `X-Forwarded-Proto` and `X-Forwarded-Host` are ignored, that link carries `http://` and an internal host name, and it does not work when clicked.
- **Audit trails**: authorization change logs, installer-key usage records, and streaming-session log entries record the connecting address. They show the proxy's address instead of the real client.
- **HTTPS redirects**: in production the server uses HTTPS redirection and HSTS, and it takes the incoming scheme from `X-Forwarded-Proto`. Ignoring that header leaves the app believing it is serving plain HTTP, and redirect behavior breaks in whichever direction your proxy is wired.

The shipped `docker-compose.yml` publishes no HTTPS port and sets only `ASPNETCORE_HTTP_PORTS=8080`. Inside that container the redirect middleware has no HTTPS port to aim at, so it logs `Failed to determine the https port for redirect` and passes requests through. The proxy owns the HTTP-to-HTTPS redirect.

Stripping the upgrade headers is a different failure, and it is not silent. The agent's SignalR client sets `SkipNegotiation = true` and `Transports = HttpTransportType.WebSockets`, so there is no long-polling fallback. A proxy that does not pass `Upgrade` and `Connection: upgrade` leaves agents unable to connect at all. The viewer hubs and the `/relay` WebSocket need the same handling, so remote control breaks the same way.

To see whether forwarded headers are being applied, set Debug logging for the `Microsoft.AspNetCore.HttpOverrides` category and read the startup and per-request output. Both the shipped `appsettings.json` and `docker-compose.yml` already run that category at Debug, so the addresses the middleware refused show up on a default deployment.

## Agent Route Allowlist

If you put ControlR behind a browser-authentication proxy such as Cloudflare Access, Tailscale Funnel, or Pomerium, the agent's traffic still has to reach the server. The agent runs unattended on managed devices and cannot complete a browser-based login flow, so the routes it calls must bypass the proxy's auth layer. Everything else can remain protected.

Traffic from the device only uses these route patterns:

| Path | Transport | Purpose |
|------|-----------|---------|
| `/hubs/agent` | WebSockets | SignalR connection between the agent and the server. Carries device registration, heartbeats, status updates, and command dispatch. |
| `/relay` | WebSockets | Remote-control screen and input stream. The desktop client on the device opens its own outbound WebSocket here as the responding side, and the per-session token in the query string is what authenticates it. The viewer connects to the same path as the requesting side. |
| `/api/agent` | HTTP | REST endpoints used by the agent (device registration with an installer key, update bundle metadata). |
| `/downloads` | HTTP | Agent bundles and installers. The agent's update flow fetches these files when applying an update. |

Older agent builds call the legacy aliases `/api/devices` and `/api/agent-update` instead of `/api/agent`. Keep those prefixes reachable too if any un-updated agent might still call them.

Configure your proxy to bypass authentication for these prefixes. All other paths, including the web UI, the viewer SignalR hub (`/hubs/viewer`), and the internal and V1 API surfaces, should remain protected. The agent does not need access to any of them.

### Cloudflare Access Example

Create a self-hosted application in Cloudflare Access that covers your ControlR origin, then add a [bypass policy](https://developers.cloudflare.com/cloudflare-one/policies/access/) for the agent prefixes. In the policy builder, set the **Action** to **Bypass** and the **Selector** to **Include** with the following paths:

```
/hubs/agent
/relay
/api/agent
/downloads
/api/devices
/api/agent-update
```

The last two are the legacy aliases older agents call. Drop them once no un-updated agent remains.

Apply the bypass policy to the same application that protects the rest of your ControlR deployment. All other requests will continue to require authentication through Cloudflare Access.

If the agent fails to connect or update after you put it behind Cloudflare Access, the most common cause is a missing prefix in the bypass list. Check the server logs for HTTP 401 or 403 responses on the paths above.
