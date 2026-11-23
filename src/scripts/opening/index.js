import { textToPoints } from './points.js';
import { stepParticles } from './physics.js';
import { criarRenderizador } from './gl.js';

const DPR_MAXIMO = 1.5;
const MAXIMO_DESKTOP = 5500;
const MAXIMO_CELULAR = 2200;
const QUADRO_MAXIMO = 1 / 30;

const maximoDePontos = () =>
  window.matchMedia('(max-width: 700px)').matches ? MAXIMO_CELULAR : MAXIMO_DESKTOP;

const medirTexto = (contexto, linhas) =>
  Math.max(...linhas.map((linha) => contexto.measureText(linha).width));

const amostrarNome = (nome, largura, altura) => {
  const tela = document.createElement('canvas');
  tela.width = largura;
  tela.height = altura;
  const contexto = tela.getContext('2d', { willReadFrequently: true });
  const linhas = nome.toUpperCase().split(' ');
  const familia = '"Bricolage Grotesque Variable", system-ui, sans-serif';

  contexto.font = `800 100px ${familia}`;
  const porLargura = ((largura * 0.84) / medirTexto(contexto, linhas)) * 100;
  const porAltura = (altura * 0.5) / (linhas.length * 0.95);
  const tamanho = Math.min(porLargura, porAltura);

  contexto.font = `800 ${tamanho}px ${familia}`;
  contexto.fillStyle = '#fff';
  contexto.textAlign = 'center';
  contexto.textBaseline = 'middle';
  const altura_linha = tamanho * 0.95;
  const topo = altura * 0.42 - ((linhas.length - 1) * altura_linha) / 2;
  linhas.forEach((linha, indice) => {
    contexto.fillText(linha, largura / 2, topo + indice * altura_linha);
  });

  const pixels = contexto.getImageData(0, 0, largura, altura).data;
  const alpha = new Uint8ClampedArray(largura * altura);
  for (let i = 0; i < alpha.length; i += 1) alpha[i] = pixels[i * 4 + 3];
  return alpha;
};

const escolherPontos = (alpha, largura, altura, maximo) => {
  let passo = 3;
  let pontos = textToPoints(alpha, largura, altura, passo);
  const quantidade = pontos.length / 2;
  if (quantidade > maximo) {
    passo = Math.ceil(passo * Math.sqrt(quantidade / maximo));
    pontos = textToPoints(alpha, largura, altura, passo);
  }
  return pontos;
};

const criarMeta = (quantidade, escalaBase) => {
  const meta = new Float32Array(quantidade * 2);
  for (let i = 0; i < quantidade; i += 1) {
    const sorteio = Math.random();
    meta[i * 2] = sorteio < 0.58 ? 0 : sorteio < 0.82 ? 1 : 2;
    meta[i * 2 + 1] = escalaBase * (0.75 + Math.random() * 0.75);
  }
  return meta;
};

const criarEstado = (pontos, aspecto, coesao) => {
  const pos = new Float32Array(pontos.length);
  const home = new Float32Array(pontos.length);
  for (let i = 0; i < pontos.length; i += 2) {
    home[i] = pontos[i] * aspecto;
    home[i + 1] = pontos[i + 1];
    pos[i] = Math.random() * aspecto;
    pos[i + 1] = Math.random();
  }
  return { pos, vel: new Float32Array(pontos.length), home, coesao };
};

