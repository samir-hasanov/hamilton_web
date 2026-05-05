/**
 * API kök ünvanı: həmişə /api/v1 ilə bitir.
 * REACT_APP_API_BASE boş olduqda: lokal backend (npm start).
 * K8s / Nginx üçün build: REACT_APP_API_BASE=/api/v1 (eyni origin proxy).
 * Birbaşa backend üçün: REACT_APP_API_BASE=http://host:8085/api/v1
 */
function resolveApiBaseUrl() {
  const env = process.env.REACT_APP_API_BASE;
  if (env == null || env === '') {
    return 'http://localhost:8085/api/v1';
  }
  const t = String(env).trim();
  if (t.startsWith('http://') || t.startsWith('https://')) {
    const base = t.replace(/\/$/, '');
    return base.endsWith('/api/v1') ? base : `${base}/api/v1`;
  }
  const path = t.startsWith('/') ? t : `/${t}`;
  return path.endsWith('/api/v1') ? path : `${path.replace(/\/$/, '')}/api/v1`;
}

export const API_BASE_URL = resolveApiBaseUrl();
