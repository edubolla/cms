// Mini gerador de site estático: lê content/ e escreve dist/.
// Existe só para você ver o resultado das edições; num projeto real
// isso seria Hugo, Astro, Eleventy, Next, Jekyll etc.
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import matter from 'gray-matter';
import { marked } from 'marked';

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmt = d => new Date(d).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

const site = JSON.parse(await readFile('content/settings/site.json', 'utf8'));

const layout = (title, body) => `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<style>
  body{font:18px/1.6 system-ui,sans-serif;max-width:42rem;margin:3rem auto;padding:0 1rem;color:#222}
  a{color:#0b5fff} header{margin-bottom:2rem;border-bottom:1px solid #ddd;padding-bottom:1rem}
  header h1{margin:0} header p{margin:.25rem 0 0;color:#666} img{max-width:100%}
  .meta{color:#666;font-size:.9rem} .tag{background:#eef;border-radius:4px;padding:0 .4rem;margin-right:.25rem}
  footer{margin-top:3rem;color:#666;font-size:.9rem}
</style></head><body>
<header><h1><a href="./" style="color:inherit;text-decoration:none">${esc(site.title)}</a></h1><p>${esc(site.tagline)}</p></header>
${body}
<footer><a href="admin/">Abrir painel</a>${site.email ? ` · ${esc(site.email)}` : ''}</footer>
</body></html>`;

await rm('dist', { recursive: true, force: true });
await mkdir('dist/posts', { recursive: true });

const posts = [];
for (const file of (await readdir('content/posts')).filter(f => f.endsWith('.md'))) {
  const { data, content } = matter(await readFile(`content/posts/${file}`, 'utf8'));
  if (data.published === false) continue;
  posts.push({ ...data, slug: file.replace(/\.md$/, ''), html: marked.parse(content) });
}
posts.sort((a, b) => new Date(b.date) - new Date(a.date));

const toRoot = html => html.replaceAll('href="./"', 'href="../"').replaceAll('href="admin/"', 'href="../admin/"');

for (const p of posts) {
  const tags = (p.tags ?? []).map(t => `<span class="tag">${esc(t)}</span>`).join('');
  const cover = p.cover ? `<img src="..${esc(p.cover)}" alt="">` : '';
  await writeFile(`dist/posts/${p.slug}.html`, toRoot(layout(p.title, `<article>
<h2>${esc(p.title)}</h2><p class="meta">${fmt(p.date)} ${tags}</p>${cover}${p.html}
<p><a href="index.html">← Todos os posts</a></p></article>`)));
}

const list = posts.map(p => `<li><a href="${p.slug}.html">${esc(p.title)}</a> <span class="meta">${fmt(p.date)}</span>
${p.description ? `<br><span class="meta">${esc(p.description)}</span>` : ''}</li>`).join('\n');
await writeFile('dist/posts/index.html', toRoot(layout(`Posts · ${site.title}`, `<h2>Posts</h2><ul>${list}</ul>`)));

// Home provisória
await writeFile('dist/index.html', `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(site.title)} · Em construção</title>
<style>
  body{margin:0;min-height:100vh;display:grid;place-items:center;text-align:center;font:18px/1.5 system-ui,sans-serif;color:#222;background:#fafafa}
  h1{font-size:clamp(2rem,6vw,3.5rem);letter-spacing:.05em;margin:0 0 .5rem}
  p{color:#666;margin:0}
</style></head><body><main>
<h1>EM CONSTRUÇÃO</h1>
<p>${esc(site.title)}</p>
</main></body></html>`);

await cp('admin', 'dist/admin', { recursive: true });
await cp('uploads', 'dist/uploads', { recursive: true });
console.log(`Site gerado em dist/ (${posts.length} posts)`);
