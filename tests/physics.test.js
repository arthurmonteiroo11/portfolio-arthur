import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stepParticles, VELOCIDADE_MAXIMA } from '../src/scripts/opening/physics.js';

const DT = 1 / 60;

const criarEstado = (pos, home, coesao = 1) => ({
  pos: new Float32Array(pos),
  vel: new Float32Array(pos.length),
  home: new Float32Array(home),
  coesao,
});

const rodar = (estado, ponteiro, passos) => {
  for (let i = 0; i < passos; i += 1) stepParticles(estado, ponteiro, DT);
};

test('ponteiro ativo afasta particula proxima', () => {
  const estado = criarEstado([0.5, 0.5], [0.5, 0.5]);
  stepParticles(estado, { x: 0.45, y: 0.5, active: true }, DT);
  assert.ok(estado.vel[0] > 0);
  assert.ok(Math.abs(estado.vel[1]) < 1e-6);
});

test('ponteiro inativo nao afasta ninguem', () => {
  const estado = criarEstado([0.5, 0.5], [0.5, 0.5]);
  stepParticles(estado, { x: 0.5, y: 0.5, active: false }, DT);
  assert.equal(estado.vel[0], 0);
  assert.equal(estado.vel[1], 0);
});

test('ponteiro longe nao afeta a particula', () => {
  const estado = criarEstado([0.5, 0.5], [0.5, 0.5]);
  stepParticles(estado, { x: 0.9, y: 0.9, active: true }, DT);
  assert.equal(estado.vel[0], 0);
  assert.equal(estado.vel[1], 0);
});

test('sem ponteiro a particula volta para home', () => {
  const estado = criarEstado([0.9, 0.9], [0.5, 0.5]);
  rodar(estado, { x: 0, y: 0, active: false }, 400);
  const distancia = Math.hypot(estado.pos[0] - 0.5, estado.pos[1] - 0.5);
  assert.ok(distancia < 0.02);
});

test('sem coesao a particula nao e puxada para home', () => {
  const estado = criarEstado([0.9, 0.9], [0.5, 0.5], 0);
  rodar(estado, { x: 0, y: 0, active: false }, 120);
  assert.equal(estado.pos[0], Math.fround(0.9));
  assert.equal(estado.pos[1], Math.fround(0.9));
});

test('velocidade nao cresce sem limite', () => {
  const estado = criarEstado([0.5, 0.5], [0.5, 0.5]);
  for (let i = 0; i < 300; i += 1) {
    stepParticles(estado, { x: 0.5001, y: 0.5, active: true }, DT);
    assert.ok(Math.hypot(estado.vel[0], estado.vel[1]) <= VELOCIDADE_MAXIMA + 1e-6);
  }
});

test('processa varias particulas de forma independente', () => {
  const estado = criarEstado([0.5, 0.5, 0.1, 0.1], [0.5, 0.5, 0.1, 0.1]);
  stepParticles(estado, { x: 0.45, y: 0.5, active: true }, DT);
  assert.ok(estado.vel[0] > 0);
  assert.equal(estado.vel[2], 0);
  assert.equal(estado.vel[3], 0);
});
