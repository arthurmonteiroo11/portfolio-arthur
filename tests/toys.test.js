import { test } from 'node:test';
import assert from 'node:assert/strict';
import { obterToy } from '../src/scripts/toys/index.js';

test('toy linhas e toy formas sao brinquedos diferentes', () => {
  assert.notEqual(obterToy('linhas'), obterToy('formas'));
});

test('nome desconhecido cai no toy formas', () => {
  assert.equal(obterToy('nao-existe'), obterToy('formas'));
});

test('obterToy devolve uma funcao de montar', () => {
  assert.equal(typeof obterToy('linhas'), 'function');
  assert.equal(typeof obterToy('formas'), 'function');
});

test('toy telas e um brinquedo proprio', () => {
  assert.notEqual(obterToy('telas'), obterToy('formas'));
  assert.equal(typeof obterToy('telas'), 'function');
});
