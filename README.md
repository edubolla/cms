# Metinger Tech: site com Astro + Decap CMS

Site de criação de sites em Novo Hamburgo e região. O visual é feito em [Astro](https://astro.build)
(HTML estático, rápido, com JavaScript só onde precisa de movimento) e o conteúdo é editado pelo
[Decap CMS](https://decapcms.org) em `/admin`, que salva tudo como arquivos neste repositório.

## Rodar localmente

```bash
npm install
npm run dev
```

- Site: http://localhost:4321
- Painel: http://localhost:4321/admin/ (clique em **Entrar**; em localhost não pede senha e grava direto nos arquivos)

## Onde fica cada coisa

| Caminho | O que é |
| --- | --- |
| `content/home.json` | Textos da home (título, palavras que alternam, serviços, FAQ...). Editável em **Página inicial** no painel |
| `content/site.json` | Nome, e-mail, **WhatsApp**, redes sociais. Se o WhatsApp for preenchido, todos os botões de contato passam a abrir a conversa |
| `content/blog/*.md` | Posts do blog |
| `public/admin/config.yml` | Define os campos do painel |
| `src/components/` | Blocos da página (Hero, Serviços, FAQ...) |
| `src/styles/global.css` | Cores, fontes e espaçamentos |
| `src/scripts/motion.ts` | Animações (palavras que alternam, rede de pontos, entrada ao rolar) |
| `api/auth.js`, `api/callback.js` | Login do painel com GitHub (funções da Vercel) |
| `public/brand/` | Logo e ícone |

## Publicação (Vercel)

Cada commit em `main` publica sozinho (`vercel.json`: `npm run build`, saída em `dist`).
Variáveis necessárias na Vercel: `GITHUB_CLIENT_ID` e `GITHUB_CLIENT_SECRET` (OAuth App do GitHub, callback `<domínio>/api/callback`).

### Ao trocar para o domínio definitivo (metingertech.com.br)

Atualize o domínio em: `astro.config.mjs` (`site`), `public/robots.txt` (Sitemap), `public/admin/config.yml`
(`base_url`, `site_url`, `display_url`) e a callback URL do OAuth App no GitHub.

## Observação sobre `npm audit`

Os avisos vêm do `decap-server`, usado só em desenvolvimento local; não vão para o site publicado.
