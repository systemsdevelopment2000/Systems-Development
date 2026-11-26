/**
 * Script de validación de seguridad y datos antes de hacer push a producción.
 * Valida:
 * 1. Identidad de Git (usuario, email corporativo de SD).
 * 2. Repositorio remoto (destinado exclusivamente a systemsdevelopment2000).
 * 3. Rama activa (main).
 * 4. Variables de entorno de producción (Supabase).
 * 5. Commits pendientes de subir a Vercel.
 * 6. Verificación de tipos TypeScript (tsc -b --noEmit).
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch (err) {
    return null;
  }
}

console.log('\n' + '='.repeat(60));
console.log('   SISTEMA DE AUDITORÍA Y VALIDACIÓN PRE-PUSH - SD');
console.log('='.repeat(60));

let errores = 0;

// 1. Validar Identidad del Autor
const userName = run('git config --local user.name');
const userEmail = run('git config --local user.email');

console.log('\n[1/6] Identidad del Autor Git:');
console.log(`      Usuario : ${userName || '(no configurado localmente)'}`);
console.log(`      Email   : ${userEmail || '(no configurado localmente)'}`);

if (!userName || !userName.includes('SD')) {
  console.error('  ❌ ERROR: user.name local no corresponde a Systems Development.');
  errores++;
} else {
  console.log('  ✅ Usuario corporativo validado (SD).');
}

if (!userEmail || userEmail.toLowerCase().includes('mgg') || !userEmail.toLowerCase().includes('systemsdevelopment')) {
  console.error(`  ❌ ERROR: Email local inválido o asociado a MGG (${userEmail}).`);
  errores++;
} else {
  console.log('  ✅ Email corporativo validado (systemsdevelopment2000@gmail.com).');
}

// 2. Validar Repositorio Remoto
const remoteUrl = run('git remote get-url origin');
console.log('\n[2/6] Repositorio Remoto (Origin):');
console.log(`      URL: ${remoteUrl || '(sin remoto origin)'}`);

if (!remoteUrl || !remoteUrl.includes('systemsdevelopment2000/Systems-Development')) {
  console.error('  ❌ ERROR: El remoto NO apunta al repositorio oficial de Systems-Development.');
  errores++;
} else {
  console.log('  ✅ Repositorio oficial de Systems Development verificado.');
}

// 3. Validar Rama Activa
const branch = run('git branch --show-current');
console.log('\n[3/6] Rama de Despliegue:');
console.log(`      Rama actual: ${branch}`);
if (branch !== 'main') {
  console.warn('  ⚠️ AVISO: No estás en la rama "main". Vercel solo despliega producción desde "main".');
} else {
  console.log('  ✅ Rama "main" de producción confirmada.');
}

// 4. Validar Variables de Entorno y Conexión Supabase
console.log('\n[4/6] Configuración de Supabase:');
const envPath = path.resolve(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('  ❌ ERROR: No se encontró el archivo .env.local.');
  errores++;
} else {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const matchUrl = envContent.match(/VITE_SUPABASE_URL=["']?(https:\/\/[^"'\s]+)["']?/);
  const supabaseUrl = matchUrl ? matchUrl[1] : '';
  console.log(`      Supabase URL: ${supabaseUrl || '(no definida)'}`);
  
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    console.error('  ❌ ERROR: VITE_SUPABASE_URL contiene valores placeholder o inválidos.');
    errores++;
  } else if (supabaseUrl.includes('wfqawuubaugofihdoaos')) {
    console.log('  ✅ Proyecto oficial de Supabase verificado (wfqawuubaugofihdoaos).');
  } else {
    console.warn('  ⚠️ AVISO: URL de Supabase personalizada detectada.');
  }
}

// 5. Commits Pendientes de Subir
console.log('\n[5/6] Commits pendientes de subir a Vercel:');
const commitsPendientes = run('git log origin/main..HEAD --oneline');
if (!commitsPendientes) {
  console.log('      (El repositorio ya está sincronizado con origin/main, 0 commits pendientes)');
} else {
  const lineas = commitsPendientes.split('\n');
  console.log(`      Total: ${lineas.length} commit(s) nuevo(s):`);
  lineas.forEach((l) => console.log(`        • ${l}`));
  console.log('  ✅ Lista de cambios preparada para despliegue.');
}

// 6. Verificación de Tipos TypeScript
console.log('\n[6/6] Verificación de Tipos TypeScript (tsc -b --noEmit)...');
const tscResult = run('npx tsc -b --noEmit');
if (tscResult === null) {
  console.error('  ❌ ERROR: Se detectaron errores de TypeScript. Corrige antes de desplegar.');
  errores++;
} else {
  console.log('  ✅ Cero errores de compilación TypeScript.');
}

// Resumen Final
console.log('\n' + '='.repeat(60));
if (errores > 0) {
  console.error(`❌ VALIDACIÓN FALLIDA: Se encontraron ${errores} problema(s).`);
  console.error('   El push ha sido detenido por seguridad.');
  console.log('='.repeat(60) + '\n');
  process.exit(1);
} else {
  console.log('✅ VALIDACIÓN EXITOSA: Todos los datos, usuario y proyecto están en orden.');
  console.log('   Autorizado para git push origin main -> Vercel');
  console.log('='.repeat(60) + '\n');
  process.exit(0);
}
