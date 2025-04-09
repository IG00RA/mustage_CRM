'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// export async function login(formData: FormData) {
//   const username = formData.get('username');
//   const password = formData.get('password');

//   if (!username || !password) {
//     return { error: 'Username and password are required' };
//   }

//   const response = await fetch(`${process.env.NEXT_PUBLIC_HOST_BACK}/login`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ login: username, password }),
//     credentials: 'include',
//   });
//   console.log(response);

//   if (!response.ok) {
//     if (response.status === 401) {
//       return { error: 'Invalid credentials' };
//     } else if (response.status === 422) {
//       const errorData = await response.json();
//       return { error: errorData.detail[0].msg || 'Validation error' };
//     } else {
//       return { error: 'Login failed' };
//     }
//   }

//   redirect('/ru/dashboard');
// }

export async function login(formData: FormData) {
  const username = formData.get('username');
  const password = formData.get('password');

  // Базова валідація на сервері
  if (!username || !password) {
    return { error: 'Username and password are required' };
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_HOST_BACK}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ login: username, password }),
  });

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
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  });

  redirect('/ru/');
}

export async function logout() {
  // Отримуємо токен з куків для авторизації запиту на бекенд
  const cookieStore = await cookies();
  const authToken = cookieStore.get('access_token');
  if (!authToken?.value) {
    // Якщо токену немає, просто перенаправляємо на сторінку логіну
    redirect('/ru/login');
    return;
  }

  try {
    // Викликаємо API логауту на бекенді
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_HOST_BACK}/logout`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(response);

    // Перевіряємо відповідь від бекенду
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

  // Редирект виконується поза блоком try/catch
  redirect('/ru/login');
}
