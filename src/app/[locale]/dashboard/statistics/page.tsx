import PrivateRoute from '@/components/PrivateRoute/PrivateRoute';
import Statistics from '@/components/Statistics/Statistics';

export default function Statistic() {
  return (
    <PrivateRoute>
      <Statistics />
    </PrivateRoute>
  );
}
