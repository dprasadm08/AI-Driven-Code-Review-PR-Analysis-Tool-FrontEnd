# ============================================================
# Makefile – Full-stack container helper commands
# ============================================================
.PHONY: up down dev build logs ps test-startup clean help

# Start production full-stack (frontend + backend mock)
up:
	docker compose up --build -d
	@echo ""
	@echo "  Frontend → http://localhost:4200"
	@echo "  Backend  → http://localhost:8080/api/health"

# Tear down all containers
down:
	docker compose down --remove-orphans

# Start development mode (live reload, source mount)
dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Build frontend image only
build:
	docker compose build frontend

# Tail logs for all services
logs:
	docker compose logs -f

# Show running containers status
ps:
	docker compose ps

# Test full-stack startup: bring up, wait for health, verify endpoints, tear down
test-startup:
	@echo "=== Starting full-stack containers ==="
	docker compose up --build -d
	@echo "=== Waiting 30s for services to become healthy ==="
	sleep 30
	@echo "=== Checking frontend (port 4200) ==="
	curl -sf http://localhost:4200/ | head -c 200
	@echo ""
	@echo "=== Checking backend health (port 8080) ==="
	curl -sf http://localhost:8080/api/health
	@echo ""
	@echo "=== Container health status ==="
	docker compose ps
	@echo "=== Tearing down ==="
	docker compose down --remove-orphans
	@echo "=== Full-stack startup test PASSED ==="

# Remove containers, volumes and built images
clean:
	docker compose down --remove-orphans --volumes
	docker image rm ai-pr-review-frontend:latest 2>/dev/null || true

help:
	@echo ""
	@echo "  make up            – Start production stack (detached)"
	@echo "  make dev           – Start dev stack with live reload"
	@echo "  make down          – Stop all containers"
	@echo "  make build         – Build frontend image only"
	@echo "  make logs          – Follow logs"
	@echo "  make ps            – Show container status"
	@echo "  make test-startup  – Full-stack smoke test"
	@echo "  make clean         – Remove containers, images, volumes"
	@echo ""
