import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Routes requiring authentication
const protectedRoutes = [
  '/api/fish',
  '/api/plant',
  '/api/tank',
  '/dashboard',
];

// Helper to match protected paths
function isProtected(pathname: string) {
  return protectedRoutes.some((route) => pathname.startsWith(route));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes to proceed
  if (!isProtected(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get('token')?.value;

  if (!token) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized: No token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret');

    const { payload } = await jwtVerify(token, secret);

    // Optional: Enforce role-based access
    // if (payload.role !== 'super_admin') {
    //   return new NextResponse('Forbidden: Insufficient permissions', { status: 403 });
    // }

    // Attach user info to request headers if needed downstream
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', String(payload.id));
    requestHeaders.set('x-user-role', String(payload.role));

    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch (err) {
    console.error('JWT verification failed:', err);
    return new NextResponse(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export const config = {
  matcher: [
    '/api/fish/:path*',
    '/api/plant/:path*',
    '/api/tank/:path*',
    '/dashboard/:path*',
  ],
};
