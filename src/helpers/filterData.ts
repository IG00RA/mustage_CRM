import { Sale } from '@/api/sales/data';

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
          // Тиждень: перші 7 днів лютого 2025 (місяць 1)
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
          // Місяць: записи, що належать до січня 2025 (місяць 0)
          return d.getFullYear() === 2025 && d.getMonth() === 0;
        }
        return false;
      });
    case 'quarter': {
      // Приклад агрегації для "Квартал" залишається без змін
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
