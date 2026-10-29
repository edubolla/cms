// Prévia do post no painel: mostra o texto com o visual do site.
// "h" é o createElement que o Decap expõe globalmente; widgetFor('body') renderiza o Markdown.
CMS.registerPreviewStyle('/admin/preview.css');

const PostPreview = ({ entry, widgetFor }) => {
  const d = entry.get('data');
  const date = d.get('date') ? new Date(d.get('date')).toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: 'long', year: 'numeric' }) : '';
  return h('article', { className: 'preview' },
    h('p', { className: 'meta' }, date, d.get('published') === false ? h('span', { className: 'draft' }, 'Rascunho (não publicado)') : null),
    h('h1', {}, d.get('title') || 'Sem título'),
    d.get('cover') ? h('img', { className: 'cover', src: d.get('cover'), alt: '' }) : null,
    widgetFor('body'));
};
CMS.registerPreviewTemplate('blog', PostPreview);
