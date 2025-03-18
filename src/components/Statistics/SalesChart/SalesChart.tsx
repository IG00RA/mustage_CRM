'use client';

import { useState, useMemo, useEffect } from 'react';
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
  ChartOptions,
  TooltipModel,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { useTranslations } from 'next-intl';
import Icon from '@/helpers/Icon';
import styles from './SalesChart.module.css';
import useExportToExcel from '@/hooks/useExportToExcel';
import WhiteBtn from '@/components/Buttons/WhiteBtn/WhiteBtn';
import { useSalesStore } from '@/store/salesStore';
import { CustomSelect } from '@/components/Buttons/CustomSelect/CustomSelect';

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

const SalesChart: React.FC = () => {
  const t = useTranslations();
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [dataType, setDataType] = useState<'amount' | 'quantity'>('amount');
  const [dateRange, setDateRange] = useState<string>('today');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [fetchKey, setFetchKey] = useState<string>('today');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const {
    chartSales,
    loading,
    error,
    fetchHourlyReport,
    fetchDailyReport,
    fetchMonthlyReport,
  } = useSalesStore();

  const formatAmount = (value: number) =>
    dataType === 'amount' ? `$${value.toFixed(2)}` : value;

  const dateParams = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const last7DaysStart = new Date(today);
    last7DaysStart.setDate(today.getDate() - 6);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfQuarter = new Date(
      today.getFullYear(),
      Math.floor(today.getMonth() / 3) * 3,
      1
    );
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    return {
      todayStr,
      yesterdayStr: yesterday.toISOString().split('T')[0],
      last7DaysStartStr: last7DaysStart.toISOString().split('T')[0],
      startOfMonthStr: startOfMonth.toISOString().split('T')[0],
      startOfQuarterStr: startOfQuarter.toISOString().split('T')[0],
      startOfYearStr: startOfYear.toISOString().split('T')[0],
    };
  }, []);

  // Групування даних по тижнях для "Квартал"
  const groupByWeek = (
    sales: { period: string; amount: number; quantity: number }[]
  ) => {
    const weeklyData: { [week: string]: { amount: number; quantity: number } } =
      {};

    sales.forEach(sale => {
      const date = new Date(sale.period);
      const year = date.getFullYear();
      const weekNumber =
        Math.floor((date.getDate() - 1 + ((date.getDay() + 6) % 7)) / 7) + 1; // Номер тижня в місяці
      const weekKey = `${year}-W${weekNumber.toString().padStart(2, '0')}`;

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { amount: 0, quantity: 0 };
      }
      weeklyData[weekKey].amount += sale.amount;
      weeklyData[weekKey].quantity += sale.quantity;
    });

    return Object.entries(weeklyData).map(([period, data]) => ({
      period,
      amount: data.amount,
      quantity: data.quantity,
    }));
  };

  const fetchSalesData = async (
    range: string,
    start?: string,
    end?: string
  ) => {
    const {
      todayStr,
      yesterdayStr,
      last7DaysStartStr,
      startOfMonthStr,
      startOfQuarterStr,
      startOfYearStr,
    } = dateParams;

    console.log('Fetching:', range, 'Start:', start, 'End:', end);

    switch (range) {
      case 'today':
        await fetchHourlyReport(todayStr);
        break;
      case 'yesterday':
        await fetchHourlyReport(yesterdayStr); // Погодинний звіт за вчора
        break;
      case 'week':
        await fetchDailyReport(last7DaysStartStr, todayStr); // Останні 7 днів
        break;
      case 'month':
        await fetchDailyReport(startOfMonthStr, todayStr);
        break;
      case 'quarter': {
        await fetchDailyReport(startOfQuarterStr, todayStr);
        const groupedSales = groupByWeek(chartSales);
        useSalesStore.setState({ chartSales: groupedSales });
        break;
      }
      case 'year':
        await fetchMonthlyReport(startOfYearStr, todayStr);
        break;
      case 'custom':
        if (start && end) {
          await fetchDailyReport(start, end);
        }
        break;
    }
  };

  // Початкове завантаження та оновлення при зміні стану
  useEffect(() => {
    const key =
      dateRange === 'custom'
        ? `${dateRange}-${customStartDate}-${customEndDate}`
        : dateRange;

    // Початкове завантаження лише якщо chartSales порожній
    if (chartSales.length === 0 && !loading && !error) {
      fetchSalesData('today');
      setFetchKey('today');
    } else if (fetchKey !== key) {
      // Оновлення при зміні періоду
      fetchSalesData(dateRange, customStartDate, customEndDate);
      setFetchKey(key);
    }
  }, [
    dateRange,
    customStartDate,
    customEndDate,
    fetchKey,
    chartSales.length,
    loading,
    error,
    dateParams,
  ]);

  const handleDateRangeChange = (newRange: string) => {
    setDateRange(newRange);
    // Виклик fetchSalesData перенесено в useEffect, щоб уникнути дублювання
  };

  const handleCustomDateChange = (start: string, end: string) => {
    setCustomStartDate(start);
    setCustomEndDate(end);
    // Виклик fetchSalesData перенесено в useEffect
  };

  const barWidth = 32;
  const gapWidth = 50;
  const chartMinWidth =
    chartSales.length > 0 ? chartSales.length * (barWidth + gapWidth) : 0;

  const maxValue = useMemo(() => {
    const values = chartSales.map(sale => sale[dataType]);
    return values.length > 0 ? Math.max(...values) : 0;
  }, [chartSales, dataType]);

  const tickCount = 5;
  const tickValues = useMemo(() => {
    const ticks = [];
    for (let i = 0; i <= tickCount; i++) {
      ticks.push(Math.round((maxValue / tickCount) * i));
    }
    return ticks;
  }, [maxValue]);

  const customTooltip = {
    enabled: false,
    external: (context: {
      chart: ChartJS;
      tooltip: TooltipModel<'bar' | 'line'>;
    }) => {
      let tooltipEl = document.getElementById('custom-tooltip');
      const chartContainer = document.getElementById('chart-container');

      if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.id = 'custom-tooltip';
        tooltipEl.classList.add(styles.custom_tooltip);
        chartContainer && chartContainer.appendChild(tooltipEl);
      }

      const tooltipModel = context.tooltip;
      if (!tooltipModel || !tooltipModel.body || tooltipModel.opacity === 0) {
        tooltipEl.style.opacity = '0';
        return;
      }

      const position = context.chart.canvas.getBoundingClientRect();
      const dataPoint = tooltipModel.dataPoints[0];
      const formattedValue = formatAmount(dataPoint.raw as number);

      tooltipEl.innerHTML = `<p>${dataPoint.label}</p><div></div><span>${formattedValue}</span>`;
      tooltipEl.style.opacity = '1';
      tooltipEl.style.left = `${
        position.left + window.pageXOffset + tooltipModel.caretX
      }px`;
      tooltipEl.style.top = `${
        position.top + window.pageYOffset + tooltipModel.caretY - 44
      }px`;
    },
  };

  const commonOptions: ChartOptions<'bar' | 'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { display: false } },
      y: { grid: { display: true }, ticks: { display: false } },
    },
    plugins: { tooltip: customTooltip },
  };

  const lineOptions = {
    ...commonOptions,
    elements: { point: { radius: 0 }, line: { tension: 0.3 } },
  };
  const barOptions = { ...commonOptions };

  const dataset = {
    data: chartSales.map(sale => sale[dataType]),
    backgroundColor: chartType === 'bar' ? '#AEBBFF' : '#5672ff10',
    hoverBackgroundColor: '#5671ff',
    borderColor: '#AEBBFF',
    borderRadius: 5,
    ...(chartType === 'bar'
      ? { barThickness: barWidth, maxBarThickness: barWidth }
      : { fill: true }),
  };

  const chartData = {
    labels: chartSales.map(sale => sale.period),
    datasets: [dataset],
  };

  const options = chartType === 'bar' ? barOptions : lineOptions;

  const exportToExcel = useExportToExcel({ sales: chartSales, dateRange });

  const dateRangeOptions = [
    { value: 'today', label: 'togglerDataToday' },
    { value: 'yesterday', label: 'togglerDataYesterday' },
    { value: 'week', label: 'togglerDataWeek' },
    { value: 'month', label: 'togglerDataMonth' },
    { value: 'quarter', label: 'togglerDataQuarter' },
    { value: 'year', label: 'togglerDataYear' },
    { value: 'custom', label: 'togglerDataCustom', icon: true },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className={styles.chart_wrap} id="chart-container">
      <h3 className={styles.chart_header}>{t('Statistics.chart.header')}</h3>
      <span className={styles.chart_year_text}>
        (+43%) {t('Statistics.chart.headerText')}
      </span>

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
                onClick={() => handleDateRangeChange(value)}
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

      {dateRange === 'custom' && (
        <div className={styles.custom_date_range}>
          <input
            type="date"
            value={customStartDate}
            onChange={e =>
              handleCustomDateChange(e.target.value, customEndDate)
            }
            placeholder="Start Date"
          />
          <input
            type="date"
            value={customEndDate}
            onChange={e =>
              handleCustomDateChange(customStartDate, e.target.value)
            }
            placeholder="End Date"
          />
        </div>
      )}

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
          <div className={styles.chart_box} style={{ minWidth: chartMinWidth }}>
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
              {formatAmount(val)}
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
