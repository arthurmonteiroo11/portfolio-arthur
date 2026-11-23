const CAMINHO = [
  [40, 250],
  [40, 170],
  [120, 90],
  [280, 90],
  [360, 170],
  [360, 250],
];

const LINHAS_FUNDO = [
  [
    [20, 60],
    [140, 60],
    [200, 120],
    [200, 300],
  ],
  [
    [400, 200],
    [300, 200],
    [240, 260],
    [240, 300],
  ],
];

const ESTACOES = [0, 0.25, 0.5, 0.75, 1];
const ANO_INICIAL = 1974;
const ANO_FINAL = 2026;
const NS = 'http://www.w3.org/2000/svg';

const medirTrechos = (pontos) => {
  const trechos = [];
  for (let i = 0; i < pontos.length - 1; i += 1) {
    const [ax, ay] = pontos[i];
    const [bx, by] = pontos[i + 1];
    trechos.push(Math.hypot(bx - ax, by - ay));
  }
  return trechos;
};

const somar = (valores) => valores.reduce((total, valor) => total + valor, 0);

export const projetarNoCaminho = (pontos, x, y) => {
  const trechos = medirTrechos(pontos);
  const total = somar(trechos);
  let melhor = { distancia: Infinity, t: 0 };
  let acumulado = 0;

  trechos.forEach((comprimento, i) => {
    const [ax, ay] = pontos[i];
    const [bx, by] = pontos[i + 1];
    const dx = bx - ax;
    const dy = by - ay;
    const bruto = comprimento > 0 ? ((x - ax) * dx + (y - ay) * dy) / (comprimento * comprimento) : 0;
    const u = Math.min(1, Math.max(0, bruto));
    const distancia = Math.hypot(x - (ax + dx * u), y - (ay + dy * u));
    if (distancia < melhor.distancia) {
      melhor = { distancia, t: (acumulado + u * comprimento) / total };
    }
    acumulado += comprimento;
  });

  return melhor.t;
};

export const pontoNoCaminho = (pontos, t) => {
  const trechos = medirTrechos(pontos);
  const alvo = Math.min(1, Math.max(0, t)) * somar(trechos);
  let acumulado = 0;

  for (let i = 0; i < trechos.length; i += 1) {
    if (alvo <= acumulado + trechos[i]) {
      const u = trechos[i] > 0 ? (alvo - acumulado) / trechos[i] : 0;
      const [ax, ay] = pontos[i];
      const [bx, by] = pontos[i + 1];
      return [ax + (bx - ax) * u, ay + (by - ay) * u];
    }
    acumulado += trechos[i];
  }
  return pontos[pontos.length - 1];
};

export const caminhoAte = (pontos, t) => {
  const trechos = medirTrechos(pontos);
  const alvo = Math.min(1, Math.max(0, t)) * somar(trechos);
  const resultado = [pontos[0]];
  let acumulado = 0;

  for (let i = 0; i < trechos.length; i += 1) {
    if (alvo >= acumulado + trechos[i]) {
      resultado.push(pontos[i + 1]);
      acumulado += trechos[i];
      continue;
    }
    if (alvo > acumulado) {
      const u = (alvo - acumulado) / trechos[i];
      const [ax, ay] = pontos[i];
      const [bx, by] = pontos[i + 1];
      resultado.push([ax + (bx - ax) * u, ay + (by - ay) * u]);
    }
    break;
  }
  return resultado;
};

const criar = (tag, atributos = {}) => {
  const no = document.createElementNS(NS, tag);
  Object.entries(atributos).forEach(([nome, valor]) => no.setAttribute(nome, String(valor)));
  return no;
};

const emTexto = (pontos) => pontos.map(([x, y]) => `${x},${y}`).join(' ');

const anoDe = (t) => Math.round(ANO_INICIAL + t * (ANO_FINAL - ANO_INICIAL));

