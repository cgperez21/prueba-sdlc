const assert = require('assert');
const { restar, dividir, promedio } = require('../src/operaciones');

describe('Operaciones', function () {
  it('resta dos numeros', function () {
    assert.strictEqual(restar(5, 3), 2);
  });

  it('divide dos numeros', function () {
    assert.strictEqual(dividir(10, 2), 5);
  });

  it('dividir por cero lanza error', function () {
    assert.throws(() => dividir(1, 0), /dividir por cero/);
  });

  // FALLA por el bug intencional en promedio()
  it('calcula el promedio de [2, 4, 6]', function () {
    assert.strictEqual(promedio([2, 4, 6]), 4);
  });
});
