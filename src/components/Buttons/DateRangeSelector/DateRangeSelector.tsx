'use client';

import 'react-datepicker/dist/react-datepicker.css';
import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import Icon from '@/helpers/Icon';
import { useSalesStore } from '@/store/salesStore';
import { DateRangeSelectorProps, AggregationType } from '@/types/salesTypes';
import CustomSelect from '@/components/Buttons/CustomSelect/CustomSelect';
import DatePicker from 'react-datepicker';
import styles from './DateRangeSelector.module.css';

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
  const [customStartDate, setCustomStartDate] = useState<Date | null>(
    initialStartDate ? new Date(initialStartDate) : null
  );
  const [customEndDate, setCustomEndDate] = useState<Date | null>(
    initialEndDate ? new Date(initialEndDate) : null
  );
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const customDateRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const defaultMinDate = new Date('2023-03-01');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        customDateRef.current &&
        !customDateRef.current.contains(event.target as Node)
      ) {
        setIsCustomDateOpen(false);
      }
    };

    if (isCustomDateOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCustomDateOpen]);

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
    { value: 'monthly', label: t('Statistics.chart.toggler.togglerByMonth') },
    { value: 'yearly', label: t('Statistics.chart.toggler.togglerByYear') },
  ];

  const handleAggregationSelect = (values: string[]) => {
    const selectedValue = values[0] as AggregationType;
    const selectedOption = aggregationOptions.find(
      opt => opt.label === selectedValue
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

  const handleCustomButtonClick = () => {
    onDateRangeChange('custom');
    setIsCustomDateOpen(prev => !prev);
    if (isCustomDateOpen) {
      setCustomStartDate(null);
      setCustomEndDate(null);
    }
  };

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    const effectiveMinDate = minDate ? new Date(minDate) : defaultMinDate;

    let adjustedStart = start;
    let adjustedEnd = end;

    if (start && start < effectiveMinDate) {
      adjustedStart = effectiveMinDate;
    }
    if (end && end > today) {
      adjustedEnd = today;
    }

    setCustomStartDate(adjustedStart);
    setCustomEndDate(adjustedEnd);

    if (adjustedStart && adjustedEnd && adjustedStart <= adjustedEnd) {
      const formatDate = (date: Date) =>
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          '0'
        )}-${String(date.getDate()).padStart(2, '0')}`;
      onCustomDatesChange(formatDate(adjustedStart), formatDate(adjustedEnd));
      setIsCustomDateOpen(false);
    }
  };

  const renderAggregationSelect = () =>
    showAggregationSelect ? (
      <CustomSelect
        options={aggregationOptions.map(
          opt => opt.label || t('Statistics.chart.toggler.togglerAll')
        )}
        selected={[
          aggregationType
            ? t(
                aggregationType === 'yearly'
                  ? 'Statistics.chart.toggler.togglerByYear'
                  : 'Statistics.chart.toggler.togglerByMonth'
              )
            : t('Statistics.chart.toggler.togglerAll'),
        ]}
        onSelect={handleAggregationSelect}
        multiSelections={false}
        width={130}
        minSelectWidth={130}
        inDate={true}
      />
    ) : (
      <button
        onClick={handleAllPeriodClick}
        className={`${styles.chart_button_all} ${
          dateRange === 'all' ? styles.active : ''
        }`}
      >
        {t('Statistics.chart.toggler.togglerDataAll')}
      </button>
    );

  const renderDateRangeButtons = () => {
    const firstGroup = dateRangeOptions.slice(0, 4);
    const secondGroup = dateRangeOptions.slice(4, 6);

    return (
      <>
        <div className={styles.date_range_group}>
          {firstGroup.map(({ value, label }) => (
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
        </div>
        <div className={styles.date_range_group_second}>
          {secondGroup.map(({ value, label }) => (
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
        </div>
      </>
    );
  };

  return (
    <div className={styles.chart_toggler_block}>
      <span className={styles.chart_toggler_label}>{t(label)}</span>
      <div className={styles.chart_toggler_buttons}>
        {isMobile ? (
          <>
            {renderAggregationSelect()}
            {renderDateRangeButtons()}
          </>
        ) : (
          <>
            {renderDateRangeButtons()}
            {renderAggregationSelect()}
          </>
        )}
        <div className={styles.chart_toggler_button_wrap} ref={customDateRef}>
          <button
            onClick={handleCustomButtonClick}
            className={`${styles.chart_button} ${
              customPeriodLabel
                ? styles.chart_button_custom_font
                : styles.chart_button_custom
            } ${dateRange === 'custom' ? styles.active : ''}`}
          >
            <Icon name="icon-stat_calendar_grey" width={14} height={14} />
            {dateRange === 'custom' && customPeriodLabel
              ? customPeriodLabel
              : t('Statistics.chart.toggler.togglerDataCustom')}
          </button>
          {dateRange === 'custom' && isCustomDateOpen && (
            <div className={styles.custom_date_range}>
              <DatePicker
                selectsRange
                startDate={customStartDate}
                endDate={customEndDate}
                onChange={handleDateChange}
                minDate={minDate ? new Date(minDate) : defaultMinDate}
                maxDate={today}
                inline
                calendarClassName={styles.custom_datepicker}
                showYearDropdown
                yearDropdownItemNumber={15}
                scrollableYearDropdown
                showMonthDropdown
                calendarStartDay={1}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DateRangeSelector;
