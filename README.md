# TheKingArthur

Portfólio de Arthur Monteiro: uma abertura em WebGL em que o nome se monta com o mouse e uma fase em tela cheia para cada projeto, do mais fácil ao mais difícil.

Site: https://thekingarthur.vercel.app

## Stack

Astro 5 estático, GSAP com ScrollTrigger, Lenis, WebGL puro e CSS puro. Fontes Bricolage Grotesque e DM Sans via Fontsource.

## Como funciona

- `src/data/github.js` busca os repositórios públicos de `arthurmonteiroo11` a cada build. Se a API falhar, usa `src/data/repos-cache.json`.
- `src/data/projetos.json` guarda o que a API não sabe: ordem de dificuldade, cor, texto, brinquedo e quais projetos são privados.
- `src/data/catalogo.js` junta as duas fontes. Repositório público fora do `projetos.json` vai para o Arquivo.
- Projetos privados aparecem só como cena, sem link do repositório.

## Adicionar ou mudar um projeto

1. Edite `src/data/projetos.json`. Use `dificuldade` para a posição na ordem (menor primeiro).
2. Para um repositório privado, coloque `"privado": true`. Nenhuma URL é exibida.
3. Para esconder um repositório público, coloque `"oculto": true`.
4. Escolha o brinquedo em `toy`: `linhas` ou `formas`. Para criar outro, adicione um arquivo em `src/scripts/toys/` e registre em `src/scripts/toys/index.js`.

Repositório novo no GitHub só aparece depois do próximo deploy na Vercel.

## Testes

```
npm test
```

Cobrem o catálogo, o cache do GitHub, a física e a amostragem da abertura, o contador de fases e o brinquedo Linhas. Animações e WebGL são conferidos no preview da Vercel.

## Estrutura

```
src/
  components/   Abertura, Cena, Arquivo, FimDeJogo, Hud
  data/         github.js, catalogo.js, formatar.js, projetos.json, contato.json, repos-cache.json
  layouts/      Base.astro
  pages/        index.astro, 404.astro
  scripts/      scroll.js, hud.js, scenes.js, opening/, toys/
  styles/       tokens.css, base.css, toys.css
tests/
```
