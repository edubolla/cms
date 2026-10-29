// Passo 2 do login: o GitHub devolve um "code"; trocamos por um token
// e entregamos o token para a janela do painel (/admin) via postMessage.
const crypto = require('node:crypto');

const page = (status, content) => `<!doctype html><html><body><script>
(function () {
  var status = ${JSON.stringify(status)};
  var content = ${JSON.stringify(content)};
  function receive(e) {
    // Só responde para o próprio site, nunca para outra origem.
    if (e.origin !== window.location.origin) return;
    window.opener.postMessage('authorization:github:' + status + ':' + JSON.stringify(content), e.origin);
  }
  window.addEventListener('message', receive, false);
  window.opener.postMessage('authorizing:github', window.location.origin);
})();
</script></body></html>`;

const readCookie = (req, name) =>
  (req.headers.cookie || '').split(';').map(c => c.trim().split('=')).find(([k]) => k === name)?.[1];

module.exports = async (req, res) => {
  const { code, state } = req.query;
  const expected = readCookie(req, 'oauth_state');
  res.setHeader('Set-Cookie', 'oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/api; Max-Age=0');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  const validState = state && expected && state.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(state), Buffer.from(expected));
  if (!code || !validState) {
    res.status(400).send(page('error', { message: 'Login inválido ou expirado. Tente de novo.' }));
    return;
  }

  try {
    const r = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    const data = await r.json();
    if (!data.access_token) throw new Error(data.error_description || data.error || 'sem token');
    res.status(200).send(page('success', { token: data.access_token, provider: 'github' }));
  } catch (err) {
    res.status(500).send(page('error', { message: `Falha ao autenticar no GitHub: ${err.message}` }));
  }
};
