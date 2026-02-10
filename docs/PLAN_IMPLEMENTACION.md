# Plan de Implementación - Security App Backend

**Proyecto**: Plataforma SaaS Multi-tenant de Gestión Operativa y Seguridad  
**Framework**: NestJS + PostgreSQL + MongoDB + Redis  
**Última actualización**: Febrero 2026

---

## 📋 Estado Actual del Proyecto

### ✅ Completado (Fase 1 - Fundación)

- [x] Setup inicial de NestJS
- [x] Configuración Docker Compose (PostgreSQL, MongoDB, Redis)
- [x] Estructura base de módulos
- [x] Módulo de autenticación (Auth)
- [x] Módulo de empresa/tenant (Empresa)
- [x] Módulo de turnos (Shift)
- [x] Configuración de base de datos con TypeORM
- [x] Configuración de variables de entorno
- [x] Scripts de verificación de conexiones
- [x] Documentación de setup inicial

### 📁 Estructura Actual

```
src/
├── core/
│   ├── common/          # Utilidades comunes
│   ├── config/          # Configuración de la app
│   └── database/        # Configuración de bases de datos
├── modules/
│   ├── auth/           # ✅ Autenticación JWT
│   ├── empresa/        # ✅ Multi-tenancy
│   ├── shift/          # ✅ Gestión de turnos
│   └── user/           # Gestión de usuarios (parcial)
```

---

## 🎯 Roadmap de Implementación

### **FASE 2: Core Operativo** (4-6 semanas)

#### 2.1 Completar Módulo de Usuarios
**Prioridad**: Alta | **Estimación**: 1 semana

**Tareas**:
- [ ] Crear entidad `User` completa con todos los campos
  - `id`, `email`, `password_hash`, `full_name`, `role`, `phone`
  - `status`, `device_id`, `session_token`, `last_login`
  - Timestamps y soft delete
- [ ] Implementar CRUD de usuarios
- [ ] Crear DTOs de validación (CreateUserDto, UpdateUserDto)
- [ ] Implementar control de sesión única por `device_id`
- [ ] Crear endpoint para asignación de usuarios a espacios
- [ ] Implementar RBAC (Role-Based Access Control)
  - Roles: `operator`, `supervisor`, `admin`, `client`
  - Guards: `RoleGuard`, `SpaceAccessGuard`
- [ ] Tests unitarios del módulo User

**Archivos a crear/modificar**:
```
src/modules/user/
├── entities/
│   ├── user.entity.ts
│   └── user-space-assignment.entity.ts
├── dto/
│   ├── create-user.dto.ts
│   ├── update-user.dto.ts
│   └── assign-space.dto.ts
├── guards/
│   ├── role.guard.ts
│   └── space-access.guard.ts
├── decorators/
│   ├── roles.decorator.ts
│   └── current-user.decorator.ts
├── user.controller.ts
├── user.service.ts
├── user.service.spec.ts
└── user.module.ts
```

---

#### 2.2 Módulo de Espacios (Spaces)
**Prioridad**: Alta | **Estimación**: 1 semana

**Tareas**:
- [ ] Crear entidad `Space`
  - Campos: `id`, `name`, `type`, `address`, `coordinates`, `config`, `status`
  - Relación con tenant (empresa)
  - Soporte para PostGIS (coordenadas geográficas)
- [ ] Implementar CRUD de espacios
- [ ] Crear tipos de espacios (enum)
  - `residential`, `hospital`, `industrial`, `logistics`, `construction`, `event`
- [ ] Implementar validación de límites por plan
  - Guard para verificar `max_spaces` del plan
- [ ] Endpoint para listar espacios por tenant
- [ ] Endpoint para asignar usuarios a espacios
- [ ] Tests unitarios

**Archivos a crear**:
```
src/modules/space/
├── entities/
│   └── space.entity.ts
├── dto/
│   ├── create-space.dto.ts
│   └── update-space.dto.ts
├── enums/
│   └── space-type.enum.ts
├── guards/
│   └── space-limit.guard.ts
├── space.controller.ts
├── space.service.ts
├── space.service.spec.ts
└── space.module.ts
```

---

#### 2.3 Módulo de Rondas (Rounds)
**Prioridad**: Alta | **Estimación**: 2 semanas

**Tareas**:
- [ ] Crear entidad `Round`
  - Campos: `id`, `space_id`, `name`, `checkpoints`, `schedule`, `status`
  - JSONB para checkpoints y schedule
- [ ] Crear entidad `RoundExecution`
  - Campos: `id`, `round_id`, `user_id`, `started_at`, `completed_at`
  - `checkpoints_completed`, `status`, `sync_status`, `offline_created`
- [ ] Implementar CRUD de rondas
- [ ] Endpoint para iniciar ejecución de ronda
  - `POST /rounds/executions/start`
- [ ] Endpoint para completar ronda
  - `POST /rounds/executions/complete`
- [ ] Endpoint para validar checkpoints
  - `POST /checkpoints/validate`
- [ ] Lógica de validación GPS básica
- [ ] Sistema de tracking de progreso de ronda
- [ ] Tests unitarios y E2E

**Archivos a crear**:
```
src/modules/rounds/
├── entities/
│   ├── round.entity.ts
│   └── round-execution.entity.ts
├── dto/
│   ├── create-round.dto.ts
│   ├── start-execution.dto.ts
│   ├── complete-execution.dto.ts
│   └── validate-checkpoint.dto.ts
├── enums/
│   ├── round-status.enum.ts
│   └── checkpoint-type.enum.ts
├── rounds.controller.ts
├── rounds.service.ts
├── round-execution.service.ts
├── checkpoint-validation.service.ts
└── rounds.module.ts
```

---

#### 2.4 Módulo de Bitácora (Logbook)
**Prioridad**: Media | **Estimación**: 1 semana

**Tareas**:
- [ ] Crear entidad `LogbookEntry`
  - Campos: `id`, `space_id`, `user_id`, `entry_type`, `description`
  - `attachments`, `location`, `timestamp`, `is_synced`, `is_immutable`
- [ ] Implementar CRUD de entradas
- [ ] Tipos de entrada (enum)
  - `incident`, `observation`, `maintenance`, `visitor`, `other`
- [ ] Soporte para adjuntos (fotos, archivos)
- [ ] Endpoint para marcar como inmutable después de sincronización
- [ ] Filtros y búsqueda por fecha, tipo, espacio
- [ ] Tests unitarios

**Archivos a crear**:
```
src/modules/logbook/
├── entities/
│   └── logbook-entry.entity.ts
├── dto/
│   ├── create-entry.dto.ts
│   └── update-entry.dto.ts
├── enums/
│   └── entry-type.enum.ts
├── logbook.controller.ts
├── logbook.service.ts
└── logbook.module.ts
```

---

#### 2.5 Módulo de Alertas (Alerts) - Básico
**Prioridad**: Alta | **Estimación**: 1 semana

