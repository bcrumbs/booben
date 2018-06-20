#!/bin/bash

set -e 

git clone https://github.com/bcrumbs/booben-projects
export BOOBEN_DIR=$PWD
export PROJECTS_DIR=$PWD/booben-projects
echo "{\"projectsDir\":\"${PROJECTS_DIR}\"}" > dev-config.json
npm i
node rebuild-components-bundle.js --config dev-config.json -- test-cases
npm run build
node index.js --config dev-config.json