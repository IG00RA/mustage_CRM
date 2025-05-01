import { DateRangeResult, RangeType, Sale } from '@/types/salesTypes';

export default function filterSalesData(
  dateRange: string,
  salesData: Sale[]
): Sale[] {
  switch (dateRange) {
    case 'today':
      return salesData.filter(
        sale =>
          sale.period.includes(':') && !sale.period.startsWith('Yesterday')
      );
    case 'yesterday':
      return salesData.filter(sale => sale.period.startsWith('Yesterday'));
    case 'week':
      return salesData.filter(sale => {
        if (/^\d{4}-\d{2}-\d{2}$/.test(sale.period)) {
          const d = new Date(sale.period);
          return (
            d.getFullYear() === 2025 &&
            d.getMonth() === 1 &&
            d.getDate() >= 1 &&
            d.getDate() <= 7
          );
        }
        return false;
      });
    case 'month':
      return salesData.filter(sale => {
        if (/^\d{4}-\d{2}-\d{2}$/.test(sale.period)) {
          const d = new Date(sale.period);
          return d.getFullYear() === 2025 && d.getMonth() === 0;
        }
        return false;
      });
    case 'quarter': {
      const quarterData = salesData.filter(sale => {
        if (/^\d{4}-\d{2}$/.test(sale.period)) {
          const [year, month] = sale.period.split('-').map(Number);
          return year === 2025 && month >= 1 && month <= 3;
        }
        return false;
      });
      const aggregated = quarterData.reduce((acc, sale) => {
        if (!acc[sale.period]) {
          acc[sale.period] = { ...sale };
        } else {
          acc[sale.period].amount += sale.amount;
          acc[sale.period].quantity += sale.quantity;
        }
        return acc;
      }, {} as Record<string, Sale>);
      return Object.values(aggregated);
    }
    case 'year':
      return salesData.filter(sale => /^\d{4}-\d{2}$/.test(sale.period));
    default:
      return salesData;
  }
}


export const getDateRangeParameters = (
  range: RangeType,
  customStartDate?: string,
  customEndDate?: string
): DateRangeResult => {
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  const yesterday = new Date(today.setDate(today.getDate() - 1))
    .toISOString()
    .split('T')[0];
  const last7DaysStart = new Date(today.setDate(today.getDate() - 6))
    .toISOString()
    .split('T')[0];
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .split('T')[0];
  const startOfQuarter = new Date(
    today.getFullYear(),
    Math.floor(today.getMonth() / 3) * 3,
    1
  )
    .toISOString()
    .split('T')[0];
  const startOfYear = new Date(today.getFullYear(), 0, 1)
    .toISOString()
    .split('T')[0];

  const ranges: Record<RangeType, DateRangeResult> = {
    today: {
      reportType: 'hourly',
      current: { date: todayString },
      lastYear: { date: shiftYear(todayString) },
    },
    yesterday: {
      reportType: 'hourly',
      current: { date: yesterday },
      lastYear: { date: shiftYear(yesterday) },
    },
    week: {
      reportType: 'daily',
      current: { start_date: last7DaysStart, end_date: todayString },
      lastYear: {
        start_date: shiftYear(last7DaysStart),
        end_date: shiftYear(todayString),
      },
    },
    month: {
      reportType: 'daily',
      current: { start_date: startOfMonth, end_date: todayString },
      lastYear: {
        start_date: shiftYear(startOfMonth),
        end_date: shiftYear(todayString),
      },
    },
    quarter: {
      reportType: 'daily',
      current: { start_date: startOfQuarter, end_date: todayString },
      lastYear: {
        start_date: shiftYear(startOfQuarter),
        end_date: shiftYear(todayString),
      },
    },
    year: {
      reportType: 'monthly',
      current: { start_date: startOfYear, end_date: todayString },
      lastYear: {
        start_date: shiftYear(startOfYear),
        end_date: shiftYear(todayString),
      },
    },
    custom: {
      reportType: 'custom',
      current: { start_date: customStartDate, end_date: customEndDate },
      lastYear: {
        start_date: shiftYear(customStartDate!),
        end_date: shiftYear(customEndDate!),
      },
    },
    all: {
      reportType: 'all',
      current: {},
      lastYear: {},
    },
  };
  return ranges[range];
};

export const shiftYear = (date: string): string => {
  if (!date || !isValidDateFormat(date)) {
    return new Date().toISOString().split('T')[0];
  }
  return new Date(new Date(date).setFullYear(new Date(date).getFullYear() - 1))
    .toISOString()
    .split('T')[0];
};

export const isValidDateFormat = (date: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(date)) {
    return false;
  }
  const [year, month, day] = date.split('-').map(Number);
  const dateObject = new Date(year, month - 1, day);
  return (
    dateObject.getFullYear() === year &&
    dateObject.getMonth() === month - 1 &&
    dateObject.getDate() === day
  );
};

export const getDaysDifference = (start: string, end: string): number => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const differenceInMilliseconds = endDate.getTime() - startDate.getTime();
  return Math.ceil(differenceInMilliseconds / (1000 * 60 * 60 * 24));
};

export const aggregateToWeekly = (sales: Sale[]): Sale[] => {
  const weeklyData: { [week: string]: { amount: number; quantity: number } } =
    {};
  sales.forEach(sale => {
    const date = new Date(sale.period);
    const year = date.getFullYear();
    const weekNumber =
      Math.floor((date.getDate() - 1 + ((date.getDay() + 6) % 7)) / 7) + 1;
    const weekKey = `${year}-W${weekNumber.toString().padStart(2, '0')}`;
    weeklyData[weekKey] = weeklyData[weekKey] || { amount: 0, quantity: 0 };
    weeklyData[weekKey].amount += sale.amount;
    weeklyData[weekKey].quantity += sale.quantity;
  });
  return Object.entries(weeklyData).map(([period, data]) => ({
    period,
    amount: data.amount,
    quantity: data.quantity,
  }));
};

export const aggregateToMonthly = (sales: Sale[]): Sale[] => {
  const monthlyData: { [month: string]: { amount: number; quantity: number } } =
    {};
  sales.forEach(sale => {
    const date = new Date(sale.period);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}`;
    monthlyData[monthKey] = monthlyData[monthKey] || { amount: 0, quantity: 0 };
    monthlyData[monthKey].amount += sale.amount;
    monthlyData[monthKey].quantity += sale.quantity;
  });
  return Object.entries(monthlyData).map(([period, data]) => ({
    period,
    amount: data.amount,
    quantity: data.quantity,
  }));
};

export const aggregateToYearly = (sales: Sale[]): Sale[] => {
  const yearlyData: { [year: string]: { amount: number; quantity: number } } =
    {};
  sales.forEach(sale => {
    const date = new Date(sale.period);
    const yearKey = `${date.getFullYear()}`;
    yearlyData[yearKey] = yearlyData[yearKey] || { amount: 0, quantity: 0 };
    yearlyData[yearKey].amount += sale.amount;
    yearlyData[yearKey].quantity += sale.quantity;
  });
  return Object.entries(yearlyData).map(([period, data]) => ({
    period,
    amount: data.amount,
    quantity: data.quantity,
  }));
};