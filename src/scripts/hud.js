export const formatarProgresso = (indice, total) => {
  if (indice <= 0) return 'Início';
  if (indice > total) return 'Fim de jogo';
  return `${indice} / ${total}`;
};

export const setHud = (indice, total) => {
  const valor = document.querySelector('[data-hud-valor]');
  if (!valor) return;
  const texto = formatarProgresso(indice, total);
  if (valor.textContent === texto) return;
  valor.textContent = texto;
  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduzido) return;
  valor.animate(
    [
      { transform: 'translateY(45%)', opacity: 0 },
      { transform: 'translateY(0)', opacity: 1 },
    ],
    { duration: 320, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
  );
};