**Tareas**:
- [ ] Crear entidad `Alert`
  - Campos: `id`, `space_id`, `created_by`, `alert_type`, `severity`
  - `title`, `description`, `location`, `status`, `assigned_to`
  - `escalation_level`, `escalated_at`, `resolved_at`
- [ ] Implementar CRUD de alertas
- [ ] Tipos y severidades (enums)
  - Tipos: `emergency`, `security`, `maintenance`, `man_down`, `other`
  - Severidad: `low`, `medium`, `high`, `critical`
- [ ] Estados de alerta (enum)
  - `open`, `acknowledged`, `in_progress`, `resolved`, `escalated`
- [ ] Endpoint para crear alerta
- [ ] Endpoint para asignar/atender alerta
- [ ] Endpoint para resolver alerta
- [ ] Tests unitarios

**Archivos a crear**:
```
src/modules/alerts/
├── entities/
│   └── alert.entity.ts
├── dto/
│   ├── create-alert.dto.ts
│   ├── update-alert.dto.ts
│   └── resolve-alert.dto.ts
├── enums/
│   ├── alert-type.enum.ts
│   ├── alert-severity.enum.ts
│   └── alert-status.enum.ts
├── alerts.controller.ts
├── alerts.service.ts
└── alerts.module.ts
```

---

### **FASE 3: Features Avanzadas** (3-4 semanas)

#### 3.1 Sistema de Geolocalización
**Prioridad**: Alta | **Estimación**: 1.5 semanas

**Tareas**:
- [ ] Crear módulo de geolocalización
- [ ] Implementar validación GPS con geofencing
  - Cálculo de distancia (fórmula de Haversine)
  - Radio configurable por checkpoint
- [ ] Implementar validación QR
  - Generación de códigos QR únicos
  - Validación de códigos escaneados
- [ ] Implementar validación NFC (preparar estructura)
- [ ] Crear colección MongoDB `geolocation_tracking`
  - Índice geoespacial 2dsphere
  - TTL index para auto-eliminación (30 días)
- [ ] Endpoint para guardar tracking de ubicación
- [ ] Tests de validación GPS

**Archivos a crear**:
```
src/modules/geolocation/
├── schemas/
│   └── geolocation-tracking.schema.ts
├── services/
│   ├── geofencing.service.ts
│   ├── qr-validation.service.ts
│   └── nfc-validation.service.ts
├── dto/
│   ├── validate-gps.dto.ts
│   └── location-update.dto.ts
├── geolocation.controller.ts
├── geolocation.service.ts
└── geolocation.module.ts
```

---

#### 3.2 Sistema de Sincronización Offline
**Prioridad**: Alta | **Estimación**: 2 semanas

**Tareas**:
- [ ] Crear módulo de sincronización
- [ ] Crear colección MongoDB `sync_queue`
  - Campos: `tenant_id`, `entity_type`, `entity_id`, `operation`, `payload`
  - `sync_status`, `retry_count`, `error_message`
- [ ] Implementar endpoint de sincronización batch
  - `POST /sync/batch`
- [ ] Implementar lógica de resolución de conflictos
  - Estrategia: Last-Write-Wins
  - Detección de conflictos críticos
- [ ] Crear colección `conflict_resolution_log`
- [ ] Implementar cola Bull para procesamiento asíncrono
- [ ] Sistema de reintentos automáticos
- [ ] Tests de sincronización y conflictos

**Archivos a crear**:
```
src/modules/sync/
├── schemas/
│   ├── sync-queue.schema.ts
│   └── conflict-resolution.schema.ts
├── services/
│   ├── sync-queue.service.ts
│   └── conflict-resolver.service.ts
├── processors/
│   └── sync.processor.ts
├── dto/
│   ├── sync-batch.dto.ts
│   └── sync-record.dto.ts
├── sync.controller.ts
├── sync.service.ts
└── sync.module.ts
```

---

#### 3.3 Escalamiento Automático de Alertas
**Prioridad**: Alta | **Estimación**: 1.5 semanas

**Tareas**:
- [ ] Crear entidad `AlertEscalationRule`
  - Campos: `space_id`, `alert_type`, `severity`, `level`
  - `wait_minutes`, `notify_email`, `notify_push`, `escalate_to_role`
- [ ] Implementar CRUD de reglas de escalamiento
- [ ] Configurar Bull Queue para escalamiento
  - Job: `check-alert-escalation`
  - Delay configurable por nivel
- [ ] Crear processor para verificar estado de alertas
- [ ] Implementar lógica de escalamiento automático
  - Incrementar `escalation_level`
  - Notificar al siguiente nivel
  - Programar siguiente verificación
- [ ] Tests de escalamiento

**Archivos a crear**:
```
src/modules/alerts/
├── entities/
│   └── alert-escalation-rule.entity.ts
├── processors/
│   └── alert-escalation.processor.ts
├── services/
│   └── alert-escalation.service.ts
└── dto/
    └── escalation-rule.dto.ts
```

---

#### 3.4 Sistema "Hombre Vivo" (Man Down)
**Prioridad**: Alta | **Estimación**: 1 semana

**Tareas**:
- [ ] Crear entidad `ManDownCheck`
  - Campos: `space_id`, `sent_by`, `sent_to`, `sent_at`
  - `response_deadline`, `responded_at`, `status`, `escalated_at`
- [ ] Endpoint para enviar verificación
  - `POST /man-down/send`
- [ ] Endpoint para responder verificación
  - `POST /man-down/respond/:check_id`
- [ ] Configurar Bull Queue para verificación
  - Job: `check-man-down-response`
- [ ] Crear processor para verificar respuesta
  - Si no responde: crear alerta crítica
  - Activar escalamiento automático
- [ ] Integración con módulo de notificaciones
- [ ] Tests de flujo completo

**Archivos a crear**:
```
src/modules/man-down/
├── entities/
│   └── man-down-check.entity.ts
├── dto/
│   ├── send-check.dto.ts
│   └── respond-check.dto.ts
├── processors/
│   └── man-down.processor.ts
├── man-down.controller.ts
├── man-down.service.ts
└── man-down.module.ts
```

---

#### 3.5 Módulos Operativos Adicionales
**Prioridad**: Media | **Estimación**: 1.5 semanas

**Tareas**:

**Módulo de Visitas**:
- [ ] Crear entidad `Visit`
- [ ] CRUD de visitas
- [ ] Estados: `scheduled`, `in_progress`, `completed`, `cancelled`
- [ ] Registro de entrada/salida

**Módulo de Turnos (Shifts) - Mejorar**:
- [ ] Completar entidad `Shift`
- [ ] Sistema de entrega de turno (handover)
- [ ] Tareas pendientes por turno
- [ ] Notas de entrega

**Archivos a crear**:
```
src/modules/visits/
├── entities/visit.entity.ts
├── dto/...
├── visits.controller.ts
└── visits.service.ts

src/modules/shift/
├── entities/shift.entity.ts (mejorar)
├── dto/handover.dto.ts
└── shift-handover.service.ts
```

---

#### 3.6 WebSockets para Tiempo Real
**Prioridad**: Media | **Estimación**: 1 semana

