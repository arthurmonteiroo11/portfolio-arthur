import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatarProgresso } from '../src/scripts/hud.js';

test('indice zero mostra Início', () => {
  assert.equal(formatarProgresso(0, 5), 'Início');
});

test('indice dentro do total mostra n / total', () => {
  assert.equal(formatarProgresso(3, 5), '3 / 5');
});

test('ultimo projeto mostra total / total', () => {
  assert.equal(formatarProgresso(5, 5), '5 / 5');
});

test('indice depois do total mostra Fim de jogo', () => {
  assert.equal(formatarProgresso(6, 5), 'Fim de jogo');
});

test('indice negativo cai em Início', () => {
  assert.equal(formatarProgresso(-2, 5), 'Início');
});
