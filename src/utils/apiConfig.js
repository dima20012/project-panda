// Dynamic Server Node Host API & WebSockets Config

export const DEFAULT_SERVER_URL = 'http://localhost:3001';

export const getServerUrl = () => {
  let url = localStorage.getItem('panda_server_url') || DEFAULT_SERVER_URL;
  return url.replace(/\/+$/, ''); // Strip trailing slash
};

export const setServerUrl = (newUrl) => {
  if (!newUrl) return;
  const cleanUrl = newUrl.trim().replace(/\/+$/, '');
  localStorage.setItem('panda_server_url', cleanUrl);
};

export const pingServerNode = async (targetUrl = null) => {
  const baseUrl = (targetUrl || getServerUrl()).replace(/\/+$/, '');
  const startTime = Date.now();
  try {
    const res = await fetch(`${baseUrl}/api/ping`, { method: 'GET', cache: 'no-store' });
    const latency = Date.now() - startTime;
    if (res.ok) {
      const data = await res.json();
      return { success: true, latency, data };
    }
    return { success: false, error: `HTTP ${res.status}` };
  } catch (err) {
    return { success: false, error: 'Connection Refused / Unreachable' };
  }
};