**Tareas**:
- [ ] Configurar WebSocket Gateway
- [ ] Implementar tracking de ubicación en tiempo real
  - Namespace: `/tracking`
  - Evento: `location-update`
- [ ] Implementar notificaciones en tiempo real
  - Namespace: `/notifications`
  - Eventos: `checkpoint-completed`, `round-completed`, `alert-created`
- [ ] Sistema de rooms por espacio
  - `space:{space_id}:supervisors`
  - `space:{space_id}:operators`
- [ ] Autenticación de WebSocket con JWT
- [ ] Tests de conexión y eventos

**Archivos a crear**:
```
src/modules/websockets/
├── gateways/
│   ├── tracking.gateway.ts
│   └── notifications.gateway.ts
├── guards/
│   └── ws-auth.guard.ts
└── websockets.module.ts
```

---

### **FASE 4: Marca Blanca y Reportes** (2-3 semanas)

#### 4.1 Sistema de Marca Blanca (White Label)
**Prioridad**: Alta | **Estimación**: 1.5 semanas

**Tareas**:
- [ ] Crear entidad `WhiteLabelConfig`
  - Campos: `tenant_id`, `version`, `primary_color`, `secondary_color`
  - `logo_url`, `app_name`, `module_names`, `icon_set`, `custom_icons`
- [ ] Implementar CRUD de configuración
- [ ] Sistema de versionado
  - Incrementar versión en cada actualización
  - Notificar a apps móviles de nueva versión
- [ ] Cache en Redis (1 hora)
  - Key: `white-label:{tenant_id}`
- [ ] Endpoint público para obtener configuración
  - `GET /white-label` (requiere auth)
- [ ] Integración con DigitalOcean Spaces para logos
- [ ] Tests de configuración y cache

**Archivos a crear**:
```
src/modules/white-label/
├── entities/
│   └── white-label-config.entity.ts
├── dto/
│   ├── create-config.dto.ts
│   └── update-config.dto.ts
├── white-label.controller.ts
├── white-label.service.ts
└── white-label.module.ts
```

---

#### 4.2 Sistema de Reportes
**Prioridad**: Media | **Estimación**: 2 semanas

**Tareas**:
- [ ] Crear módulo de reportes
- [ ] Tipos de reportes:
  - Reporte de rondas
  - Reporte de incidentes/alertas
  - Reporte de asistencia
  - Reporte de visitas
- [ ] Configurar Bull Queue para generación
  - Job: `generate-report`
- [ ] Implementar generación de Excel con ExcelJS
- [ ] Implementar generación de PDF (opcional)
- [ ] Integración con DigitalOcean Spaces
  - Subir reportes generados
  - Lifecycle policy: auto-eliminar después de 7 días
- [ ] Envío por email con SendGrid
- [ ] Endpoint para solicitar reporte
  - `POST /reports/generate`
- [ ] Endpoint para consultar estado del job
  - `GET /reports/status/:job_id`
- [ ] Tests de generación

**Archivos a crear**:
```
src/modules/reports/
├── dto/
│   ├── generate-report.dto.ts
│   └── report-params.dto.ts
├── services/
│   ├── report-generator.service.ts
│   ├── excel-generator.service.ts
│   └── pdf-generator.service.ts
├── processors/
│   └── report.processor.ts
├── templates/
│   ├── rounds-report.template.ts
│   └── alerts-report.template.ts
├── reports.controller.ts
├── reports.service.ts
└── reports.module.ts
```

---

### **FASE 5: Infraestructura y Servicios** (2-3 semanas)

#### 5.1 Módulo de Notificaciones
**Prioridad**: Alta | **Estimación**: 1.5 semanas

**Tareas**:
- [ ] Crear módulo de notificaciones
- [ ] Integración con Firebase Cloud Messaging (FCM)
  - Configurar Firebase Admin SDK
  - Endpoint para registrar device tokens
  - Envío de push notifications
- [ ] Integración con SendGrid para emails
  - Configurar API key
  - Templates de emails
  - Envío de emails transaccionales
- [ ] Sistema de preferencias de notificación por usuario
- [ ] Cola Bull para envío asíncrono
- [ ] Tests de integración

**Archivos a crear**:
```
src/core/notifications/
├── services/
│   ├── fcm.service.ts
│   ├── email.service.ts
│   └── notification-preferences.service.ts
├── dto/
│   ├── send-push.dto.ts
│   └── send-email.dto.ts
├── templates/
│   ├── alert-notification.template.ts
│   ├── man-down-missed.template.ts
│   └── report-ready.template.ts
├── processors/
│   └── notification.processor.ts
└── notifications.module.ts
```

---

#### 5.2 Módulo de Storage (DigitalOcean Spaces)
**Prioridad**: Media | **Estimación**: 1 semana

**Tareas**:
- [ ] Crear módulo de storage
- [ ] Configurar AWS SDK para S3-compatible
  - Endpoint: DigitalOcean Spaces
- [ ] Implementar upload de archivos
  - Logos de marca blanca
  - Adjuntos de bitácora
  - Reportes generados
- [ ] Implementar generación de URLs firmadas
  - Acceso temporal a archivos privados
- [ ] Organización por carpetas
  - `tenants/{tenant_id}/logos/`
  - `tenants/{tenant_id}/attachments/`
  - `reports/{tenant_id}/`
- [ ] Configurar lifecycle policies
- [ ] Tests de upload y download

**Archivos a crear**:
```
src/core/storage/
├── services/
│   └── storage.service.ts
├── dto/
│   └── upload-file.dto.ts
├── storage.config.ts
└── storage.module.ts
```

---

#### 5.3 Sistema de Auditoría Completo
**Prioridad**: Media | **Estimación**: 1 semana

**Tareas**:
- [ ] Mejorar módulo de auditoría existente
- [ ] Crear colección MongoDB `audit_logs`
  - Índices por tenant, user, fecha
  - TTL index (retención 1 año)
- [ ] Implementar interceptor global
  - Registrar todas las operaciones (excepto GET)
  - Capturar: `tenant_id`, `user_id`, `action`, `entity_type`
  - `changes` (before/after), `ip_address`, `user_agent`
- [ ] Implementar soft delete global
  - Interceptor para convertir DELETE en UPDATE
  - Campo `deleted_at` en todas las entidades
- [ ] Endpoint para consultar logs de auditoría
  - Filtros por fecha, usuario, entidad
  - Solo accesible por admins
- [ ] Tests de auditoría

**Archivos a crear**:
```
src/core/audit/
├── schemas/
│   └── audit-log.schema.ts
├── interceptors/
│   ├── audit.interceptor.ts
│   └── soft-delete.interceptor.ts
├── audit.controller.ts
├── audit.service.ts
└── audit.module.ts
```

---

#### 5.4 Sistema de Planes y Feature Flags
**Prioridad**: Media | **Estimación**: 1 semana

**Tareas**:
- [ ] Crear entidad `SubscriptionPlan`
  - Campos: `name`, `max_spaces`, `max_users`, `features`, `price`
  - `billing_cycle`
