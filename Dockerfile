FROM caddy:2.11.8-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY target /srv

EXPOSE 4321
