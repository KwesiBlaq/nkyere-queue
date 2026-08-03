# Nkyere — local development shortcuts
# Requires GNU make (choco install make  |  scoop install make  |  bundled in Git Bash)
#
# Windows note: Horizon uses pcntl (POSIX-only). Use 'make worker' for native Windows
# queue processing. Use 'make horizon-docker' / 'make reverb-docker' for the Docker services.

.DEFAULT_GOAL := help
.PHONY: help up-infra down serve reverb worker horizon-docker reverb-docker test lint fix fresh

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
	  | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-22s\033[0m %s\n", $$1, $$2}'

# ─── Infrastructure ───────────────────────────────────────────────────────────

up-infra: ## Start MariaDB, Redis (no app container)
	docker compose up -d db redis

down: ## Stop and remove all containers (all profiles)
	docker compose --profile full --profile horizon --profile reverb down

# ─── Local dev (native PHP + Docker MariaDB/Redis) ────────────────────────────

serve: ## Start PHP dev server on :8000
	php artisan serve

reverb: ## Start Reverb WebSocket server on :8080 (native)
	php artisan reverb:start

worker: ## Start queue worker — Windows-compatible, no pcntl required
	php artisan queue:work redis --queue=tickets,default --sleep=3 --tries=3 --timeout=150

horizon-docker: ## Start Horizon workers in Docker (gets the /horizon dashboard)
	docker compose --profile horizon up -d db redis horizon
	@echo ""
	@echo "  Horizon workers running in Docker."
	@echo "  Run 'make serve' then visit http://localhost:8000/horizon"
	@echo ""

reverb-docker: ## Start Reverb WebSocket server in Docker
	docker compose --profile reverb up -d db redis reverb

# ─── Quality ──────────────────────────────────────────────────────────────────

test: ## Run Pest test suite (parallel)
	php vendor/bin/pest --parallel

lint: ## Check code style (Pint --test) and static types (PHPStan)
	php vendor/bin/pint --test && php vendor/bin/phpstan analyse

fix: ## Auto-fix code style with Pint
	php vendor/bin/pint

# ─── Database ─────────────────────────────────────────────────────────────────

fresh: ## Drop all tables, re-run migrations, seed
	php artisan migrate:fresh --seed
