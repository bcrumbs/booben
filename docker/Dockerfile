FROM node:slim

COPY docker/docker-entrypoint.sh /usr/src/app/
COPY . /usr/src/app

WORKDIR /usr/src/app

RUN apt update \
    && apt install --no-install-recommends -y git \
    && npm install --production \
    && npm dedupe \
    && npm rm -g yarn npm \
    && echo "{\"projectsDir\":\"${PWD}/booben-projects\"}" > dev-config.json \
    && apt purge -y git \
    && rm -rf /root/..?* \
              /root/.[!.]* \
              /root/* \
              /tmp/* \
              /var/lib/apt/lists/*


VOLUME /var/lib/booben

EXPOSE 3000

ENTRYPOINT ["/bin/sh", "docker-entrypoint.sh"]
