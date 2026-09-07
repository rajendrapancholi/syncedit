import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";

const JWT_COOKIE_NAME = "token";
const LOGIN_PATH = "/login";
const JWT_SECRET = process.env.JWT_SECRET!;
const BACKEND_URL = process.env.NEXT_PUBLIC_BASE_API;

const PROTECTED_PATHS = ["/editor", "/dashboard", "/projects", "/admin"];
const GUEST_PATHS = ["/login", "/register"];

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Get and validate Token format
  const token = req.cookies.get(JWT_COOKIE_NAME)?.value;
  const isTokenFormatValid = token && token.split(".").length === 3;

  // Guest pages (login/register)
  if (GUEST_PATHS.some((p) => pathname.startsWith(p))) {
    if (isTokenFormatValid) {
      try {
        const secretKey = new TextEncoder().encode(JWT_SECRET);
        await jose.jwtVerify(token, secretKey);
        // If token is valid, send them to dashboard
        return NextResponse.redirect(new URL("/dashboard", req.url));
      } catch (err) {
        // If token is invalid, let them stay on login/register
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // Protected pages
  if (PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
    if (!isTokenFormatValid) {
      return NextResponse.redirect(new URL(LOGIN_PATH, req.url));
    }

    try {
      const secretKey = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jose.jwtVerify(token, secretKey, {
        algorithms: ["HS256"],
      });

      const userRole = payload.role as string; // 'admin' | 'user'
      const userId = payload.id as string;

      // Global Role Protection (Example: Only admins see /admin dashboard)
      if (pathname.startsWith("/admin") && userRole !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      // Project-Specific Access Control (for /editor/[projectId])
      if (pathname.startsWith("/editor/")) {
        const projectId = pathname.split("/")[2];

        // Check access via your Express backend
        // This ensures the user is a member of the project (view/edit/owner)
        const accessCheck = await fetch(`${BACKEND_URL}/project/check-access`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: `${JWT_COOKIE_NAME}=${token}`,
          },
          body: JSON.stringify({ projectId }),
        });

        if (!accessCheck.ok) {
          console.error(
            `Access denied for user ${userId} to project ${projectId}`,
          );
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
      }

      return NextResponse.next();
    } catch (err) {
      console.error("Auth Middleware Error:", err);
      const response = NextResponse.redirect(new URL(LOGIN_PATH, req.url));
      response.cookies.delete(JWT_COOKIE_NAME);
      return response;
    }
  }
}

export const config = {
  matcher: [
    "/editor/:path*",
    "/dashboard/:path*",
    "/projects/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
