// Modulo ADICIONAL (no viene en el material del curso): sirve para que el reporte
// de la Parte 1 tenga una prueba que falla y codigo sin cobertura.

function restar(a, b) {
  return a - b;
}

function dividir(a, b) {
  if (b === 0) {
    throw new Error('No se puede dividir por cero');
  }
  return a / b;
}

// BUG INTENCIONAL (para la demo): divide por (length - 1) en vez de length.
// Correccion: return numeros.reduce((acc, n) => acc + n, 0) / numeros.length;
function promedio(numeros) {
  return numeros.reduce((acc, n) => acc + n, 0) / (numeros.length - 1);
}

// Funcion SIN pruebas: aparecera como codigo no cubierto.
function esPar(n) {
  return n % 2 === 0;
}

module.exports = { restar, dividir, promedio, esPar };
