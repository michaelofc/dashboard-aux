const { json, readJson, setSessionCookie } = require('../_lib/security');
const { resolveFilialIdByAccessKey, resolveSourceByFilial } = require('../_lib/config');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'method_not_allowed' });
  }

  try {
    const body = await readJson(req);
    const accessKey = (body.accessKey || '').trim();
    const filialId = resolveFilialIdByAccessKey(accessKey);

    if (!filialId) {
      return json(res, 401, { error: 'invalid_credentials' });
    }

    const sourceUrl = resolveSourceByFilial(filialId);
    if (!sourceUrl) {
      return json(res, 500, { error: 'source_not_configured' });
    }

    setSessionCookie(res, filialId);
    return json(res, 200, { ok: true, filialId });
  } catch (err) {
    return json(res, 400, { error: 'bad_request', message: err.message });
  }
};
