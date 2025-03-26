export const BASE_URL =
  process.env.NEXT_PUBLIC_HOST_BACK || 'http://localhost:3000';
export const ENDPOINTS = {
  SALES_SUMMARY: `${BASE_URL}/sales/summary`,
  SALES_HOURLY: `${BASE_URL}/sales/hourly-report`,
  SALES_DAILY: `${BASE_URL}/sales/daily-report`,
  SALES_MONTHLY: `${BASE_URL}/sales/monthly-report`,
  SALES_YEARLY: `${BASE_URL}/sales/yearly-report`,
  CATEGORIES: `${BASE_URL}/categories`,
  SUBCATEGORIES: `${BASE_URL}/subcategories`,
  ACCOUNTS: `${BASE_URL}/accounts`,
  SELLERS: `${BASE_URL}/sellers`,
  ACCOUNT_SETS: `${BASE_URL}/account-sets`,
};
