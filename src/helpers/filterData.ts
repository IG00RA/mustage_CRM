import { DateRangeResult, RangeType, Sale } from '@/types/salesTypes';

export function filterSalesData(dateRange: string, salesData: Sale[]): Sale[] {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

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
          if (isNaN(d.getTime())) return false;
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - 6);
          return d >= weekStart && d <= today;
        }
        return false;
      });
    case 'month':
      return salesData.filter(sale => {
        if (/^\d{4}-\d{2}-\d{2}$/.test(sale.period)) {
          const d = new Date(sale.period);
          if (isNaN(d.getTime())) return false;
          const monthStart = new Date(today);
          monthStart.setMonth(today.getMonth() - 1);
          return d >= monthStart && d <= today;
        }
        return false;
      });
    case 'quarter': {
      const quarterData = salesData.filter(sale => {
        if (/^\d{4}-\d{2}-\d{2}$/.test(sale.period)) {
          const d = new Date(sale.period);
          if (isNaN(d.getTime())) return false;
          const quarterStart = new Date(today);
          quarterStart.setMonth(today.getMonth() - 3);
          return d >= quarterStart && d <= today;
        }
        return false;
      });
      return aggregateToWeekly(quarterData);
    }
    case 'year':
      return salesData.filter(sale => {
        if (/^\d{4}-\d{2}$/.test(sale.period)) {
          const [year, month] = sale.period.split('-').map(Number);
          if (isNaN(year) || isNaN(month)) return false;
          const yearStart = new Date(today);
          yearStart.setFullYear(today.getFullYear() - 1);
          const startYear = yearStart.getFullYear();
          const startMonth = yearStart.getMonth() + 1;
          return (
            (year === startYear && month >= startMonth) ||
            (year === currentYear && month <= currentMonth + 1)
          );
        }
        return false;
      });
    case 'custom':
      // Pre-aggregate daily data (YYYY-MM-DD) to monthly (YYYY-MM)
      return preAggregateToMonthly(salesData);
    default:
      return salesData;
  }
}

// Pre-aggregate daily data to monthly for custom ranges
function preAggregateToMonthly(sales: Sale[]): Sale[] {
  console.log('preAggregateToMonthly input:', sales);
  const monthlyData: { [month: string]: { amount: number; quantity: number } } =
    {};
  sales.forEach(sale => {
    const match = sale.period.match(/^(\d{4})-(\d{2})-\d{2}$/);
    if (!match) {
      console.log(
        'Invalid period format in preAggregateToMonthly:',
        sale.period
      );
      return;
    }
    const [, year, month] = match;
    const monthKey = `${year}-${month}`;
    monthlyData[monthKey] = monthlyData[monthKey] || { amount: 0, quantity: 0 };
    monthlyData[monthKey].amount += Number(sale.amount || 0);
    monthlyData[monthKey].quantity += sale.quantity || 0;
  });
  const result = Object.entries(monthlyData)
    .map(([period, data]) => ({
      period,
      amount: Number(data.amount.toFixed(2)),
      quantity: data.quantity,
    }))
    .sort((a, b) => a.period.localeCompare(b.period));
  console.log('preAggregateToMonthly output:', result);
  return result;
}

