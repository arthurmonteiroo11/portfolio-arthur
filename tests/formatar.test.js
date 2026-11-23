import { test } from 'node:test';
import assert from 'node:assert/strict';
import { semProtocolo } from '../src/data/formatar.js';

test('remove https:// do link', () => {
  assert.equal(semProtocolo('https://github.com/arthurmonteiroo11'), 'github.com/arthurmonteiroo11');
});

test('remove a barra final', () => {
  assert.equal(semProtocolo('https://linhas.vercel.app/'), 'linhas.vercel.app');
});

test('remove mailto: do e-mail', () => {
  assert.equal(semProtocolo('mailto:arthur.silvamonteiro@hotmail.com'), 'arthur.silvamonteiro@hotmail.com');
});

test('texto sem protocolo continua igual', () => {
  assert.equal(semProtocolo('arthur.silvamonteiro@hotmail.com'), 'arthur.silvamonteiro@hotmail.com');
});
