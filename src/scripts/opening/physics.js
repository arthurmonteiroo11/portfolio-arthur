export const VELOCIDADE_MAXIMA = 3;

const RAIO_PONTEIRO = 0.14;
const FORCA_PONTEIRO = 55;
const RIGIDEZ_MOLA = 16;
const ATRITO_POR_QUADRO = 0.9;

export const stepParticles = (estado, ponteiro, dt) => {
  const { pos, vel, home } = estado;
  const coesao = estado.coesao ?? 1;
  const atrito = Math.pow(ATRITO_POR_QUADRO, dt * 60);

  for (let i = 0; i < pos.length; i += 2) {
    let ax = (home[i] - pos[i]) * RIGIDEZ_MOLA * coesao;
    let ay = (home[i + 1] - pos[i + 1]) * RIGIDEZ_MOLA * coesao;

    if (ponteiro.active) {
      const dx = pos[i] - ponteiro.x;
      const dy = pos[i + 1] - ponteiro.y;
      const distancia = Math.hypot(dx, dy);
      if (distancia < RAIO_PONTEIRO) {
        const direcaoX = distancia > 1e-6 ? dx / distancia : 1;
        const direcaoY = distancia > 1e-6 ? dy / distancia : 0;
        const intensidade = (1 - distancia / RAIO_PONTEIRO) * FORCA_PONTEIRO;
        ax += direcaoX * intensidade;
        ay += direcaoY * intensidade;
      }
    }

    let vx = (vel[i] + ax * dt) * atrito;
    let vy = (vel[i + 1] + ay * dt) * atrito;
    const velocidade = Math.hypot(vx, vy);
    if (velocidade > VELOCIDADE_MAXIMA) {
      vx = (vx / velocidade) * VELOCIDADE_MAXIMA;
      vy = (vy / velocidade) * VELOCIDADE_MAXIMA;
    }

    vel[i] = vx;
    vel[i + 1] = vy;
    pos[i] += vx * dt;
    pos[i + 1] += vy * dt;
  }
};
