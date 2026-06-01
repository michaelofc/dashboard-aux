const { json, getSession } = require('./_lib/security');
const { resolveSourceByFilial } = require('./_lib/config');

function withGid(url, gid) {
  const parsed = new URL(url);
  parsed.searchParams.set('gid', gid);
  parsed.searchParams.set('output', 'csv');
  parsed.searchParams.set('cache', String(Date.now()));
  return parsed.toString();
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return json(res, 405, { error: 'method_not_allowed' });
  }

  const session = getSession(req);
  if (!session) {
    return json(res, 401, { error: 'unauthorized' });
  }

  const sourceUrl = resolveSourceByFilial(session.filialId);
  if (!sourceUrl) {
    return json(res, 500, { error: 'source_not_configured' });
  }

  const kind = String(req.query.kind || 'main').toLowerCase();
  const targetUrl = kind === 'aux' ? withGid(sourceUrl, '2018703213') : withGid(sourceUrl, '0');

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        Accept: 'text/csv'
      }
    });

    if (!response.ok) {
      return json(res, 502, { error: 'upstream_error', status: response.status });
    }

    const csv = await response.text();
    return json(res, 200, { kind, filialId: session.filialId, csv });
  } catch (err) {
    return json(res, 502, { error: 'upstream_fetch_failed', message: err.message });
  }
};
