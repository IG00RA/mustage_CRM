import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

// Створюємо окремий middleware для next-intl
const intlMiddleware = createIntlMiddleware(routing);

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Перевіряємо, чи це запит до статичних файлів в /assets
  if (pathname.startsWith('/assets/')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('access_token');

  // Публічні шляхи, які доступні без токена
  const publicPaths = ['/login', '/register', '/forgot-password'];

  // Перевіряємо, чи поточний шлях є публічним
  const isPublicPath = publicPaths.some(
    path => pathname.endsWith(path) || pathname.includes(`${path}/`)
  );

  // Якщо це публічний шлях і токен існує, перенаправляємо на головну сторінку
  if (isPublicPath && token?.value) {
    const locale = request.nextUrl.locale || routing.defaultLocale;
    const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Якщо це публічний шлях і токена немає, пропускаємо запит через intlMiddleware
  if (isPublicPath) {
    return intlMiddleware(request);
  }

  if (!token?.value) {
    const locale = request.nextUrl.locale || routing.defaultLocale;
    const loginUrl = new URL(`/${locale}/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Якщо токен є, передаємо керування next-intl
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Шляхи для інтернаціоналізації
    '/(ua|ru|en)/:path*',
    // Захищені маршрути (усі, крім статичних файлів і API)
    '/((?!api|_next/static|_next/image|favicon.ico|assets|robots.txt).*)', // Додали assets до виключень
  ],
};
