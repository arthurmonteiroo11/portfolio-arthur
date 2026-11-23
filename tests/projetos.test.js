import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildCatalog } from '../src/data/catalogo.js';
import projetos from '../src/data/projetos.json' with { type: 'json' };
import cache from '../src/data/repos-cache.json' with { type: 'json' };
import contato from '../src/data/contato.json' with { type: 'json' };

test('projetos.json gera cinco cenas em ordem de dificuldade', () => {
  const { cenas } = buildCatalog(cache, projetos);
  assert.deepEqual(
    cenas.map((c) => c.id),
    ['minimal-design-system', 'meu-dinheirinho', 'assistente-mari', 'gaucho-express', 'linhas'],
  );
});

test('as duas cenas privadas nao expoem nenhuma url', () => {
  const { cenas } = buildCatalog(cache, projetos);
  const privadas = cenas.filter((c) => c.privado);
  assert.equal(privadas.length, 2);
  for (const cena of privadas) {
    assert.equal(cena.repoUrl, null);
    assert.equal(cena.siteUrl, null);
  }
});

test('nenhum repositorio privado aparece no arquivo', () => {
  const { arquivo } = buildCatalog(cache, projetos);
  const nomes = arquivo.map((a) => a.nome);
  assert.ok(!nomes.includes('meu-dinheirinho'));
  assert.ok(!nomes.includes('assistente-mari'));
});

test('contato usa a conta real do github e links com https', () => {
  assert.equal(contato.github, 'https://github.com/arthurmonteiroo11');
  assert.match(contato.linkedin, /^https:\/\//);
});

test('toda cena tem cor hexadecimal valida', () => {
  const { cenas } = buildCatalog(cache, projetos);
  for (const cena of cenas) assert.match(cena.cor, /^#[0-9a-f]{6}$/i);
});

test('meu-dinheirinho tem tres telas com texto alternativo', () => {
  const { cenas } = buildCatalog(cache, projetos);
  const cena = cenas.find((c) => c.id === 'meu-dinheirinho');
  assert.equal(cena.toy, 'telas');
  assert.equal(cena.telas.length, 3);
  for (const tela of cena.telas) {
    assert.match(tela.src, /^\/telas\/.+\.jpg$/);
    assert.ok(tela.alt.length > 10);
  }
});

test('cenas sem telas recebem lista vazia', () => {
  const { cenas } = buildCatalog(cache, projetos);
  const cena = cenas.find((c) => c.id === 'linhas');
  assert.deepEqual(cena.telas, []);
});

test('gaucho-express mostra duas telas em formato de janela', () => {
  const { cenas } = buildCatalog(cache, projetos);
  const cena = cenas.find((c) => c.id === 'gaucho-express');
  assert.equal(cena.toy, 'telas');
  assert.equal(cena.formato, 'janela');
  assert.equal(cena.telas.length, 2);
});

test('cenas com telas de celular usam o formato celular', () => {
  const { cenas } = buildCatalog(cache, projetos);
  assert.equal(cenas.find((c) => c.id === 'meu-dinheirinho').formato, 'celular');
});
