'use client';

import { useState, useMemo, useEffect } from 'react';
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
  const [fetchKey, setFetchKey] = useState<string>('today');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [isCustomDateOpen, setIsCustomDateOpen] = useState<boolean>(false);

  const {
    chartSales,
    loading,
    error,
    dateRange,
    setDateRange,
    customPeriodLabel,
    setCustomPeriodLabel,
    fetchHourlyReport,
    fetchDailyReport,
    fetchMonthlyReport,
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

    return {
      todayStr,
      yesterdayStr: yesterday.toISOString().split('T')[0],
      last7DaysStartStr: last7DaysStart.toISOString().split('T')[0],
      startOfMonthStr: startOfMonth.toISOString().split('T')[0],
      startOfQuarterStr: startOfQuarter.toISOString().split('T')[0],
      startOfYearStr: startOfYear.toISOString().split('T')[0],
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

  const formatDateInput = (value: string): string => {
    // Видаляємо все, крім цифр
    const numbers = value.replace(/\D/g, '');
    let formatted = '';

    if (numbers.length >= 2) {
      const day = numbers.slice(0, 2);
      formatted += day;
      if (numbers.length >= 4) {
        const month = numbers.slice(2, 4);
        formatted += `.${month}`;
        if (numbers.length >= 8) {
          const year = numbers.slice(4, 8);
          formatted += `.${year}`;
        } else if (numbers.length > 4) {
          formatted += `.${numbers.slice(4)}`;
        }
      } else if (numbers.length > 2) {
        formatted += `.${numbers.slice(2)}`;
      }
    } else {
      formatted = numbers;
    }

    return formatted;
  };

  const isValidDate = (dateStr: string): boolean => {
    if (dateStr.length !== 10 || dateStr.includes('_')) return false;
    const [day, month, year] = dateStr.split('.').map(Number);
    const date = new Date(year, month - 1, day);
    return (
      date.getDate() === day &&
      date.getMonth() === month - 1 &&
      date.getFullYear() === year
    );
  };

  const handleCustomDateInput = (type: 'start' | 'end', value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 8); // Обмежуємо до 8 цифр (DDMMYYYY)
    let formattedValue = formatDateInput(numbers);

    // Валідація дня, місяця, року лише для повністю введених частин
    if (formattedValue.length >= 2) {
      let [day, month, year] = formattedValue.split('.');
      if (day && day.length === 2) {
        const dayNum = parseInt(day);
        if (dayNum > 31) day = '31';
        else if (dayNum < 1) day = '01';
      }
      if (month && month.length === 2) {
        const monthNum = parseInt(month);
        if (monthNum > 12) month = '12';
        else if (monthNum < 1) month = '01';
      }
      if (year && year.length === 4) {
        const yearNum = parseInt(year);
        const currentYear = new Date().getFullYear();
        const maxYear = currentYear + 10;
        if (yearNum < 2000) year = '2000';
        else if (yearNum > maxYear) year = String(maxYear);
      }
      formattedValue = [day, month, year].filter(Boolean).join('.');
    }

    if (type === 'start') {
      setCustomStartDate(formattedValue);
      if (formattedValue.length === 10 && isValidDate(formattedValue)) {
        if (customEndDate.length === 10 && isValidDate(customEndDate)) {
          const startDateObj = new Date(
            formattedValue.split('.').reverse().join('-')
          );
          const endDateObj = new Date(
            customEndDate.split('.').reverse().join('-')
          );
          if (startDateObj < endDateObj) {
            setCustomPeriodLabel(`${formattedValue} - ${customEndDate}`);
            setIsCustomDateOpen(false);
            fetchSalesData(
              'custom',
              formattedValue.split('.').reverse().join('-'),
              customEndDate.split('.').reverse().join('-')
            );
            setFetchKey(`custom-${formattedValue}-${customEndDate}`);
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
            // Додаємо запит даних після коригування
            if (isValidDate(nextDayStr)) {
              setCustomPeriodLabel(`${formattedValue} - ${nextDayStr}`);
              setIsCustomDateOpen(false);
              fetchSalesData(
                'custom',
                formattedValue.split('.').reverse().join('-'),
                nextDayStr.split('.').reverse().join('-')
              );
              setFetchKey(`custom-${formattedValue}-${nextDayStr}`);
            }
          }
        }
      }
    } else {
      setCustomEndDate(formattedValue);
      if (
        formattedValue.length === 10 &&
        isValidDate(formattedValue) &&
        customStartDate.length === 10 &&
        isValidDate(customStartDate)
      ) {
        const startDateObj = new Date(
          customStartDate.split('.').reverse().join('-')
        );
        const endDateObj = new Date(
          formattedValue.split('.').reverse().join('-')
        );
        if (startDateObj < endDateObj) {
          setCustomPeriodLabel(`${customStartDate} - ${formattedValue}`);
          setIsCustomDateOpen(false);
          fetchSalesData(
            'custom',
            customStartDate.split('.').reverse().join('-'),
            formattedValue.split('.').reverse().join('-')
          );
          setFetchKey(`custom-${customStartDate}-${formattedValue}`);
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
          // Додаємо запит даних після коригування
          if (isValidDate(nextDayStr)) {
            setCustomPeriodLabel(`${customStartDate} - ${nextDayStr}`);
            setIsCustomDateOpen(false);
            fetchSalesData(
              'custom',
              customStartDate.split('.').reverse().join('-'),
              nextDayStr.split('.').reverse().join('-')
            );
            setFetchKey(`custom-${customStartDate}-${nextDayStr}`);
          }
        }
      }
    }
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

    switch (range) {
      case 'today':
        await fetchHourlyReport(todayStr);
        break;
      case 'yesterday':
        await fetchHourlyReport(yesterdayStr);
        break;
      case 'week':
        await fetchDailyReport(last7DaysStartStr, todayStr);
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

  useEffect(() => {
    const key =
      dateRange === 'custom'
        ? `${dateRange}-${customStartDate}-${customEndDate}`
        : dateRange;

    if (chartSales.length === 0 && !loading && !error) {
      fetchSalesData('today');
      setFetchKey('today');
    } else if (fetchKey !== key && dateRange !== 'custom') {
      fetchSalesData(dateRange);
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
                key={'custom'}
                onClick={handleCustomButtonClick}
                className={`${styles.chart_button} ${
                  dateRange === 'custom' ? styles.active : ''
                }`}
              >
                <Icon name="icon-stat_calendar_grey" width={14} height={14} />
                {dateRange === 'custom' && customPeriodLabel
                  ? customPeriodLabel
                  : t(`Statistics.chart.toggler.togglerDataCustom`)}
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
