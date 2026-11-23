const QUANTIDADE = 34;
const TIPOS = ['circulo', 'quadrado', 'triangulo'];
const DPR_MAXIMO = 1.5;

const criarFormas = () =>
  Array.from({ length: QUANTIDADE }, (_, i) => ({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    tipo: TIPOS[i % TIPOS.length],
    tamanho: 9 + Math.random() * 15,
    rigidez: 5 + Math.random() * 9,
    angulo: Math.random() * Math.PI * 2,
    giro: (Math.random() - 0.5) * 2.4,
    fase: Math.random() * Math.PI * 2,
    contorno: i % 2 === 0,
  }));

const desenharForma = (ctx, forma, cor) => {
  ctx.save();
  ctx.translate(forma.x, forma.y);
  ctx.rotate(forma.angulo);
  ctx.beginPath();
  const r = forma.tamanho / 2;
  if (forma.tipo === 'circulo') {
    ctx.arc(0, 0, r, 0, Math.PI * 2);
  } else if (forma.tipo === 'quadrado') {
    ctx.rect(-r, -r, r * 2, r * 2);
  } else {
    ctx.moveTo(0, -r * 1.15);
    ctx.lineTo(r * 1.05, r * 0.75);
    ctx.lineTo(-r * 1.05, r * 0.75);
    ctx.closePath();
  }
  if (forma.contorno) {
    ctx.strokeStyle = cor;
    ctx.lineWidth = 2;
    ctx.stroke();
  } else {
    ctx.fillStyle = cor;
    ctx.fill();
  }
  ctx.restore();
};

export const montarFormas = (el) => {
  const cor = getComputedStyle(el).getPropertyValue('--cor').trim() || '#ffb347';
  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tela = document.createElement('canvas');
  tela.className = 'toy-tela';
  el.append(tela);
  const ctx = tela.getContext('2d');
  const formas = criarFormas();
  const ponteiro = { x: 0, y: 0, ativo: false };
  let largura = 0;
  let altura = 0;
  let quadro = 0;
  let anterior = 0;
  let inicializado = false;

  const espalhar = () => {
    formas.forEach((forma) => {
      forma.x = Math.random() * largura;
      forma.y = Math.random() * altura;
    });
  };

  const medir = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_MAXIMO);
    largura = el.clientWidth;
    altura = el.clientHeight;
    tela.width = Math.max(1, Math.round(largura * dpr));
    tela.height = Math.max(1, Math.round(altura * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!inicializado) {
      espalhar();
      inicializado = true;
    }
    if (reduzido) desenharQuadroEstatico();
  };

  const alvoDe = (forma, agora) => {
    const respiracao = agora * 0.0016 + forma.fase;
    if (ponteiro.ativo) {
      const orbita = 28 + forma.tamanho * 2.2;
      return [
        ponteiro.x + Math.cos(respiracao) * orbita,
        ponteiro.y + Math.sin(respiracao * 1.3) * orbita,
      ];
    }
    return [
      largura / 2 + Math.cos(respiracao) * largura * 0.32,
      altura / 2 + Math.sin(respiracao * 1.2) * altura * 0.3,
    ];
  };

  function desenharQuadroEstatico() {
    ctx.clearRect(0, 0, largura, altura);
    formas.forEach((forma, i) => {
      const [x, y] = alvoDe(forma, i * 400);
      forma.x = x;
      forma.y = y;
      desenharForma(ctx, forma, cor);
    });
  }

  const passo = (agora) => {
    quadro = 0;
    if (document.hidden) return;
    const dt = Math.min(0.033, (agora - anterior) / 1000 || 0.016);
    anterior = agora;
    const atrito = Math.pow(0.9, dt * 60);
    ctx.clearRect(0, 0, largura, altura);
    formas.forEach((forma) => {
      const [alvoX, alvoY] = alvoDe(forma, agora);
      forma.vx = (forma.vx + (alvoX - forma.x) * forma.rigidez * dt) * atrito;
      forma.vy = (forma.vy + (alvoY - forma.y) * forma.rigidez * dt) * atrito;
      forma.x += forma.vx * dt;
      forma.y += forma.vy * dt;
      forma.angulo += forma.giro * dt;
      desenharForma(ctx, forma, cor);
    });
    agendar();
  };

  function agendar() {
    if (quadro || reduzido) return;
    quadro = requestAnimationFrame(passo);
  }

  const posicao = (evento) => {
    const caixa = el.getBoundingClientRect();
    ponteiro.x = evento.clientX - caixa.left;
    ponteiro.y = evento.clientY - caixa.top;
  };

  const aoMover = (evento) => {
    posicao(evento);
    ponteiro.ativo = true;
  };

  const aoSair = () => {
    ponteiro.ativo = false;
  };

  const aoPressionar = (evento) => {
    posicao(evento);
    ponteiro.ativo = true;
    formas.forEach((forma) => {
      const dx = forma.x - ponteiro.x;
      const dy = forma.y - ponteiro.y;
      const distancia = Math.hypot(dx, dy) || 1;
      const impulso = 380 + Math.random() * 420;
      forma.vx += (dx / distancia) * impulso;
      forma.vy += (dy / distancia) * impulso;
    });
  };

  const aoMudarVisibilidade = () => agendar();

  const observador = new ResizeObserver(medir);
  observador.observe(el);
  el.addEventListener('pointermove', aoMover);
  el.addEventListener('pointerdown', aoPressionar);
  el.addEventListener('pointerleave', aoSair);
  el.addEventListener('pointercancel', aoSair);
  document.addEventListener('visibilitychange', aoMudarVisibilidade);
  medir();
  agendar();

  return () => {
    if (quadro) cancelAnimationFrame(quadro);
    observador.disconnect();
    el.removeEventListener('pointermove', aoMover);
    el.removeEventListener('pointerdown', aoPressionar);
    el.removeEventListener('pointerleave', aoSair);
    el.removeEventListener('pointercancel', aoSair);
    document.removeEventListener('visibilitychange', aoMudarVisibilidade);
    tela.remove();
  };
};
