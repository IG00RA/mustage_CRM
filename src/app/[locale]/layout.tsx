import '../../styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';

import { NextIntlClientProvider } from 'next-intl';
import localFont from 'next/font/local';
import { Inter, Public_Sans } from 'next/font/google';
import { getMessages } from 'next-intl/server';
import { ToastContainer } from 'react-toastify';
import { Metadata } from 'next';

const public_Sans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font_sans',
  adjustFontFallback: false,
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font_inter',
  adjustFontFallback: false,
});

const sfPro = localFont({
  src: [
    {
      path: '../../fonts/SF-Pro-Display-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../fonts/SF-Pro-Display-Medium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../fonts/SF-Pro-Display-Semibold.otf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../fonts/SF-Pro-Display-Bold.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font_sfPro',
});

const localeMetadata: Record<
  string,
  { title: string; description: string; keywords: string }
> = {
  uk: {
    title: 'Вакансії в Mustage Team – Робота в digital-маркетингу',
    description:
      'Приєднуйтесь до Mustage Team – молодої української команди, що створює інноваційні рішення у digital-маркетингу та affiliate-індустрії.',
    keywords:
      'вакансії, робота, Mustage Team, digital-маркетинг, affiliate-маркетинг, кар’єра',
  },
  ru: {
    title: 'Mustage CRM – Админ-панель для управления аккаунтами',
    description: 'Mustage CRM – Админ-панель для управления аккаунтами',
    keywords:
      'вакансии, работа, Mustage Team, digital-маркетинг, affiliate-маркетинг, карьера',
  },
  en: {
    title: 'Careers at Mustage Team – Jobs in Digital Marketing',
    description:
      'Join Mustage Team – a young Ukrainian team creating innovative solutions in digital marketing and the affiliate industry.',
    keywords:
      'jobs, careers, Mustage Team, digital marketing, affiliate marketing, opportunities',
  },
};

type Props = {
  params: Promise<{ locale: string }>;
};
export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { locale } = await params;
  const metadataValues = localeMetadata[locale] || localeMetadata.ru;
  const url = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return {
    metadataBase: new URL(url), // Базовий URL
    title: metadataValues.title,
    description: metadataValues.description,
    keywords: metadataValues.keywords,
    robots: {
      index: true,
      follow: true,
    },
    twitter: {
      card: 'summary_large_image',
      title: metadataValues.title,
      description: metadataValues.description,
      images: [
        {
          url: '/opengraph-image.png',
          width: 1200,
          height: 630,
          alt: metadataValues.title,
        },
      ],
    },
    openGraph: {
      title: metadataValues.title,
      description: metadataValues.description,
      type: 'website',
      images: [
        {
          url: '/opengraph-image.png',
          width: 1200,
          height: 630,
          alt: metadataValues.title,
        },
      ],
    },
    icons: {
      icon: [
        { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/favicon.ico', type: 'image/x-icon' },
        { url: '/apple-touch-icon.png', sizes: '180x180' },
      ],
    },
    manifest: `/site.webmanifest`,
  };
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;
  const { locale } = resolvedParams;

  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <body
        className={`${public_Sans.variable} ${inter.variable} ${sfPro.variable}`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
          <ToastContainer />
          <div id="__next"></div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
