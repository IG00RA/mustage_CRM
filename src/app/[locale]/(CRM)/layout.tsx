import '../../../styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';
import ResponsiveNav from '@/components/ResponsiveNav/ResponsiveNav';

export const generateMetadata = async () => {
  return {
    title: `Админ-панель | Mustage ACCOUNTS PANEL`,
    description: 'Админ-панель для управления аккаунтами',
  };
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ResponsiveNav>{children}</ResponsiveNav>;
}
