Perfect — here’s a **full unified setup** where your **Next.js proxy injects user headers**, and the **Socket.IO server reads those headers** so HTTP routes and WebSocket rooms share the same authentication and role/ownership logic.

---

## 1️⃣ Proxy (with headers)

We’ll reuse the helper from before (`verifyJwt`, `hasProjectAccess`, `isRoleAllowed`).

```ts
// src/proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyJwt, hasProjectAccess, isRoleAllowed } from "@/lib/auth";

const LOGIN_PATH = "/signin";
const FORBIDDEN_PATH = "/403";

const ROUTES: { path: string; roles: string[] }[] = [
  { path: "/editor", roles: ["editor", "admin"] },
  { path: "/dashboard", roles: ["user", "editor", "admin"] },
  { path: "/projects", roles: ["user", "editor", "admin"] },
  { path: "/project", roles: ["user", "editor", "admin"] }, // /project/:id
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const route = ROUTES.find((r) => pathname.startsWith(r.path));
  if (!route) return NextResponse.next();

  const token = req.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.redirect(new URL(LOGIN_PATH, req.url));

  try {
    const payload = await verifyJwt(token);

    if (!isRoleAllowed(payload.role, route.roles)) {
      return NextResponse.redirect(new URL(FORBIDDEN_PATH, req.url));
    }

    if (pathname.startsWith("/project/")) {
      const projectId = pathname.split("/")[2];
      const allowed = await hasProjectAccess(payload.id, projectId);
      if (!allowed)
        return NextResponse.redirect(new URL(FORBIDDEN_PATH, req.url));
    }

    // Inject user info into headers
    const headers = new Headers(req.headers);
    headers.set("x-user-id", payload.id);
    headers.set("x-user-email", payload.email);
    headers.set("x-user-role", payload.role);

    return NextResponse.next({
      request: { headers },
    });
  } catch (err) {
    console.error("JWT verification failed:", err);
    return NextResponse.redirect(new URL(LOGIN_PATH, req.url));
  }
}

export const config = {
  matcher: [
    "/editor/:path*",
    "/dashboard/:path*",
    "/projects/:path*",
    "/project/:id/:path*",
  ],
};
```

---

## 2️⃣ Socket.IO server reading user headers

We’ll make **Socket.IO trust the headers injected by the proxy** (or fallback to token in handshake for direct WS connections):

```ts
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { verifyJwt, hasProjectAccess, isRoleAllowed } from "@/lib/auth";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const { headers, auth } = socket.handshake;
    const token =
      auth?.token ||
      headers["x-user-token"] || // in case proxy injected header for WS upgrade
      null;
    const projectId =
      auth?.projectId || headers["x-project-id"]?.toString() || null;

    if (!token || !projectId) return next(new Error("Unauthorized"));

    // Verify JWT
    const payload = await verifyJwt(token);

    if (!isRoleAllowed(payload.role, ["user", "editor", "admin"])) {
      return next(new Error("Forbidden"));
    }

    const allowed = await hasProjectAccess(payload.id, projectId);
    if (!allowed) return next(new Error("Forbidden"));

    // Attach info to socket
    socket.data.userId = payload.id;
    socket.data.role = payload.role;
    socket.data.projectId = projectId;

    next();
  } catch (err) {
    console.error("Socket auth error", err);
    next(new Error("Unauthorized"));
  }
});

// Socket.IO connection
io.on("connection", (socket) => {
  const { userId, projectId, role } = socket.data;
  const room = `project-${projectId}`;

  socket.join(room);
  socket.emit("joined", { room, userId, role });

  socket.on("update", (data) => {
    socket.to(room).emit("update", { userId, role, ...data });
  });

  socket.on("disconnect", () => console.log(`${userId} left ${room}`));
});

server.listen(4000, () => console.log("Socket.IO server running on port 4000"));
```

---

## 3️⃣ Next.js frontend usage

```ts
import { io } from "socket.io-client";

// Get token from cookie
const token = document.cookie
  .split("; ")
  .find((row) => row.startsWith("auth_token="))
  ?.split("=")[1];

const socket = io("http://localhost:4000", {
  auth: {
    token,
    projectId: "1234",
  },
});

socket.on("joined", (data) => console.log("Joined room:", data));
socket.on("update", (data) => console.log("Update received:", data));
```

---

### ✅ Benefits of this unified setup

1. **HTTP + WebSocket share the same JWT verification, role, and ownership logic**
2. **Proxy injects user info** → API routes and pages don’t need to re-verify JWT
3. Socket.IO middleware **reads the same token/headers**, enforcing role and project access
4. Easy to extend to new routes, roles, or projects
5. Centralized `auth.ts` helper makes maintenance simple

---

I can also provide a **ready-to-use TypeScript type-safe version** where both **proxy.ts headers** and **Socket.IO socket.data** are **typed as `UserSession`**, so you get full autocomplete and safety in your project.

Do you want me to do that next?

# socket io

| Function Name                             | Description                                                                                                                                            | Used on         |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------- |
| `io()`                                    | Initializes a new Socket.IO client instance, connecting to a server URL or namespace.                                                                  | Client          |
| `io.on('connection', ...)`                | Registers a handler for the `'connection'` event, executed when a client successfully connects to the server.                                          | Server          |
| `socket.emit(eventName, data, [ack])`     | Emits a custom named event from either the client to the server, or the server to the client. Optional data can be included, and an optional callback. | Client & Server |
| `socket.on(eventName, callback)`          | Registers a handler function to listen for a specific named event.                                                                                     | Client & Server |
| `io.emit(eventName, data)`                | Broadcasts an event to all connected clients within the default namespace.                                                                             | Server          |
| `socket.broadcast.emit(eventName, data)`  | Sends an event to everyone except the sender of the original message.                                                                                  | Server          |
| `socket.join(roomName)`                   | Subscribes a socket to a specific channel or "room".                                                                                                   | Server          |
| `io.to(roomName).emit(...)`               | Broadcasts an event only to clients that have joined a specific room.                                                                                  | Server          |
| `socket.disconnect()` or `socket.close()` | Disconnects the socket from the server. The client will attempt to reconnect automatically unless configured otherwise.                                | Client & Server |
| `socket.use(middleware)`                  | Registers a middleware function that has access to the socket instance and is executed before event handlers.                                          | Server          |
