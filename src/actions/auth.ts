'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// interface UserFunction {
//   function_name: string;
// }
// interface UserData {
//   is_admin: boolean;
//   functions?: UserFunction[];
// }

export async function login(formData: FormData) {
  const username = formData.get('username');
  const password = formData.get('password');

  if (!username || !password) {
    return { error: 'Username and password are required' };
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_HOST_BACK_LOCAL}/login`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ login: username, password }),
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      return { error: 'Invalid credentials' };
    } else if (response.status === 422) {
      const errorData = await response.json();
      return { error: errorData.detail[0].msg || 'Validation error' };
    } else {
      return { error: 'Login failed' };
    }
  }

  const data = await response.json();
  const token = data.access_token;

  // Збереження токену в HTTP-only куках на 30 днів
  const cookieStore = await cookies();
  cookieStore.set('access_token', token, {
    httpOnly: process.env.NEXT_PUBLIC_LOCAL !== 'local',
    // secure: process.env.NODE_ENV === 'production',
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  });

  // const userResponse = await fetch(
  //   `${process.env.NEXT_PUBLIC_HOST_BACK_LOCAL}/users/me`,
  //   {
  //     method: 'GET',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       Authorization: `Bearer ${token}`,
  //     },
  //     credentials: 'include',
  //   }
  // );

  // console.log('userResponse', userResponse);

  // if (!userResponse.ok) {
  //   return { error: 'Failed to fetch user data' };
  // }

  // const userData: UserData = await userResponse.json();

  // const isDashboardAllowed =
  //   userData.is_admin ||
  //   !userData.functions ||
  //   userData.functions.length === 0 ||
  //   userData.functions.some(func => func.function_name === 'Обзор');
  // redirect(isDashboardAllowed ? '/ru/dashboard' : '/ru/');
  redirect('/ru/dashboard');
}

export async function logout() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('access_token');
  if (!authToken?.value) {
    redirect('/ru/login');
    return;
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_HOST_BACK_LOCAL}/logout`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }
    );

    if (response.ok) {
      await response.json();
      // Перевіряємо успішність логауту
      // if (data.message === 'Logged out') {
      // Видаляємо токен на клієнтській стороні тільки після успішного логауту на бекенді
      cookieStore.delete('access_token');
      // Переміщуємо редирект поза блок try/catch
      // } else {
      // Якщо повідомлення не відповідає очікуваному, повертаємо помилку
      // return { error: 'Unexpected response from server' };
      // }
    } else {
      // Якщо статус відповіді не 200, повертаємо помилку
      return { error: 'Logout failed on server' };
    }
  } catch (error) {
    console.error('Error during API logout call:', error);
    return { error: 'Error during logout process' };
  }
  redirect('/ru/login');
}
