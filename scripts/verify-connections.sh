#!/bin/bash

# Script para verificar las conexiones a las bases de datos
# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Verificando conexiones a las bases de datos..."
echo ""

# Verificar PostgreSQL
echo -n "PostgreSQL: "
if docker exec security-app-postgres pg_isready -U security_app -d security_app_db > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Conectado${NC}"
    docker exec security-app-postgres psql -U security_app -d security_app_db -c "SELECT version();" | grep PostgreSQL
else
    echo -e "${RED}✗ No conectado${NC}"
    echo -e "${YELLOW}Ejecuta: docker-compose up -d postgres${NC}"
fi

echo ""

# Verificar MongoDB
echo -n "MongoDB: "
if docker exec security-app-mongodb mongosh security_app --quiet --eval "db.adminCommand('ping').ok" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Conectado${NC}"
    docker exec security-app-mongodb mongosh security_app --quiet --eval "db.version()"
else
    echo -e "${RED}✗ No conectado${NC}"
    echo -e "${YELLOW}Ejecuta: docker-compose up -d mongodb${NC}"
fi

echo ""

# Verificar Redis
echo -n "Redis: "
if docker exec security-app-redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Conectado${NC}"
    docker exec security-app-redis redis-cli INFO server | grep redis_version
else
    echo -e "${RED}✗ No conectado${NC}"
    echo -e "${YELLOW}Ejecuta: docker-compose up -d redis${NC}"
fi

echo ""
echo "✅ Verificación completada"
