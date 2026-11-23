import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fetchPublicRepos } from '../src/data/github.js';

const cache = JSON.parse(
  readFileSync(new URL('../src/data/repos-cache.json', import.meta.url), 'utf8'),
);

const resposta = (corpo, status = 200) => ({
  ok: status === 200,
  status,
  json: async () => corpo,
});

const bruto = (name, extra = {}) => ({
  name,
  description: null,
  language: null,
  html_url: `https://github.com/arthurmonteiroo11/${name}`,
  homepage: null,
  fork: false,
  ...extra,
});

test('chama o endpoint de repos do usuario', async () => {
  let pedido = '';
  await fetchPublicRepos('arthurmonteiroo11', async (url) => {
    pedido = url;
    return resposta([]);
  });
  assert.equal(
    pedido,
    'https://api.github.com/users/arthurmonteiroo11/repos?per_page=100&sort=updated&type=owner',
  );
});

test('ignora forks', async () => {
  const lista = await fetchPublicRepos('x', async () =>
    resposta([bruto('meu'), bruto('copia', { fork: true })]),
  );
  assert.deepEqual(lista.map((r) => r.name), ['meu']);
});

test('converte campos nulos e renomeia html_url para url', async () => {
  const [item] = await fetchPublicRepos('x', async () => resposta([bruto('meu')]));
  assert.deepEqual(item, {
    name: 'meu',
    description: '',
    language: '',
    url: 'https://github.com/arthurmonteiroo11/meu',
    homepage: '',
    fork: false,
  });
});

test('usa o cache quando a API falha na rede', async () => {
  const lista = await fetchPublicRepos('x', async () => {
    throw new Error('sem rede');
  });
  assert.deepEqual(lista, cache);
});

test('usa o cache quando a API responde com limite estourado', async () => {
  const lista = await fetchPublicRepos('x', async () => resposta({ message: 'rate limit' }, 403));
  assert.deepEqual(lista, cache);
});
