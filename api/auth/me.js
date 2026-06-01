const { json, getSession } = require('../_lib/security');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return json(res, 405, { error: 'method_not_allowed' });
  }

  const session = getSession(req);
  if (!session) {
    return json(res, 200, { authenticated: false });
  }

  return json(res, 200, {
    authenticated: true,
    filialId: session.filialId
  });
};
