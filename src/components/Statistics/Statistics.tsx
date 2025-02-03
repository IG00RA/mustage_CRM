'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { useState } from 'react';
import { useSalesStore } from '@/store/salesStore';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Sale } from '@/api/sales/data';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const Statistics = () => {
  const salesData = useSalesStore(state => state.sales);

  const [chartType, setChartType] = useState('bar');
  const [dataType, setDataType] = useState<'amount' | 'quantity'>('amount');
  const [dateRange, setDateRange] = useState('Сегодня');

  const filterSalesData = (): Sale[] => {
    switch (dateRange) {
      case 'Сегодня':
        return salesData.filter(
          sale =>
            sale.period.includes(':') && !sale.period.startsWith('Yesterday')
        );
      case 'Вчера':
        return salesData.filter(sale => sale.period.startsWith('Yesterday'));
      case 'Неделя':
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
      case 'Месяц':
        return salesData.filter(sale => {
          if (/^\d{4}-\d{2}-\d{2}$/.test(sale.period)) {
            const d = new Date(sale.period);
            // Місяць: записи, що належать до січня 2025 (місяць 0)
            return d.getFullYear() === 2025 && d.getMonth() === 0;
          }
          return false;
        });
      case 'Квартал': {
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
      case 'Год':
        return salesData.filter(sale => /^\d{4}-\d{2}$/.test(sale.period));
      default:
        return salesData;
    }
  };

  const chartData = {
    labels: filterSalesData().map(sale => sale.period),
    datasets: [
      {
        label: dataType === 'amount' ? 'Сумма продаж' : 'Количество продаж',
        data: filterSalesData().map(sale => sale[dataType]),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
      },
    ],
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Продажи');

    // Заголовки таблиці
    sheet.addRow(['Период', 'Количество', 'Сумма']);

    // Використовуємо відфільтровані дані для вибраного періоду
    const filteredSales = filterSalesData();
    filteredSales.forEach(sale => {
      sheet.addRow([sale.period, sale.quantity, sale.amount]);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // Додаємо вибраний період до назви файлу
    const fileName = `sales_report_${dateRange}.xlsx`;
    saveAs(blob, fileName);
  };

  return (
    <div>
      <h2>Продажи</h2>
      <div className="stats">
        <div>
          Продажи (кол-во) за сегодня:{' '}
          {salesData.find(s => s.period === 'Day')?.quantity || 0}
        </div>
        <div>
          Продажи (сумма) за сегодня:{' '}
          {salesData.find(s => s.period === 'Day')?.amount || 0}
        </div>
        <div>
          Продажи (кол-во) за эту неделю:{' '}
          {salesData.find(s => s.period === 'Week')?.quantity || 0}
        </div>
        <div>
          Продажи (сумма) за эту неделю:{' '}
          {salesData.find(s => s.period === 'Week')?.amount || 0}
        </div>
        <div>
          Продажи (кол-во) за этот месяц:{' '}
          {salesData.find(s => s.period === 'Month')?.quantity || 0}
        </div>
        <div>
          Продажи (сумма) за этот месяц:{' '}
          {salesData.find(s => s.period === 'Month')?.amount || 0}
        </div>
      </div>
      <div className="controls">
        <label>
          Вид графика:
          <select onChange={e => setChartType(e.target.value)}>
            <option value="bar">Гістограма</option>
            <option value="line">Лінійний графік</option>
          </select>
        </label>
        <label>
          Тип:
          <select
            onChange={e => setDataType(e.target.value as 'amount' | 'quantity')}
          >
            <option value="amount">Сума</option>
            <option value="quantity">Кількість</option>
          </select>
        </label>
        <label>
          Період:
          <select onChange={e => setDateRange(e.target.value)}>
            <option>Сегодня</option>
            <option>Вчера</option>
            <option>Неделя</option>
            <option>Месяц</option>
            <option>Квартал</option>
            <option>Год</option>
          </select>
        </label>
        <button onClick={exportToExcel}>Скачати xlsx-звіт</button>
      </div>
      {chartType === 'bar' ? (
        <Bar data={chartData} />
      ) : (
        <Line data={chartData} />
      )}
    </div>
  );
};

export default Statistics;
