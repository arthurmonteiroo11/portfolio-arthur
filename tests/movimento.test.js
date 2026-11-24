import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcularReduzido, lerForcado, gravarForcado } from '../src/scripts/movimento.js';

const criarArmazenamento = () => {
  const dados = new Map();
  return {
    getItem: (chave) => dados.get(chave) ?? null,
    setItem: (chave, valor) => dados.set(chave, valor),
    removeItem: (chave) => dados.delete(chave),
  };
};

const armazenamentoQuebrado = () => ({
  getItem: () => {
    throw new Error('bloqueado');
  },
  setItem: () => {
    throw new Error('bloqueado');
  },
  removeItem: () => {
    throw new Error('bloqueado');
  },
});

test('sem pedido do sistema nunca reduz', () => {
  assert.equal(calcularReduzido(false, false), false);
  assert.equal(calcularReduzido(false, true), false);
});

test('com pedido do sistema reduz, a menos que o visitante force as animacoes', () => {
  assert.equal(calcularReduzido(true, false), true);
  assert.equal(calcularReduzido(true, true), false);
});

test('a escolha de forcar animacoes e gravada e lida', () => {
  const armazenamento = criarArmazenamento();
  assert.equal(lerForcado(armazenamento), false);
  assert.equal(gravarForcado(armazenamento, true), undefined);
  assert.equal(lerForcado(armazenamento), true);
  gravarForcado(armazenamento, false);
  assert.equal(lerForcado(armazenamento), false);
});

test('armazenamento bloqueado nao quebra e conta como nao forcado', () => {
  const armazenamento = armazenamentoQuebrado();
  assert.equal(lerForcado(armazenamento), false);
  assert.doesNotThrow(() => gravarForcado(armazenamento, true));
  assert.equal(lerForcado(null), false);
});
