'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Icon from '@/helpers/Icon';
import styles from './DateRangeSelector.module.css';
import { useSalesStore } from '@/store/salesStore';
import { DateRangeSelectorProps, AggregationType } from '@/types/salesTypes';
import CustomSelect from '@/components/Buttons/CustomSelect/CustomSelect';

interface AggregationOption {
  value: AggregationType;
  label: string;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  dateRange,
  customPeriodLabel,
  onDateRangeChange,
  onCustomDatesChange,
  onAggregationChange,
  aggregationType,
  initialStartDate = '',
  initialEndDate = '',
  label = 'Statistics.chart.toggler.togglerData',
  showAggregationSelect = false,
}) => {
  const t = useTranslations();
  const { minDate } = useSalesStore();
  const [isCustomDateOpen, setIsCustomDateOpen] = useState<boolean>(false);
  const [customStartDate, setCustomStartDate] =
    useState<string>(initialStartDate);
  const [customEndDate, setCustomEndDate] = useState<string>(initialEndDate);

  const today = new Date().toISOString().split('T')[0];
  const defaultMinDate = '2023-03-01';

  const dateRangeOptions = showAggregationSelect
    ? [
        { value: 'today' as const, label: 'togglerDataToday' },
        { value: 'yesterday' as const, label: 'togglerDataYesterday' },
        { value: 'week' as const, label: 'togglerDataWeek' },
        { value: 'month' as const, label: 'togglerDataMonth' },
        { value: 'quarter' as const, label: 'togglerDataQuarter' },
        { value: 'year' as const, label: 'togglerDataYear' },
      ]
    : [
        { value: 'today' as const, label: 'togglerDataToday' },
        { value: 'yesterday' as const, label: 'togglerDataYesterday' },
        { value: 'week' as const, label: 'togglerDataWeek' },
        { value: 'month' as const, label: 'togglerDataMonth' },
        { value: 'quarter' as const, label: 'togglerDataQuarter' },
        { value: 'year' as const, label: 'togglerDataYear' },
      ];

  const aggregationOptions: AggregationOption[] = [
    { value: null, label: t('Statistics.chart.toggler.togglerSelectPeriod') },
    { value: 'monthly', label: t('Statistics.chart.toggler.togglerByMonth') },
    { value: 'yearly', label: t('Statistics.chart.toggler.togglerByYear') },
  ];

  const handleAggregationSelect = (values: string[]) => {
    const selectedValue = values[0] as AggregationType;
    const selectedOption = aggregationOptions.find(
      opt => opt.value === selectedValue
    );
    const newAggregation = selectedOption ? selectedOption.value : null;
    if (onAggregationChange) {
      onAggregationChange(newAggregation);
    }
    if (newAggregation) {
      onDateRangeChange('all');
    } else {
      onDateRangeChange('today');
    }
  };

  const handleAllPeriodClick = () => {
    onDateRangeChange('all');
  };

  const formatDateInput = (value: string): string => {
    const numbers = value.replace(/\D/g, '').slice(0, 8);
    let formatted = '';
    if (numbers.length > 0) {
      formatted = numbers.slice(0, 4);
      if (numbers.length > 4) formatted += `-${numbers.slice(4, 6)}`;
      if (numbers.length > 6) formatted += `-${numbers.slice(6, 8)}`;
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
      date.getFullYear() === year &&
      !isNaN(date.getTime())
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
          const minYear = minDate ? parseInt(minDate.split('-')[0]) : 2000;
          const currentYear = new Date().getFullYear();
          if (yearNum < minYear) year = minYear.toString();
          else if (yearNum > currentYear) year = currentYear.toString();
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
        const startDate =
          formattedValue.length === 10 ? new Date(formattedValue) : null;
        const effectiveMinDate = minDate || defaultMinDate;
        if (startDate && startDate < new Date(effectiveMinDate)) {
          formattedValue = effectiveMinDate;
        }
        setCustomStartDate(formattedValue);
        if (
          formattedValue.length === 10 &&
          customEndDate.length === 10 &&
          isValidDate(formattedValue) &&
          isValidDate(customEndDate)
        ) {
          updateCustomDates(formattedValue, customEndDate);
        }
      } else {
        const endDate =
          formattedValue.length === 10 ? new Date(formattedValue) : null;
        if (endDate && endDate > new Date(today)) {
          formattedValue = today;
        }
        setCustomEndDate(formattedValue);
        if (
          formattedValue.length === 10 &&
          customStartDate.length === 10 &&
          isValidDate(formattedValue) &&
          isValidDate(customStartDate)
        ) {
          updateCustomDates(customStartDate, formattedValue);
        }
      }
    },
    [customStartDate, customEndDate, minDate, today]
  );

  const updateCustomDates = (start: string, end: string) => {
    if (isValidDate(start) && isValidDate(end)) {
      const startDateObj = new Date(start);
      const endDateObj = new Date(end);
      const effectiveMinDate = minDate || defaultMinDate;
      const minDateObj = new Date(effectiveMinDate);
      const todayObj = new Date(today);

      const adjustedStart =
        startDateObj < minDateObj ? effectiveMinDate : start;
      const adjustedEnd = endDateObj > todayObj ? today : end;

      if (new Date(adjustedStart) <= new Date(adjustedEnd)) {
        onCustomDatesChange(adjustedStart, adjustedEnd);
        setIsCustomDateOpen(false);
      } else {
        const nextDay = new Date(adjustedStart);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayStr = `${nextDay.getFullYear()}-${String(
          nextDay.getMonth() + 1
        ).padStart(2, '0')}-${String(nextDay.getDate()).padStart(2, '0')}`;
        if (isValidDate(nextDayStr) && new Date(nextDayStr) <= todayObj) {
          onCustomDatesChange(adjustedStart, nextDayStr);
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
                min={minDate || defaultMinDate}
                max={today}
              />
              -
              <input
                type="text"
                value={customEndDate}
                className={styles.custom_date_range_input}
                onChange={e => handleCustomDateInput('end', e.target.value)}
                placeholder="yyyy-mm-dd"
                maxLength={10}
                min={minDate || defaultMinDate}
                max={today}
              />
            </div>
          )}
        </div>
        {showAggregationSelect ? (
          <CustomSelect
            label={t('Statistics.chart.toggler.togglerAll')}
            options={aggregationOptions.map(opt => opt.value || 'none')}
            selected={[aggregationType || 'none']}
            onSelect={handleAggregationSelect}
            multiSelections={false}
            width={150}
          />
        ) : (
          <button
            onClick={handleAllPeriodClick}
            className={`${styles.chart_button} ${
              dateRange === 'all' ? styles.active : ''
            }`}
          >
            {t('Statistics.chart.toggler.togglerDataAll')}
          </button>
        )}
      </div>
    </div>
  );
};

export default DateRangeSelector;
