# Scripts de Utilidad

Este directorio contiene scripts útiles para la gestión del proyecto.

## 📜 Scripts Disponibles

### `generate-secrets.js`
Genera credenciales seguras para el archivo `.env`.

**Uso:**
```bash
npm run secrets:generate
```

**Qué genera:**
- `JWT_SECRET` - Secret para tokens JWT
- `JWT_REFRESH_SECRET` - Secret para refresh tokens
- `ENCRYPTION_KEY` - Clave de encriptación para datos sensibles

### `verify-connections.sh`
Verifica que todas las bases de datos estén corriendo y sean accesibles.

**Uso:**
```bash
npm run db:verify
# o directamente:
bash scripts/verify-connections.sh
```

**Qué verifica:**
- ✅ PostgreSQL está corriendo y acepta conexiones
- ✅ MongoDB está corriendo y responde
- ✅ Redis está corriendo y responde a PING

## 🔧 Dar Permisos de Ejecución

Si los scripts no ejecutan, dale permisos:

```bash
chmod +x scripts/*.sh
```

## 💡 Consejos

- Ejecuta `npm run secrets:generate` al configurar un nuevo entorno
- Ejecuta `npm run db:verify` después de `npm run docker:up` para confirmar que todo está bien
- Los scripts están diseñados para usarse con Docker Compose
