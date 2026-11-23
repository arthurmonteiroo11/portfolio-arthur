export const posicaoNaPilha = (indice, atual, total) => (indice - atual + total) % total;

export const proximoIndice = (atual, total) => (total > 1 ? (atual + 1) % total : 0);
