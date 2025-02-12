// /components/Statistics/SalesChart.tsx
'use client';

import { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { useTranslations } from 'next-intl';
import { filterSalesData } from '@/helpers/filterData';
import { CustomSelect } from '@/components/CustomSelect/CustomSelect';
import Icon from '@/helpers/Icon';
import styles from '../Statistics.module.css';
import { Sale } from '@/api/sales/data';
import useExportToExcel from '@/hooks/useExportToExcel';
import ExportButton from '@/components/ExportButton/ExportButton';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip
);

interface SalesChartProps {
  salesData: Sale[];
}

const SalesChart: React.FC<SalesChartProps> = ({ salesData }) => {
  const t = useTranslations();
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [dataType, setDataType] = useState<'amount' | 'quantity'>('amount');
  const [dateRange, setDateRange] = useState('today');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedName, setSelectedName] = useState('');

  // Мемоізація відфільтрованих даних залежно від вибраного діапазону
  const filteredSales = useMemo(
    () => filterSalesData(dateRange, salesData),
    [dateRange, salesData]
  );

  const chartData = {
    labels: filteredSales.map(sale => sale.period),
    datasets: [
      {
        data: filteredSales.map(sale => sale[dataType]),
        backgroundColor: '#AEBBFF',
        borderRadius: 5,
      },
    ],
  };

  // Використовуємо хук для експорту, передаючи відфільтровані дані та вибраний діапазон
  const exportToExcel = useExportToExcel({ sales: filteredSales, dateRange });

  const dateRangeOptions = [
    { value: 'today', label: 'togglerDataToday' },
    { value: 'yesterday', label: 'togglerDataYesterday' },
    { value: 'week', label: 'togglerDataWeek' },
    { value: 'month', label: 'togglerDataMonth' },
    { value: 'quarter', label: 'togglerDataQuarter' },
    { value: 'year', label: 'togglerDataYear' },
    { value: 'custom', label: 'togglerDataCustom', icon: true },
  ];

  return (
    <div className={styles.chart_wrap}>
      <h3 className={styles.chart_header}>{t('Statistics.chart.header')}</h3>
      <span className={styles.chart_year_text}>
        (+43%) {t('Statistics.chart.headerText')}
      </span>

      {/* Тоглери для вибору типу даних та діапазону дат */}
      <div className={styles.chart_togglers_wrap}>
        <div className={styles.chart_toggler_block}>
          <span className={styles.chart_toggler_label}>
            {t('Statistics.chart.toggler.togglerType')}
          </span>
          <div className={styles.chart_toggler_buttons}>
            <button
              onClick={() => setDataType('amount')}
              className={`${styles.chart_button} ${
                dataType === 'amount' ? styles.active : ''
              }`}
            >
              {t('Statistics.chart.toggler.togglerSum')}
            </button>
            <button
              onClick={() => setDataType('quantity')}
              className={`${styles.chart_button} ${
                dataType === 'quantity' ? styles.active : ''
              }`}
            >
              {t('Statistics.chart.toggler.togglerQuantity')}
            </button>
          </div>
        </div>

        <div className={styles.chart_toggler_block}>
          <span className={styles.chart_toggler_label}>
            {t('Statistics.chart.toggler.togglerData')}
          </span>
          <div className={styles.chart_toggler_buttons}>
            {dateRangeOptions.map(({ value, label, icon }) => (
              <button
                key={value}
                onClick={() => setDateRange(value)}
                className={`${styles.chart_button} ${
                  dateRange === value ? styles.active : ''
                }`}
              >
                {icon && (
                  <Icon name="icon-stat_calendar_grey" width={14} height={14} />
                )}
                {t(`Statistics.chart.toggler.${label}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Вибір категорії та назви */}
      <div className={styles.chart_category_wrap}>
        <CustomSelect
          label={t('Statistics.chart.toggler.togglerCategory')}
          options={[
            t('Statistics.chart.toggler.togglerChooseCategory'),
            t('Statistics.chart.toggler.togglerChooseCategory'),
          ]}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
        <CustomSelect
          label={t('Statistics.chart.toggler.togglerName')}
          options={[
            t('Statistics.chart.toggler.togglerChooseName'),
            t('Statistics.chart.toggler.togglerChooseName'),
          ]}
          selected={selectedName}
          onSelect={setSelectedName}
        />
      </div>

      {chartType === 'bar' ? (
        <Bar data={chartData} />
      ) : (
        <Line data={chartData} />
      )}

      <div className={styles.bottom_wrap}>
        {/* Використовуємо окремий компонент кнопки експорту */}
        <ExportButton onExport={exportToExcel} />

        <div className={styles.chart_toggler_block}>
          <span className={styles.chart_toggler_label}>
            {t('Statistics.chart.chartView')}
          </span>
          <div className={styles.chart_toggler_buttons}>
            <button
              onClick={() => setChartType('line')}
              className={`${styles.chart_button} ${
                chartType === 'line' ? styles.active : ''
              }`}
            >
              {t('Statistics.chart.chartViewLinear')}
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`${styles.chart_button} ${
                chartType === 'bar' ? styles.active : ''
              }`}
            >
              {t('Statistics.chart.chartViewHistogram')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesChart;
