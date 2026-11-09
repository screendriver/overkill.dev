FROM caddy:2.11.9-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY target /srv

EXPOSE 4321
