import { defineConfig, type ProxyOptions } from 'vite';
import react from '@vitejs/plugin-react';

const backendPort = process.env.SOUL_BACKEND_PORT || '8080';
const backendTarget = `http://127.0.0.1:${backendPort}`;

function backendProxy(stripApiPrefix = false): ProxyOptions {
  return {
    target: backendTarget,
    changeOrigin: true,
    xfwd: true,
    rewrite: stripApiPrefix
      ? (path) => path.replace(/^\/api(?=\/|$)/, '') || '/'
      : undefined,
    configure(proxy) {
      proxy.on('proxyReq', (proxyRequest, request) => {
        proxyRequest.removeHeader('origin');

        const forwardedProto = request.headers['x-forwarded-proto'];
        const forwardedHost = request.headers['x-forwarded-host'];
        const forwardedPort = request.headers['x-forwarded-port'];

        proxyRequest.setHeader(
          'x-forwarded-proto',
          Array.isArray(forwardedProto)
            ? forwardedProto[0]
            : forwardedProto || (request.socket.encrypted ? 'https' : 'http'),
        );
        proxyRequest.setHeader(
          'x-forwarded-host',
          Array.isArray(forwardedHost)
            ? forwardedHost[0]
            : forwardedHost || request.headers.host || '127.0.0.1',
        );

        if (forwardedPort) {
          proxyRequest.setHeader(
            'x-forwarded-port',
            Array.isArray(forwardedPort) ? forwardedPort[0] : forwardedPort,
          );
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react()],
  preview: {
    host: '127.0.0.1',
    port: 4173,
    strictPort: true,
    allowedHosts: [
      '.ngrok.app',
      '.ngrok-free.app',
      '.ngrok.dev',
      '.ngrok-free.dev',
      '.ngrok.io',
      '.trycloudflare.com',
    ],
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
    proxy: {
      '/api': backendProxy(true),
      '/media': backendProxy(),
    },
  },
});
