import LoginForm from '@/components/Auth/LoginForm/LoginForm';

export const generateMetadata = async () => {
  return {
    title: `Авторизация | Mustage CRM`,
    description: 'Админ-панель для управления аккаунтами',
  };
};

export default function LoginPage() {
  return <LoginForm />;
}
