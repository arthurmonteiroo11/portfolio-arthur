const CHAVE = 'animacoes-forcadas';

export const calcularReduzido = (sistemaPedeReduzir, forcado) => sistemaPedeReduzir && !forcado;

export const lerForcado = (armazenamento) => {
  try {
    return armazenamento.getItem(CHAVE) === '1';
  } catch {
    return false;
  }
};

export const gravarForcado = (armazenamento, ligado) => {
  try {
    if (ligado) armazenamento.setItem(CHAVE, '1');
    else armazenamento.removeItem(CHAVE);
  } catch {
    return;
  }
};

const armazenamentoDoNavegador = () => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

export const sistemaPedeReduzir = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const movimentoReduzido = () =>
  calcularReduzido(sistemaPedeReduzir(), lerForcado(armazenamentoDoNavegador()));

export const animacoesForcadas = () => lerForcado(armazenamentoDoNavegador());

export const forcarAnimacoes = (ligado) => gravarForcado(armazenamentoDoNavegador(), ligado);
