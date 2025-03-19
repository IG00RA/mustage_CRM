'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import Icon from '@/helpers/Icon';
import styles from './SalesChart.module.css';
import useExportToExcel from '@/hooks/useExportToExcel';
import WhiteBtn from '@/components/Buttons/WhiteBtn/WhiteBtn';
import { useSalesStore } from '@/store/salesStore';
import { CustomSelect } from '@/components/Buttons/CustomSelect/CustomSelect';
import ChartDisplay from './ChartDisplay';

const SalesChart: React.FC = () => {
  const t = useTranslations();
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [dataType, setDataType] = useState<'amount' | 'quantity'>('amount');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [isCustomDateOpen, setIsCustomDateOpen] = useState<boolean>(false);
  const [yearlyChange, setYearlyChange] = useState<number | null>(null); // Для зберігання відсотка зміни

  const {
    chartSales,
    loading,
    error,
    dateRange,
    setDateRange,
    customPeriodLabel,
    setCustomPeriodLabel,
    fetchReport,
  } = useSalesStore();

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
    const lastYearDate = new Date(today);
    lastYearDate.setFullYear(today.getFullYear() - 1);

    return {
      todayStr,
      yesterdayStr: yesterday.toISOString().split('T')[0],
      last7DaysStartStr: last7DaysStart.toISOString().split('T')[0],
      startOfMonthStr: startOfMonth.toISOString().split('T')[0],
      startOfQuarterStr: startOfQuarter.toISOString().split('T')[0],
      startOfYearStr: startOfYear.toISOString().split('T')[0],
      lastYearDateStr: lastYearDate.toISOString().split('T')[0], // Дата за минулий рік
    };
  }, []);

  const groupByWeek = (
    sales: { period: string; amount: number; quantity: number }[]
  ) => {
    const weeklyData: { [week: string]: { amount: number; quantity: number } } =
      {};
    sales.forEach(sale => {
      const date = new Date(sale.period);
      const year = date.getFullYear();
      const weekNumber =
        Math.floor((date.getDate() - 1 + ((date.getDay() + 6) % 7)) / 7) + 1;
      const weekKey = `${year}-W${weekNumber.toString().padStart(2, '0')}`;
      if (!weeklyData[weekKey])
        weeklyData[weekKey] = { amount: 0, quantity: 0 };
      weeklyData[weekKey].amount += sale.amount;
      weeklyData[weekKey].quantity += sale.quantity;
    });
    return Object.entries(weeklyData).map(([period, data]) => ({
      period,
      amount: data.amount,
      quantity: data.quantity,
    }));
  };

  const formatDateInput = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    let formatted = '';
    if (numbers.length >= 2) {
      formatted += numbers.slice(0, 2);
      if (numbers.length >= 4) formatted += `.${numbers.slice(2, 4)}`;
      if (numbers.length >= 8) formatted += `.${numbers.slice(4, 8)}`;
      else if (numbers.length > 4) formatted += `.${numbers.slice(4)}`;
    } else formatted = numbers;
    return formatted;
  };

  const isValidDate = (dateStr: string): boolean => {
    if (dateStr.length !== 10) return false;
    const [day, month, year] = dateStr.split('.').map(Number);
    const date = new Date(year, month - 1, day);
    return (
      date.getDate() === day &&
      date.getMonth() === month - 1 &&
      date.getFullYear() === year
    );
  };

  const updateCustomDates = (start: string, end: string) => {
    if (isValidDate(start) && isValidDate(end)) {
      const startDateObj = new Date(start.split('.').reverse().join('-'));
      const endDateObj = new Date(end.split('.').reverse().join('-'));
      if (startDateObj < endDateObj) {
        setCustomPeriodLabel(`${start} - ${end}`);
        setIsCustomDateOpen(false);
        fetchSalesData(
          'custom',
          start.split('.').reverse().join('-'),
          end.split('.').reverse().join('-')
        );
      } else {
        const nextDay = new Date(startDateObj);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayStr = `${String(nextDay.getDate()).padStart(
          2,
          '0'
        )}.${String(nextDay.getMonth() + 1).padStart(
          2,
          '0'
        )}.${nextDay.getFullYear()}`;
        setCustomEndDate(nextDayStr);
        if (isValidDate(nextDayStr)) {
          setCustomPeriodLabel(`${start} - ${nextDayStr}`);
          setIsCustomDateOpen(false);
          fetchSalesData(
            'custom',
            start.split('.').reverse().join('-'),
            nextDayStr.split('.').reverse().join('-')
          );
        }
      }
    }
  };

  const handleCustomDateInput = (type: 'start' | 'end', value: string) => {
    const formattedValue = formatDateInput(
      value.replace(/\D/g, '').slice(0, 8)
    );
    if (type === 'start') {
      setCustomStartDate(formattedValue);
      if (formattedValue.length === 10)
        updateCustomDates(formattedValue, customEndDate);
    } else {
      setCustomEndDate(formattedValue);
      if (formattedValue.length === 10)
        updateCustomDates(customStartDate, formattedValue);
    }
  };

  const fetchSalesData = useCallback(
    async (range: string, start?: string, end?: string) => {
      const {
        todayStr,
        yesterdayStr,
        last7DaysStartStr,
        startOfMonthStr,
        startOfQuarterStr,
        startOfYearStr,
      } = dateParams;

      switch (range) {
        case 'today':
          await fetchReport('hourly', { date: todayStr });
          break;
        case 'yesterday':
          await fetchReport('hourly', { date: yesterdayStr });
          break;
        case 'week':
          await fetchReport('daily', {
            startDate: last7DaysStartStr,
            endDate: todayStr,
          });
          break;
        case 'month':
          await fetchReport('daily', {
            startDate: startOfMonthStr,
            endDate: todayStr,
          });
          break;
        case 'quarter': {
          await fetchReport('daily', {
            startDate: startOfQuarterStr,
            endDate: todayStr,
          });
          const currentSales = useSalesStore.getState().chartSales;
          const groupedSales = groupByWeek(currentSales);
          useSalesStore.setState({ chartSales: groupedSales });
          break;
        }
        case 'year':
          await fetchReport('monthly', {
            startDate: startOfYearStr,
            endDate: todayStr,
          });
          break;
        case 'custom':
          if (start && end) {
            await fetchReport('custom', { startDate: start, endDate: end });
          }
          break;
      }
    },
    [dateParams]
  );

  // Функція для обчислення відсоткової зміни порівняно з минулим роком
  const fetchYearlyChange = useCallback(async () => {
    const { todayStr, lastYearDateStr } = dateParams;

    // Отримуємо дані за сьогодні
    await fetchReport('hourly', { date: todayStr });
    const todaySales = useSalesStore.getState().chartSales;
    const todayTotalAmount = todaySales.reduce(
      (sum, sale) => sum + sale.amount,
      0
    );

    // Отримуємо дані за аналогічний день минулого року
    await fetchReport('hourly', { date: lastYearDateStr });
    const lastYearSales = useSalesStore.getState().chartSales;
    const lastYearTotalAmount = lastYearSales.reduce(
      (sum, sale) => sum + sale.amount,
      0
    );

    // Обчислюємо відсоткову зміну
    if (lastYearTotalAmount === 0) {
      setYearlyChange(todayTotalAmount > 0 ? 100 : 0); // Якщо минулого року не було продажів
    } else {
      const change =
        ((todayTotalAmount - lastYearTotalAmount) / lastYearTotalAmount) * 100;
      setYearlyChange(Number(change.toFixed(1))); // Округлюємо до одного знака
    }

    // Повертаємо дані за сьогодні після обчислення
    await fetchReport('hourly', { date: todayStr });
  }, [dateParams]);

  const prevDateRangeRef = useRef(dateRange);

  // Початкове завантаження даних і обчислення відсотка
  useEffect(() => {
    if (chartSales.length === 0 && !loading && !error) {
      fetchSalesData('today');
      fetchYearlyChange(); // Обчислюємо відсоток при першому завантаженні
    }
  }, [chartSales.length, loading, error, fetchSalesData, fetchYearlyChange]);

  // Реагуємо на зміну dateRange
  useEffect(() => {
    if (dateRange !== 'custom' && dateRange !== prevDateRangeRef.current) {
      fetchSalesData(dateRange);
      if (dateRange === 'today') fetchYearlyChange(); // Оновлюємо відсоток для 'today'
      prevDateRangeRef.current = dateRange;
    }
  }, [dateRange, fetchSalesData, fetchYearlyChange]);

  const handleDateRangeChange = (newRange: string) => {
    setDateRange(newRange);
    setIsCustomDateOpen(false);
    setCustomPeriodLabel('');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  const handleCustomButtonClick = () => {
    setDateRange('custom');
    setIsCustomDateOpen(!isCustomDateOpen);
    if (isCustomDateOpen) {
      setCustomStartDate('');
      setCustomEndDate('');
    }
  };

  const exportToExcel = useExportToExcel({ sales: chartSales, dateRange });

  const dateRangeOptions = [
    { value: 'today', label: 'togglerDataToday' },
    { value: 'yesterday', label: 'togglerDataYesterday' },
    { value: 'week', label: 'togglerDataWeek' },
    { value: 'month', label: 'togglerDataMonth' },
    { value: 'quarter', label: 'togglerDataQuarter' },
    { value: 'year', label: 'togglerDataYear' },
  ];

  return (
    <div className={styles.chart_wrap} id="chart-container">
      <h3 className={styles.chart_header}>{t('Statistics.chart.header')}</h3>
      <span className={styles.chart_year_text}>
        {yearlyChange !== null
          ? `(${yearlyChange > 0 ? '+' : ''}${yearlyChange}%)`
          : '(0%)'}{' '}
        {t('Statistics.chart.headerText')}
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
            {dateRangeOptions.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handleDateRangeChange(value)}
                className={`${styles.chart_button} ${
                  dateRange === value ? styles.active : ''
                }`}
              >
                {t(`Statistics.chart.toggler.${label}`)}
              </button>
            ))}
            <div className={styles.chart_toggler_button_wrap}>
              <button
                key="custom"
                onClick={handleCustomButtonClick}
                className={`${styles.chart_button} ${
                  dateRange === 'custom' ? styles.active : ''
                }`}
              >
                <Icon name="icon-stat_calendar_grey" width={14} height={14} />
                {dateRange === 'custom' && customPeriodLabel
                  ? customPeriodLabel
                  : t('Statistics.chart.toggler.togglerDataCustom')}
              </button>
              {dateRange === 'custom' && isCustomDateOpen && (
                <div className={styles.custom_date_range}>
                  <input
                    type="text"
                    value={customStartDate}
                    className={styles.custom_date_range_input}
                    onChange={e =>
                      handleCustomDateInput('start', e.target.value)
                    }
                    placeholder="dd.mm.yyyy"
                    maxLength={10}
                  />
                  -
                  <input
                    type="text"
                    value={customEndDate}
                    className={styles.custom_date_range_input}
                    onChange={e => handleCustomDateInput('end', e.target.value)}
                    placeholder="dd.mm.yyyy"
                    maxLength={10}
                  />
                </div>
              )}
            </div>
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

      <ChartDisplay
        chartSales={chartSales}
        chartType={chartType}
        dataType={dataType}
      />
      <div className={styles.bottom_wrap}>
        <WhiteBtn
          onClick={exportToExcel}
          text="Statistics.chart.buttonText"
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
