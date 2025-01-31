/** @type {import('next').NextConfig} */

import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/ru',
        permanent: false,
      },
      {
        source: '/ru',
        destination: '/ru/dashboard',
        permanent: false,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
