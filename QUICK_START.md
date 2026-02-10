# 🚀 Inicio Rápido - Security App

Guía rápida para poner en marcha el proyecto en menos de 5 minutos.

## ⚡ Pasos Rápidos

### 1. Generar Credenciales Seguras

```bash
npm run secrets:generate
```

Esto generará valores seguros para `JWT_SECRET`, `JWT_REFRESH_SECRET` y `ENCRYPTION_KEY`.

### 2. Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env
```

Abre el archivo `.env` y reemplaza estos valores con los generados en el paso 1:
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `ENCRYPTION_KEY`

**Las demás variables ya tienen valores por defecto que funcionan con Docker Compose.**

### 3. Iniciar las Bases de Datos

```bash
npm run docker:up
```

Espera unos 10-15 segundos para que los contenedores inicien completamente.

### 4. Verificar Conexiones

```bash
npm run db:verify
```

Deberías ver ✓ en PostgreSQL, MongoDB y Redis.

### 5. Instalar Dependencias

```bash
npm install
```

### 6. Iniciar la Aplicación

```bash
npm run start:dev
```

¡Listo! La aplicación estará corriendo en `http://localhost:3000/api`

---

## 📋 Comandos Útiles

### Docker
```bash
npm run docker:up        # Iniciar todos los servicios
npm run docker:down      # Detener servicios
npm run docker:restart   # Reiniciar servicios
npm run docker:logs      # Ver logs en tiempo real
npm run docker:clean     # Limpiar todo (¡cuidado! elimina datos)
```

### Bases de Datos
```bash
npm run db:postgres      # Conectar a PostgreSQL CLI
npm run db:mongo         # Conectar a MongoDB CLI
npm run db:redis         # Conectar a Redis CLI
npm run db:verify        # Verificar conexiones
```

### Desarrollo
```bash
npm run start:dev        # Modo desarrollo con hot-reload
npm run start:debug      # Modo debug
npm run build            # Compilar para producción
npm run start:prod       # Iniciar en modo producción
```

### Testing
```bash
npm run test             # Ejecutar tests
npm run test:watch       # Tests en modo watch
npm run test:cov         # Tests con cobertura
npm run test:e2e         # Tests end-to-end
```

---

## 🔍 Verificación Rápida

### ¿Todo está funcionando?

1. **Bases de datos corriendo:**
   ```bash
   docker-compose ps
   ```
   Deberías ver 3 contenedores con estado "Up"

2. **Conexiones funcionando:**
   ```bash
   npm run db:verify
   ```
   Deberías ver 3 checkmarks verdes

3. **Aplicación iniciada:**
   ```bash
   curl http://localhost:3000/api
   ```
   Debería responder sin errores

---

## 🆘 Problemas Comunes

### Error: "Puerto ya en uso"
```bash
# Ver qué proceso usa el puerto
lsof -i :5432   # PostgreSQL
lsof -i :27017  # MongoDB
lsof -i :6379   # Redis
lsof -i :3000   # API

# Detener Docker Compose
npm run docker:down
```

### Error: "Cannot connect to database"
```bash
# Reiniciar los contenedores
npm run docker:restart

# Ver los logs
npm run docker:logs
```

### Error: "JWT_SECRET must be at least 32 characters"
```bash
# Generar nuevas credenciales
npm run secrets:generate

# Actualizar tu archivo .env con los valores generados
```

---

## 📚 Documentación Completa

Para más detalles, consulta:
- `SETUP_GUIDE.md` - Guía completa de configuración
- `README_SETUP.md` - Documentación del proyecto
- `scripts/README.md` - Documentación de scripts

---

## ✅ Checklist de Configuración

- [ ] Credenciales generadas con `npm run secrets:generate`
- [ ] Archivo `.env` creado y configurado
- [ ] Docker Compose iniciado con `npm run docker:up`
- [ ] Conexiones verificadas con `npm run db:verify`
- [ ] Dependencias instaladas con `npm install`
- [ ] Aplicación corriendo con `npm run start:dev`

**¡Estás listo para desarrollar! 🎉**
