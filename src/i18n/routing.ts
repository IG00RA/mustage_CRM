import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['ru'] as const,
  defaultLocale: 'ru' as const,
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
