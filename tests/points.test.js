import { test } from 'node:test';
import assert from 'node:assert/strict';
import { textToPoints } from '../src/scripts/opening/points.js';

test('retorna pontos so onde alpha > 0', () => {
  const alpha = new Uint8ClampedArray(16);
  alpha[2 * 4 + 1] = 255;
  const pontos = textToPoints(alpha, 4, 4, 1);
  assert.equal(pontos.length, 2);
  assert.equal(pontos[0], 0.375);
  assert.equal(pontos[1], 0.625);
});

test('alpha totalmente vazio nao gera pontos', () => {
  const pontos = textToPoints(new Uint8ClampedArray(64), 8, 8, 1);
  assert.equal(pontos.length, 0);
});

test('valores ficam entre 0 e 1', () => {
  const alpha = new Uint8ClampedArray(64).fill(255);
  const pontos = textToPoints(alpha, 8, 8, 2);
  assert.equal(pontos.length, 32);
  for (const valor of pontos) {
    assert.ok(valor >= 0 && valor <= 1);
  }
});

test('step maior gera menos pontos', () => {
  const alpha = new Uint8ClampedArray(64).fill(255);
  const denso = textToPoints(alpha, 8, 8, 1);
  const ralo = textToPoints(alpha, 8, 8, 4);
  assert.ok(ralo.length < denso.length);
  assert.equal(ralo.length, 8);
});

test('alpha fraco de borda suavizada e ignorado', () => {
  const alpha = new Uint8ClampedArray(16).fill(40);
  assert.equal(textToPoints(alpha, 4, 4, 1).length, 0);
});

test('retorna Float32Array com pares x y', () => {
  const alpha = new Uint8ClampedArray(16).fill(255);
  const pontos = textToPoints(alpha, 4, 4, 1);
  assert.ok(pontos instanceof Float32Array);
  assert.equal(pontos.length % 2, 0);
});
