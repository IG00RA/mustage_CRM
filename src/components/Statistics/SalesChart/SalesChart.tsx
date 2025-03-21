'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Icon from '@/helpers/Icon';
import styles from './SalesChart.module.css';
import useExportToExcel from '@/hooks/useExportToExcel';
import WhiteBtn from '@/components/Buttons/WhiteBtn/WhiteBtn';
import { RangeType, useSalesStore } from '@/store/salesStore';
import { CustomSelect } from '@/components/Buttons/CustomSelect/CustomSelect';
import ChartDisplay from './ChartDisplay';
import Loader from '@/components/Loader/Loader';

const SalesChart: React.FC = () => {
  const t = useTranslations();
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [dataType, setDataType] = useState<'amount' | 'quantity'>('amount');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [isCustomDateOpen, setIsCustomDateOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [showLoader, setShowLoader] = useState<boolean>(true);

  const {
    chartSales,
    error,
    dateRange,
    yearlyChange,
    customPeriodLabel,
    categories,
    subcategories,
    setDateRange,
    setCustomPeriodLabel,
    fetchCategories,
    fetchSubcategories,
  } = useSalesStore();

  useEffect(() => {
    if (chartSales.length !== 0) {
      setShowLoader(false);
    }
  }, [chartSales]);

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
      lastYearDateStr: lastYearDate.toISOString().split('T')[0],
    };
  }, []);

  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [categories.length, fetchCategories]);

  useEffect(() => {
    if (selectedCategory) {
      fetchSubcategories(parseInt(selectedCategory));
    } else {
      fetchSubcategories();
      setSelectedSubcategory('');
    }
  }, [selectedCategory, fetchSubcategories]);

  useEffect(() => {
    if (dateRange !== 'custom' || customPeriodLabel) {
      useSalesStore
        .getState()
        .fetchSalesAndYearlyChange(
          dateRange,
          dateRange === 'custom'
            ? customStartDate.split('.').reverse().join('-')
            : undefined,
          dateRange === 'custom'
            ? customEndDate.split('.').reverse().join('-')
            : undefined,
          selectedCategory ? parseInt(selectedCategory) : undefined,
          selectedSubcategory ? parseInt(selectedSubcategory) : undefined
        );
    }
  }, [dateRange, customPeriodLabel, selectedCategory, selectedSubcategory]);

  const formatDateInput = (value: string): string => {
    const numbers = value.replace(/\D/g, '').slice(0, 8); // Обрізаємо до 8 цифр (ddmmyyyy)
    let formatted = '';
    if (numbers.length > 0) {
      formatted = numbers.slice(0, 2); // День
      if (numbers.length > 2) formatted += `.${numbers.slice(2, 4)}`; // Місяць
      if (numbers.length > 4) formatted += `.${numbers.slice(4)}`; // Рік
    }
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
      if (startDateObj <= endDateObj) {
        setCustomPeriodLabel(`${start} - ${end}`);
        setIsCustomDateOpen(false);
        setDateRange('custom');
        setCustomStartDate(start);
        setCustomEndDate(end);
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
          setDateRange('custom');
          setCustomStartDate(start);
          setCustomEndDate(nextDayStr);
        }
      }
    }
  };

  const handleCustomDateInput = (type: 'start' | 'end', value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 8);
    let formattedValue = formatDateInput(numbers);

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
        const maxYear = currentYear;
        if (yearNum < 2000) year = '2000';
        else if (yearNum > maxYear) year = String(maxYear);
      }
      formattedValue = [day, month, year].filter(Boolean).join('.');
    }

    if (type === 'start') {
      setCustomStartDate(formattedValue);
      if (formattedValue.length === 10 && customEndDate.length === 10) {
        updateCustomDates(formattedValue, customEndDate);
      }
    } else {
      setCustomEndDate(formattedValue);
      if (formattedValue.length === 10 && customStartDate.length === 10) {
        updateCustomDates(customStartDate, formattedValue);
      }
    }
  };

  const handleDateRangeChange = (newRange: RangeType) => {
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

  interface DateRangeOption {
    value: RangeType;
    label: string;
  }

  const dateRangeOptions: DateRangeOption[] = [
    { value: 'today', label: 'togglerDataToday' },
    { value: 'yesterday', label: 'togglerDataYesterday' },
    { value: 'week', label: 'togglerDataWeek' },
    { value: 'month', label: 'togglerDataMonth' },
    { value: 'quarter', label: 'togglerDataQuarter' },
    { value: 'year', label: 'togglerDataYear' },
  ];

  const handleCategorySelect = (value: string) => {
    const selectedCat = categories.find(
      cat => cat.account_category_name === value
    );
    const newCategoryId = selectedCat
      ? String(selectedCat.account_category_id)
      : '';
    if (newCategoryId !== selectedCategory && selectedSubcategory) {
      setSelectedSubcategory('');
    }
    setSelectedCategory(newCategoryId);
  };

  const handleSubcategorySelect = (value: string) => {
    const selectedSub = subcategories.find(
      sub => sub.account_subcategory_name === value
    );
    setSelectedSubcategory(
      selectedSub ? String(selectedSub.account_subcategory_id) : ''
    );
  };

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
            t('Statistics.chart.toggler.togglerAllCategory'),
            ...categories.map(cat => cat.account_category_name),
          ]}
          selected={
            selectedCategory
              ? categories.find(
                  cat => cat.account_category_id === parseInt(selectedCategory)
                )?.account_category_name || ''
              : t('Statistics.chart.toggler.togglerChooseCategory')
          }
          onSelect={handleCategorySelect}
        />
        <CustomSelect
          label={t('Statistics.chart.toggler.togglerName')}
          options={[
            t('Statistics.chart.toggler.togglerAllName'),
            ...subcategories.map(sub => sub.account_subcategory_name),
          ]}
          selected={
            selectedSubcategory
              ? subcategories.find(
                  sub =>
                    sub.account_subcategory_id === parseInt(selectedSubcategory)
                )?.account_subcategory_name || ''
              : t('Statistics.chart.toggler.togglerChooseName')
          }
          onSelect={handleSubcategorySelect}
        />
      </div>

      {showLoader && <Loader error={error} />}
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
