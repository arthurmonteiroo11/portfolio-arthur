import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  projetarNoCaminho,
  pontoNoCaminho,
  caminhoAte,
} from '../src/scripts/toys/linhas.js';

const CAMINHO = [
  [0, 0],
  [10, 0],
  [10, 10],
];

test('projeta um ponto sobre o primeiro trecho', () => {
  assert.equal(projetarNoCaminho(CAMINHO, 5, 0), 0.25);
});

test('projeta um ponto sobre o segundo trecho', () => {
  assert.equal(projetarNoCaminho(CAMINHO, 10, 5), 0.75);
});

test('ponto fora do caminho cai no trecho mais proximo', () => {
  assert.equal(projetarNoCaminho(CAMINHO, 5, 3), 0.25);
});

test('ponto alem do fim fica preso em 1', () => {
  assert.equal(projetarNoCaminho(CAMINHO, 20, 20), 1);
});

test('ponto antes do inicio fica preso em 0', () => {
  assert.equal(projetarNoCaminho(CAMINHO, -5, -5), 0);
});

test('pontoNoCaminho devolve inicio, meio e fim', () => {
  assert.deepEqual(pontoNoCaminho(CAMINHO, 0), [0, 0]);
  assert.deepEqual(pontoNoCaminho(CAMINHO, 0.5), [10, 0]);
  assert.deepEqual(pontoNoCaminho(CAMINHO, 0.75), [10, 5]);
  assert.deepEqual(pontoNoCaminho(CAMINHO, 1), [10, 10]);
});

test('pontoNoCaminho prende t fora de 0 a 1', () => {
  assert.deepEqual(pontoNoCaminho(CAMINHO, -1), [0, 0]);
  assert.deepEqual(pontoNoCaminho(CAMINHO, 2), [10, 10]);
});

test('caminhoAte corta o caminho no ponto atual', () => {
  assert.deepEqual(caminhoAte(CAMINHO, 0.75), [
    [0, 0],
    [10, 0],
    [10, 5],
  ]);
});

test('caminhoAte em 0 devolve so o ponto inicial', () => {
  assert.deepEqual(caminhoAte(CAMINHO, 0), [[0, 0]]);
});

test('caminhoAte em 1 devolve o caminho inteiro', () => {
  assert.deepEqual(caminhoAte(CAMINHO, 1), CAMINHO);
});
