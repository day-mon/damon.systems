#!/usr/bin/env bash
# seals your b2 creds into chart/templates/sealed-secret-b2.yaml.
#
#   1. cp .env.b2.example .env.b2  (fill in real values)
#   2. ./scripts/seal-b2.sh
#   3. git add chart/templates/sealed-secret-b2.yaml && commit — the sealed
#      values are unusable outside the cluster, so committing is safe.
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ ! -f .env.b2 ]]; then
	echo "✗ .env.b2 missing — cp .env.b2.example .env.b2 first" >&2
	exit 1
fi

set -a
# shellcheck disable=SC1091
source .env.b2
set +a

kubectl -n personal-site create secret generic personal-site-b2 \
	--from-literal=B2_KEY_ID="${B2_KEY_ID:?}" \
	--from-literal=B2_APPLICATION_KEY="${B2_APPLICATION_KEY:?}" \
	--from-literal=B2_BUCKET_NAME="${B2_BUCKET_NAME:-travel-albums}" \
	--from-literal=B2_REGION="${B2_REGION:-us-west-004}" \
	--dry-run=client -o yaml |
	kubeseal --controller-namespace=kube-system \
		--controller-name=sealed-secrets-controller \
		--format yaml > chart/templates/sealed-secret-b2.yaml

echo "✓ sealed to chart/templates/sealed-secret-b2.yaml — commit it"
