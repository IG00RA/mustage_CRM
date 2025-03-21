import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

// Тип Locale витягуємо з routing.locales
type Locale = (typeof routing.locales)[number]; // 'ru'

export default getRequestConfig(async ({ requestLocale }) => {
  // Спочатку приймаємо результат requestLocale як string | undefined
  const requestedLocale: string | undefined = await requestLocale;

  // Зужуємо тип до Locale | undefined, перевіряючи значення
  const locale: Locale | undefined =
    requestedLocale && routing.locales.includes(requestedLocale as Locale)
      ? (requestedLocale as Locale)
      : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
