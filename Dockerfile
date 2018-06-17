FROM registry.ordbuy.com/common/nodejs:latest

ENV NODE_ENV=development \
    BOOBEN_PORT=3000 \
    BOOBEN_SERVE_STATIC=true \
    BOOBEN_PROJECTS_DIR=/var/lib/booben/projects

COPY . /usr/src/app

WORKDIR /usr/src/app

RUN apk --no-cache add --update \
      python \
      make \
      g++ \
      git \
    && npm install --production \
    && npm dedupe \
    && npm rm -g yarn npm \
    && mkdir -p /var/lib/booben \
    && mv booben-projects /var/lib/booben/projects \
    && rm -rf /tmp/* \
    && rm -rf /root/..?* /root/.[!.]* /root/*

VOLUME /var/lib/booben

EXPOSE 3000

ENTRYPOINT ["/bin/sh", "docker-entrypoint.sh"]
