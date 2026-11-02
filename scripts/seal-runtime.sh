#!/usr/bin/env bash
# re-seal the site runtime secret after rotating any of: SESSION_SECRET,
# OIDC_CLIENT_ID/SECRET (authentik), AUTHENTIK_ISSUER, ADMIN_EMAIL.
# values come from .env.site (gitignored); result is commit-safe.
set -euo pipefail
cd "$(dirname "$0")/.."

[[ ! -f .env.site ]] && { echo "✗ .env.site missing — see .env.site.example"; exit 1; }
# shellcheck disable=SC1091
set -a; source .env.site; set +a

kubectl -n personal-site create secret generic personal-site-runtime \
	--from-literal=SESSION_SECRET="${SESSION_SECRET:?}" \
	--from-literal=OIDC_CLIENT_ID="${OIDC_CLIENT_ID:?}" \
	--from-literal=OIDC_CLIENT_SECRET="${OIDC_CLIENT_SECRET:?}" \
	--from-literal=AUTHENTIK_ISSUER="${AUTHENTIK_ISSUER:?}" \
	--from-literal=ADMIN_EMAIL="${ADMIN_EMAIL:?}" \
	--dry-run=client -o yaml |
	kubeseal --controller-namespace=kube-system \
		--controller-name=sealed-secrets-controller \
		--format yaml > chart/templates/sealed-secret-runtime.yaml

echo "✓ sealed → chart/templates/sealed-secret-runtime.yaml"
