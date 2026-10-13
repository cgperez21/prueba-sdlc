#!/usr/bin/env node
'use strict';
/**
 * Script de la Parte 1: ejecuta las pruebas unitarias con Jest, calcula la cobertura
 * y muestra por pantalla:
 *   1) Resultado de las pruebas (cuales fallan y por que)
 *   2) Porcentaje de cobertura global y por archivo
 *   3) Lineas / funciones / ramas del codigo que NO estan cubiertas
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const raiz = path.resolve(__dirname, '..');
const resultadosJson = path.join(raiz, 'test-results.json');
const coberturaJson = path.join(raiz, 'coverage', 'coverage-final.json');
const jestBin = require.resolve('jest/bin/jest');

const linea = (c = '=') => c.repeat(70);

console.log(linea());
console.log(' EJECUTANDO PRUEBAS UNITARIAS + COBERTURA');
console.log(linea());

const ejecucion = spawnSync(
  process.execPath,
  [jestBin, '--coverage', '--silent', '--json', `--outputFile=${resultadosJson}`],
  { cwd: raiz, encoding: 'utf8' }
);

if (!fs.existsSync(resultadosJson) || !fs.existsSync(coberturaJson)) {
  console.error('No se pudieron generar los reportes. Salida de Jest:\n');
  console.error(ejecucion.stdout, ejecucion.stderr);
  process.exit(2);
}

const resultados = JSON.parse(fs.readFileSync(resultadosJson, 'utf8'));
const cobertura = JSON.parse(fs.readFileSync(coberturaJson, 'utf8'));

// ---------- 1) Resultado de las pruebas ----------
console.log(`\n[1] RESULTADO DE LAS PRUEBAS`);
console.log(linea('-'));
console.log(`Total: ${resultados.numTotalTests} | OK: ${resultados.numPassedTests} | FALLAN: ${resultados.numFailedTests}`);

const fallidas = [];
for (const suite of resultados.testResults) {
  for (const t of suite.assertionResults) {
    if (t.status === 'failed') {
      fallidas.push({ archivo: path.relative(raiz, suite.name), nombre: t.fullName, mensaje: t.failureMessages.join('\n') });
    }
  }
}
if (fallidas.length === 0) {
  console.log('\n Todas las pruebas pasan.');
} else {
  console.log('\n PRUEBAS QUE FALLAN:');
  fallidas.forEach((f, i) => {
    const detalle = f.mensaje.replace(/\u001b\[[0-9;]*m/g, '').split('\n').slice(0, 4).join('\n      ');
    console.log(`\n  ${i + 1}. ${f.nombre}\n     Archivo: ${f.archivo}\n     Detalle:\n      ${detalle}`);
  });
}

// ---------- 2) Cobertura ----------
console.log(`\n[2] PORCENTAJE DE COBERTURA`);
console.log(linea('-'));
const pct = (cubiertos, total) => (total === 0 ? 100 : (cubiertos / total) * 100);
let g = { s: [0, 0], f: [0, 0], b: [0, 0] };
const detalleNoCubierto = [];

for (const [ruta, d] of Object.entries(cobertura)) {
  const sVals = Object.values(d.s);
  const fVals = Object.values(d.f);
  const bVals = Object.values(d.b).flat();
  const sc = sVals.filter((v) => v > 0).length;
  const fc = fVals.filter((v) => v > 0).length;
  const bc = bVals.filter((v) => v > 0).length;
  g.s[0] += sc; g.s[1] += sVals.length;
  g.f[0] += fc; g.f[1] += fVals.length;
  g.b[0] += bc; g.b[1] += bVals.length;
  console.log(
    `  ${path.relative(raiz, ruta).padEnd(28)} sentencias ${pct(sc, sVals.length).toFixed(1).padStart(5)}%  funciones ${pct(fc, fVals.length).toFixed(1).padStart(5)}%  ramas ${pct(bc, bVals.length).toFixed(1).padStart(5)}%`
  );

  const lineasSinCubrir = new Set();
  for (const [id, veces] of Object.entries(d.s)) {
    if (veces === 0) lineasSinCubrir.add(d.statementMap[id].start.line);
  }
  const funcionesSinCubrir = Object.entries(d.f)
    .filter(([, v]) => v === 0)
    .map(([id]) => `${d.fnMap[id].name} (linea ${d.fnMap[id].loc.start.line})`);
  const ramasSinCubrir = [];
  for (const [id, arr] of Object.entries(d.b)) {
    arr.forEach((v, i) => { if (v === 0) ramasSinCubrir.push(`linea ${d.branchMap[id].locations[i].start.line}`); });
  }
  if (lineasSinCubrir.size || funcionesSinCubrir.length || ramasSinCubrir.length) {
    detalleNoCubierto.push({ archivo: path.relative(raiz, ruta), lineas: [...lineasSinCubrir].sort((a, b) => a - b), funciones: funcionesSinCubrir, ramas: ramasSinCubrir });
  }
}
console.log(linea('-'));
console.log(`  COBERTURA GLOBAL   sentencias ${pct(...g.s).toFixed(1)}%  funciones ${pct(...g.f).toFixed(1)}%  ramas ${pct(...g.b).toFixed(1)}%`);

// ---------- 3) Codigo no cubierto ----------
console.log(`\n[3] CODIGO NO CUBIERTO POR PRUEBAS`);
console.log(linea('-'));
if (detalleNoCubierto.length === 0) {
  console.log(' Todo el codigo esta cubierto.');
} else {
  for (const n of detalleNoCubierto) {
    console.log(`\n  Archivo: ${n.archivo}`);
    if (n.lineas.length) console.log(`    Lineas sin cubrir:    ${n.lineas.join(', ')}`);
    if (n.funciones.length) console.log(`    Funciones sin pruebas: ${n.funciones.join(', ')}`);
    if (n.ramas.length) console.log(`    Ramas sin cubrir:      ${n.ramas.join(', ')}`);
  }
}

console.log('\n' + linea());
console.log(' Reporte HTML/LCOV generado en la carpeta coverage/');
console.log(linea());

// Codigo de salida distinto de 0 si hay pruebas fallidas (util para CI)
process.exit(fallidas.length > 0 ? 1 : 0);
