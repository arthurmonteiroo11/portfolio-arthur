import { posicaoNaPilha, proximoIndice } from './pilha.js';

const DIMENSOES = {
  celular: [540, 1053],
  janela: [960, 477],
};

const lerTelas = (el) => {
  try {
    const lista = JSON.parse(el.dataset.telas ?? '[]');
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
};

const criarCelular = ({ src, alt }, [largura, altura]) => {
  const celular = document.createElement('div');
  celular.className = 'toy-celular';
  const imagem = document.createElement('img');
  imagem.src = src;
  imagem.alt = '';
  imagem.width = largura;
  imagem.height = altura;
  imagem.decoding = 'async';
  imagem.draggable = false;
  celular.append(imagem);
  celular.dataset.alt = alt;
  return celular;
};

export const montarTelas = (el) => {
  const telas = lerTelas(el);
  if (telas.length === 0) return () => {};

  const formato = Object.hasOwn(DIMENSOES, el.dataset.formato) ? el.dataset.formato : 'celular';
  const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const raiz = document.createElement('div');
  raiz.className = 'toy-telas';
  raiz.dataset.formato = formato;

  const pilha = document.createElement('div');
  pilha.className = 'toy-pilha';
  const celulares = telas.map((tela) => criarCelular(tela, DIMENSOES[formato]));
  pilha.append(...celulares);

  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = 'toy-telas-botao';

  const dica = document.createElement('p');
  dica.className = 'toy-dica';
  dica.textContent = telas.length > 1 ? 'Toque para trocar de tela' : '';

  raiz.append(pilha, botao, dica);
  el.append(raiz);

  let atual = 0;

  const atualizar = () => {
    celulares.forEach((celular, indice) => {
      celular.dataset.pos = String(posicaoNaPilha(indice, atual, celulares.length));
      celular.setAttribute('aria-hidden', indice === atual ? 'false' : 'true');
    });
    botao.setAttribute(
      'aria-label',
      `${celulares[atual].dataset.alt}. Tela ${atual + 1} de ${celulares.length}. Ativar para ver a próxima.`,
    );
  };

  const aoClicar = () => {
    atual = proximoIndice(atual, celulares.length);
    dica.dataset.oculta = 'true';
    atualizar();
  };

  const aoMover = (evento) => {
    if (reduzir) return;
    const caixa = raiz.getBoundingClientRect();
    const x = (evento.clientX - caixa.left) / caixa.width - 0.5;
    const y = (evento.clientY - caixa.top) / caixa.height - 0.5;
    pilha.style.setProperty('--inclina-x', `${(y * -8).toFixed(2)}deg`);
    pilha.style.setProperty('--inclina-y', `${(x * 10).toFixed(2)}deg`);
  };

  const aoSair = () => {
    pilha.style.setProperty('--inclina-x', '0deg');
    pilha.style.setProperty('--inclina-y', '0deg');
  };

  botao.addEventListener('click', aoClicar);
  raiz.addEventListener('pointermove', aoMover);
  raiz.addEventListener('pointerleave', aoSair);
  atualizar();

  return () => {
    botao.removeEventListener('click', aoClicar);
    raiz.removeEventListener('pointermove', aoMover);
    raiz.removeEventListener('pointerleave', aoSair);
    raiz.remove();
  };
};
