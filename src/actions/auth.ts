'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

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

  // Збереження токену в HTTP-only куках
  const cookieStore = await cookies();
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });

  redirect('/ru/dashboard');
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
  redirect('/ru/login');
}
