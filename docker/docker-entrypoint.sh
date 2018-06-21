#!/bin/sh

if [ $# -eq 0 ]; then
  node index.js --config dev-config.json
else
  exec "$@"
fi