export const getDateRangeParameters = (
  range: RangeType,
  customStartDate?: string,
  customEndDate?: string
): DateRangeResult => {
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayString = yesterday.toISOString().split('T')[0];

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - 6);
  const weekStartString = weekStart.toISOString().split('T')[0];

  const monthStart = new Date(today);
  monthStart.setMonth(today.getMonth() - 1);
  const monthStartString = monthStart.toISOString().split('T')[0];

  const quarterStart = new Date(today);
  quarterStart.setMonth(today.getMonth() - 3);
  const quarterStartString = quarterStart.toISOString().split('T')[0];

  const yearStart = new Date(today);
  yearStart.setFullYear(today.getFullYear() - 1);
  const yearStartString = yearStart.toISOString().split('T')[0];

  const ranges: Record<RangeType, DateRangeResult> = {
    today: {
      reportType: 'hourly',
      current: { date: todayString },
      lastYear: { date: shiftYear(todayString) },
    },
    yesterday: {
      reportType: 'hourly',
      current: { date: yesterdayString },
      lastYear: { date: shiftYear(yesterdayString) },
    },
    week: {
      reportType: 'daily',
      current: {
        start_date: weekStartString,
        end_date: todayString,
      },
      lastYear: {
        start_date: shiftYear(weekStartString),
        end_date: shiftYear(todayString),
      },
    },
    month: {
      reportType: 'daily',
      current: {
        start_date: monthStartString,
        end_date: todayString,
      },
      lastYear: {
        start_date: shiftYear(monthStartString),
        end_date: shiftYear(todayString),
      },
    },
    quarter: {
      reportType: 'daily',
      current: {
        start_date: quarterStartString,
        end_date: todayString,
      },
      lastYear: {
        start_date: shiftYear(quarterStartString),
        end_date: shiftYear(todayString),
      },
    },
    year: {
      reportType: 'monthly',
      current: {
        start_date: yearStartString,
        end_date: todayString,
      },
      lastYear: {
        start_date: shiftYear(yearStartString),
        end_date: shiftYear(todayString),
      },
    },
    custom: {
      reportType: 'custom',
      current: { start_date: customStartDate, end_date: customEndDate },
      lastYear: {
        start_date: customStartDate ? shiftYear(customStartDate) : undefined,
        end_date: customEndDate ? shiftYear(customEndDate) : undefined,
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
  if (isNaN(year) || isNaN(month) || isNaN(day)) return false;
  const dateObject = new Date(year, month - 1, day);
  return (
    dateObject.getFullYear() === year &&
    dateObject.getMonth() === month - 1 &&
    dateObject.getDate() === day &&
    !isNaN(dateObject.getTime())
  );
};

export const getDaysDifference = (start: string, end: string): number => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 0;
  const differenceInMilliseconds = endDate.getTime() - startDate.getTime();
  return Math.ceil(differenceInMilliseconds / (1000 * 60 * 60 * 24));
};

export const aggregateToWeekly = (sales: Sale[]): Sale[] => {
  console.log('aggregateToWeekly input:', sales);
  const weeklyData: { [week: string]: { amount: number; quantity: number } } =
    {};
  sales.forEach(sale => {
    const date = new Date(sale.period);
    if (isNaN(date.getTime())) {
      console.log('Invalid date in aggregateToWeekly:', sale.period);
      return;
    }
    const year = date.getFullYear();
    const weekNumber =
      Math.floor((date.getDate() - 1 + ((date.getDay() + 6) % 7)) / 7) + 1;
    const weekKey = `${year}-W${weekNumber.toString().padStart(2, '0')}`;
    weeklyData[weekKey] = weeklyData[weekKey] || { amount: 0, quantity: 0 };
    weeklyData[weekKey].amount += sale.amount || 0;
    weeklyData[weekKey].quantity += sale.quantity || 0;
  });
  const result = Object.entries(weeklyData)
    .map(([period, data]) => ({
      period,
      amount: Number(data.amount.toFixed(2)),
      quantity: data.quantity,
    }))
    .sort((a, b) => a.period.localeCompare(b.period));
  console.log('aggregateToWeekly output:', result);
  return result;
};

export const aggregateToMonthly = (sales: Sale[]): Sale[] => {
  console.log('aggregateToMonthly input:', sales);
  const monthlyData: { [month: string]: { amount: number; quantity: number } } =
    {};
  sales.forEach(sale => {
    let year: string, month: string;
    // Handle YYYY-MM-DD
    const dailyMatch = sale.period.match(/^(\d{4})-(\d{2})-\d{2}$/);
    if (dailyMatch) {
      [, year, month] = dailyMatch;
    } else {
      // Handle YYYY-MM
      const monthlyMatch = sale.period.match(/^(\d{4})-(\d{2})$/);
      if (!monthlyMatch) {
        console.log(
          'Invalid period format in aggregateToMonthly:',
          sale.period
        );
        return;
      }
      [, year, month] = monthlyMatch;
    }
    const monthKey = `${year}-${month}`;
    monthlyData[monthKey] = monthlyData[monthKey] || { amount: 0, quantity: 0 };
    monthlyData[monthKey].amount += Number(sale.amount || 0);
    monthlyData[monthKey].quantity += sale.quantity || 0;
  });
  const result = Object.entries(monthlyData)
    .map(([period, data]) => ({
      period,
      amount: Number(data.amount.toFixed(2)),
      quantity: data.quantity,
    }))
    .sort((a, b) => a.period.localeCompare(b.period));
  console.log('aggregateToMonthly output:', result);
  return result;
};

export const aggregateToYearly = (sales: Sale[]): Sale[] => {
  console.log('aggregateToYearly input:', sales);
  const yearlyData: { [year: string]: { amount: number; quantity: number } } =
    {};
  sales.forEach(sale => {
    let year: string;
    // Handle YYYY-MM-DD
    const dailyMatch = sale.period.match(/^(\d{4})-\d{2}-\d{2}$/);
    if (dailyMatch) {
      [, year] = dailyMatch;
    } else {
      // Handle YYYY-MM
      const monthlyMatch = sale.period.match(/^(\d{4})-\d{2}$/);
      if (!monthlyMatch) {
        console.log('Invalid period format in aggregateToYearly:', sale.period);
        return;
      }
      [, year] = monthlyMatch;
    }
    yearlyData[year] = yearlyData[year] || { amount: 0, quantity: 0 };
    yearlyData[year].amount += Number(sale.amount || 0);
    yearlyData[year].quantity += sale.quantity || 0;
  });
  console.log('yearlyData before mapping:', yearlyData);
  const result = Object.entries(yearlyData)
    .map(([period, data]) => ({
      period,
      amount: Number(data.amount.toFixed(2)),
      quantity: data.quantity,
    }))
    .sort((a, b) => a.period.localeCompare(b.period));
  console.log('aggregateToYearly output:', result);
  return result;
};
