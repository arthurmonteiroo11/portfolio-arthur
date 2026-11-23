import { test } from 'node:test';
import assert from 'node:assert/strict';
import { criarControleDeContexto } from '../src/scripts/opening/contexto.js';

test('contexto perdido impede a animacao de rodar', () => {
  const controle = criarControleDeContexto();
  assert.equal(controle.podeRodar(), true);
  controle.perder();
  assert.equal(controle.podeRodar(), false);
});

test('contexto restaurado so volta a rodar se o renderizador foi recriado', () => {
  const controle = criarControleDeContexto();
  controle.perder();
  controle.restaurar(false);
  assert.equal(controle.podeRodar(), false);
  controle.restaurar(true);
  assert.equal(controle.podeRodar(), true);
});
