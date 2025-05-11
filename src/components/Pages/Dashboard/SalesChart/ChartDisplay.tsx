import React, { memo, useState, useEffect } from 'react';
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
import styles from './SalesChart.module.css';

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

interface ChartDisplayProps {
  chartSales: { period: string; amount: number; quantity: number }[];
  chartType: 'bar' | 'line';
  dataType: 'amount' | 'quantity';
}

const ChartDisplay: React.FC<ChartDisplayProps> = memo(
  ({ chartSales, chartType, dataType }) => {
    const [isMobile, setIsMobile] = useState<boolean>(false);

    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
      };

      handleResize();
      window.addEventListener('resize', handleResize);

      return () => window.removeEventListener('resize', handleResize);
    }, []);

    const formatAmount = (value: number) =>
      dataType === 'amount' ? `$${value.toFixed(2)}` : value;

    const barWidth = 32;
    const gapWidth = isMobile ? 18 : 50;
    const chartMinWidth =
      chartSales.length > 0 ? chartSales.length * (barWidth + gapWidth) : 0;

    const maxValue = React.useMemo(() => {
      const values = chartSales.map(sale => sale[dataType]);
      return values.length > 0 ? Math.max(...values) : 0;
    }, [chartSales, dataType]);

    const tickCount = 5;
    const tickValues = React.useMemo(() => {
      const ticks = [];
      for (let i = 0; i <= tickCount; i++) {
        ticks.push(Math.round((maxValue / tickCount) * i));
      }
      return ticks;
    }, [maxValue]);

    const commonOptions: ChartOptions<'bar' | 'line'> = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { display: false } },
        y: { grid: { display: true }, ticks: { display: false } },
      },
      plugins: {
        tooltip: {
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
              if (chartContainer) {
                chartContainer.appendChild(tooltipEl);
              }
            }

            const tooltipModel = context.tooltip;
            if (
              !tooltipModel ||
              !tooltipModel.body ||
              tooltipModel.opacity === 0
            ) {
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
        },
      },
    };

    const lineOptions: ChartOptions<'line'> = {
      ...commonOptions,
      elements: { point: { radius: 0 }, line: { tension: 0.3 } },
    };

    const barOptions: ChartOptions<'bar'> = {
      ...commonOptions,
    };

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

    return (
      <div className={styles.chart_wrapper}>
        <div className={styles.chart_container} id="chart-container">
          <div className={styles.chart_box} style={{ minWidth: chartMinWidth }}>
            {chartType === 'bar' ? (
              <Bar data={chartData} options={barOptions} />
            ) : (
              <Line data={chartData} options={lineOptions} />
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
    );
  }
);

ChartDisplay.displayName = 'ChartDisplay';

export default ChartDisplay;
