import { io, Socket } from 'socket.io-client';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

class SocketManager {
  private static instance: Socket | null = null;

  public static getInstance(): Socket {
    if (!this.instance) {
      this.instance = io(SOCKET_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        reconnectionAttempts: Infinity,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000,
        autoConnect: false,
        auth: (cb) => {
          fetch('/socket-token', { credentials: 'same-origin' })
            .then((r) => (r.ok ? r.json() : {}))
            .then((d) => cb(d?.token ? { token: d.token } : {}))
            .catch(() => cb({}));
        },
      });

      this.instance.on('connect', () => {
        console.log(
          '%c[Sync Engine] Connected to Orchestrator',
          'color: #10b981; font-weight: bold',
        );
      });

      this.instance.on('connect_error', (err) => {
        console.error('[Sync Engine] Connection Error:', err.message);
      });
    }
    return this.instance;
  }
}

export const socket = SocketManager.getInstance();
