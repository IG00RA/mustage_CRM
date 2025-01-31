'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useSalesStore } from '@/store/salesStore';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Statistics() {
  const salesData = useSalesStore(state => state.sales);

  const chartData = {
    labels: salesData.map(sale => sale.period),
    datasets: [
      {
        label: 'Total Sales',
        data: salesData.map(sale => sale.amount),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  return (
    <div>
      <h2>Sales Statistics</h2>
      <Bar data={chartData} />
    </div>
  );
}
