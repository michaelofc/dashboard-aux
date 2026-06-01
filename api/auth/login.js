import { json, readJson, setSessionCookie, clearSessionCookie, getSession } from '../../lib/security.js';
import { resolveFilialIdByAccessKey, resolveSourceByFilial } from '../../lib/config.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const session = getSession(req);
    if (!session) {
      return json(res, 200, { authenticated: false });
    }
    return json(res, 200, { authenticated: true, filialId: session.filialId });
  }

  if (req.method === 'DELETE') {
    clearSessionCookie(res);
    return json(res, 200, { ok: true });
  }

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
}
