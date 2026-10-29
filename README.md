# Demo do Decap CMS

Projeto para ver e entender como o [Decap CMS](https://github.com/decaporg/decap-cms) funciona
(CMS "Git-based": o conteúdo é salvo como arquivos no repositório, sem banco de dados).

## Rodar

```bash
npm install
npm run dev
```

- Site: http://localhost:8080
- Painel: http://localhost:8080/admin/ (clique em **Entrar**, não pede senha em modo local)

Edite um post no painel e veja o arquivo mudar em `content/posts/` (`git status` mostra a alteração).

## Como as peças se encaixam

| Arquivo | Papel |
| --- | --- |
| `admin/index.html` | Carrega o Decap CMS (um único `<script>`) em `/admin` |
| `admin/config.yml` | Define o modelo de conteúdo: coleções, campos, onde salvar |
| `content/posts/*.md` | Entradas da coleção `posts` (front matter YAML + Markdown) |
| `content/settings/site.json` | Entrada da coleção de arquivo único `settings` |
| `uploads/` | Imagens enviadas pelo painel |
| `build.mjs` | Mini gerador estático (só para você ver o resultado; num projeto real seria Hugo, Astro, Eleventy, Next...) |

## Fluxo

1. O editor abre `/admin`. O Decap lê `config.yml` e monta a interface.
2. Em produção ele autentica no GitHub e usa a API do GitHub para ler e gravar arquivos
   (cada "Publicar" vira um commit em `main`; com `publish_mode: editorial_workflow`, vira Pull Request).
3. O push dispara o build do site, que gera o HTML novo.

Em `localhost`, `local_backend: true` faz o painel falar com o `decap-server` (porta 8081),
que grava direto nos arquivos da sua pasta. Sem login, sem commit.

## Para usar o painel em produção (backend GitHub)

O GitHub não permite login OAuth só no navegador, então precisa de um pequeno servidor OAuth:

1. Hospede o site (GitHub Pages, Netlify, Vercel, Cloudflare Pages...).
2. Crie um OAuth App em GitHub → Settings → Developer settings.
3. Configure um proxy OAuth (Netlify faz isso nativamente; fora dele, use um projeto como `sveltia-cms-auth`
   ou `decap-proxy`) e aponte `base_url` em `admin/config.yml`.

Referências: [Quick start](https://decapcms.org/docs/quick-start/), [backends](https://decapcms.org/docs/backends-overview/),
[widgets](https://decapcms.org/docs/widgets/).
