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
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { useState } from 'react';
import { useSalesStore } from '@/store/salesStore';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Sale } from '@/api/sales/data';
import { CustomSelect } from '@/components/CustomSelect/CustomSelect';
import styles from './ChartSection.module.css';
import { useTranslations } from 'next-intl';
import Icon from '@/helpers/Icon';
import { filterSalesData } from '@/helpers/filterData';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip
);

const ChartSection = () => {
  const t = useTranslations();
  const salesData = useSalesStore(state => state.sales);

  const [chartType, setChartType] = useState('bar');
  const [dataType, setDataType] = useState<'amount' | 'quantity'>('amount');
  const [dateRange, setDateRange] = useState('today');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedName, setSelectedName] = useState('');

  const chartData = {
    labels: filterSalesData(dateRange, salesData).map(sale => sale.period),
    datasets: [
      {
        data: filterSalesData(dateRange, salesData).map(sale => sale[dataType]),
        backgroundColor: '#AEBBFF',
        borderRadius: 5,
      },
    ],
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Продажи');

    // Заголовки таблиці
    sheet.addRow(['Период', 'Количество', 'Сумма']);

    // Використовуємо відфільтровані дані для вибраного періоду
    const filteredSales = filterSalesData(dateRange, salesData);
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
    <>
      <div className={styles.stat_wrap}>
        <h2 className={styles.header}>{t('Statistics.header')}</h2>
        <ul className={styles.stat_list}>
          {/* Статистика за день */}
          <li className={styles.stat_item}>
            <h3 className={styles.stat_header}>
              {t('Statistics.stat.headerQuantity')}
            </h3>
            <span className={styles.stat_period}>
              <Icon
                className={styles.logo}
                name="icon-stat_calendar"
                width={14}
                height={14}
              />
              {t('Statistics.stat.periodDay')}
            </span>
            <span className={styles.stat_quantity}>
              {salesData
                .filter(
                  sale =>
                    sale.period.includes(':') &&
                    !sale.period.startsWith('Yesterday')
                )
                .reduce((sum, sale) => sum + sale.quantity, 0)}
            </span>
          </li>
          <li className={styles.stat_item}>
            <h3 className={styles.stat_header}>
              {t('Statistics.stat.headerSum')}
            </h3>
            <span className={styles.stat_period}>
              <Icon
                className={styles.logo}
                name="icon-stat_calendar"
                width={14}
                height={14}
              />
              {t('Statistics.stat.periodDay')}
            </span>
            <span className={styles.stat_quantity}>
              {salesData
                .filter(
                  sale =>
                    sale.period.includes(':') &&
                    !sale.period.startsWith('Yesterday')
                )
                .reduce((sum, sale) => sum + sale.amount, 0)}
            </span>
          </li>

          {/* Статистика за тиждень */}
          <li className={styles.stat_item}>
            <h3 className={styles.stat_header}>
              {t('Statistics.stat.headerQuantity')}
            </h3>
            <span className={styles.stat_period}>
              <Icon
                className={styles.logo}
                name="icon-stat_calendar"
                width={14}
                height={14}
              />
              {t('Statistics.stat.periodWeek')}
            </span>
            <span className={styles.stat_quantity}>
              {salesData
                .filter(sale => {
                  if (/^\d{4}-\d{2}-\d{2}$/.test(sale.period)) {
                    const d = new Date(sale.period);
                    return (
                      d.getFullYear() === 2025 &&
                      d.getMonth() === 1 &&
                      d.getDate() >= 1 &&
                      d.getDate() <= 7
                    );
                  }
                  return false;
                })
                .reduce((sum, sale) => sum + sale.quantity, 0)}
            </span>
          </li>
          <li className={styles.stat_item}>
            <h3 className={styles.stat_header}>
              {t('Statistics.stat.headerSum')}
            </h3>
            <span className={styles.stat_period}>
              <Icon
                className={styles.logo}
                name="icon-stat_calendar"
                width={14}
                height={14}
              />
              {t('Statistics.stat.periodWeek')}
            </span>
            <span className={styles.stat_quantity}>
              {salesData
                .filter(sale => {
                  if (/^\d{4}-\d{2}-\d{2}$/.test(sale.period)) {
                    const d = new Date(sale.period);
                    return (
                      d.getFullYear() === 2025 &&
                      d.getMonth() === 1 &&
                      d.getDate() >= 1 &&
                      d.getDate() <= 7
                    );
                  }
                  return false;
                })
                .reduce((sum, sale) => sum + sale.amount, 0)}
            </span>
          </li>

          {/* Статистика за місяць */}
          <li className={styles.stat_item}>
            <h3 className={styles.stat_header}>
              {t('Statistics.stat.headerQuantity')}
            </h3>
            <span className={styles.stat_period}>
              <Icon
                className={styles.logo}
                name="icon-stat_calendar"
                width={14}
                height={14}
              />
              {t('Statistics.stat.periodMonth')}
            </span>
            <span className={styles.stat_quantity}>
              {salesData
                .filter(sale => {
                  if (/^\d{4}-\d{2}-\d{2}$/.test(sale.period)) {
                    const d = new Date(sale.period);
                    return d.getFullYear() === 2025 && d.getMonth() === 0;
                  }
                  return false;
                })
                .reduce((sum, sale) => sum + sale.quantity, 0)}
            </span>
          </li>
          <li className={styles.stat_item}>
            <h3 className={styles.stat_header}>
              {t('Statistics.stat.headerSum')}
            </h3>
            <span className={styles.stat_period}>
              <Icon
                className={styles.logo}
                name="icon-stat_calendar"
                width={14}
                height={14}
              />
              {t('Statistics.stat.periodMonth')}
            </span>
            <span className={styles.stat_quantity}>
              {salesData
                .filter(sale => {
                  if (/^\d{4}-\d{2}-\d{2}$/.test(sale.period)) {
                    const d = new Date(sale.period);
                    return d.getFullYear() === 2025 && d.getMonth() === 0;
                  }
                  return false;
                })
                .reduce((sum, sale) => sum + sale.amount, 0)}
            </span>
          </li>
        </ul>
      </div>
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
              {[
                { value: 'today', label: 'togglerDataToday' },
                { value: 'yesterday', label: 'togglerDataYesterday' },
                { value: 'week', label: 'togglerDataWeek' },
                { value: 'month', label: 'togglerDataMonth' },
                { value: 'quarter', label: 'togglerDataQuarter' },
                { value: 'year', label: 'togglerDataYear' },
                { value: 'custom', label: 'togglerDataCustom', icon: true },
              ].map(({ value, label, icon }) => (
                <button
                  key={value}
                  onClick={() => setDateRange(value)}
                  className={`${styles.chart_button} ${
                    dateRange === value ? styles.active : ''
                  }`}
                >
                  {icon && (
                    <Icon
                      name="icon-stat_calendar_grey"
                      width={14}
                      height={14}
                    />
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
          <button className={styles.download_button} onClick={exportToExcel}>
            <Icon
              className={styles.download_icon}
              name="icon-cloud-download"
              width={16}
              height={16}
            />
            {t('Statistics.chart.buttonText')}
          </button>

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
    </>
  );
};

export default ChartSection;
