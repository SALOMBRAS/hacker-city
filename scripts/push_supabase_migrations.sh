#!/usr/bin/env bash
set -euo pipefail

PROJECT_REF="yguxmkgkwumcskucdlfc"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  echo "❌ SUPABASE_ACCESS_TOKEN não encontrado no ambiente."
  echo "Como rodar:"
  echo "  1) Gere um Personal Access Token em: https://supabase.com/dashboard/account/tokens"
  echo "  2) Execute: SUPABASE_ACCESS_TOKEN=sbp_seu_token_aqui ./scripts/push_supabase_migrations.sh"
  echo ""
  echo "Ou cole diretamente o arquivo:"
  echo "  $ROOT_DIR/supabase/migrations/20261119_full_mmo_anticheat_clans_ddos_bounties.sql"
  echo "no SQL Editor: https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new"
  exit 1
fi

cd "$ROOT_DIR"
echo "🔗 Vinculando projeto Supabase (${PROJECT_REF})..."
npx --yes supabase link --project-ref "$PROJECT_REF"
echo "🚀 Subindo migrations de supabase/migrations/..."
npx --yes supabase db push
echo "✅ Migrations aplicadas com sucesso em ${PROJECT_REF}!"
