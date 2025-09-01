#!/bin/bash
# file: create_namespace.sh

tctl() {
  docker exec temporal-admin-tools tctl "$@"
}

tctl --namespace "default" namespace register
until tctl --namespace "default" namespace describe ; do
  echo " *** Retrying... *** "
  sleep .5
done