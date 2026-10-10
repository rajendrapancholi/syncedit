<div align="center">

# SyncEdit

**A real-time collaborative code editor with live cursors, team chat, video huddles and role-based access control.**

Multiple developers edit the same files in the browser at the same time, see each other's cursors, talk over chat or video, and share projects with fine-grained permissions.

![Next.js](https://img.shields.io/badge/Next.js-App_Router-000000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-Express-fbf0df?logo=bun&logoColor=black)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?logo=socketdotio&logoColor=white)
![Yjs](https://img.shields.io/badge/Yjs-CRDT-6c5ce7)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?logo=kubernetes&logoColor=white)

[Live Demo](https://syncedit.vercel.app) · [Architecture](#architecture) · [Engineering Highlights](#engineering-highlights) · [Getting Started](#getting-started) · [Run on Kubernetes](#run-on-kubernetes-minikube--kind) · [Roadmap](#roadmap--known-limitations)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Screenshots](#screenshots)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Engineering Highlights](#engineering-highlights)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Run on Kubernetes (minikube / kind)](#run-on-kubernetes-minikube--kind)
- [API Reference](#api-reference)
- [Real-time Events](#real-time-events)
- [Data Model](#data-model)
- [Deployment](#deployment)
- [Roadmap & Known Limitations](#roadmap--known-limitations)
- [Documentation Map](#documentation-map)
- [Author](#author)

---

## Overview

SyncEdit is a full-stack, browser-based pair-programming environment. A project is a workspace with a file tree and a Monaco (VS Code) editor. Everyone with access sees edits, cursors and selections as they happen, can chat, and can jump into a peer-to-peer video huddle without leaving the editor.

I built it to work through the hard parts of real-time software end to end: conflict-free text sync, authenticated WebSockets, permission enforcement on both the REST and socket layers, horizontal scaling with a Redis pub/sub adapter, and a Kubernetes deployment with autoscaling.

## Screenshots

|                  Dashboard                   |          Collaborative editor          |
| :------------------------------------------: | :------------------------------------: |
| ![Dashboard](docs/screenshots/dashboard.png) | ![Editor](docs/screenshots/editor.png) |

## Features

**Collaborative editing**

- Real-time multi-user editing in the Monaco editor, synchronised with **Yjs** (CRDT) over Socket.IO
- Live remote cursors and selections, colour-coded per user
- Shared file explorer: create, rename and delete files and folders, and everyone's tree updates instantly
- Autosave (2 s debounce) to PostgreSQL, with a "file saved" notification to collaborators
- Syntax highlighting chosen from the file extension

**Teamwork**

- Per-project team chat with typing indicators; the last 100 messages are persisted and replayed on join
- Live presence: who is online and which file they are in
- Peer-to-peer video/audio huddle (WebRTC) with mic and camera toggles, signalled over Socket.IO
- In-app notification bell for joins, chat and invites

**Access control & sharing**

- Email/password auth with bcrypt-hashed passwords and JWTs in `httpOnly` cookies
- Four project roles: `view` < `edit` < `admin` < `owner`, plus a global `admin` role
- Invite collaborators by email; invites for people without an account become 7-day pending tokens
- Read-only users are blocked **server-side**, not just hidden in the UI

**Platform**

- Dark/light theme, responsive UI, skeleton loaders, per-route error and not-found boundaries
- Kubernetes manifests with ingress routing, sticky sessions and CPU-based autoscaling

## Architecture

```mermaid
flowchart LR
    subgraph Browser
        UI["Next.js UI<br/>(App Router)"]
        ED["Monaco Editor<br/>+ Yjs Y.Text"]
        RTC["WebRTC<br/>(simple-peer)"]
    end

    ING["Ingress / Reverse proxy<br/>/ to frontend, /api and /socket.io to backend"]

    subgraph Backend["Backend (Bun + Express + Socket.IO)"]
        REST["REST API<br/>auth, projects, files"]
        WS["Socket.IO gateway<br/>Yjs relay, presence, chat,<br/>file tree, WebRTC signalling"]
    end

    REDIS[("Redis<br/>pub/sub adapter, access cache,<br/>token blacklist, pending invites")]
    PG[("PostgreSQL<br/>users, projects, members,<br/>files, folders, chat")]

    UI -->|HTTPS + JWT cookie| ING
    ED <-->|WebSocket| ING
    RTC -.->|signalling only| ING
    RTC <-.->|peer-to-peer media| RTC
    ING --> REST
    ING --> WS
    REST --> PG
    REST --> REDIS
    WS --> PG
    WS <--> REDIS
```

### How a keystroke travels

```mermaid
sequenceDiagram
    participant A as Client A (editor)
    participant S as Socket.IO server
    participant B as Client B (editor)

    A->>S: connect (JWT verified in handshake middleware)
    A->>S: join-project
    S-->>A: access level, presence, chat history
    A->>S: request-yjs-state
    S-->>A: yjs-state (current document)
    Note over A: keystroke updates the local Y.Text
    A->>S: yjs-update (50 ms debounced diff)
    S->>S: reject if the user is view-only
    S-->>B: yjs-update (fanned out across pods by the Redis adapter)
    Note over B: apply update, Monaco model refreshes
    A->>S: PUT /api/files/content/:id (2 s autosave)
```

## Tech Stack

| Layer        | Technology                                                                                                                                                            |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend** | Next.js (App Router, parallel and intercepting routes), React, TypeScript, Tailwind CSS, Monaco Editor, TanStack Query, Zustand, next-themes, Motion, react-hot-toast |
| **Realtime** | Socket.IO (WebSocket with polling fallback), Yjs (CRDT), `@socket.io/redis-adapter`, WebRTC via `simple-peer`                                                         |
| **Backend**  | Bun, Express, TypeScript, `pg`, `ioredis`, `jsonwebtoken`, `bcryptjs`, `cors`, `cookie-parser`, `morgan`                                                              |
| **Data**     | PostgreSQL 16, Redis 7                                                                                                                                                |
| **Infra**    | Kubernetes (minikube), Traefik ingress, HPA, StatefulSet + PVC. Public demo: Vercel (frontend), Render (backend), Neon (Postgres)                                     |

## Engineering Highlights

### Real-time sync

- **CRDT-based sync with Yjs.** Edits are exchanged as binary Yjs updates instead of whole-file snapshots, so concurrent edits merge deterministically.
- **No lost keystrokes under debouncing.** The client sends a 50 ms-debounced _diff against the last broadcast state vector_ (`Y.encodeStateAsUpdate(doc, lastVector)`), and flushes pending changes on unmount, file switch and reconnect.
- **No echo loops.** Remote updates are applied with a `'socket'` transaction origin, and a guard flag stops Monaco's `setValue` from feeding back into the document or triggering autosave and dirty state.
- **Late joiners get the full document** via `request-yjs-state`; the first client to open a file seeds an empty document from the saved content.

### Security & access control

- **Authentication everywhere.** JWTs live in `httpOnly` cookies (`secure` + `SameSite=Strict` in production) with 7-day expiry. Socket.IO connections are authenticated in a handshake middleware that verifies the token _and_ re-loads the user.
- **Real logout.** Logging out writes the token to a Redis blacklist with a TTL equal to the token's remaining lifetime, so revoked tokens are rejected without growing the blacklist forever.
- **Defence in depth.** Permissions are checked in three places: Next.js `proxy.ts` (JWT verification with `jose`, admin-route gating, project-membership check before `/editor/[projectId]` renders), Express middleware (`injectProjectAccess` + `canEdit`), and the socket handlers (view-only users get `edit_denied` for Yjs updates, content changes and file-tree mutations).
- **Cached authorization.** Project access levels are cached in Redis for 1 hour and invalidated on every invite, role change and member removal.
- **Safe invites.** Pending invites are random UUID tokens in Redis with a 7-day TTL, and accepting one requires the signed-in user's email to match the invited email.

### Backend design

- **Layered structure:** routes, controllers, services, middleware, utils, so business logic stays out of the HTTP layer.
- **Transactional writes.** Creating a project inserts the project and the owner's membership in one Postgres transaction with rollback on failure.
- **Idempotent chat persistence.** `INSERT ... ON CONFLICT (id) DO NOTHING` makes message saves safe to retry.
- **Production hygiene:** parameterised SQL throughout, pooled connections with timeouts and keep-alive, conditional DB SSL, CORS allow-list, graceful shutdown on `SIGINT`/`SIGTERM` (drain HTTP, close the pool, 10 s hard-exit fallback), `/health` endpoint for probes.

### Frontend design

- **Advanced App Router patterns:** route groups, **parallel routes** (`@stats`, `@projects`, `@activity`) for an independently-loading dashboard, and **intercepting routes** (`@modal`) for invite and create-project dialogs that still have shareable URLs.
- **Resilience:** `loading.tsx`, `error.tsx` and `not-found.tsx` boundaries at every level, plus `instrumentation.ts` that validates required env vars at boot (fails fast in production) and logs server request errors.
- **Single shared socket** (singleton manager with infinite reconnection and back-off) consumed through small hooks: `useYjsSync`, `useChatSocket`, `useNotifications`, `useWebRTC`, `useFileTree`.

### Scalability & DevOps

- **Horizontal scaling:** the Socket.IO Redis adapter fans events out across backend pods.
- **Kubernetes:** Traefik ingress with path routing, sticky-session cookie on the backend Service, rolling updates with `maxUnavailable: 0`, an init container that waits for Postgres and Redis, readiness/liveness probes, resource requests and limits, and an **HPA scaling the backend between 2 and 5 replicas at 60% CPU** (fast scale-up, 2-minute scale-down stabilisation).
- See [`k8s/README.md`](k8s/README.md) for the full runbook, including a load-test walkthrough.

## Project Structure

```
syncedit/
├── backend/                     # Bun + Express + Socket.IO API
│   └── src/
│       ├── app.ts / server.ts   # Express app, HTTP server, graceful shutdown
│       ├── config/              # env + PostgreSQL pool
│       ├── controllers/         # auth, project, file
│       ├── middlewares/         # authMiddleware, accessMiddleware (RBAC)
│       ├── routes/              # /auth, /project, /files
│       ├── services/            # project, file, chat, user, in-memory tree cache
│       ├── sockets/             # socket.ts (Yjs, presence, chat, WebRTC), fileTree.socket.ts
│       ├── lib/redis.ts         # shared ioredis client
│       └── utils/               # JWT + blacklist, permissions, tree builder
├── frontend/                    # Next.js app
│   └── src/
│       ├── app/                 # (public), (user)/(dash), editor, projects/[projectId], admin
│       ├── components/          # dashboard, layouts (IDE), modals, UI primitives
│       ├── services/
│       │   ├── editor/          # Monaco tabs, file tree, Yjs sync hook
│       │   ├── chat/            # live chat + socket hook
│       │   ├── stream/          # WebRTC huddle (VideoChat, useWebRTC)
│       │   └── notifications/   # notification store + bell
│       ├── shared/              # Navbar, Sidebar, providers, theme toggle
│       ├── lib/                 # socket singleton, utils
│       └── proxy.ts             # edge auth + project-access gate
├── k8s/                         # Kubernetes manifests (namespace → HPA) + runbook
└── README.md
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (backend) and Node.js 20+ (frontend tooling)
- PostgreSQL 16 and Redis 7 (Docker is the easiest way)

### 1. Clone

```bash
git clone <your-repo-url> syncedit
cd syncedit
```

### 2. Start PostgreSQL and Redis

```bash
docker run -d --name syncedit-pg \
  -e POSTGRES_USER=syncedit -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=livecode \
  -p 5432:5432 postgres:16-alpine

docker run -d --name syncedit-redis -p 6379:6379 redis:7-alpine

# create the tables
psql "postgresql://syncedit:secret@localhost:5432/livecode" -f backend/postgresqlStructure.sql
```

### 3. Run the backend

Create `backend/.env`:

```env
BASE_PORT=5000
NODE_ENV=development
CLIENT_ORIGINS=http://localhost:3000
CLIENT_ORIGIN=http://localhost:3000
REDIS_URL=redis://localhost:6379

DB_HOST=localhost
DB_PORT=5432
DB_USER=syncedit
DB_PASSWORD=secret
DB_NAME=livecode
DATABASE_SSL=false

JWT_SECRET=replace-with-a-long-random-string
COOKIE_SECRET=replace-with-another-long-random-string
```

```bash
cd backend
bun install
bun --watch src/server.ts     # or your `dev` script
# API on http://localhost:5000  (health check: /health)
```

### 4. Run the frontend

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_BASE_API=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
JWT_SECRET=replace-with-a-long-random-string   # must match the backend value
```

```bash
cd frontend
bun install          # or npm install
bun run dev          # http://localhost:3000
```

> Some frontend calls use relative `/api/...` URLs. In Kubernetes the ingress routes `/api` to the backend; for local development make sure `/api` is proxied or rewritten to `http://localhost:5000/api`.

### 5. Try the collaboration

1. Register two accounts (use a normal window and an incognito window).
2. Create a project and invite the second account by email.
3. Open the project in both windows and edit the same file: text, cursors, chat and presence sync live.
4. Change the second user's role to `view` and confirm their edits are rejected.

## Run on Kubernetes (minikube / kind)

The `k8s/` folder deploys the whole stack onto a local cluster. I run it on **minikube**; a **kind** alternative is included below.

```
Traefik Ingress ──┬── /            → frontend (Next.js, 2 pods)
 (syncedit.local) ├── /api         → backend  (Bun/Express, 2–5 pods via HPA)
                  └── /socket.io   → backend  (sticky-session cookie)
                                         │
                                  ┌──────┴──────┐
                               Redis          PostgreSQL
                          (pub/sub adapter)  (StatefulSet + 1Gi PVC)
```

| Manifest            | Creates                                                                                      |
| ------------------- | -------------------------------------------------------------------------------------------- |
| `00-namespace.yaml` | `syncedit` namespace                                                                         |
| `01-config.yaml`    | ConfigMap (non-secret env) and Secret (**local dev values only**)                            |
| `02-postgres.yaml`  | PostgreSQL 16 StatefulSet, Service and PVC; schema loaded from the `postgres-init` ConfigMap |
| `03-redis.yaml`     | Redis 7 Deployment and Service                                                               |
| `04-backend.yaml`   | Backend Deployment (init container, probes, rolling update) and Service with sticky cookie   |
| `05-frontend.yaml`  | Frontend Deployment (2 replicas) and Service                                                 |
| `06-ingress.yaml`   | Traefik Ingress for `syncedit.local`                                                         |
| `07-hpa.yaml`       | HorizontalPodAutoscaler for the backend (2–5 pods at 60% CPU)                                |

### Prerequisites

[Docker](https://docs.docker.com/get-docker/), [minikube](https://minikube.sigs.k8s.io/docs/start/), [kubectl](https://kubernetes.io/docs/tasks/tools/) and [Helm](https://helm.sh/docs/intro/install/). Run every command below **from the repository root**.

### Option A: minikube (recommended)

**1. Start the cluster and enable metrics (the HPA needs them)**

```bash
minikube start --cpus=2 --memory=4g
minikube addons enable metrics-server
```

**2. Install the Traefik ingress controller**

```bash
helm repo add traefik https://traefik.github.io/charts && helm repo update
helm install traefik traefik/traefik -n traefik --create-namespace
```

> Ingress-NGINX was retired by the Kubernetes project in March 2026, which is why this project uses Traefik.

**3. Build the images inside minikube's Docker daemon**

The manifests use local images (`syncedit-backend:local`, `syncedit-frontend:local`) with `imagePullPolicy: IfNotPresent`, so the images must exist inside the cluster's Docker.

```bash
# bash / zsh
eval $(minikube docker-env)

# PowerShell (Windows)
# & minikube -p minikube docker-env --shell powershell | Invoke-Expression

docker build -t syncedit-backend:local ./backend
docker build -t syncedit-frontend:local ./frontend \
  --build-arg NEXT_PUBLIC_BASE_API=http://syncedit.local/api \
  --build-arg NEXT_PUBLIC_SOCKET_URL=http://syncedit.local
```

> `NEXT_PUBLIC_*` values are inlined into the browser bundle at build time, so they must be passed as build args and the frontend `Dockerfile` must declare matching `ARG`s.

**4. Apply the manifests**

```bash
# a) namespace first
kubectl apply -f k8s/00-namespace.yaml

# b) database schema, mounted into Postgres as an init script
kubectl -n syncedit create configmap postgres-init \
  --from-file=backend/postgresqlStructure.sql

# c) everything else (config, Postgres, Redis, backend, frontend, ingress, HPA)
kubectl apply -f k8s/
```

**5. Expose the app**

```bash
# run in a separate terminal and keep it open
minikube tunnel
```

Map the hostname to your machine. Add this line to your hosts file (Linux/macOS: `/etc/hosts`, Windows: `C:\Windows\System32\drivers\etc\hosts`, edit as Administrator):

```
127.0.0.1 syncedit.local
```

If `kubectl -n traefik get svc traefik` shows a different `EXTERNAL-IP`, use that IP instead of `127.0.0.1`. Then open **http://syncedit.local**.

**6. Verify**

```bash
kubectl -n syncedit get pods,svc,ingress,hpa
kubectl -n syncedit logs -l app=collab-backend --prefix -f   # which pod serves which user
```

All pods should reach `Running` and `1/1 Ready`. Open the app in two browsers (one incognito), edit the same file and confirm it syncs.

**7. Autoscaling demo**

```bash
# terminal 1: watch the HPA
kubectl -n syncedit get hpa -w

# terminal 2: generate load (run 2–3 with different names if CPU stays low)
kubectl -n syncedit run load1 --rm -it --image=busybox:1.36 --restart=Never -- \
  sh -c 'while true; do wget -q -O- http://collab-backend:5000/health >/dev/null; done'
```

`TARGETS` rises above 60% and `REPLICAS` grows toward 5. Stop the load and it scales back down after about 2 minutes.

**8. Clean up**

```bash
kubectl delete ns syncedit
minikube stop        # or: minikube delete
```

### Option B: kind

<details>
<summary>Click to expand the kind setup</summary>

kind has no `minikube tunnel` or `docker-env`, so three things differ: images are loaded with `kind load`, ports are mapped in the cluster config, and `metrics-server` needs a flag for kind's self-signed kubelet certs.

**1. Create the cluster with a host port mapped to Traefik**

```bash
cat <<'EOF' > kind-config.yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
    extraPortMappings:
      - containerPort: 30080
        hostPort: 80
        protocol: TCP
EOF

kind create cluster --name syncedit --config kind-config.yaml
```

**2. Install Traefik as a NodePort service**

```bash
helm repo add traefik https://traefik.github.io/charts && helm repo update
helm install traefik traefik/traefik -n traefik --create-namespace \
  --set service.type=NodePort \
  --set ports.web.nodePort=30080
```

**3. Install metrics-server (for the HPA)**

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
kubectl -n kube-system patch deployment metrics-server --type=json \
  -p '[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]'
```

**4. Build the images and load them into the cluster**

```bash
docker build -t syncedit-backend:local ./backend
docker build -t syncedit-frontend:local ./frontend \
  --build-arg NEXT_PUBLIC_BASE_API=http://syncedit.local/api \
  --build-arg NEXT_PUBLIC_SOCKET_URL=http://syncedit.local

kind load docker-image syncedit-backend:local syncedit-frontend:local --name syncedit
```

**5. Apply the manifests** (same as minikube, step 4)

```bash
kubectl apply -f k8s/00-namespace.yaml
kubectl -n syncedit create configmap postgres-init --from-file=backend/postgresqlStructure.sql
kubectl apply -f k8s/
```

**6. Open the app.** Add `127.0.0.1 syncedit.local` to your hosts file and browse to **http://syncedit.local**. No tunnel is needed because port 80 is mapped straight to Traefik.

**Clean up:** `kind delete cluster --name syncedit`

</details>

### Troubleshooting

| Symptom                             | Likely cause and fix                                                                                                                                                                                                                                                                   |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ErrImagePull` / `ImagePullBackOff` | The image is not inside the cluster. Re-run `eval $(minikube docker-env)` in the _same shell_ and rebuild (minikube), or run `kind load docker-image ...` (kind).                                                                                                                      |
| HPA shows `TARGETS <unknown>/60%`   | `metrics-server` is not running. Enable the addon (minikube) or install it with the `--kubelet-insecure-tls` patch (kind), and wait a minute.                                                                                                                                          |
| `syncedit.local` does not load      | `minikube tunnel` is not running, or the hosts entry is missing or points to the wrong IP.                                                                                                                                                                                             |
| Pods wait in `Init` state           | The backend init container waits for Postgres and Redis; check `kubectl -n syncedit get pods` and the Postgres pod logs.                                                                                                                                                               |
| Tables are missing                  | Postgres only runs init scripts on an **empty** data directory. Recreate the volume: `kubectl -n syncedit delete pod postgres-0 && kubectl -n syncedit delete pvc data-postgres-0`, then `kubectl apply -f k8s/` again. (Or simply `kubectl delete ns syncedit` and repeat the steps.) |
| Login works but real-time does not  | Confirm `/socket.io` is routed to the backend in `06-ingress.yaml`, and that `NEXT_PUBLIC_SOCKET_URL` was set at **build** time.                                                                                                                                                       |

The original runbook, including notes on running more than one backend replica, is in [`k8s/README.md`](k8s/README.md).

## API Reference

All routes except `register`, `login` and `/health` require the auth cookie.

| Area         | Method & path                                                     | Notes                                               |
| ------------ | ----------------------------------------------------------------- | --------------------------------------------------- |
| **Auth**     | `POST /api/auth/register`                                         | Hashes the password with bcrypt                     |
|              | `POST /api/auth/login`                                            | Sets the `httpOnly` JWT cookie                      |
|              | `POST /api/auth/logout`                                           | Blacklists the token in Redis                       |
|              | `GET /api/auth/me`                                                | Current user                                        |
| **Projects** | `GET /api/project/get-projects`                                   | Projects the user belongs to, with access level     |
|              | `POST /api/project/create`                                        | Project and owner membership in one transaction     |
|              | `GET /api/project/get-project/:projectId`                         | Project details                                     |
|              | `PATCH /api/project/:projectId/metadata`                          | Rename or edit description (`edit`+)                |
|              | `GET /api/project/members/:projectId`                             | List members and roles                              |
|              | `POST /api/project/invite`, `POST /api/project/:projectId/invite` | Invite by email (`edit`+)                           |
|              | `POST /api/project/accept-invite`                                 | Redeem a pending invite token                       |
|              | `POST /api/project/check-access`                                  | Used by the Next.js proxy before opening the editor |
| **Files**    | `GET /api/files/tree/:projectId`                                  | Nested file/folder tree                             |
|              | `POST /api/files/create`                                          | Create file or folder (`edit`+)                     |
|              | `PATCH /api/files/rename/:id`                                     | Rename (`edit`+)                                    |
|              | `PUT /api/files/content/:id`                                      | Save content (`edit`+)                              |
|              | `DELETE /api/files/:id`                                           | Delete (`edit`+)                                    |
| **Health**   | `GET /health`, `GET /api/health`                                  | Liveness/readiness probe                            |

## Real-time Events

| Domain            | Client → Server                                                                                                       | Server → Client                                                                                                                             |
| ----------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Session**       | `identify`, `join-project`, `leave-project`, `get-active-users`                                                       | `update-presence`, `member-joined`, `project_access_denied`, `notification`                                                                 |
| **Document sync** | `request-yjs-state`, `yjs-update`                                                                                     | `yjs-state`, `yjs-update`, `edit_denied`                                                                                                    |
| **Cursors**       | `cursor_move`                                                                                                         | `cursor_update`, `cursor_leave`                                                                                                             |
| **Files**         | `file_tree:join`, `file:create`, `file:rename`, `file:delete`, `file_saved`                                           | `file_tree:init`, `file_tree:update`, `file_saved_notification`, `edit_denied`                                                              |
| **Chat**          | `team-message`, `typing-start`, `typing-stop`                                                                         | `chat-history`, `team-message`, `user-typing`                                                                                               |
| **Video huddle**  | `join-video-room`, `leave-video-room`, `video-state-change`, `webrtc-signal`, `webrtc-answer`, `webrtc-ice-candidate` | `video-room-users`, `user-joined-video`, `user-left-video`, `video-state-updated`, `webrtc-signal`, `webrtc-answer`, `webrtc-ice-candidate` |

## Data Model

| Table             | Purpose            | Key columns                                                                                                |
| ----------------- | ------------------ | ---------------------------------------------------------------------------------------------------------- |
| `users`           | Accounts           | `id`, `name`, `email` (unique), `password_hash`, `role` (`user` / `admin`)                                 |
| `projects`        | Workspaces         | `id`, `name`, `description`, `owner_id`, `created_at`, `updated_at`                                        |
| `project_members` | Per-project access | `project_id`, `user_id`, `access_level` (`view`/`edit`/`admin`/`owner`), unique on `(project_id, user_id)` |
| `folders`         | Directory tree     | `id`, `name`, `project_id`, `parent_id`                                                                    |
| `files`           | File contents      | `id`, `name`, `project_id`, `folder_id`, `content`, `updated_at`                                           |
| `chat_messages`   | Persisted chat     | `id`, `project_id`, `user_id`, `username`, `message`, `created_at`                                         |

The full schema is in [`backend/postgresqlStructure.sql`](backend/postgresqlStructure.sql).

**Redis keys:** `access:{userId}:{projectId}` (1 h cache), `blacklist:{token}` (TTL = remaining token life), `invite:{token}` (7 days), plus Socket.IO adapter pub/sub channels.

## Deployment

| Target          | Stack                                                                               | Guide                                                                                       |
| --------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Public demo** | Vercel (frontend), Render (backend), Neon (PostgreSQL)                              | Set the env vars above on each service; set `DATABASE_SSL=true` for Neon                    |
| **Kubernetes**  | minikube (or kind) + Traefik, 2–5 backend pods via HPA, Postgres StatefulSet, Redis | [Run on Kubernetes](#run-on-kubernetes-minikube--kind) and [`k8s/README.md`](k8s/README.md) |

## Roadmap & Known Limitations

Being upfront about what is done and what is next:

**Scaling the real-time layer**

- [ ] **Persist Yjs state outside process memory.** Server-side `Y.Doc`s, presence and video-room state currently live in each backend process. Sticky sessions plus the Redis adapter make multi-pod usage work for typical sessions, but strict correctness needs Yjs updates persisted in Redis/Postgres (or room-to-pod routing), and idle docs should be evicted.
- [ ] **Incremental Monaco ↔ Yjs binding.** The binding currently replaces the whole text on each local change. A diff-based binding (as in `y-monaco`) preserves intent better under heavy concurrent typing.
- [ ] Move presence and video-room state to Redis.
- [ ] TURN server and/or SFU for video; the current peer-to-peer mesh suits small groups.

**Product features scaffolded in the UI but not wired up yet**

- [ ] AI assistant panel (UI exists, no backend handler yet)
- [ ] Admin dashboard and project settings pages
- [ ] Teams, reports, revenue and subscription pages (static UI only)

**Quality**

- [ ] Unit tests for services and permission helpers, integration tests for socket flows
- [ ] CI pipeline (lint, type-check, test, build images) with GitHub Actions
- [ ] Rate limiting on auth routes and request validation (e.g. Zod)

## Documentation Map

| Doc                                        | Contents                                              |
| ------------------------------------------ | ----------------------------------------------------- |
| **README.md** (this file)                  | Project overview, architecture, setup, API and events |
| [`backend/README.md`](backend/README.md)   | Backend internals, services, env vars, socket design  |
| [`frontend/README.md`](frontend/README.md) | Frontend structure, routing, state management, hooks  |
| [`k8s/README.md`](k8s/README.md)           | Kubernetes deployment and autoscaling runbook         |

## Author

**Rajendra Pancholi**, full-stack developer

[GitHub](https://github.com/rajendrapancholi) · [LinkedIn](https://www.linkedin.com/in/rajendra-pancholi) · [Portfolio](https://rajendrapancholi.vercel.app/)

If you found this project interesting, a star on the repo is appreciated.
