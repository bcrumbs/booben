#!/bin/sh

if [ $# -eq 0 ]; then
  node index.js
else
  exec "$@"
fi