- [ ] Crear servicio de feature flags
  - Método: `canUseFeature(tenant_id, feature)`
- [ ] Implementar guards de límites
  - `PlanLimitGuard`: validar límites de espacios/usuarios
  - `FeatureFlagGuard`: validar acceso a features
- [ ] Crear decorator `@RequireFeature()`
- [ ] Endpoint para consultar plan actual
- [ ] Endpoint para upgrade/downgrade de plan
- [ ] Tests de validación de features

**Archivos a crear**:
```
src/modules/subscription/
├── entities/
│   └── subscription-plan.entity.ts
├── services/
│   ├── feature-flag.service.ts
│   └── subscription.service.ts
├── guards/
│   ├── plan-limit.guard.ts
│   └── feature-flag.guard.ts
├── decorators/
│   └── require-feature.decorator.ts
├── subscription.controller.ts
└── subscription.module.ts
```

---

#### 5.5 Cache y Optimización
**Prioridad**: Media | **Estimación**: 1 semana

**Tareas**:
- [ ] Configurar Redis Cache Module
- [ ] Implementar cache para:
  - Configuración de marca blanca (1 hora)
  - Permisos de usuario (15 minutos)
  - Planes de suscripción (1 día)
  - Reglas de escalamiento (1 hora)
- [ ] Implementar cache interceptor personalizado
- [ ] Implementar invalidación de cache
  - Al actualizar configuraciones
  - Al cambiar permisos
- [ ] Rate limiting con Redis
  - Límite por IP
  - Límite por usuario
- [ ] Optimización de queries PostgreSQL
  - Índices en campos frecuentes
  - Análisis de queries lentas
- [ ] Tests de cache

**Archivos a crear**:
```
src/core/cache/
├── interceptors/
│   └── cache.interceptor.ts
├── decorators/
│   └── cache-key.decorator.ts
├── services/
│   └── cache.service.ts
├── cache.config.ts
└── cache.module.ts
```

---

### **FASE 6: Testing, Documentación y Deploy** (2-3 semanas)

#### 6.1 Testing Completo
**Prioridad**: Alta | **Estimación**: 2 semanas

**Tareas**:
- [ ] Tests unitarios para todos los servicios
  - Target: >70% coverage
- [ ] Tests de integración
  - Flujos completos por módulo
- [ ] Tests E2E
  - Flujo de autenticación
  - Flujo de creación de ronda y ejecución
  - Flujo de alertas y escalamiento
  - Flujo de sincronización offline
  - Flujo de man down
- [ ] Tests de performance
  - Carga de sincronización (100 registros)
  - Generación de reportes (10k registros)
- [ ] Tests de seguridad
  - Validación de permisos
  - Aislamiento de tenants
- [ ] Configurar coverage report

---

#### 6.2 Documentación
**Prioridad**: Alta | **Estimación**: 1 semana

**Tareas**:
- [ ] Configurar Swagger/OpenAPI
  - Decoradores en todos los endpoints
  - Schemas de DTOs
  - Ejemplos de requests/responses
- [ ] Documentar variables de entorno
- [ ] Crear guía de desarrollo
- [ ] Documentar flujos principales
- [ ] Crear diagramas de secuencia actualizados
- [ ] Documentar decisiones arquitectónicas (ADRs)
- [ ] README completo con:
  - Instalación
  - Configuración
  - Comandos útiles
  - Troubleshooting

---

#### 6.3 CI/CD y Deploy
**Prioridad**: Alta | **Estimación**: 1 semana

**Tareas**:
- [ ] Configurar GitHub Actions
  - Pipeline de CI: lint, test, build
  - Pipeline de CD: deploy a staging/production
- [ ] Configurar Docker para producción
  - Multi-stage build
  - Optimización de imagen
- [ ] Configurar DigitalOcean
  - Droplets o App Platform
  - Bases de datos administradas
  - Spaces para storage
- [ ] Configurar variables de entorno en producción
- [ ] Configurar SSL/TLS
- [ ] Configurar monitoreo
  - Prometheus + Grafana
  - Logs centralizados
  - Alertas de errores
- [ ] Configurar backups automáticos
  - PostgreSQL: diario
  - MongoDB: diario
- [ ] Documentar proceso de deploy

**Archivos a crear**:
```
.github/
└── workflows/
    ├── ci.yml
    └── cd.yml

docker/
├── Dockerfile.prod
└── docker-compose.prod.yml

infrastructure/
├── prometheus.yml
├── grafana/
└── nginx/
```

---

## 📊 Métricas de Progreso

### Módulos Completados: 3/15 (20%)
- ✅ Auth
- ✅ Empresa (Tenant)
- ✅ Shift (básico)

### Módulos en Desarrollo: 0/15
- 🔄 (ninguno actualmente)

### Módulos Pendientes: 12/15 (80%)
- ⏳ User (completar)
- ⏳ Space
- ⏳ Rounds
- ⏳ Logbook
- ⏳ Alerts
- ⏳ Geolocation
- ⏳ Sync
- ⏳ Man Down
- ⏳ Visits
- ⏳ White Label
- ⏳ Reports
- ⏳ Notifications

---

## 🎯 Próximos Pasos Inmediatos

### Sprint Actual (Semana 1-2)

1. **Completar módulo User** (Prioridad 1)
   - Implementar entidad completa
   - CRUD + control de sesión única
   - RBAC con guards

2. **Crear módulo Space** (Prioridad 2)
   - Entidad con PostGIS
   - CRUD + validación de límites
   - Asignación de usuarios

3. **Iniciar módulo Rounds** (Prioridad 3)
   - Entidades Round y RoundExecution
   - CRUD básico

### Sprint Siguiente (Semana 3-4)

1. Completar módulo Rounds con validación GPS
2. Crear módulo Logbook
3. Crear módulo Alerts (básico)
4. Iniciar módulo de Geolocalización

---

## 👥 Roles y Permisos del Sistema

### Definición de Roles

#### **Operator / Vigilante** (Guardia de seguridad)
**Responsabilidades**:
- Ejecutar rondas asignadas
- Validar checkpoints (GPS/QR/NFC)
- Crear entradas en la bitácora
- Crear alertas cuando detectan incidentes
- Responder a verificaciones "Hombre Vivo"
- Registrar visitas

**Permisos**:
- ✅ CRUD de sus propias rondas ejecutadas
- ✅ Crear entradas de bitácora
- ✅ Crear alertas
- ✅ Ver sus propios turnos
- ✅ Responder man-down checks
- ❌ NO puede ver rondas de otros guardias
- ❌ NO puede gestionar usuarios ni espacios

**Restricciones**:
- Sesión única: solo puede estar logueado en un dispositivo a la vez
- Solo accede a los espacios que tiene asignados

---

#### **Supervisor** (Supervisor de operaciones)
**Responsabilidades**:
- Monitorear rondas en tiempo real
- Gestionar y atender alertas
- Enviar verificaciones "Hombre Vivo" a guardias
- Ver reportes de sus espacios
- Supervisar a los guardias asignados

