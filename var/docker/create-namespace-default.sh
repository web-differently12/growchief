#!/usr/bin/env bash
# file: create_namespace.sh (host)
set -euo pipefail

TCTL="docker exec temporal-admin-tools tctl"
ADDR="--address temporal:7233"
NS="default"

echo "Waiting for Temporal to be healthy..."
until $TCTL $ADDR cluster health >/dev/null 2>&1; do
  sleep 2
done

# describe-or-create, idempotent
if ! $TCTL $ADDR namespace describe --namespace "$NS" >/dev/null 2>&1; then
  echo "Creating namespace '$NS'..."
  # 'create' is preferred; 'register' also works on many versions
  $TCTL $ADDR namespace create --namespace "$NS" --description 'Default namespace' --rd 1
fi

# verify loop
until $TCTL $ADDR namespace describe --namespace "$NS" >/dev/null 2>&1; do
  echo " *** Retrying... *** "
  sleep 0.5
done
echo "Namespace '$NS' is ready."