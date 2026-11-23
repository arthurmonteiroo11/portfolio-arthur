const textoOuNulo = (valor) => (valor ? valor : null);

const montarCena = (curado, repo) => {
  const privado = Boolean(curado.privado);
  return {
    id: curado.id,
    titulo: curado.titulo,
    texto: curado.texto,
    cor: curado.cor,
    toy: curado.toy,
    dificuldade: curado.dificuldade,
    tecnologias: curado.tecnologias ?? [],
    telas: curado.telas ?? [],
    formato: curado.formatoTelas ?? 'celular',
    privado,
    repoUrl: privado ? null : (repo?.url ?? null),
    siteUrl: textoOuNulo(curado.siteUrl) ?? (privado ? null : textoOuNulo(repo?.homepage)),
  };
};

const montarItemArquivo = (repo) => ({
  nome: repo.name,
  descricao: repo.description ?? '',
  linguagem: repo.language ?? '',
  url: repo.url,
  siteUrl: textoOuNulo(repo.homepage),
});

export const buildCatalog = (repos, curated) => {
  const publicos = repos.filter((repo) => !repo.fork);
  const porNome = new Map(publicos.map((repo) => [repo.name, repo]));
  const reivindicados = new Set(curated.map((c) => c.repo).filter(Boolean));

  const cenas = curated
    .filter((curado) => !curado.oculto)
    .sort((a, b) => a.dificuldade - b.dificuldade)
    .map((curado) => montarCena(curado, porNome.get(curado.repo)));

  const arquivo = publicos
    .filter((repo) => !reivindicados.has(repo.name))
    .map(montarItemArquivo);

  return { cenas, arquivo };
};
