#!/usr/bin/env node

/**
 * Script para generar secrets seguros para producción
 * Uso: node scripts/generate-production-secrets.js
 */

const crypto = require('crypto');

console.log('🔐 Generando secrets seguros para producción...\n');

// Generar secrets
const jwtSecret = crypto.randomBytes(32).toString('hex');
const jwtRefreshSecret = crypto.randomBytes(32).toString('hex');
const encryptionKey = crypto.randomBytes(32).toString('hex');

console.log('═══════════════════════════════════════════════════════════════');
console.log('📋 SECRETS GENERADOS - Copia estos valores a DigitalOcean');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('JWT_SECRET=');
console.log(jwtSecret);
console.log('');

console.log('JWT_REFRESH_SECRET=');
console.log(jwtRefreshSecret);
console.log('');

console.log('ENCRYPTION_KEY=');
console.log(encryptionKey);
console.log('');

console.log('═══════════════════════════════════════════════════════════════');
console.log('⚠️  IMPORTANTE:');
console.log('   1. NO compartas estos secrets con nadie');
console.log('   2. NO los subas a GitHub');
console.log('   3. Úsalos SOLO en producción');
console.log('   4. Guárdalos en un lugar seguro (1Password, LastPass, etc.)');
console.log('═══════════════════════════════════════════════════════════════\n');

// Generar también formato para .env
console.log('📄 Formato para archivo .env (NO subir a GitHub):\n');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`JWT_REFRESH_SECRET=${jwtRefreshSecret}`);
console.log(`ENCRYPTION_KEY=${encryptionKey}`);
console.log('');

console.log('✅ Secrets generados exitosamente!\n');
