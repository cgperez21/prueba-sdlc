# Integration Solutions QA

Proyecto de la Evaluación Parcial N°2 (AUY1102 - Ciclo de vida del Software I).

Usa los archivos del material complementario 2.2.5 (`sum.js`, `sum.test.js`, `sum.feature`, `sum.steps.js`,
`acceptance.feature`, `acceptances.steps.js`) más un módulo adicional (`src/operaciones.js`) para que el
reporte muestre una prueba fallida y código sin cobertura.

## Requisitos
Node.js 20+ y Git.

## Uso
```bash
npm install          # instala dependencias y genera package-lock.json
npm test             # pruebas unitarias (Jest)
npm run test:bdd     # pruebas de aceptacion (Cucumber)
npm run test:report  # Parte 1: pruebas + cobertura + codigo no cubierto
npm run audit        # Parte 2: npm audit
```

## Prueba que falla a propósito
`promedio()` en `src/operaciones.js` divide por `length - 1`. Corrección:
`return numeros.reduce((acc, n) => acc + n, 0) / numeros.length;`

## Estructura
- `src/` código · `test/` pruebas Jest · `features/` Cucumber (.feature + step_definitions)
- `scripts/ejecutar-pruebas.js` script de la Parte 1
- `sonar-project.properties` y `.github/workflows/ci.yml` para la Parte 2
