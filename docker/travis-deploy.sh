#!/usr/bin/env bash

make bootstrap
make docker-build
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
docker tag booben:latest $DOCKER_REPO:latest
docker push $DOCKER_REPO:latest
docker tag $DOCKER_REPO:latest $DOCKER_REPO:"$(sed -nr 's/.*"version":\ "(.*)",/\1/p' package.json)"
docker push $DOCKER_REPO:"$(sed -nr 's/.*"version":\ "(.*)",/\1/p' package.json)"
