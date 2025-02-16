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
  Filler,
  Tooltip,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { useTranslations } from 'next-intl';
import { filterSalesData } from '@/helpers/filterData';
import { CustomSelect } from '@/components/Buttons/CustomSelect/CustomSelect';
import Icon from '@/helpers/Icon';
import styles from './SalesChart.module.css';
import { Sale } from '@/api/sales/data';
import useExportToExcel from '@/hooks/useExportToExcel';
import WhiteBtn from '@/components/Buttons/WhiteBtn/WhiteBtn';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Filler,
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

  // Відфільтровані дані за вибраним діапазоном
  const filteredSales = useMemo(
    () => filterSalesData(dateRange, salesData),
    [dateRange, salesData]
  );

  // Параметри для бар-чарту:
  const barWidth = 32; // ширина стовпця
  const gapWidth = 50; // відстань між стовпцями
  // Обчислюємо мінімальну ширину внутрішнього контейнера:
  const chartMinWidth =
    filteredSales.length > 0 ? filteredSales.length * (barWidth + gapWidth) : 0;

  // Розрахунок максимуму для осі y (використовується для відображення фіксованих міток)
  const maxValue = useMemo(() => {
    const values = filteredSales.map(sale => sale[dataType]);
    return values.length > 0 ? Math.max(...values) : 0;
  }, [filteredSales, dataType]);

  // Генеруємо набір міток для y-осі (наприклад, 5 інтервалів)
  const tickCount = 5;
  const tickValues = useMemo(() => {
    const ticks = [];
    for (let i = 0; i <= tickCount; i++) {
      ticks.push(Math.round((maxValue / tickCount) * i));
    }
    return ticks;
  }, [maxValue]);

  // Спільні налаштування графіка
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
      },
      y: {
        position: 'right' as const,
        grid: { display: true },
        ticks: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
    },
  };

  const lineOptions = {
    ...commonOptions,
    elements: {
      point: { radius: 0 },
      line: { tension: 0.3 },
    },
  };

  const barOptions = {
    ...commonOptions,
  };

  const dataset = {
    data: filteredSales.map(sale => sale[dataType]),
    backgroundColor: chartType === 'bar' ? '#AEBBFF' : '#5672ff10',
    borderColor: '#AEBBFF',
    borderRadius: 5,
    ...(chartType === 'bar'
      ? { barThickness: barWidth, maxBarThickness: barWidth }
      : { fill: true }),
  };

  const chartData = {
    labels: filteredSales.map(sale => sale.period),
    datasets: [dataset],
  };

  // Вибір налаштувань залежно від типу графіка
  const options = chartType === 'bar' ? barOptions : lineOptions;

  // Хук для експорту даних у Excel
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

      <div className={styles.chart_wrapper}>
        <div className={styles.chart_container}>
          <div
            className={styles.chart_box}
            style={{
              minWidth: chartMinWidth,
            }}
          >
            {chartType === 'bar' ? (
              <Bar data={chartData} options={options} />
            ) : (
              <Line data={chartData} options={options} />
            )}
          </div>
        </div>
        <div className={styles.fixed_y_axis}>
          {tickValues.map((val, idx) => (
            <span className={styles.axis_item} key={idx}>
              {val}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.bottom_wrap}>
        <WhiteBtn
          onClick={exportToExcel}
          text={'Statistics.chart.buttonText'}
          icon="icon-cloud-download"
          iconFill="icon-cloud-download-fill"
        />

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
