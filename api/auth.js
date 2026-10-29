// Passo 1 do login: manda o editor para a tela de autorização do GitHub.
const crypto = require('node:crypto');

module.exports = (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    res.status(500).send('GITHUB_CLIENT_ID não configurado nas variáveis de ambiente da Vercel.');
    return;
  }

  // "state" protege contra login forjado: guardamos num cookie e conferimos no retorno.
  const state = crypto.randomBytes(16).toString('hex');
  res.setHeader('Set-Cookie', `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/api; Max-Age=600`);

  const params = new URLSearchParams({
    client_id: clientId,
    // public_repo basta para repositório público. Se o repo virar privado, use "repo".
    scope: process.env.GITHUB_OAUTH_SCOPE || 'public_repo',
    state,
  });
  res.redirect(302, `https://github.com/login/oauth/authorize?${params}`);
};
