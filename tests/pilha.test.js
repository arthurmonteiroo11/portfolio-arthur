import { test } from 'node:test';
import assert from 'node:assert/strict';
import { posicaoNaPilha, proximoIndice } from '../src/scripts/toys/pilha.js';

test('a tela atual fica na frente', () => {
  assert.equal(posicaoNaPilha(1, 1, 3), 0);
});

test('as outras telas ficam atras, em ordem circular', () => {
  assert.equal(posicaoNaPilha(2, 1, 3), 1);
  assert.equal(posicaoNaPilha(0, 1, 3), 2);
});

test('proximoIndice volta ao inicio depois da ultima tela', () => {
  assert.equal(proximoIndice(0, 3), 1);
  assert.equal(proximoIndice(2, 3), 0);
});

test('proximoIndice com uma tela so continua nela', () => {
  assert.equal(proximoIndice(0, 1), 0);
  assert.equal(proximoIndice(0, 0), 0);
});
