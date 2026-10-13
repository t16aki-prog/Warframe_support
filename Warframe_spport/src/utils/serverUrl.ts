/**
 * Resolves the backend WebSocket / API server URL dynamically.
 * Priority:
 * 1. Explicit environment variable: VITE_SERVER_URL
 * 2. Current origin in browser (with protocol-aware port fallback for local dev)
 */
export function getBackendServerUrl(): string {
  if (import.meta.env.VITE_SERVER_URL) {
    return import.meta.env.VITE_SERVER_URL;
  }

  if (typeof window !== 'undefined') {
    const isHttps = window.location.protocol === 'https:';
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    // In local development with Vite dev server (e.g. localhost:5173), target port 3001
    if (isLocalhost && window.location.port !== '3001') {
      return `http://${window.location.hostname}:3001`;
    }

    // In production hosted on same domain / reverse proxy
    if (!window.location.port) {
      return `${window.location.protocol}//${window.location.host}`;
    }

    // Default LAN fallback
    return `${isHttps ? 'https:' : 'http:'}//${window.location.hostname}:3001`;
  }

  return 'http://localhost:3001';
}