**Permisos**:
- ✅ Ver TODAS las rondas de sus espacios asignados
- ✅ Gestionar alertas (asignar, atender, resolver)
- ✅ Enviar man-down checks a guardias
- ✅ Ver reportes de sus espacios
- ✅ Ver bitácora completa de sus espacios
- ✅ Ver tracking en tiempo real de guardias
- ✅ Gestionar visitas y turnos
- ❌ NO puede crear/editar espacios
- ❌ NO puede gestionar usuarios

**Privilegios especiales**:
- Puede tener múltiples sesiones activas (móvil + web)
- Recibe notificaciones de alertas de nivel 0

---

#### **Admin** (Administrador del tenant)
**Responsabilidades**:
- Gestión completa del tenant/empresa
- Configurar espacios y usuarios
- Configurar marca blanca
- Gestionar suscripción y plan
- Acceso a toda la información

**Permisos**:
- ✅ CRUD de espacios
- ✅ CRUD de usuarios y asignaciones
- ✅ Configurar marca blanca (colores, logo, nombres de módulos)
- ✅ Ver y gestionar suscripción
- ✅ Ver TODO: rondas, alertas, bitácora de todos los espacios
- ✅ Generar reportes de cualquier espacio
- ✅ Configurar reglas de escalamiento de alertas
- ✅ Ver logs de auditoría
- ✅ Gestionar turnos y visitas
- ❌ NO puede acceder a datos de otros tenants

**Privilegios especiales**:
- Múltiples sesiones activas
- Recibe notificaciones de alertas escaladas (nivel 1)
- Acceso al panel web de administración

---

#### **Client** (Cliente final)
**Responsabilidades**:
- Ver información de sus espacios contratados
- Recibir reportes
- Monitorear estado general

**Permisos**:
- ✅ Solo LECTURA de reportes
- ✅ Ver eventos importantes de sus espacios
- ✅ Ver dashboard con métricas generales
- ✅ Recibir notificaciones de alertas críticas escaladas (nivel 2)
- ❌ NO puede crear/editar nada
- ❌ NO puede ver detalles operativos

**Uso típico**:
- Dueños de edificios residenciales
- Gerentes de hospitales/empresas
- Clientes que contratan el servicio de seguridad

---

### Matriz de Permisos

| Funcionalidad | Operator | Supervisor | Admin | Client |
|--------------|----------|------------|-------|--------|
| Ejecutar rondas | ✅ Propias | ❌ | ❌ | ❌ |
| Ver rondas | ✅ Propias | ✅ De sus espacios | ✅ Todas | ❌ |
| Crear alertas | ✅ | ✅ | ✅ | ❌ |
| Gestionar alertas | ❌ | ✅ | ✅ | ❌ |
| Enviar man-down | ❌ | ✅ | ✅ | ❌ |
| Responder man-down | ✅ | ✅ | ✅ | ❌ |
| Crear bitácora | ✅ | ✅ | ✅ | ❌ |
| Ver bitácora | ✅ Propia | ✅ De sus espacios | ✅ Toda | ❌ |
| Gestionar espacios | ❌ | ❌ | ✅ | ❌ |
| Gestionar usuarios | ❌ | ❌ | ✅ | ❌ |
| Marca blanca | ❌ | ❌ | ✅ | ❌ |
| Ver reportes | ❌ | ✅ Sus espacios | ✅ Todos | ✅ Solo lectura |
| Generar reportes | ❌ | ✅ | ✅ | ❌ |
| Logs de auditoría | ❌ | ❌ | ✅ | ❌ |
| Gestionar suscripción | ❌ | ❌ | ✅ | ❌ |

---

## 💰 Estrategia de Planes y Límites

### Modelo de Negocio: Límites Duales

**Decisión**: Cada plan limita TANTO espacios COMO usuarios de forma independiente.

**Razón**: 
- ✅ Modelo de negocio más justo y escalable
- ✅ Previene abuso del sistema
- ✅ Incentiva upgrades cuando crecen
- ✅ Permite ofrecer add-ons para flexibilidad

---

### Planes Propuestos

#### **Plan Básico** - $99/mes
```json
{
  "name": "Básico",
  "max_spaces": 3,
  "max_users": 10,
  "features": {
    "offline": true,
    "white_label": "basic",
    "modules": ["rounds", "logbook", "alerts"]
  },
  "price": 99,
  "billing_cycle": "monthly"
}
```

**Ideal para**: Empresas de seguridad pequeñas que gestionan 2-3 condominios

---

#### **Plan Profesional** - $299/mes
```json
{
  "name": "Profesional",
  "max_spaces": 10,
  "max_users": 30,
  "features": {
    "offline": true,
    "white_label": "full",
    "modules": ["rounds", "logbook", "alerts", "visits", "shifts", "man_down"]
  },
  "price": 299,
  "billing_cycle": "monthly"
}
```

**Ideal para**: Empresas medianas que gestionan edificios, centros comerciales

---

#### **Plan Enterprise** - $799/mes
```json
{
  "name": "Enterprise",
  "max_spaces": 50,
  "max_users": 100,
  "features": {
    "offline": true,
    "white_label": "full",
    "modules": ["all"],
    "custom_reports": true,
    "api_access": true,
    "priority_support": true
  },
  "price": 799,
  "billing_cycle": "monthly"
}
```

**Ideal para**: Empresas grandes con múltiples contratos

---

#### **Plan Custom** - Personalizado
- `max_spaces`: Ilimitado o personalizado
- `max_users`: Ilimitado o personalizado
- `features`: Todo + soporte dedicado + SLA garantizado
- `price`: Negociable

---

### Add-ons Disponibles

Para mayor flexibilidad sin cambiar de plan:

```json
{
  "addons": [
    {
      "name": "+5 Espacios Adicionales",
      "price": 50,
      "applies_to": ["basic", "professional"]
    },
    {
      "name": "+10 Usuarios Adicionales",
      "price": 30,
      "applies_to": ["basic", "professional"]
    },
    {
      "name": "Módulo Man Down",
      "price": 40,
      "applies_to": ["basic"]
    }
  ]
}
```

---

### Validación de Límites

#### Guard para Espacios
```typescript
@Injectable()
export class SpaceLimitGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.getRequest();
    const { tenant_id } = request.user;
    
    const subscription = await this.subscriptionService.getByTenant(tenant_id);
    const plan = await this.planService.findOne(subscription.plan_id);
    const currentSpaceCount = await this.spaceService.countByTenant(tenant_id);
    
    if (currentSpaceCount >= plan.max_spaces) {
      throw new ForbiddenException(
        `Plan limit reached: You can only have ${plan.max_spaces} spaces. ` +
        `Upgrade your plan to add more spaces.`
      );
    }
    
    return true;
  }
}
```

