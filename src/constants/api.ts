export const BASE_URL =
  process.env.NEXT_PUBLIC_HOST_BACK || 'http://localhost:3000';
export const ENDPOINTS = {
  SALES_SUMMARY: `${BASE_URL}/sales/summary`,
  SALES_HOURLY: `${BASE_URL}/sales/hourly-report`,
  SALES_DAILY: `${BASE_URL}/sales/daily-report`,
  SALES_MONTHLY: `${BASE_URL}/sales/monthly-report`,
  SALES_YEARLY: `${BASE_URL}/sales/yearly-report`,
  SALES_ALL_TIME: `${BASE_URL}/sales/all-time-report`,
  CATEGORIES: `${BASE_URL}/categories`,
  SUBCATEGORIES: `${BASE_URL}/subcategories`,
  SELLERS: `${BASE_URL}/sellers`,
  ACCOUNTS: `${BASE_URL}/accounts`,
  ACCOUNT_SETS: `${BASE_URL}/account-sets`,
  ACCOUNTS_SEARCH: `${BASE_URL}/accounts/search`,
  ACCOUNTS_REPLACE: `${BASE_URL}/accounts/replace`,
  ACCOUNTS_STOP_SELLING: `${BASE_URL}/accounts/stop-selling`,
  PROMOCODES: `${BASE_URL}/promocodes`,
  USERS: `${BASE_URL}/users`,
  REGISTER_USER: `${BASE_URL}/register-user`,
  CRM_FUNCTIONS: `${BASE_URL}/crm-functions`,
  REFERRAL_PAYMENT_SETTINGS: `${BASE_URL}/referral-system/payment-settings`,
};
