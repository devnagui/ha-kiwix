#!/bin/sh
set -eu

nginx -t
kiwix-serve --library --port=8080 /tmp/ingress-library.xml &
exec nginx -g 'daemon off;'
