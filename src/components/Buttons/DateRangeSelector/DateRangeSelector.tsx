'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Icon from '@/helpers/Icon';
import styles from './DateRangeSelector.module.css';
import { DateRangeSelectorProps } from '@/types/componentsTypes';

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  dateRange,
  customPeriodLabel,
  onDateRangeChange,
  onCustomDatesChange,
  initialStartDate = '',
  initialEndDate = '',
  label = 'Statistics.chart.toggler.togglerData',
}) => {
  const t = useTranslations();
  const [isCustomDateOpen, setIsCustomDateOpen] = useState<boolean>(false);
  const [customStartDate, setCustomStartDate] =
    useState<string>(initialStartDate);
  const [customEndDate, setCustomEndDate] = useState<string>(initialEndDate);

  const dateRangeOptions = [
    { value: 'all' as const, label: 'togglerDataAll' },
    { value: 'today' as const, label: 'togglerDataToday' },
    { value: 'yesterday' as const, label: 'togglerDataYesterday' },
    { value: 'week' as const, label: 'togglerDataWeek' },
    { value: 'month' as const, label: 'togglerDataMonth' },
    { value: 'quarter' as const, label: 'togglerDataQuarter' },
    { value: 'year' as const, label: 'togglerDataYear' },
  ];

  const formatDateInput = (value: string): string => {
    const numbers = value.replace(/\D/g, '').slice(0, 8);
    let formatted = '';
    if (numbers.length > 0) {
      formatted = numbers.slice(0, 4); // Рік
      if (numbers.length > 4) formatted += `-${numbers.slice(4, 6)}`; // Місяць
      if (numbers.length > 6) formatted += `-${numbers.slice(6, 8)}`; // День
    }
    return formatted;
  };

  const isValidDate = (dateStr: string): boolean => {
    if (dateStr.length !== 10) return false;
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return (
      date.getDate() === day &&
      date.getMonth() === month - 1 &&
      date.getFullYear() === year
    );
  };

  const handleCustomDateInput = useCallback(
    (type: 'start' | 'end', value: string) => {
      const numbers = value.replace(/\D/g, '').slice(0, 8);
      let formattedValue = formatDateInput(numbers);

      if (formattedValue.length >= 4) {
        let [year, month, day] = formattedValue.split('-');
        if (year && year.length === 4) {
          const yearNum = parseInt(year);
          const currentYear = new Date().getFullYear();
          if (yearNum < 2000) year = '2000';
          else if (yearNum > currentYear) year = String(currentYear);
        }
        if (month && month.length === 2) {
          const monthNum = parseInt(month);
          if (monthNum > 12) month = '12';
          else if (monthNum < 1) month = '01';
        }
        if (day && day.length === 2) {
          const dayNum = parseInt(day);
          if (dayNum > 31) day = '31';
          else if (dayNum < 1) day = '01';
        }
        formattedValue = [year, month, day].filter(Boolean).join('-');
      }

      if (type === 'start') {
        setCustomStartDate(formattedValue);
        if (
          formattedValue.length === 10 &&
          customEndDate.length === 10 &&
          isValidDate(formattedValue)
        ) {
          updateCustomDates(formattedValue, customEndDate);
        }
      } else {
        setCustomEndDate(formattedValue);
        if (
          formattedValue.length === 10 &&
          customStartDate.length === 10 &&
          isValidDate(formattedValue)
        ) {
          updateCustomDates(customStartDate, formattedValue);
        }
      }
    },
    [customStartDate, customEndDate]
  );

  const updateCustomDates = (start: string, end: string) => {
    if (isValidDate(start) && isValidDate(end)) {
      const startDateObj = new Date(start);
      const endDateObj = new Date(end);
      if (startDateObj <= endDateObj) {
        onCustomDatesChange(start, end);
        setIsCustomDateOpen(false);
      } else {
        const nextDay = new Date(startDateObj);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayStr = `${nextDay.getFullYear()}-${String(
          nextDay.getMonth() + 1
        ).padStart(2, '0')}-${String(nextDay.getDate()).padStart(2, '0')}`;
        if (isValidDate(nextDayStr)) {
          onCustomDatesChange(start, nextDayStr);
          setIsCustomDateOpen(false);
        }
      }
    }
  };

  const handleCustomButtonClick = () => {
    onDateRangeChange('custom');
    setIsCustomDateOpen(prev => !prev);
    if (isCustomDateOpen) {
      setCustomStartDate('');
      setCustomEndDate('');
    }
  };

  return (
    <div className={styles.chart_toggler_block}>
      <span className={styles.chart_toggler_label}>{t(label)}</span>
      <div className={styles.chart_toggler_buttons}>
        {dateRangeOptions.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onDateRangeChange(value)}
            className={`${styles.chart_button} ${
              dateRange === value ? styles.active : ''
            }`}
          >
            {t(`Statistics.chart.toggler.${label}`)}
          </button>
        ))}
        <div className={styles.chart_toggler_button_wrap}>
          <button
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
                onChange={e => handleCustomDateInput('start', e.target.value)}
                placeholder="yyyy-mm-dd"
                maxLength={10}
              />
              -
              <input
                type="text"
                value={customEndDate}
                className={styles.custom_date_range_input}
                onChange={e => handleCustomDateInput('end', e.target.value)}
                placeholder="yyyy-mm-dd"
                maxLength={10}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DateRangeSelector;
