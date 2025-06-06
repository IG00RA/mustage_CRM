import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { User } from '@/types/usersTypes';
import { fetchWithErrorHandling } from '@/utils/apiUtils';

// Створюємо окремий middleware для next-intl
const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = request.nextUrl.locale || routing.defaultLocale;

  // Перевіряємо, чи це запит до статичних файлів або виключених шляхів
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

  // Публічні шляхи, які доступні без токена
  const publicPaths = ['/login', '/register', '/forgot-password'];

  // Перевіряємо, чи поточний шлях є публічним
  const isPublicPath = publicPaths.some(
    path => pathname.endsWith(path) || pathname.includes(`${path}/`)
  );

  // Якщо це публічний шлях і токен існує, перенаправляємо на головну сторінку
  if (isPublicPath && token?.value) {
    const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Якщо це публічний шлях і токена немає, пропускаємо запит через intlMiddleware
  if (isPublicPath) {
    return intlMiddleware(request);
  }

  // Якщо токена немає, перенаправляємо на сторінку логіну
  if (!token?.value) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Перевіряємо валідність токена через API
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

    // Якщо токен валідний, передаємо керування next-intl
    return intlMiddleware(request);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('Could not validate credentials')
    ) {
      // Видаляємо невалідний токен і перенаправляємо на логін
      const response = NextResponse.redirect(
        new URL(`/${locale}/login`, request.url)
      );
      response.cookies.delete('access_token');
      return response;
    }
    // Якщо інша помилка, дозволяємо запит продовжити (можна налаштувати інакше)
    return intlMiddleware(request);
  }
}

export const config = {
  matcher: [
    // Шляхи для інтернаціоналізації
    '/(ua|ru|en)/:path*',
    // Захищені маршрути (усі, крім статичних файлів і API)
    '/((?!api|_next/static|_next/image|favicon.ico|assets|robots.txt).*)',
  ],
};
