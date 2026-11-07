#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "✨ Starting AURA Luxe Women's Fashion Boutique Platform ✨"
echo "=========================================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Verify backend dependencies
cd "$SCRIPT_DIR/backend"
echo "[1/2] Initializing database and boutique catalog seeder..."
python3 -c "from app.seed.seed_data import seed_database; seed_database()"

echo "[2/2] Launching unified web server on port 8000..."
echo "----------------------------------------------------------"
echo "👗 Public Storefront: http://localhost:8000"
echo "🛡️ Admin Dashboard:  http://localhost:8000/admin"
echo "📖 Swagger API Docs: http://localhost:8000/docs"
echo "🔑 Default Admin:    admin@auraluxe.fashion / AdminPassword123!"
echo "----------------------------------------------------------"
echo "Press Ctrl+C to stop the server."

python3 main.py

