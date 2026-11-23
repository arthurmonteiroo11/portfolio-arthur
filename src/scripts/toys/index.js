import { montarFormas } from './formas.js';
import { montarLinhas } from './linhas.js';

const REGISTRO = {
  linhas: montarLinhas,
  formas: montarFormas,
};

export const obterToy = (nome) => (Object.hasOwn(REGISTRO, nome) ? REGISTRO[nome] : montarFormas);

export const mountToy = (nome, el) => obterToy(nome)(el);
