# 🗄️ Configuración de DBeaver para PostgreSQL

Guía para conectar DBeaver a la base de datos PostgreSQL del proyecto.

## 📋 Requisitos Previos

1. DBeaver instalado
2. Docker Compose corriendo: `npm run docker:up`
3. PostgreSQL container activo

## 🔧 Configuración de la Conexión

### Paso 1: Crear Nueva Conexión

1. Abre DBeaver
2. Click en **Database** → **New Database Connection** (o `Cmd+Shift+N` en Mac)
3. Selecciona **PostgreSQL**
4. Click en **Next**

### Paso 2: Configurar Parámetros de Conexión

Usa estos valores (tomados de tu `docker-compose.yml`):

#### Main Tab

| Campo | Valor |
|-------|-------|
| **Host** | `localhost` |
| **Port** | `5432` |
| **Database** | `security_app_db` |
| **Username** | `security_app` |
| **Password** | `security_app_password` |

#### Configuración Visual

```
┌─────────────────────────────────────┐
│ Connection Settings                 │
├─────────────────────────────────────┤
│ Host:     localhost                 │
│ Port:     5432                      │
│ Database: security_app_db           │
│ Username: security_app              │
│ Password: ••••••••••••••••••••      │
│                                     │
│ ☑ Show all databases                │
│ ☐ Read only                         │
└─────────────────────────────────────┘
```

### Paso 3: Probar Conexión

1. Click en **Test Connection**
2. Si es la primera vez, DBeaver descargará el driver de PostgreSQL automáticamente
3. Deberías ver: **"Connected (PostgreSQL 16.x)"**
4. Click en **Finish**

## ✅ Verificación

Una vez conectado, deberías ver:

```
security_app_db
├── Schemas
│   └── public
│       ├── Tables
│       │   ├── users
│       │   ├── empresas
│       │   ├── shifts
│       │   └── ... (otras tablas)
│       └── ...
└── ...
```

## 🎨 Configuración Recomendada

### Configurar el Schema por Defecto

1. Click derecho en la conexión → **Edit Connection**
2. Ve a **PostgreSQL** tab
3. En **Show databases**, selecciona: `security_app_db`
4. En **Show schemas**, selecciona: `public`
5. Click en **OK**

### Habilitar Auto-commit (Desarrollo)

1. Click derecho en la conexión → **Edit Connection**
2. Ve a **Connection** tab
3. Marca **Auto-commit**
4. Click en **OK**

## 📊 Consultas Útiles

### Ver todas las tablas

```sql
SELECT 
    table_name,
    table_type
FROM 
    information_schema.tables
WHERE 
    table_schema = 'public'
ORDER BY 
    table_name;
```

### Ver estructura de una tabla

```sql
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_name = 'users'
ORDER BY 
    ordinal_position;
```

### Ver usuarios registrados

```sql
SELECT 
    id,
    email,
    full_name,
    role,
    status,
    created_at
FROM 
    users
ORDER BY 
    created_at DESC;
```

## 🔐 Seguridad

### Para Desarrollo (Local)

- ✅ Usar las credenciales del `docker-compose.yml`
- ✅ Guardar la contraseña en DBeaver (es local)
- ✅ Habilitar auto-commit para pruebas rápidas

### Para Producción

- ⚠️ **NUNCA** uses las credenciales por defecto
- ⚠️ Usa conexión SSH/SSL
- ⚠️ Configura read-only si solo necesitas consultar
- ⚠️ No guardes contraseñas de producción en DBeaver

## 🛠️ Troubleshooting

### Error: "Connection refused"

**Causa:** PostgreSQL no está corriendo

**Solución:**
```bash
# Verificar que el contenedor esté corriendo
docker compose ps

# Si no está corriendo, iniciarlo
npm run docker:up

# Verificar conexión
npm run db:verify
```

### Error: "Authentication failed"

**Causa:** Credenciales incorrectas

**Solución:**
1. Verifica que estés usando las credenciales correctas de `docker-compose.yml`
2. Usuario: `security_app`
3. Password: `security_app_password`

### Error: "Database does not exist"

**Causa:** La base de datos no se creó correctamente

**Solución:**
```bash
# Reiniciar PostgreSQL
docker compose restart postgres

# Ver logs
docker compose logs postgres

# Si persiste, recrear el contenedor
docker compose down
docker compose up -d postgres
```

### No puedo ver las tablas

**Causa:** TypeORM aún no ha creado las tablas

**Solución:**
```bash
# Iniciar la aplicación para que TypeORM cree las tablas
npm run start:dev
```

Las tablas se crearán automáticamente porque `synchronize: true` está habilitado en desarrollo.

## 📝 Notas Importantes

1. **Synchronize en Desarrollo:** TypeORM creará/actualizará las tablas automáticamente cuando inicies la app
2. **Datos de Prueba:** Puedes insertar datos directamente desde DBeaver para testing
3. **Backups:** DBeaver permite exportar/importar datos fácilmente
4. **ER Diagrams:** DBeaver puede generar diagramas ER automáticamente (click derecho en database → View Diagram)

## 🎯 Atajos Útiles de DBeaver

| Atajo | Acción |
|-------|--------|
| `Cmd+Enter` | Ejecutar consulta actual |
| `Cmd+Shift+Enter` | Ejecutar script completo |
| `Cmd+Space` | Auto-completar |
| `Cmd+/` | Comentar/descomentar |
| `F4` | Ver propiedades de objeto |
| `Cmd+F` | Buscar en resultados |

## 🔗 Conexión Alternativa (CLI)

Si prefieres usar la línea de comandos:

```bash
# Conectar directamente al contenedor
npm run db:postgres

# O manualmente
docker exec -it security-app-postgres psql -U security_app -d security_app_db
```

---

**¿Listo para conectar?** Sigue los pasos y estarás navegando tu base de datos en minutos. 🚀
