# 🔴 Configuración de Herramientas para Redis

Guía para conectar y gestionar Redis en el proyecto.

## 📋 Requisitos Previos

1. Docker Compose corriendo: `docker compose up -d`
2. Redis container activo

## 🛠️ Opciones de Herramientas

### Opción 1: RedisInsight (Recomendada) 🌟

**La herramienta oficial de Redis, gratuita y muy completa.**

#### Instalación

**macOS:**
```bash
brew install --cask redisinsight
```

**Windows/Linux:**
Descarga desde: https://redis.io/insight/

#### Configuración de Conexión

1. Abre RedisInsight
2. Click en **"Add Redis Database"**
3. Selecciona **"Add Database Manually"**

**Parámetros:**

| Campo | Valor |
|-------|-------|
| **Host** | `localhost` |
| **Port** | `6379` |
| **Database Alias** | `Security App Redis` |
| **Username** | _(dejar vacío)_ |
| **Password** | _(dejar vacío)_ |

4. Click en **"Add Redis Database"**

#### Características Principales

- **Browser:** Navega y edita keys visualmente
- **Workbench:** Ejecuta comandos Redis
- **Profiler:** Monitorea comandos en tiempo real
- **Slow Log:** Identifica queries lentas
- **CLI integrada:** Terminal Redis incorporada

---

### Opción 2: Redis CLI (Línea de Comandos)

**Acceso rápido desde terminal.**

#### Desde el contenedor Docker:
```bash
docker compose exec redis redis-cli
```

#### Desde tu máquina (si tienes Redis instalado):
```bash
redis-cli -h localhost -p 6379
```

#### Comandos Útiles:

```bash
# Ver todas las keys
KEYS *

# Ver info del servidor
INFO

# Obtener valor de una key
GET mi_key

# Establecer valor
SET mi_key "valor"

# Ver keys con patrón
KEYS session:*

# Ver tipo de dato
TYPE mi_key

# TTL de una key
TTL mi_key

# Eliminar una key
DEL mi_key

# Limpiar toda la base de datos (¡CUIDADO!)
FLUSHDB

# Monitorear comandos en tiempo real
MONITOR

# Salir
EXIT
```

---

### Opción 3: Another Redis Desktop Manager

**Alternativa gratuita y open source.**

#### Instalación

**macOS:**
```bash
brew install --cask another-redis-desktop-manager
```

**Otras plataformas:**
https://github.com/qishibo/AnotherRedisDesktopManager

#### Configuración

1. Click en **"New Connection"**
2. **Name:** Security App Redis
3. **Host:** localhost
4. **Port:** 6379
5. Click en **"Test Connection"** → **"OK"**

---

### Opción 4: VS Code Extension

**Redis para VS Code**

1. Instala la extensión: **"Redis" by Dunn**
2. Click en el ícono de Redis en la barra lateral
3. Click en **"+"** para agregar conexión
4. **Host:** localhost:6379

---

## 🔍 Uso Común en el Proyecto

### Tipos de Datos que Usarás

#### 1. **Sessions (Strings)**
```bash
# Ver sesiones activas
KEYS session:*

# Ver detalles de una sesión
GET session:abc123...
```

#### 2. **Cache (Strings con TTL)**
```bash
# Ver datos en cache
KEYS cache:*

# Ver TTL de un cache
TTL cache:user:123
```

#### 3. **Rate Limiting (Sorted Sets)**
```bash
# Ver rate limits
KEYS throttle:*

# Ver intentos de un IP
ZRANGE throttle:192.168.1.1 0 -1 WITHSCORES
```

#### 4. **Queues (Lists)**
```bash
# Ver colas
KEYS queue:*

# Ver elementos en cola
LRANGE queue:notifications 0 -1
```

---

## 📊 Monitoreo y Debugging

### Ver Estadísticas del Servidor

```bash
docker compose exec redis redis-cli INFO
```

**Secciones importantes:**
- **Server:** Versión, uptime
- **Clients:** Conexiones activas
- **Memory:** Uso de memoria
- **Stats:** Comandos ejecutados
- **Keyspace:** Número de keys por DB

### Monitorear Comandos en Tiempo Real

```bash
docker compose exec redis redis-cli MONITOR
```

Útil para debugging y ver qué está haciendo tu aplicación.

### Ver Comandos Lentos

```bash
docker compose exec redis redis-cli SLOWLOG GET 10
```

---

## 🔐 Configuración con Autenticación (Producción)

Para producción, deberías habilitar autenticación:

### 1. Actualizar `docker-compose.yml`

```yaml
redis:
  image: redis:7-alpine
  command: redis-server --appendonly yes --requirepass your_secure_password
  environment:
    REDIS_PASSWORD: your_secure_password
```

### 2. Actualizar `.env`

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_secure_password
```

### 3. Conectar con Password

**RedisInsight:**
- Password: `your_secure_password`

**CLI:**
```bash
redis-cli -h localhost -p 6379 -a your_secure_password
```

---

## 🛠️ Troubleshooting

### Error: "Connection refused"

**Solución:**
```bash
# Verificar que Redis esté corriendo
docker ps | grep redis

# Reiniciar si es necesario
docker compose restart redis
```

### Error: "NOAUTH Authentication required"

**Causa:** Redis tiene password configurado pero no lo estás proporcionando.

**Solución:**
```bash
# Autenticarse después de conectar
AUTH your_password

# O conectar directamente con password
redis-cli -a your_password
```

### Redis está usando mucha memoria

**Ver uso de memoria:**
```bash
redis-cli INFO memory
```

**Limpiar keys expiradas:**
```bash
redis-cli --scan --pattern "cache:*" | xargs redis-cli DEL
```

**Configurar límite de memoria en `docker-compose.yml`:**
```yaml
redis:
  command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
```

---

## 📈 Mejores Prácticas

### 1. **Naming Conventions**
Usa prefijos descriptivos para organizar keys:
```
session:{userId}:{sessionId}
cache:user:{userId}
throttle:{ip}:{endpoint}
queue:notifications
```

### 2. **Establecer TTL**
Siempre establece TTL para evitar memory leaks:
```bash
SET cache:user:123 "{...}" EX 3600  # Expira en 1 hora
```

### 3. **Monitoreo Regular**
Revisa periódicamente:
- Número de keys: `DBSIZE`
- Uso de memoria: `INFO memory`
- Comandos lentos: `SLOWLOG GET`

### 4. **Backup**
Redis persiste datos en `/data` (montado en volume):
```bash
# Forzar guardado
docker compose exec redis redis-cli SAVE

# Ver última vez que se guardó
docker compose exec redis redis-cli LASTSAVE
```

---

## 📚 Recursos Adicionales

- [Redis Commands Reference](https://redis.io/commands/)
- [RedisInsight Docs](https://redis.io/docs/stack/insight/)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)
- [Redis Data Types](https://redis.io/docs/data-types/)

## 💡 Tips

- **Usa RedisInsight** para visualización y debugging
- **Usa CLI** para operaciones rápidas y scripting
- **Establece TTL** en todas las keys temporales
- **Monitorea memoria** regularmente en producción
- **Usa prefijos** consistentes para organizar keys
- **Habilita persistencia** con AOF para datos críticos
