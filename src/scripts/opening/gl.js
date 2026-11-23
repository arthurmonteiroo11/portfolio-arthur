const VERTEX = `
attribute vec2 a_pos;
attribute float a_forma;
attribute float a_tamanho;
uniform float u_aspecto;
uniform float u_escala;
varying float v_forma;
void main() {
  vec2 p = vec2(a_pos.x / u_aspecto, a_pos.y);
  gl_Position = vec4(p.x * 2.0 - 1.0, 1.0 - p.y * 2.0, 0.0, 1.0);
  gl_PointSize = a_tamanho * u_escala;
  v_forma = a_forma;
}
`;

const FRAGMENT = `
precision mediump float;
varying float v_forma;
uniform vec3 u_cor_a;
uniform vec3 u_cor_b;
uniform vec3 u_cor_c;
void main() {
  vec2 c = gl_PointCoord * 2.0 - 1.0;
  float d;
  vec3 cor;
  if (v_forma < 0.5) {
    d = length(c);
    cor = u_cor_a;
  } else if (v_forma < 1.5) {
    d = max(abs(c.x), abs(c.y));
    cor = u_cor_b;
  } else {
    d = abs(c.x) + abs(c.y);
    cor = u_cor_c;
  }
  if (d > 0.95) discard;
  gl_FragColor = vec4(cor, 1.0);
}
`;

const COR_A = [0.949, 0.937, 0.91];
const COR_B = [1.0, 0.702, 0.278];
const COR_C = [0.486, 0.549, 1.0];

const compilar = (gl, tipo, fonte) => {
  const shader = gl.createShader(tipo);
  gl.shaderSource(shader, fonte);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};

const ligar = (gl) => {
  const vertex = compilar(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = compilar(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  if (!vertex || !fragment) return null;
  const programa = gl.createProgram();
  gl.attachShader(programa, vertex);
  gl.attachShader(programa, fragment);
  gl.linkProgram(programa);
  if (!gl.getProgramParameter(programa, gl.LINK_STATUS)) return null;
  return programa;
};

export const criarRenderizador = (gl) => {
  const programa = ligar(gl);
  if (!programa) return null;

  const bufferPos = gl.createBuffer();
  const bufferMeta = gl.createBuffer();
  const local = {
    pos: gl.getAttribLocation(programa, 'a_pos'),
    forma: gl.getAttribLocation(programa, 'a_forma'),
    tamanho: gl.getAttribLocation(programa, 'a_tamanho'),
    aspecto: gl.getUniformLocation(programa, 'u_aspecto'),
    escala: gl.getUniformLocation(programa, 'u_escala'),
  };
  let quantidade = 0;

  gl.useProgram(programa);
  gl.uniform3fv(gl.getUniformLocation(programa, 'u_cor_a'), COR_A);
  gl.uniform3fv(gl.getUniformLocation(programa, 'u_cor_b'), COR_B);
  gl.uniform3fv(gl.getUniformLocation(programa, 'u_cor_c'), COR_C);
  gl.clearColor(0, 0, 0, 0);

  const carregar = (pos, meta) => {
    quantidade = pos.length / 2;
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferPos);
    gl.bufferData(gl.ARRAY_BUFFER, pos, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferMeta);
    gl.bufferData(gl.ARRAY_BUFFER, meta, gl.STATIC_DRAW);
  };

  const desenhar = (pos, aspecto, escala, largura, altura) => {
    gl.viewport(0, 0, largura, altura);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(programa);
    gl.uniform1f(local.aspecto, aspecto);
    gl.uniform1f(local.escala, escala);

    gl.bindBuffer(gl.ARRAY_BUFFER, bufferPos);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, pos);
    gl.enableVertexAttribArray(local.pos);
    gl.vertexAttribPointer(local.pos, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, bufferMeta);
    gl.enableVertexAttribArray(local.forma);
    gl.vertexAttribPointer(local.forma, 1, gl.FLOAT, false, 8, 0);
    gl.enableVertexAttribArray(local.tamanho);
    gl.vertexAttribPointer(local.tamanho, 1, gl.FLOAT, false, 8, 4);

    gl.drawArrays(gl.POINTS, 0, quantidade);
  };

  const destruir = () => {
    gl.deleteBuffer(bufferPos);
    gl.deleteBuffer(bufferMeta);
    gl.deleteProgram(programa);
  };

  return { carregar, desenhar, destruir };
};
