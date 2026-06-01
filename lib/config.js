function parseJsonEnv(name) {
  const raw = process.env[name];
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

function getFilialKeys() {
  return parseJsonEnv('DASH_FILIAL_KEYS_JSON') || {};
}

function getFilialSources() {
  return parseJsonEnv('DASH_FILIAL_SOURCES_JSON') || {};
}

function toPublishedCsvUrl(rawUrl) {
  try {
    const url = new URL((rawUrl || '').trim());
    if (url.protocol !== 'https:') return '';
    if (url.hostname !== 'docs.google.com') return '';
    if (!url.pathname.includes('/spreadsheets/')) return '';

    if (url.pathname.includes('/pubhtml')) {
      url.pathname = url.pathname.replace('/pubhtml', '/pub');
      url.searchParams.set('output', 'csv');
      return url.toString();
    }

    if (url.pathname.endsWith('/pub')) {
      url.searchParams.set('output', 'csv');
      return url.toString();
    }

    if (url.searchParams.get('output') === 'csv') {
      return url.toString();
    }

    return '';
  } catch (_) {
    return '';
  }
}

function resolveFilialIdByAccessKey(accessKey) {
  const keys = getFilialKeys();
  const key = (accessKey || '').trim();
  if (!key) return '';

  const filialId = Object.keys(keys).find(id => String(keys[id]) === key);
  return filialId || '';
}

function resolveSourceByFilial(filialId) {
  const sources = getFilialSources();
  const source = sources[filialId];
  if (!source) return '';
  return toPublishedCsvUrl(String(source));
}

export {
  getFilialKeys,
  getFilialSources,
  resolveFilialIdByAccessKey,
  resolveSourceByFilial
};
