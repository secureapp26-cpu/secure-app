# 🍃 Configuración de MongoDB Compass

Guía para conectar MongoDB Compass a la base de datos MongoDB del proyecto.

## 📋 Requisitos Previos

1. MongoDB Compass instalado
2. Docker Compose corriendo: `docker compose up -d`
3. MongoDB container activo

## 📥 Instalación de MongoDB Compass

### macOS
```bash
brew install --cask mongodb-compass
```

### Windows
Descarga desde: https://www.mongodb.com/try/download/compass

### Linux
```bash
wget https://downloads.mongodb.com/compass/mongodb-compass_latest_amd64.deb
sudo dpkg -i mongodb-compass_latest_amd64.deb
```

## 🔧 Configuración de la Conexión

### Paso 1: Abrir MongoDB Compass

1. Abre MongoDB Compass
2. Verás la pantalla de "New Connection"

### Paso 2: Configurar la Conexión

#### Opción A: URI de Conexión (Rápida)

Copia y pega esta URI en el campo de conexión:

```
mongodb://localhost:27017/security_app
```

#### Opción B: Configuración Manual

Si prefieres configurar manualmente:

| Campo | Valor |
|-------|-------|
| **Host** | `localhost` |
| **Port** | `27017` |
| **Authentication** | None |
| **Database** | `security_app` |

### Paso 3: Conectar

1. Click en **"Connect"**
2. Deberías ver la base de datos `security_app` en el panel izquierdo

## 📊 Estructura de la Base de Datos

Una vez conectado, verás las siguientes colecciones:

- **activities** - Registro de actividades del sistema
- **audits** - Logs de auditoría
- Otras colecciones según los módulos implementados

## 🔍 Operaciones Comunes

### Ver Documentos
1. Click en la base de datos `security_app`
2. Click en una colección (ej: `activities`)
3. Verás los documentos en formato JSON

### Filtrar Documentos
En el campo de filtro, usa sintaxis MongoDB:
```json
{ "user_id": "123e4567-e89b-12d3-a456-426614174000" }
```

### Crear Índices
1. Ve a la pestaña **"Indexes"** de una colección
2. Click en **"Create Index"**
3. Define los campos y opciones

### Exportar Datos
1. Selecciona una colección
2. Click en **"Export Collection"**
3. Elige el formato (JSON, CSV)

## 🛠️ Troubleshooting

### Error: "Connection refused"

**Causa:** El contenedor de MongoDB no está corriendo.

**Solución:**
```bash
# Verificar que el contenedor esté activo
docker ps | grep mongodb

# Si no está corriendo, levanta los servicios
docker compose up -d
```

### Error: "Authentication failed"

**Causa:** La configuración actual no requiere autenticación.

**Solución:** Asegúrate de NO tener configurado ningún usuario/contraseña en la conexión.

### No veo la base de datos `security_app`

**Causa:** La base de datos se crea cuando se inserta el primer documento.

**Solución:** Espera a que la aplicación NestJS cree las colecciones automáticamente, o créala manualmente:
1. Click en **"Create Database"**
2. Nombre: `security_app`
3. Primera colección: `activities`

## 🔐 Configuración con Autenticación (Producción)

Para entornos de producción, deberías habilitar autenticación en MongoDB:

### 1. Actualizar `docker-compose.yml`
```yaml
mongodb:
  environment:
    MONGO_INITDB_ROOT_USERNAME: admin
    MONGO_INITDB_ROOT_PASSWORD: secure_password_here
    MONGO_INITDB_DATABASE: security_app
```

### 2. URI de Conexión con Autenticación
```
mongodb://admin:secure_password_here@localhost:27017/security_app?authSource=admin
```

### 3. Actualizar `.env`
```env
MONGODB_URI=mongodb://admin:secure_password_here@localhost:27017/security_app?authSource=admin
```

## 📚 Recursos Adicionales

- [MongoDB Compass Docs](https://www.mongodb.com/docs/compass/current/)
- [MongoDB Query Syntax](https://www.mongodb.com/docs/manual/tutorial/query-documents/)
- [MongoDB Aggregation](https://www.mongodb.com/docs/manual/aggregation/)

## 💡 Tips

- **Favoritos:** Guarda la conexión como favorita para acceso rápido
- **Schema Analysis:** Usa la pestaña "Schema" para analizar la estructura de tus documentos
- **Explain Plan:** Revisa el performance de tus queries con "Explain Plan"
- **Validation Rules:** Define reglas de validación de esquema en la pestaña "Validation"
