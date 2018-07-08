#!/usr/bin/env bash

PROJECTS_REPO="https://github.com/bcrumbs/booben-projects.git"

for i in "$@"
do
case $i in
    -d=*|--project-dir=*)
    PROJECTS_DIR="${i#*=}"
    ;;
    -p=*|--project-name=*)
    PROJECT_NAME="${i#*=}"
    ;;
    --deploy=*)
    DEPLOY="${i#*=}"
    ;;
    *)
    ;;
esac
done

if [ -z "${PROJECTS_DIR}" ]; then
  PROJECTS_DIR="booben-projects"
fi
if [ -z "${PROJECT_NAME}" ]; then
  PROJECT_NAME="*"
fi

git clone ${PROJECTS_REPO} ${PROJECTS_DIR}
if [ "${PROJECTS_DIR:0:1}" = "/" ]; then
  echo "{\"projectsDir\":\"${PROJECTS_DIR}\"}" > projects-config.json
else
  echo "{\"projectsDir\":\"${PWD}/${PROJECTS_DIR}\"}" > projects-config.json
fi
npm i
if [ -z "${DEPLOY}" ]; then
  npm run build
else
  npm run build:demo
fi
while read PROJECT; do
  echo "BUILD PROJECT: ${PROJECT}"
  node rebuild-components-bundle.js --config projects-config.json -- ${PROJECT}
done < <(find ${PROJECTS_DIR}/${PROJECT_NAME} -maxdepth 0 -type d | sed 's/.*\///g')
