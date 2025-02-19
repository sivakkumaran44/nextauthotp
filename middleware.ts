import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { AUTH_ROUTES } from '@/lib/auth/constants';
export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuthenticated = !!token;
  const path = request.nextUrl.pathname;
  const isLoginPage = path === '/';
  const isRegisterPage = path === AUTH_ROUTES.REGISTER;
  const isDashboardPage = path.startsWith(AUTH_ROUTES.DASHBOARD);
  if ((isLoginPage || isRegisterPage) && isAuthenticated) {
    return NextResponse.redirect(new URL(AUTH_ROUTES.DASHBOARD, request.url));
  }
  if (isDashboardPage && !isAuthenticated) {
    return NextResponse.redirect(new URL(AUTH_ROUTES.LOGIN, request.url));
  }
  return NextResponse.next();
}
export const config = {
  matcher: [
    '/',
    '/registerForm',
    '/dashboard/:path*'
  ]
};