export const montarLinhas = (el) => {
  const cor = getComputedStyle(el).getPropertyValue('--cor').trim() || '#ff7a1a';

  const svg = criar('svg', {
    class: 'toy-svg',
    viewBox: '0 0 400 300',
    preserveAspectRatio: 'xMidYMid meet',
    'aria-hidden': 'false',
  });

  LINHAS_FUNDO.forEach((linha) => {
    svg.append(
      criar('polyline', {
        points: emTexto(linha),
        fill: 'none',
        stroke: cor,
        'stroke-opacity': 0.14,
        'stroke-width': 8,
        'stroke-linejoin': 'round',
        'stroke-linecap': 'round',
      }),
    );
  });

  svg.append(
    criar('polyline', {
      points: emTexto(CAMINHO),
      fill: 'none',
      stroke: cor,
      'stroke-opacity': 0.3,
      'stroke-width': 10,
      'stroke-linejoin': 'round',
      'stroke-linecap': 'round',
    }),
  );

  const progresso = criar('polyline', {
    points: emTexto(caminhoAte(CAMINHO, 0)),
    fill: 'none',
    stroke: cor,
    'stroke-width': 10,
    'stroke-linejoin': 'round',
    'stroke-linecap': 'round',
  });
  svg.append(progresso);

  const estacoes = ESTACOES.map((fracao) => {
    const [x, y] = pontoNoCaminho(CAMINHO, fracao);
    const circulo = criar('circle', {
      cx: x,
      cy: y,
      r: 9,
      fill: '#0d0e12',
      stroke: '#f2efe8',
      'stroke-width': 3,
    });
    svg.append(circulo);
    return { fracao, circulo };
  });

  const vagao = criar('g', {
    class: 'toy-vagao',
    tabindex: 0,
    role: 'slider',
    'aria-label': 'Avançar no tempo, de 1974 a 2026',
    'aria-valuemin': ANO_INICIAL,
    'aria-valuemax': ANO_FINAL,
    'aria-valuenow': ANO_INICIAL,
    'aria-valuetext': `Ano ${ANO_INICIAL}`,
    'data-dica': 'on',
  });
  vagao.append(
    criar('circle', { class: 'toy-aura', r: 26, fill: cor, 'fill-opacity': 0.25 }),
    criar('circle', { r: 30, fill: 'transparent' }),
    criar('rect', { x: -17, y: -10, width: 34, height: 20, rx: 6, fill: cor }),
    criar('rect', { x: -11, y: -5, width: 7, height: 6, rx: 1.5, fill: '#0d0e12' }),
    criar('rect', { x: -1, y: -5, width: 7, height: 6, rx: 1.5, fill: '#0d0e12' }),
    criar('rect', { x: 9, y: -5, width: 5, height: 6, rx: 1.5, fill: '#0d0e12' }),
  );
  svg.append(vagao);

  const ano = document.createElement('p');
  ano.className = 'toy-ano';
  ano.textContent = String(ANO_INICIAL);

  const dica = document.createElement('p');
  dica.className = 'toy-dica';
  dica.textContent = 'Arraste o vagão pela linha';

  el.append(svg, ano, dica);

  let t = 0;
  let arrastando = false;

  const atualizar = (novoT) => {
    t = Math.min(1, Math.max(0, novoT));
    progresso.setAttribute('points', emTexto(caminhoAte(CAMINHO, t)));
    const [x, y] = pontoNoCaminho(CAMINHO, t);
    const antes = pontoNoCaminho(CAMINHO, t - 0.01);
    const depois = pontoNoCaminho(CAMINHO, t + 0.01);
    const angulo = (Math.atan2(depois[1] - antes[1], depois[0] - antes[0]) * 180) / Math.PI;
    vagao.setAttribute('transform', `translate(${x} ${y}) rotate(${angulo})`);
    estacoes.forEach(({ fracao, circulo }) => {
      circulo.setAttribute('fill', t >= fracao - 1e-6 ? '#f2efe8' : '#0d0e12');
    });
    const valor = anoDe(t);
    ano.textContent = String(valor);
    vagao.setAttribute('aria-valuenow', valor);
    vagao.setAttribute('aria-valuetext', `Ano ${valor}`);
  };

  const esconderDica = () => {
    vagao.setAttribute('data-dica', 'off');
    dica.setAttribute('data-oculta', 'true');
  };

  const noSvg = (evento) => {
    const ponto = svg.createSVGPoint();
    ponto.x = evento.clientX;
    ponto.y = evento.clientY;
    const convertido = ponto.matrixTransform(svg.getScreenCTM().inverse());
    return [convertido.x, convertido.y];
  };

  const aoPressionar = (evento) => {
    arrastando = true;
    vagao.setPointerCapture(evento.pointerId);
    esconderDica();
  };

  const aoArrastar = (evento) => {
    if (!arrastando) return;
    const [x, y] = noSvg(evento);
    atualizar(projetarNoCaminho(CAMINHO, x, y));
  };

  const aoSoltar = (evento) => {
    arrastando = false;
    if (vagao.hasPointerCapture(evento.pointerId)) vagao.releasePointerCapture(evento.pointerId);
  };

  const aoTeclar = (evento) => {
    const passos = {
      ArrowRight: 1,
      ArrowUp: 1,
      ArrowLeft: -1,
      ArrowDown: -1,
      PageUp: 5,
      PageDown: -5,
    };
    const total = ANO_FINAL - ANO_INICIAL;
    if (evento.key === 'Home') atualizar(0);
    else if (evento.key === 'End') atualizar(1);
    else if (evento.key in passos) atualizar(t + passos[evento.key] / total);
    else return;
    evento.preventDefault();
    esconderDica();
  };

  vagao.addEventListener('pointerdown', aoPressionar);
  vagao.addEventListener('pointermove', aoArrastar);
  vagao.addEventListener('pointerup', aoSoltar);
  vagao.addEventListener('pointercancel', aoSoltar);
  vagao.addEventListener('keydown', aoTeclar);
  atualizar(0);

  return () => {
    vagao.removeEventListener('pointerdown', aoPressionar);
    vagao.removeEventListener('pointermove', aoArrastar);
    vagao.removeEventListener('pointerup', aoSoltar);
    vagao.removeEventListener('pointercancel', aoSoltar);
    vagao.removeEventListener('keydown', aoTeclar);
    svg.remove();
    ano.remove();
    dica.remove();
  };
};
