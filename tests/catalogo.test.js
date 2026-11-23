import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildCatalog } from '../src/data/catalogo.js';

const repo = (nome, extra = {}) => ({
  name: nome,
  description: `descricao ${nome}`,
  language: 'JavaScript',
  url: `https://github.com/arthurmonteiroo11/${nome}`,
  homepage: '',
  fork: false,
  ...extra,
});

const curado = (id, extra = {}) => ({
  id,
  repo: id,
  titulo: id,
  texto: `texto ${id}`,
  cor: '#ffb347',
  toy: 'formas',
  dificuldade: 1,
  tecnologias: ['JavaScript'],
  ...extra,
});

test('cena privada nunca tem repoUrl nem siteUrl do repositorio', () => {
  const repos = [repo('segredo', { homepage: 'https://vaza.example' })];
  const { cenas } = buildCatalog(repos, [curado('segredo', { privado: true })]);
  assert.equal(cenas.length, 1);
  assert.equal(cenas[0].repoUrl, null);
  assert.equal(cenas[0].siteUrl, null);
});

test('cena privada nao aparece no arquivo mesmo se a API a devolver', () => {
  const repos = [repo('segredo')];
  const { arquivo } = buildCatalog(repos, [curado('segredo', { privado: true })]);
  assert.deepEqual(arquivo, []);
});

test('cenas saem em ordem crescente de dificuldade', () => {
  const lista = [
    curado('dificil', { dificuldade: 5 }),
    curado('facil', { dificuldade: 1 }),
    curado('medio', { dificuldade: 3 }),
  ];
  const { cenas } = buildCatalog([], lista);
  assert.deepEqual(cenas.map((c) => c.id), ['facil', 'medio', 'dificil']);
});

test('cena publica usa a url do repositorio e o homepage como site', () => {
  const repos = [repo('linhas', { homepage: 'https://linhas.vercel.app' })];
  const { cenas } = buildCatalog(repos, [curado('linhas')]);
  assert.equal(cenas[0].repoUrl, 'https://github.com/arthurmonteiroo11/linhas');
  assert.equal(cenas[0].siteUrl, 'https://linhas.vercel.app');
});

test('siteUrl do curado tem prioridade sobre o homepage', () => {
  const repos = [repo('linhas', { homepage: 'https://velho.example' })];
  const { cenas } = buildCatalog(repos, [curado('linhas', { siteUrl: 'https://novo.example' })]);
  assert.equal(cenas[0].siteUrl, 'https://novo.example');
});

test('repo publico fora do curado vai para o arquivo', () => {
  const { arquivo } = buildCatalog([repo('solto')], []);
  assert.equal(arquivo.length, 1);
  assert.equal(arquivo[0].nome, 'solto');
  assert.equal(arquivo[0].url, 'https://github.com/arthurmonteiroo11/solto');
});

test('repo curado nao se repete no arquivo', () => {
  const { arquivo } = buildCatalog([repo('linhas'), repo('solto')], [curado('linhas')]);
  assert.deepEqual(arquivo.map((a) => a.nome), ['solto']);
});

test('repo oculto fica fora das cenas e do arquivo', () => {
  const { cenas, arquivo } = buildCatalog(
    [repo('perfil')],
    [curado('perfil', { oculto: true })],
  );
  assert.deepEqual(cenas, []);
  assert.deepEqual(arquivo, []);
});

test('descricao e linguagem nulas viram string vazia', () => {
  const { arquivo } = buildCatalog([repo('vazio', { description: null, language: null })], []);
  assert.equal(arquivo[0].descricao, '');
  assert.equal(arquivo[0].linguagem, '');
});

test('fork nunca entra no arquivo', () => {
  const { arquivo } = buildCatalog([repo('copia', { fork: true })], []);
  assert.deepEqual(arquivo, []);
});
