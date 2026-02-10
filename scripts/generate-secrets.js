#!/usr/bin/env node

/**
 * Script para generar credenciales seguras para el archivo .env
 * Ejecutar: node scripts/generate-secrets.js
 */

const crypto = require('crypto');

function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

console.log('🔐 Generando credenciales seguras...\n');
console.log('Copia estos valores en tu archivo .env:\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('# JWT Secrets');
console.log(`JWT_SECRET=${generateSecret(32)}`);
console.log(`JWT_REFRESH_SECRET=${generateSecret(32)}`);
console.log('');

console.log('# Encryption Key');
console.log(`ENCRYPTION_KEY=${generateSecret(32)}`);
console.log('');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('⚠️  IMPORTANTE:');
console.log('   - Guarda estos valores de forma segura');
console.log('   - NO los compartas ni los subas a repositorios públicos');
console.log('   - En producción, usa variables de entorno del servidor');
console.log('   - Genera nuevos valores para cada entorno (dev, staging, prod)');
console.log('');
