import PrivateRoute from '@/components/PrivateRoute/PrivateRoute';
import Statistics from '@/components/Statistics/Statistics';

export default function Db_settings() {
  return (
    <PrivateRoute>
      <Statistics />
    </PrivateRoute>
  );
}
