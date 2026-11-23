export const criarControleDeContexto = () => {
  let perdido = false;
  return {
    perder: () => {
      perdido = true;
    },
    restaurar: (renderizadorCriado) => {
      if (renderizadorCriado) perdido = false;
    },
    podeRodar: () => !perdido,
  };
};
