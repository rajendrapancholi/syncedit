# SyncEdit on Kubernetes (local: minikube)

Architecture: `Traefik Ingress -> { frontend (Next.js) , backend (Bun/Express/Socket.io/Yjs) } -> { Redis, Postgres }`

- One host (`syncedit.local`), path routing: `/socket.io` and `/api` -> backend, `/` -> frontend
- Backend: 2-5 replicas (HPA on CPU 60%), sticky-session cookie on the backend Service
- Redis: Socket.io pub/sub. Postgres: StatefulSet + PVC (local only; use a managed DB in cloud)
- Public live demo runs separately on Vercel + Render + Neon. This folder is the Kubernetes deployment of the same app.

> Ingress-NGINX was retired by the Kubernetes project in March 2026, so this setup uses Traefik.

## Prerequisites

Docker, minikube, kubectl, helm.

## Backend code changes needed first

1. `GET /health` -> 200
2. Listen on `process.env.PORT` (0.0.0.0)
3. `app.set("trust proxy", 1)`
4. Make DB SSL conditional: `ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false`
5. Redis adapter (required with more than one replica):

   ```bash
   cd backend && bun add @socket.io/redis-adapter
   ```

   ```ts
   import { createAdapter } from '@socket.io/redis-adapter';
   import Redis from 'ioredis';

   const pub = new Redis(process.env.REDIS_URL!);
   const sub = pub.duplicate();
   io.adapter(createAdapter(pub, sub));
   ```

6. Yjs: if the server keeps a `Y.Doc` per room in memory, replicas will diverge. Either make the server a pure relay,
   persist updates (Redis/Postgres) and load them on join, or route a room to one pod (consistent hashing).
   Test with 2 replicas before claiming horizontal scaling.

## Run

```bash
minikube start --cpus=2 --memory=4g
minikube addons enable metrics-server

# ingress controller
helm repo add traefik https://traefik.github.io/charts && helm repo update
helm install traefik traefik/traefik -n traefik --create-namespace

# build images INSIDE minikube's docker (bash/zsh)
eval $(minikube docker-env)
docker build -t syncedit-backend:local ./backend
docker build -t syncedit-frontend:local ./frontend \
  --build-arg NEXT_PUBLIC_API_URL=http://syncedit.local/api \
  --build-arg NEXT_PUBLIC_SOCKET_URL=http://syncedit.local

# namespace -> DB schema -> everything else
kubectl apply -f k8s/00-namespace.yaml
kubectl -n syncedit create configmap postgres-init --from-file=backend/postgresqlStructure.sql
kubectl apply -f k8s/

# expose: run in a separate terminal and keep it open
minikube tunnel
```

Add `127.0.0.1 syncedit.local` to your hosts file (Linux/macOS: `/etc/hosts`, Windows: `C:\Windows\System32\drivers\etc\hosts`).
If `kubectl -n traefik get svc traefik` shows a different EXTERNAL-IP, use that IP instead. Open http://syncedit.local

## Verify

```bash
kubectl -n syncedit get pods,svc,ingress,hpa
kubectl -n syncedit logs -l app=collab-backend --prefix -f   # see which pod each user hits
```

Open two browsers (one incognito), edit the same file, confirm sync.

## Autoscaling demo

```bash
kubectl -n syncedit get hpa -w    # terminal 1
# terminal 2 (run 2-3 of these with different names if CPU stays low):
kubectl -n syncedit run load1 --rm -it --image=busybox:1.36 --restart=Never -- \
  sh -c 'while true; do wget -q -O- http://collab-backend:5000/health >/dev/null; done'
```

Watch TARGETS go above 60% and REPLICAS grow to 5; stop the load and it scales back down after ~2 minutes.

## Cleanup

```bash
kubectl delete ns syncedit
minikube stop
```