#### Guard para Usuarios
```typescript
@Injectable()
export class UserLimitGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.getRequest();
    const { tenant_id } = request.user;
    
    const subscription = await this.subscriptionService.getByTenant(tenant_id);
    const plan = await this.planService.findOne(subscription.plan_id);
    const currentUserCount = await this.userService.countByTenant(tenant_id);
    
    if (currentUserCount >= plan.max_users) {
      throw new ForbiddenException(
        `Plan limit reached: You can only have ${plan.max_users} users. ` +
        `Upgrade your plan to add more users.`
      );
    }
    
    return true;
  }
}
```

---

### Endpoint de Uso y Límites

```typescript
// GET /subscription/usage
{
  "plan": {
    "name": "Profesional",
    "limits": {
      "spaces": 10,
      "users": 30
    }
  },
  "usage": {
    "spaces": {
      "current": 7,
      "max": 10,
      "percentage": 70,
      "remaining": 3
    },
    "users": {
      "current": 22,
      "max": 30,
      "percentage": 73.33,
      "remaining": 8
    }
  },
  "canAddSpace": true,
  "canAddUser": true,
  "recommendations": {
    "nearLimit": ["users"],
    "suggestUpgrade": false
  }
}
```

---

### Escenarios de Uso

#### Escenario 1: Empresa Pequeña ✅
- **Plan**: Básico
- **Espacios**: 3 condominios
- **Usuarios**: 6 guardias + 1 supervisor + 1 admin = 8 usuarios
- **Resultado**: Dentro del límite (3/3 espacios, 8/10 usuarios)

#### Escenario 2: Empresa Mediana ✅
- **Plan**: Profesional
- **Espacios**: 8 edificios + 2 centros comerciales = 10 espacios
- **Usuarios**: 18 guardias + 4 supervisores + 2 admins + 1 cliente = 25 usuarios
- **Resultado**: Dentro del límite (10/10 espacios, 25/30 usuarios)

#### Escenario 3: Intento de Abuso ❌
- **Plan**: Básico (quieren ahorrar)
- **Intento**: Crear 10 espacios con 5 usuarios
- **Resultado**: Bloqueado al intentar crear el 4to espacio
- **Mensaje**: "Plan limit reached: You can only have 3 spaces. Upgrade your plan to add more spaces."

---

## 📝 Notas Importantes

### Decisiones Técnicas Clave

1. **Multi-tenancy**: Schema per tenant en PostgreSQL
   - Mejor aislamiento y performance
   - Facilita backups por cliente

2. **Sincronización Offline**: MongoDB + Bull Queue
   - MongoDB para logs de sincronización
   - Bull para procesamiento asíncrono confiable

3. **Cache**: Redis para configuraciones frecuentes
   - Marca blanca (1 hora)
   - Permisos (15 minutos)

4. **Storage**: DigitalOcean Spaces (S3-compatible)
   - Más económico que AWS S3
   - Compatible con SDK de AWS

5. **Límites de Planes**: Validación dual (espacios Y usuarios)
   - Guards en endpoints de creación
   - Endpoint de consulta de uso en tiempo real
   - Sistema de add-ons para flexibilidad

### Consideraciones de Seguridad

- ✅ JWT con expiración corta (15 min)
- ✅ Refresh tokens en Redis (7 días)
- ✅ Control de sesión única por device_id
- ✅ RBAC con guards en todos los endpoints
- ✅ Validación de tenant en cada request
- ✅ Soft delete para auditoría
- ✅ Logs de auditoría en MongoDB

---

### Estrategia de Rate Limiting

#### Problema Identificado

El rate limiting por IP con límite de **10 peticiones/minuto es demasiado restrictivo** para:

1. **Navegación normal**: Usuario navega por home, módulos, dashboards
   - Cada vista puede hacer 3-5 peticiones (datos, permisos, configuración)
   - En 60 segundos puede visitar 3-4 secciones = 12-20 peticiones
   - **Resultado**: Usuario legítimo bloqueado ❌

2. **Sincronización offline**: Guardia con 280 registros pendientes
   - Al conectarse envía todo en batch
   - Excede límite inmediatamente
   - **Resultado**: Datos no se sincronizan ❌

#### Solución: Rate Limiting Diferenciado

**Estrategia**: Diferentes límites según tipo de endpoint y usuario autenticado.

##### 1. Rate Limiting por Usuario (no por IP)

```typescript
@Injectable()
export class UserRateLimitGuard extends ThrottlerGuard {
  protected getTracker(req: Request): Promise<string> {
    const user = req.user as User;
    
    // Si está autenticado, limitar por user_id
    if (user?.id) {
      return Promise.resolve(`user:${user.tenant_id}:${user.id}`);
    }
    
    // Si no está autenticado (login, registro), limitar por IP
    const ip = req.headers['x-forwarded-for'] || req.ip;
    return Promise.resolve(`ip:${ip}`);
  }
}
```

**Ventajas**:
- ✅ Múltiples usuarios en misma IP (oficina, WiFi público) no se afectan
- ✅ Límite por usuario autenticado
- ✅ Endpoints públicos siguen limitados por IP

##### 2. Límites por Tipo de Endpoint

| Tipo de Endpoint | Rate Limit | Razón |
|------------------|------------|-------|
| **Autenticación** | | |
| `/auth/login` | 5 req/min por IP | Prevenir fuerza bruta |
| `/auth/register` | 3 req/min por IP | Prevenir spam de cuentas |
| `/auth/refresh` | 10 req/min por usuario | Renovación de tokens |
| **Navegación Normal** | | |
| `/api/*` (general) | 200 req/min por usuario | Navegación fluida en SPA |
| `GET /api/*` | 300 req/min por usuario | Lecturas más permisivas |
| `POST/PUT/DELETE /api/*` | 100 req/min por usuario | Escrituras más controladas |
| **Sincronización Offline** | | |
| `/sync/batch` | 500 req/min por usuario | Sincronización masiva |
| `/sync/status` | Sin límite | Solo lectura, sin impacto |
| **Reportes** | | |
| `/reports/generate` | 10 req/min por usuario | Proceso pesado |
| `/reports/download` | 50 req/min por usuario | Descarga de reportes |
| **Health & Monitoring** | | |
| `/health` | Sin límite | Monitoreo externo |
| `/metrics` | Sin límite | Prometheus scraping |

##### 3. Implementación por Endpoint

```typescript
// Endpoints de autenticación (limitados por IP)
@Post('login')
@UseGuards(RateLimitGuard)  // Por IP
@Throttle({ default: { limit: 5, ttl: 60000 } })
async login(@Body() dto: LoginDto) {}

// Endpoints normales (limitados por usuario)
@Get('spaces')
@UseGuards(JwtAuthGuard, UserRateLimitGuard)
@Throttle({ default: { limit: 200, ttl: 60000 } })
async getSpaces(@CurrentUser() user: User) {}

// Sincronización offline (límite alto)
@Post('sync/batch')
@UseGuards(JwtAuthGuard, UserRateLimitGuard)
@Throttle({ default: { limit: 500, ttl: 60000 } })
async syncBatch(@Body() dto: SyncBatchDto) {
  // Validar máximo 100 registros por petición
  if (dto.records.length > 100) {
    throw new BadRequestException('Maximum 100 records per batch');
  }
  return this.syncService.processBatch(dto.records);
}

// Health check (sin límite)
@Get('health')
@SkipThrottle()
async healthCheck() {
  return { status: 'ok' };
}
```

