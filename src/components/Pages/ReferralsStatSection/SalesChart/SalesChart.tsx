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
  ChartOptions,
  Plugin,
  TooltipModel,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { useTranslations } from 'next-intl';
import CustomSelect from '@/components/Buttons/CustomSelect/CustomSelect';
import styles from './SalesChart.module.css';
import useExportToExcel from '@/hooks/useExportToExcel';
import WhiteBtn from '@/components/Buttons/WhiteBtn/WhiteBtn';
import filterSalesData from '@/helpers/filterData';
import { Sale } from '@/types/salesTypes';

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
  const [selectedCategory, setSelectedCategory] = useState(['']);
  const [selectedName, setSelectedName] = useState(['']);

  const filteredSales = useMemo(
    () => filterSalesData(dateRange, salesData),
    [dateRange, salesData]
  );

  const barWidth = 32;
  const gapWidth = 50;
  const chartMinWidth =
    filteredSales.length > 0 ? filteredSales.length * (barWidth + gapWidth) : 0;

  const maxValue = useMemo(() => {
    const values = filteredSales.map(sale => sale[dataType]);
    return values.length > 0 ? Math.max(...values) : 0;
  }, [filteredSales, dataType]);

  const tickCount = 5;
  const tickValues = useMemo(() => {
    const ticks = [];
    for (let i = 0; i <= tickCount; i++) {
      ticks.push(Math.round((maxValue / tickCount) * i));
    }
    return ticks;
  }, [maxValue]);

  const customTooltip: Plugin<'bar' | 'line'> = {
    id: 'customTooltip',
    afterDraw: () => {
      return undefined;
    },
    beforeTooltipDraw: () => {
      return false;
    },
    afterTooltipDraw: (
      chart: ChartJS,
      args: { tooltip: TooltipModel<'bar' | 'line'> }
    ) => {
      let tooltipEl = document.getElementById('custom-tooltip');
      const chartContainer = document.getElementById('chart-container');

      if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.id = 'custom-tooltip';
        tooltipEl.classList.add(styles.custom_tooltip);
        if (chartContainer) {
          chartContainer.appendChild(tooltipEl);
        }
      }

      const tooltipModel = args.tooltip;

      if (!tooltipModel || !tooltipModel.body || tooltipModel.opacity === 0) {
        tooltipEl.style.opacity = '0';
        return;
      }

      const position = chart.canvas.getBoundingClientRect();
      const dataPoint = tooltipModel.dataPoints[0];

      tooltipEl.innerHTML = `<p>${dataPoint.label}</p><div></div><span>${dataPoint.raw}</span>`;

      tooltipEl.style.opacity = '1';
      tooltipEl.style.left = `${
        position.left + window.pageXOffset + tooltipModel.caretX
      }px`;
      tooltipEl.style.top = `${
        position.top + window.pageYOffset + tooltipModel.caretY - 44
      }px`;
    },
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { display: false } },
      y: { grid: { display: true }, ticks: { display: false } },
    },
    plugins: {
      tooltip: {
        enabled: false,
      },
    },
  };

  const lineOptions: ChartOptions<'line'> = {
    ...commonOptions,
    elements: {
      point: { radius: 0 },
      line: { tension: 0.3 },
    },
  };

  const barOptions: ChartOptions<'bar'> = {
    ...commonOptions,
  };

  const dataset = {
    data: filteredSales.map(sale => sale[dataType]),
    backgroundColor: chartType === 'bar' ? '#AEBBFF' : '#5672ff10',
    hoverBackgroundColor: '#5671ff',
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

  const exportToExcel = useExportToExcel({ sales: filteredSales, dateRange });

  const dateRangeOptions = [
    { value: 'today', label: 'today' },
    { value: 'yesterday', label: 'yesterday' },
    { value: 'week', label: 'week' },
    { value: 'month', label: 'month' },
    { value: 'quarter', label: 'quarter' },
    { value: 'year', label: 'year' },
    { value: 'custom', label: 'allTime' },
  ];

  return (
    <div className={styles.chart_wrap} id="chart-container">
      <h3 className={styles.chart_header}>{t('ReferralsStat.chart.header')}</h3>

      <div className={styles.chart_togglers_wrap}>
        <div className={styles.chart_toggler_block}>
          <span className={styles.chart_toggler_label}>
            {t('ReferralsStat.chart.type')}
          </span>
          <div className={styles.chart_toggler_buttons}>
            <button
              onClick={() => setDataType('amount')}
              className={`${styles.chart_button} ${
                dataType === 'amount' ? styles.active : ''
              }`}
            >
              {t('ReferralsStat.chart.sell')}
            </button>
            <button
              onClick={() => setDataType('quantity')}
              className={`${styles.chart_button} ${
                dataType === 'quantity' ? styles.active : ''
              }`}
            >
              {t('ReferralsStat.chart.replenishment')}
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
                onClick={() => setDateRange(value)}
                className={`${styles.chart_button} ${
                  dateRange === value ? styles.active : ''
                }`}
              >
                {t(`ReferralsStat.chart.${label}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.chart_category_wrap}>
        <CustomSelect
          label={t('ReferralsStat.referral')}
          options={['Все рефералы']}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
          width={338}
        />
        <CustomSelect
          label={t('ReferralsStat.tableTop.refParam')}
          options={['rnfirst']}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
          width={338}
        />
        <CustomSelect
          label={t('ReferralsStat.chart.characteristic')}
          options={['Сумма']}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
          width={339}
        />
        <CustomSelect
          label={t('Statistics.chart.toggler.togglerCategory')}
          options={[
            t('Statistics.chart.toggler.togglerChooseCategory'),
            t('Statistics.chart.toggler.togglerChooseCategory'),
          ]}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
          width={516}
        />
        <CustomSelect
          label={t('Statistics.chart.toggler.togglerName')}
          options={[
            t('Statistics.chart.toggler.togglerChooseName'),
            t('Statistics.chart.toggler.togglerChooseName'),
          ]}
          selected={selectedName}
          onSelect={setSelectedName}
          width={516}
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
              <Bar
                data={chartData}
                options={barOptions}
                plugins={[customTooltip]}
              />
            ) : (
              <Line
                data={chartData}
                options={lineOptions}
                plugins={[customTooltip]}
              />
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
