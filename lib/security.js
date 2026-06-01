import crypto from 'crypto';

const COOKIE_NAME = 'dash_session';
const SESSION_TTL_SECONDS = 8 * 60 * 60;

function getSecret() {
  return process.env.DASH_SESSION_SECRET || '';
}

function parseCookies(req) {
  const header = req.headers.cookie || '';
  return header.split(';').reduce((acc, item) => {
    const trimmed = item.trim();
    if (!trimmed) return acc;
    const idx = trimmed.indexOf('=');
    if (idx <= 0) return acc;
    const key = trimmed.slice(0, idx);
    const value = trimmed.slice(idx + 1);
    acc[key] = decodeURIComponent(value);
    return acc;
  }, {});
}

function signToken(payload) {
  const secret = getSecret();
  if (!secret) throw new Error('Missing DASH_SESSION_SECRET');

  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verifyToken(token) {
  const secret = getSecret();
  if (!secret || !token || !token.includes('.')) return null;

  const [body, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', secret).update(body).digest('base64url');

  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;

  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  if (!payload || !payload.exp || Date.now() > payload.exp) return null;
  return payload;
}

function buildCookie(value, maxAgeSeconds) {
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Strict'
  ];
  if (typeof maxAgeSeconds === 'number') {
    parts.push(`Max-Age=${maxAgeSeconds}`);
  }
  return parts.join('; ');
}

function setSessionCookie(res, filialId) {
  const payload = {
    filialId,
    iat: Date.now(),
    exp: Date.now() + SESSION_TTL_SECONDS * 1000
  };
  const token = signToken(payload);
  res.setHeader('Set-Cookie', buildCookie(token, SESSION_TTL_SECONDS));
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', buildCookie('', 0));
}

function getSession(req) {
  const cookies = parseCookies(req);
  return verifyToken(cookies[COOKIE_NAME]);
}

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

async function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
      if (data.length > 1024 * 1024) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

export {
  COOKIE_NAME,
  SESSION_TTL_SECONDS,
  json,
  readJson,
  getSession,
  setSessionCookie,
  clearSessionCookie
};