##### 4. Configuración Global

```typescript
// security.module.ts
ThrottlerModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => [
    {
      name: 'default',
      ttl: 60000,      // 60 segundos
      limit: 200,      // 200 peticiones por defecto
    },
    {
      name: 'strict',  // Para endpoints sensibles
      ttl: 60000,
      limit: 5,
    },
    {
      name: 'relaxed', // Para sincronización
      ttl: 60000,
      limit: 500,
    },
  ],
})
```

##### 5. Estrategia de Sincronización en Cliente

```typescript
// App móvil - Sincronización inteligente
async syncOfflineData() {
  const pendingRecords = await getOfflineRecords(); // Ej: 280 registros
  
  // Dividir en batches de 100
  const batches = chunk(pendingRecords, 100); // [100, 100, 80]
  
  for (const batch of batches) {
    try {
      await api.post('/sync/batch', { records: batch });
      await markAsSynced(batch);
      
      // Pequeña pausa entre batches para no saturar
      if (batches.length > 1) {
        await sleep(200); // 200ms entre batches
      }
    } catch (error) {
      if (error.status === 429) {
        // Rate limit excedido, esperar y reintentar
        await sleep(2000);
        await this.retryBatch(batch);
      } else {
        // Otro error, marcar para revisión
        await markAsConflict(batch, error);
      }
    }
  }
}
```

#### Protección Adicional: Bloqueo por Comportamiento Sospechoso

El rate limiting NO bloquea permanentemente. El **bloqueo permanente** solo ocurre cuando:

```typescript
// SecurityService - Bloqueo automático después de 5 actividades sospechosas
markSuspiciousIP(ip: string): void {
  const count = (this.suspiciousIPs.get(ip) || 0) + 1;
  
  if (count >= 5) {
    this.blockIP(ip);  // Bloqueo permanente
  }
}
```

**Actividades sospechosas**:
1. Request muy grande (>10MB)
2. Path traversal (`../../etc/passwd`)
3. SQL injection (`' UNION SELECT`)
4. XSS attempt (`<script>`)
5. Code injection (`exec()`)
6. Bots no autorizados

**Flujo**:
```
Usuario normal excede rate limit:
└─ Recibe 429 Too Many Requests
└─ Espera 60 segundos
└─ Puede continuar normalmente

Usuario malicioso:
├─ Intenta 5 ataques diferentes
└─ IP bloqueada permanentemente (403 Forbidden)
    └─ Requiere desbloqueo manual por admin
```

#### Variables de Entorno

```bash
# .env
# Rate Limiting
THROTTLE_TTL=60000                    # 60 segundos
THROTTLE_DEFAULT_LIMIT=200            # Navegación normal
THROTTLE_STRICT_LIMIT=5               # Login, registro
THROTTLE_RELAXED_LIMIT=500            # Sincronización

# Security
SECURITY_MAX_REQUEST_SIZE=10485760    # 10MB
SECURITY_SUSPICIOUS_THRESHOLD=5       # Intentos antes de bloquear
```

#### Monitoreo y Ajustes

**Métricas a monitorear**:
- Tasa de 429 errors por endpoint
- Usuarios legítimos bloqueados
- Tiempo promedio de sincronización
- IPs bloqueadas automáticamente

**Ajustes recomendados después de producción**:
- Si muchos 429 en navegación → Aumentar límite default a 300
- Si sincronización lenta → Aumentar límite relaxed a 1000
- Si muchos ataques → Reducir threshold de bloqueo a 3

---

### Sistema de Observabilidad: Grafana Stack

#### Estrategia: Enfoque Híbrido

**Decisión**: Combinar Grafana Stack con MongoDB para diferentes propósitos

```
┌─────────────────────────────────────────────┐
│          Estrategia Híbrida                 │
├─────────────────────────────────────────────┤
│                                             │
│  📊 Métricas → Prometheus → Grafana        │
│     - Performance, latencias, throughput    │
│     - Uso de recursos (CPU, memoria)        │
│     - Métricas de negocio (rondas, alertas)│
│                                             │
│  📝 Logs Operacionales → Loki → Grafana    │
│     - Errores, warnings, debug              │
│     - Logs de aplicación en tiempo real     │
│     - Búsqueda y filtrado rápido            │
│                                             │
│  🔍 Logs de Auditoría → MongoDB            │
│     - Compliance, legal                     │
│     - Retención larga (1+ años)             │
│     - Histórico inmutable                   │
│                                             │
│  🔒 Logs de Seguridad → MongoDB + Grafana  │
│     - Ataques, bloqueos                     │
│     - Dashboard de seguridad                │
│     - Alertas en tiempo real                │
│                                             │
└─────────────────────────────────────────────┘
```

**Razón**: 
- ✅ Grafana para observabilidad y debugging en tiempo real
- ✅ MongoDB para auditoría, compliance y retención larga
- ✅ Mejor rendimiento y costos optimizados

#### Componentes del Stack

##### 1. Prometheus - Métricas

**Métricas de Sistema**:
- `http_requests_total` - Total de requests HTTP
- `http_request_duration_seconds` - Duración de requests
- `nodejs_heap_size_used_bytes` - Uso de memoria
- `nodejs_eventloop_lag_seconds` - Lag del event loop

**Métricas de Negocio**:
- `rounds_created_total` - Rondas creadas por tenant
- `rounds_completed_total` - Rondas completadas
- `checkpoints_validated_total` - Checkpoints validados (GPS/QR/NFC)
- `alerts_created_total` - Alertas creadas por tipo/severidad
- `sync_queue_size` - Tamaño de cola de sincronización
- `sync_success_rate` - Tasa de éxito de sincronización
- `active_users` - Usuarios activos por tenant

**Métricas de Seguridad**:
- `rate_limit_exceeded_total` - Rate limits excedidos
- `ips_blocked_total` - IPs bloqueadas
- `auth_failures_total` - Fallos de autenticación

##### 2. Loki - Logs Centralizados

**Niveles**: error, warn, info, debug

**Labels para filtrado**:
- `app`, `environment`, `tenant_id`, `user_id`, `level`, `context`

##### 3. Grafana - Dashboards

**Dashboards a crear**:

1. **System Overview**: Health general, requests/sec, latencia, errores
2. **Business Metrics**: Rondas, checkpoints, alertas, usuarios activos
3. **Performance**: Latencia por endpoint, queries lentas, event loop
4. **Security**: Rate limits, IPs bloqueadas, intentos de login
5. **Tenant Dashboard**: Métricas por tenant específico
6. **Sync Dashboard**: Cola de sincronización, tasa de éxito/fallo

#### Dependencias NPM

```json
{
  "dependencies": {
    "@willsoto/nestjs-prometheus": "^6.0.0",
    "prom-client": "^15.1.0",
    "winston": "^3.11.0",
    "winston-loki": "^6.0.8"
  }
}
```

