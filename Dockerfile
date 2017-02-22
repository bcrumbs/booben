FROM alpine:3.5
LABEL maintainer "Dmitriy Bizyaev"

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app

COPY .npmrc /root/.npmrc

RUN apk update \
    && apk add \
        nodejs \
        python \
        make \
        g++ \
    && npm install --production \
    && npm dedupe \
    && rm /var/cache/apk/* \
    && rm -rf /tmp/* \
    && rm -rf /root/..?* /root/.[!.]* /root/*

VOLUME /var/lib/jssy-projects

ENV NODE_ENV development
ENV JSSY_PORT 3000
ENV JSSY_SERVE_STATIC true
ENV JSSY_PROJECTS_DIR /var/lib/jssy-projects

EXPOSE 3000

ENTRYPOINT [ "/bin/sh", "docker-entrypoint.sh" ]
