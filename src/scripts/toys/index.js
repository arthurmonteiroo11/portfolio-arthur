import { montarFormas } from './formas.js';
import { montarLinhas } from './linhas.js';
import { montarTelas } from './telas.js';

const REGISTRO = {
  linhas: montarLinhas,
  formas: montarFormas,
  telas: montarTelas,
};

export const obterToy = (nome) => (Object.hasOwn(REGISTRO, nome) ? REGISTRO[nome] : montarFormas);

export const mountToy = (nome, el) => obterToy(nome)(el);
