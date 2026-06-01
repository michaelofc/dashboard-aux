const { json, clearSessionCookie } = require('../_lib/security');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'method_not_allowed' });
  }
  clearSessionCookie(res);
  return json(res, 200, { ok: true });
};