#### Docker Compose - Servicios de Monitoreo

Agregar al `docker-compose.yml`:

```yaml
# Servicios de Monitoreo
prometheus:
  image: prom/prometheus:latest
  container_name: security-app-prometheus
  restart: unless-stopped
  ports:
    - '9090:9090'
  volumes:
    - ./monitoring/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
    - prometheus_data:/prometheus
  command:
    - '--config.file=/etc/prometheus/prometheus.yml'
    - '--storage.tsdb.retention.time=30d'
  networks:
    - security-app-network

loki:
  image: grafana/loki:latest
  container_name: security-app-loki
  restart: unless-stopped
  ports:
    - '3100:3100'
  volumes:
    - ./monitoring/loki/loki-config.yml:/etc/loki/local-config.yaml
    - loki_data:/loki
  command: -config.file=/etc/loki/local-config.yaml
  networks:
    - security-app-network

promtail:
  image: grafana/promtail:latest
  container_name: security-app-promtail
  restart: unless-stopped
  volumes:
    - ./logs:/var/log/app
    - ./monitoring/promtail/promtail-config.yml:/etc/promtail/config.yml
  command: -config.file=/etc/promtail/config.yml
  networks:
    - security-app-network

grafana:
  image: grafana/grafana:latest
  container_name: security-app-grafana
  restart: unless-stopped
  ports:
    - '3001:3000'
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD:-admin}
    - GF_USERS_ALLOW_SIGN_UP=false
  volumes:
    - grafana_data:/var/lib/grafana
    - ./monitoring/grafana/provisioning:/etc/grafana/provisioning
  networks:
    - security-app-network

# Agregar volúmenes
volumes:
  prometheus_data:
  loki_data:
  grafana_data:
```

#### Estructura de Archivos

```
monitoring/
├── prometheus/
│   └── prometheus.yml
├── loki/
│   └── loki-config.yml
├── promtail/
│   └── promtail-config.yml
└── grafana/
    └── provisioning/
        ├── datasources/
        │   └── datasources.yml
        └── dashboards/
            ├── dashboards.yml
            ├── system-overview.json
            ├── business-metrics.json
            ├── performance.json
            ├── security.json
            ├── tenant.json
            └── sync.json

src/core/
├── logging/
│   ├── logging.module.ts
│   ├── services/
│   │   ├── logger.service.ts
│   │   └── mongodb-logger.service.ts
│   ├── interceptors/
│   │   └── http-logging.interceptor.ts
│   └── decorators/
│       └── log-execution.decorator.ts
└── metrics/
    ├── metrics.module.ts
    ├── services/
    │   └── metrics.service.ts
    └── decorators/
        └── track-metric.decorator.ts
```

#### Variables de Entorno

```bash
# Logging
LOG_LEVEL=info
LOG_TO_FILE=true
LOG_TO_LOKI=true
LOKI_HOST=http://localhost:3100

# Grafana
GRAFANA_ADMIN_PASSWORD=secure_password_here

# Métricas
METRICS_ENABLED=true
PROMETHEUS_PORT=9090
```

#### Scripts NPM

```json
{
  "scripts": {
    "monitoring:up": "docker compose up -d prometheus loki promtail grafana",
    "monitoring:down": "docker compose stop prometheus loki promtail grafana",
    "monitoring:logs": "docker compose logs -f prometheus loki promtail grafana",
    "grafana:open": "open http://localhost:3001",
    "prometheus:open": "open http://localhost:9090"
  }
}
```

#### Implementación en NestJS

##### Módulo de Métricas

```typescript
// src/core/metrics/metrics.module.ts
import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: { enabled: true },
      path: '/metrics',
      defaultLabels: { app: 'security-app' },
    }),
  ],
})
export class MetricsModule {}
```

##### Uso en Servicios

```typescript
// Ejemplo en rounds.service.ts
import { Counter, Histogram } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';

@Injectable()
export class RoundsService {
  constructor(
    @InjectMetric('rounds_created_total') 
    private roundsCounter: Counter,
    @InjectMetric('round_execution_duration_seconds') 
    private roundDuration: Histogram,
  ) {}

  async createRound(dto: CreateRoundDto) {
    const timer = this.roundDuration.startTimer();
    try {
      const round = await this.roundRepo.save(dto);
      this.roundsCounter.inc({ tenant_id: dto.tenant_id });
      return round;
    } finally {
      timer();
    }
  }
}
```

#### Plan de Implementación

**Fase 1: Setup Básico** (1-2 días)
- Crear estructura de carpetas `monitoring/`
- Crear archivos de configuración
- Actualizar docker-compose.yml
- Instalar dependencias NPM

**Fase 2: Integración de Métricas** (2-3 días)
- Implementar MetricsModule
- Crear decorators para tracking
- Integrar en servicios clave
- Configurar endpoint /metrics

**Fase 3: Integración de Logs** (2-3 días)
- Implementar LoggingModule con Winston
- Configurar transporte a Loki
- Implementar interceptores HTTP
- Mantener logs de auditoría en MongoDB

**Fase 4: Dashboards** (2-3 días)
- Crear datasources en Grafana
- Diseñar 6 dashboards principales
- Configurar variables y filtros
- Configurar auto-refresh

**Fase 5: Alertas** (1-2 días)
- Configurar alertas en Grafana
- Integrar con Slack/Email
- Definir umbrales críticos

**Fase 6: Testing y Docs** (1 día)
- Probar dashboards
- Verificar métricas y logs
- Documentar acceso y uso

**Tiempo total**: 9-14 días

#### Beneficios

| Beneficio | Impacto |
|-----------|---------|
| **Visibilidad** | Dashboards en tiempo real |
| **Debugging** | Logs centralizados con búsqueda rápida |
| **Proactividad** | Alertas antes de problemas |
| **Performance** | Identificar cuellos de botella |
| **Compliance** | Auditoría completa en MongoDB |
| **Profesionalismo** | Stack enterprise-grade |

#### Consideraciones

- **Recursos**: ~500MB RAM adicionales
- **Retención**: 30 días en Prometheus/Loki, 1+ año en MongoDB
- **Seguridad**: Proteger /metrics con autenticación en producción
- **Backup**: Incluir volúmenes en estrategia de backup

---

### Performance Targets

- API response time: < 200ms (p95)
- Sincronización offline: < 5s para 100 registros
- Generación de reportes: < 30s para 10k registros
- Soporte para 1000 tenants simultáneos
- 10,000 usuarios activos concurrentes

---

## 🔗 Referencias

- **Arquitectura completa**: `docs/security-saas-backend-architecture-ae63c0.md`
- **Quick Start**: `QUICK_START.md`
- **Setup detallado**: `README_SETUP.md`
- **Configuración DB**: `docs/DBEAVER_SETUP.md`, `docs/MONGODB_COMPASS_SETUP.md`, `docs/REDIS_SETUP.md`

---

**Última actualización**: Febrero 2026  
**Versión del plan**: 1.0
