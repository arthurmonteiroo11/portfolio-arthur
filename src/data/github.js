import cache from './repos-cache.json' with { type: 'json' };

const normalizar = (bruto) => ({
  name: bruto.name,
  description: bruto.description ?? '',
  language: bruto.language ?? '',
  url: bruto.html_url,
  homepage: bruto.homepage ?? '',
  fork: Boolean(bruto.fork),
});

const cabecalhos = () => {
  const token = globalThis.process?.env?.GITHUB_TOKEN;
  return {
    Accept: 'application/vnd.github+json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const fetchPublicRepos = async (owner, fetchImpl = fetch) => {
  const url = `https://api.github.com/users/${owner}/repos?per_page=100&sort=updated&type=owner`;
  try {
    const resposta = await fetchImpl(url, { headers: cabecalhos() });
    if (!resposta.ok) return cache;
    const corpo = await resposta.json();
    return corpo.filter((repo) => !repo.fork).map(normalizar);
  } catch {
    return cache;
  }
};
