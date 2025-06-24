import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { User } from '@/types/usersTypes';
import { fetchWithErrorHandling } from '@/utils/apiUtils';

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = request.nextUrl.locale || routing.defaultLocale;

  if (
    pathname.startsWith('/assets/') ||
    pathname.startsWith('/_next/static/') ||
    pathname.startsWith('/_next/image/') ||
    pathname.includes('favicon.ico') ||
    pathname.includes('robots.txt')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('access_token');

  const publicPaths = ['/login', '/register', '/forgot-password'];

  const isPublicPath = publicPaths.some(
    path => pathname.endsWith(path) || pathname.includes(`${path}/`)
  );

  if (isPublicPath && token?.value) {
    const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  if (isPublicPath) {
    return intlMiddleware(request);
  }

  if (!token?.value) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    await fetchWithErrorHandling<User>(
      `${process.env.NEXT_PUBLIC_HOST_BACK_LOCAL}/users/me`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.value}`,
        },
        credentials: 'include',
      },
      () => {}
    );

    return intlMiddleware(request);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('Could not validate credentials')
    ) {
      const response = NextResponse.redirect(
        new URL(`/${locale}/login`, request.url)
      );
      response.cookies.delete('access_token');
      return response;
    }
    return intlMiddleware(request);
  }
}

export const config = {
  matcher: [
    '/(ua|ru|en)/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico|assets|robots.txt).*)',
  ],
};
