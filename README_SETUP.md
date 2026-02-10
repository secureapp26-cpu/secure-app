# 🔐 Security App - Backend API

Plataforma SaaS multi-tenant para gestión operativa y seguridad con soporte offline-first y marca blanca.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Stack Tecnológico](#stack-tecnológico)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Testing](#testing)
- [Endpoints API](#endpoints-api)
- [Seguridad](#seguridad)

## ✨ Características

- ✅ **Autenticación JWT** con bcrypt (12 rounds)
- ✅ **Sesión única por dispositivo** con control de device_id
- ✅ **Multi-tenant** con aislamiento de datos por empresa
- ✅ **Validación robusta** con class-validator
- ✅ **Seguridad** con Helmet.js y CORS
- ✅ **Tests unitarios** con patrón AAA (Arrange-Act-Assert)
- ✅ **TypeORM** para PostgreSQL
- ✅ **Mongoose** para MongoDB
- ✅ **Docker Compose** para desarrollo local

## 🛠️ Stack Tecnológico

### Core
- **Framework**: NestJS 11
- **Lenguaje**: TypeScript 5.7
- **Base de datos principal**: PostgreSQL 16
- **Base de datos auxiliar**: MongoDB 7
- **Cache**: Redis 7

### Seguridad
- **Autenticación**: JWT (jsonwebtoken)
- **Hashing**: bcrypt (12 rounds)
- **Validación**: class-validator + class-transformer
- **Headers**: Helmet.js

### Testing
- **Framework**: Jest 30
- **E2E**: Supertest

## 📦 Requisitos Previos

- Node.js >= 18.x
- npm >= 9.x
- Docker y Docker Compose (para bases de datos)

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd security-app
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones:

```env
# Application
NODE_ENV=development
PORT=3000
API_PREFIX=api

# JWT - ⚠️ CAMBIAR EN PRODUCCIÓN
JWT_SECRET=dev-super-secret-jwt-key-min-32-characters-long-change-in-production
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=dev-super-secret-refresh-key-min-32-characters-long-change-in-production
JWT_REFRESH_EXPIRATION=7d

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=security_app
POSTGRES_PASSWORD=security_app_password
POSTGRES_DB=security_app_db

# MongoDB
MONGODB_URI=mongodb://localhost:27017/security_app

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Security
BCRYPT_SALT_ROUNDS=12
ENCRYPTION_KEY=dev-encryption-key-for-sensitive-data-32-chars

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10
```

### 4. Iniciar servicios con Docker

```bash
docker-compose up -d
```

Esto iniciará:
- PostgreSQL en puerto 5432
- MongoDB en puerto 27017
- Redis en puerto 6379

### 5. Verificar que los servicios estén corriendo

```bash
docker-compose ps
```

## 🏃 Ejecución

### Modo Desarrollo

```bash
npm run start:dev
```

La aplicación estará disponible en: `http://localhost:3000/api`

### Modo Producción

```bash
npm run build
npm run start:prod
```

### Modo Debug

```bash
npm run start:debug
```

## 🧪 Testing

### Tests Unitarios

```bash
npm run test
```

### Tests con Cobertura

```bash
npm run test:cov
```

### Tests E2E

```bash
npm run test:e2e
```

### Tests en Modo Watch

```bash
npm run test:watch
```

## 📡 Endpoints API

### Base URL
```
http://localhost:3000/api
```

### Autenticación

#### 1. Registro de Usuario

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "Password123!@#",
  "full_name": "Juan Pérez",
  "role": "operator",
  "phone": "+57 300 123 4567",
  "empresa_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Validaciones de contraseña:**
- Mínimo 8 caracteres
- Máximo 50 caracteres
- Al menos una mayúscula
- Al menos una minúscula
- Al menos un número
- Al menos un carácter especial (@$!%*?&)

**Respuesta exitosa (201):**
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174001",
    "email": "usuario@example.com",
    "full_name": "Juan Pérez",
    "role": "operator",
    "phone": "+57 300 123 4567",
    "status": "active",
    "empresa_id": "123e4567-e89b-12d3-a456-426614174000",
    "created_at": "2026-02-09T21:00:00.000Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 2. Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "Password123!@#",
  "device_id": "device-uuid-123"
}
```

**Respuesta exitosa (200):**
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174001",
    "email": "usuario@example.com",
    "full_name": "Juan Pérez",
    "role": "operator",
    "empresa": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "nombre": "Empresa Demo"
    }
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Nota importante:** Si el usuario ya tiene una sesión activa en otro dispositivo, la sesión anterior se invalidará automáticamente.

#### 3. Refresh Token

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Respuesta exitosa (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 4. Logout

```http
POST /api/auth/logout
Authorization: Bearer {access_token}
```

**Respuesta exitosa (204):** Sin contenido

### Roles de Usuario

- `operator`: Operador/Vigilante
- `supervisor`: Supervisor
- `admin`: Administrador
- `client`: Cliente (solo lectura)

## 🔒 Seguridad

### Medidas Implementadas

#### 1. Contraseñas
- ✅ Hasheadas con **bcrypt** (12 rounds)
- ✅ Nunca se almacenan en texto plano
- ✅ Validación de complejidad en el registro

#### 2. JWT Tokens
- ✅ **Access Token**: 15 minutos de duración
- ✅ **Refresh Token**: 7 días de duración
- ✅ Firmados con secretos fuertes (mínimo 32 caracteres)
- ✅ Incluyen información del dispositivo (device_id)

#### 3. Sesión Única por Dispositivo
- ✅ Un usuario solo puede estar logueado en un dispositivo a la vez
- ✅ Al hacer login en un nuevo dispositivo, se invalida la sesión anterior
- ✅ Control mediante `device_id` almacenado en la base de datos

#### 4. Headers de Seguridad
- ✅ **Helmet.js** configurado
- ✅ CORS habilitado con configuración segura
- ✅ Protección contra XSS
- ✅ Protección contra clickjacking

#### 5. Validación de Datos
- ✅ **class-validator** en todos los DTOs
- ✅ Whitelist habilitado (elimina propiedades no definidas)
- ✅ Transform habilitado para conversión automática de tipos

#### 6. Auditoría
- ✅ Soft delete en todas las entidades
- ✅ Timestamps automáticos (created_at, updated_at, deleted_at)
- ✅ Registro de último login

### Recomendaciones para Producción

1. **Cambiar todos los secretos** en `.env`:
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `ENCRYPTION_KEY`
   - Contraseñas de bases de datos

2. **Usar HTTPS** en producción

3. **Configurar rate limiting** adecuado

4. **Habilitar logs** de auditoría

5. **Configurar backups** automáticos de bases de datos

6. **Usar variables de entorno** del proveedor cloud (no archivos .env)

## 📁 Estructura del Proyecto

```
src/
├── core/                    # Módulos transversales
│   ├── config/             # Configuración global
│   ├── database/           # Configuración de bases de datos
│   └── common/             # Guards, decorators, interceptors
│       └── guards/
│           └── jwt-auth.guard.ts
│
├── modules/                # Módulos de negocio
│   ├── empresa/           # Gestión de empresas
│   │   └── entities/
│   │       └── empresa.entity.ts
│   │
│   ├── user/              # Gestión de usuarios
│   │   └── entities/
│   │       └── user.entity.ts
│   │
│   └── auth/              # Autenticación
│       ├── dto/
│       │   ├── register.dto.ts
│       │   └── login.dto.ts
│       ├── strategies/
│       │   └── jwt.strategy.ts
│       ├── auth.controller.ts
│       ├── auth.service.ts
│       ├── auth.service.spec.ts
│       └── auth.module.ts
│
├── app.module.ts          # Módulo principal
└── main.ts                # Punto de entrada
```

## 🐛 Troubleshooting

### Error: "Cannot connect to PostgreSQL"

Verifica que Docker esté corriendo:
```bash
docker-compose ps
docker-compose logs postgres
```

### Error: "JWT secret is required"

Asegúrate de que el archivo `.env` existe y tiene las variables configuradas.

### Error: "Port 3000 already in use"

Cambia el puerto en `.env`:
```env
PORT=3001
```

## 📝 Notas Adicionales

### Patrón AAA en Tests

Todos los tests siguen el patrón **AAA (Arrange-Act-Assert)**:

```typescript
it('debe registrar un nuevo usuario exitosamente', async () => {
  // Arrange - Preparar datos y mocks
  const registerDto = { ... };
  mockUserRepository.findOne.mockResolvedValue(null);
  
  // Act - Ejecutar la acción
  const result = await service.register(registerDto);
  
  // Assert - Verificar resultados
  expect(result).toHaveProperty('user');
  expect(result.user.email).toBe(registerDto.email);
});
```

### Próximos Pasos

1. ✅ Autenticación JWT implementada
2. ⏳ Implementar módulo de Espacios
3. ⏳ Implementar módulo de Rondas
4. ⏳ Implementar módulo de Alertas
5. ⏳ Implementar sincronización offline
6. ⏳ Implementar marca blanca

## 📞 Soporte

Para reportar problemas o solicitar features, crea un issue en el repositorio.

---

**Desarrollado con ❤️ usando NestJS**
