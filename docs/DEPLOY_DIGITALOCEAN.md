# 🚀 Deploy en DigitalOcean App Platform

Guía completa para desplegar la aplicación Security App en DigitalOcean App Platform.

---

## 📋 Prerequisitos

- ✅ Cuenta en DigitalOcean (con $200 crédito gratis)
- ✅ Cuenta en MongoDB Atlas (cluster creado)
- ✅ Repositorio en GitHub
- ✅ Código pusheado a la rama `main`

---

## 🎯 Configuración de MongoDB Atlas

### 1. Obtener Connection String

1. Ve a tu cluster en MongoDB Atlas
2. Click en **"Connect"**
3. Selecciona **"Connect your application"**
4. Copia el connection string:

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

5. Reemplaza `<username>` y `<password>` con tus credenciales
6. Agrega el nombre de la base de datos al final:

```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/security_app?retryWrites=true&w=majority
```

### 2. Configurar IP Whitelist

1. En MongoDB Atlas → **Network Access**
2. Click **"Add IP Address"**
3. Selecciona **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

⚠️ **Nota**: En producción, restringe esto a las IPs de DigitalOcean.

---

## 🌊 Configuración en DigitalOcean

### Paso 1: Crear App

1. Ve a [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click **"Create App"**
3. Selecciona **"GitHub"** como source
4. Autoriza DigitalOcean a acceder a tu repositorio
5. Selecciona tu repositorio: `security-app`
6. Selecciona la rama: `main`
7. Click **"Next"**

### Paso 2: Configurar Recursos

#### a) Configurar el Servicio Web

DigitalOcean detectará automáticamente el `Dockerfile`. Configura:

- **Name**: `security-app-api`
- **Type**: Web Service
- **Dockerfile Path**: `Dockerfile`
- **HTTP Port**: `3000`
- **HTTP Request Routes**: `/`
- **Instance Size**: **Basic ($12/mes)** o **Professional ($25/mes)**
- **Instance Count**: `1`

#### b) Agregar Dev Databases

Click **"Add Resource"** → **"Database"**

**PostgreSQL Dev Database**:
- Name: `db`
- Engine: PostgreSQL
- Version: 16
- Click **"Add"**

**Redis Dev Database**:
- Name: `redis`
- Engine: Redis
- Version: 7
- Click **"Add"**

⚠️ **Nota**: Las dev databases son compartidas y limitadas. Para producción, usa Managed Databases.

### Paso 3: Variables de Entorno

Click en tu servicio → **"Environment Variables"** → **"Edit"**

Agrega las siguientes variables:

```bash
# Application
NODE_ENV=production
APP_PORT=3000
APP_API_PREFIX=api

# JWT Secrets (genera nuevos con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=tu-secret-generado-de-64-caracteres-aqui
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=otro-secret-generado-de-64-caracteres-aqui
JWT_REFRESH_EXPIRATION=7d

# PostgreSQL (usa las referencias de DigitalOcean)
DATABASE_HOST=${db.HOSTNAME}
DATABASE_PORT=${db.PORT}
DATABASE_USERNAME=${db.USERNAME}
DATABASE_PASSWORD=${db.PASSWORD}
DATABASE_NAME=${db.DATABASE}

# MongoDB Atlas (tu connection string)
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/security_app?retryWrites=true&w=majority

# Redis (usa las referencias de DigitalOcean)
REDIS_HOST=${redis.HOSTNAME}
REDIS_PORT=${redis.PORT}
REDIS_PASSWORD=${redis.PASSWORD}

# CORS (agrega tus dominios de frontend)
CORS_ORIGINS=*

# Security
BCRYPT_SALT_ROUNDS=12
ENCRYPTION_KEY=tu-encryption-key-de-32-caracteres

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_DEFAULT_LIMIT=200
THROTTLE_STRICT_LIMIT=5
THROTTLE_RELAXED_LIMIT=500

# Logging
LOG_LEVEL=info
```

### Paso 4: Configurar Región

- Selecciona la región más cercana a tus usuarios
- Recomendado: **New York** (para LATAM)

### Paso 5: Configurar App Info

- **App Name**: `security-app`
- **Project**: Default (o crea uno nuevo)

### Paso 6: Review y Deploy

1. Revisa toda la configuración
2. Click **"Create Resources"**
3. Espera 5-10 minutos mientras se despliega

---

## 🔍 Verificar Deployment

### 1. Ver Logs

En tu app → **"Runtime Logs"**

Deberías ver:
```
🚀 Aplicación corriendo en: http://localhost:3000/api
🔒 Seguridad: Helmet, CORS, Rate Limiting habilitados
```

### 2. Probar la API

Tu app estará disponible en:
```
https://security-app-xxxxx.ondigitalocean.app
```

Prueba el endpoint:
```bash
curl https://security-app-xxxxx.ondigitalocean.app/api
```

### 3. Verificar Bases de Datos

**PostgreSQL**:
```bash
# En la consola de DigitalOcean
psql $DATABASE_URL
\dt  # Listar tablas
```

**MongoDB**:
```bash
# En MongoDB Atlas → Collections
# Deberías ver tu base de datos "security_app"
```

**Redis**:
```bash
# En la consola de DigitalOcean
redis-cli -h $REDIS_HOST -p $REDIS_PORT -a $REDIS_PASSWORD
PING  # Debería responder PONG
```

---

## 🔄 Deploy Automático (CI/CD)

DigitalOcean desplegará automáticamente cuando hagas push a `main`:

```bash
git add .
git commit -m "feat: add new feature"
git push origin main
```

El deploy se activará automáticamente y verás el progreso en la consola.

---

## 🔒 Configurar Dominio Personalizado (Opcional)

### 1. Agregar Dominio

1. En tu app → **"Settings"** → **"Domains"**
2. Click **"Add Domain"**
3. Ingresa tu dominio: `api.tudominio.com`
4. Click **"Add Domain"**

### 2. Configurar DNS

En tu proveedor de DNS (Namecheap, GoDaddy, etc.):

```
Type: CNAME
Name: api
Value: security-app-xxxxx.ondigitalocean.app
TTL: 3600
```

### 3. Esperar Propagación

- Puede tomar 24-48 horas
- DigitalOcean configurará HTTPS automáticamente

---

## 📊 Monitoreo

### Métricas Incluidas

En tu app → **"Insights"**:
- CPU Usage
- Memory Usage
- Request Count
- Response Time
- Error Rate

### Alertas

1. **"Settings"** → **"Alerts"**
2. Configura alertas para:
   - CPU > 80%
   - Memory > 80%
   - Error Rate > 5%

---

## 💰 Costos

### Configuración Básica ($12/mes)

```
App Platform Basic:        $12/mes
PostgreSQL Dev DB:         $0 (incluido)
Redis Dev DB:              $0 (incluido)
MongoDB Atlas Free:        $0
──────────────────────────────────
TOTAL:                     $12/mes
```

Con $200 de crédito = **16 meses gratis**

### Escalar a Producción ($199/mes)

Cuando tengas tráfico real:

```
App Platform Professional: $50/mes
Managed PostgreSQL:        $60/mes
Managed Redis:             $15/mes
MongoDB Atlas M10:         $57/mes
Load Balancer:             $12/mes
Spaces (storage):          $5/mes
──────────────────────────────────
TOTAL:                     $199/mes
```

---

## 🐛 Troubleshooting

### Error: "Application failed to start"

**Causa**: Variables de entorno incorrectas

**Solución**:
1. Verifica todas las variables en **"Environment Variables"**
2. Asegúrate de usar `${db.HOSTNAME}` para PostgreSQL
3. Verifica el connection string de MongoDB

### Error: "Cannot connect to database"

**Causa**: MongoDB Atlas no permite la conexión

**Solución**:
1. Ve a MongoDB Atlas → **Network Access**
2. Agrega `0.0.0.0/0` a la whitelist
3. Verifica que el connection string sea correcto

### Error: "Port 3000 is already in use"

**Causa**: Variable `APP_PORT` incorrecta

**Solución**:
- Asegúrate de que `APP_PORT=3000`
- No uses `PORT` (DigitalOcean lo maneja internamente)

### Logs no aparecen

**Solución**:
1. Ve a **"Runtime Logs"**
2. Selecciona el componente correcto
3. Ajusta el rango de tiempo

---

## 🔐 Seguridad en Producción

### 1. Generar Secrets Seguros

```bash
# Generar JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generar JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generar ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Configurar CORS

Reemplaza `CORS_ORIGINS=*` con tus dominios reales:
```bash
CORS_ORIGINS=https://app.tudominio.com,https://admin.tudominio.com
```

### 3. Restringir MongoDB Atlas

1. MongoDB Atlas → **Network Access**
2. Remueve `0.0.0.0/0`
3. Agrega solo las IPs de DigitalOcean

### 4. Habilitar Backups

Para Managed Databases:
1. **Databases** → Tu database
2. **Settings** → **Backups**
3. Habilitar backups automáticos

---

## 📚 Recursos Adicionales

- [DigitalOcean App Platform Docs](https://docs.digitalocean.com/products/app-platform/)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [NestJS Deployment](https://docs.nestjs.com/faq/deployment)

---

## ✅ Checklist de Deploy

```bash
□ Cuenta en DigitalOcean creada
□ Cuenta en MongoDB Atlas creada
□ Cluster de MongoDB creado
□ Connection string obtenido
□ IP whitelist configurada (0.0.0.0/0)
□ Código pusheado a GitHub
□ App creada en DigitalOcean
□ Dev databases agregadas (PostgreSQL + Redis)
□ Variables de entorno configuradas
□ Secrets generados y configurados
□ Deploy completado exitosamente
□ Logs verificados
□ API funcionando
□ Bases de datos conectadas
```

---

**¡Listo!** Tu aplicación está desplegada y lista para usar. 🎉