export const startOpening = (canvas, nome) => {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: true });
  if (!gl) return null;
  let renderizador = criarRenderizador(gl);
  if (!renderizador) return null;

  const ponteiro = { x: 0, y: 0, active: false };
  let estado = null;
  let aspecto = 1;
  let escala = 1;
  let largura = 0;
  let altura = 0;
  let movimento = 0;
  let ultimoPonteiro = null;
  let inicio = performance.now();
  let anterior = inicio;
  let quadro = 0;
  let destruido = false;
  let visivel = true;
  let temporizador = 0;

  const rodando = () => !destruido && visivel && !document.hidden;

  const construir = async () => {
    await document.fonts.ready;
    await document.fonts.load('800 100px "Bricolage Grotesque Variable"');
    if (destruido) return;

    const cssLargura = Math.max(1, Math.round(canvas.clientWidth));
    const cssAltura = Math.max(1, Math.round(canvas.clientHeight));
    escala = Math.min(window.devicePixelRatio || 1, DPR_MAXIMO);
    largura = Math.round(cssLargura * escala);
    altura = Math.round(cssAltura * escala);
    canvas.width = largura;
    canvas.height = altura;
    aspecto = cssLargura / cssAltura;

    const alpha = amostrarNome(nome, cssLargura, cssAltura);
    const pontos = escolherPontos(alpha, cssLargura, cssAltura, maximoDePontos());
    const coesao = estado ? estado.coesao : 0;
    estado = criarEstado(pontos, aspecto, coesao);
    const tamanhoBase = (cssLargura < 700 ? 3.2 : 4.4);
    renderizador.carregar(estado.pos, criarMeta(pontos.length / 2, tamanhoBase));
    canvas.dataset.estado = 'ativo';
    agendar();
  };

  const alvoDeCoesao = (agora) => {
    const decorrido = (agora - inicio) / 1000;
    const porTempo = Math.min(1, Math.max(0, (decorrido - 1) / 6));
    const porMovimento = Math.min(1, movimento * 0.9);
    return Math.max(porTempo, porMovimento);
  };

  const passo = (agora) => {
    quadro = 0;
    if (!rodando() || !estado) return;
    const dt = Math.min(QUADRO_MAXIMO, (agora - anterior) / 1000);
    anterior = agora;
    estado.coesao += (alvoDeCoesao(agora) - estado.coesao) * Math.min(1, dt * 3);
    stepParticles(estado, ponteiro, dt);
    renderizador.desenhar(estado.pos, aspecto, escala, largura, altura);
    agendar();
  };

  function agendar() {
    if (quadro || !rodando() || !estado) return;
    anterior = performance.now();
    quadro = requestAnimationFrame(passo);
  }

  const aoMover = (evento) => {
    const caixa = canvas.getBoundingClientRect();
    const dentro =
      evento.clientX >= caixa.left &&
      evento.clientX <= caixa.right &&
      evento.clientY >= caixa.top &&
      evento.clientY <= caixa.bottom;
    ponteiro.active = dentro;
    if (!dentro) {
      ultimoPonteiro = null;
      return;
    }
    ponteiro.x = ((evento.clientX - caixa.left) / caixa.width) * aspecto;
    ponteiro.y = (evento.clientY - caixa.top) / caixa.height;
    if (ultimoPonteiro) {
      movimento += Math.hypot(ponteiro.x - ultimoPonteiro.x, ponteiro.y - ultimoPonteiro.y);
    }
    ultimoPonteiro = { x: ponteiro.x, y: ponteiro.y };
  };

  const aoSoltar = () => {
    ponteiro.active = false;
    ultimoPonteiro = null;
  };

  const aoMudarVisibilidade = () => agendar();

  const aoPerderContexto = (evento) => {
    evento.preventDefault();
    canvas.dataset.estado = 'inativo';
    if (quadro) cancelAnimationFrame(quadro);
    quadro = 0;
  };

  const aoRestaurarContexto = () => {
    renderizador = criarRenderizador(gl);
    if (renderizador) construir();
  };

  const redimensionar = () => {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => {
      const novaLargura = Math.round(canvas.clientWidth * escala);
      const novaAltura = Math.round(canvas.clientHeight * escala);
      const mudouLargura = novaLargura !== largura;
      const mudouAltura = Math.abs(novaAltura - altura) / Math.max(altura, 1) > 0.25;
      if (mudouLargura || mudouAltura) construir();
    }, 180);
  };

  const observadorTamanho = new ResizeObserver(redimensionar);
  const observadorVisao = new IntersectionObserver((entradas) => {
    visivel = entradas[0].isIntersecting;
    agendar();
  });

  window.addEventListener('pointermove', aoMover, { passive: true });
  window.addEventListener('pointerdown', aoMover, { passive: true });
  window.addEventListener('pointerup', aoSoltar, { passive: true });
  window.addEventListener('pointercancel', aoSoltar, { passive: true });
  document.addEventListener('visibilitychange', aoMudarVisibilidade);
  canvas.addEventListener('webglcontextlost', aoPerderContexto);
  canvas.addEventListener('webglcontextrestored', aoRestaurarContexto);
  observadorTamanho.observe(canvas);
  observadorVisao.observe(canvas);

  construir();

  const destroy = () => {
    destruido = true;
    clearTimeout(temporizador);
    if (quadro) cancelAnimationFrame(quadro);
    window.removeEventListener('pointermove', aoMover);
    window.removeEventListener('pointerdown', aoMover);
    window.removeEventListener('pointerup', aoSoltar);
    window.removeEventListener('pointercancel', aoSoltar);
    document.removeEventListener('visibilitychange', aoMudarVisibilidade);
    canvas.removeEventListener('webglcontextlost', aoPerderContexto);
    canvas.removeEventListener('webglcontextrestored', aoRestaurarContexto);
    observadorTamanho.disconnect();
    observadorVisao.disconnect();
    if (renderizador) renderizador.destruir();
    canvas.dataset.estado = 'inativo';
  };

  return { destroy };
};
