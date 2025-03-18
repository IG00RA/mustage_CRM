'use client';

import { useActionState, useTransition } from 'react'; // Додаємо useTransition
import { login } from '@/actions/auth';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import styles from './LoginForm.module.css';
import logo from '@/img/logo.svg';

export default function LoginForm() {
  const t = useTranslations();

  // Стан для збереження значення логіну
  const [usernameValue, setUsernameValue] = useState('');
  // Стан для відстеження завантаження
  const [isPending, startTransition] = useTransition();

  // Обгортка для Server Action
  const wrappedLogin = async (state: { error: any }, formData: FormData) => {
    const result = await login(formData);
    return result;
  };

  const [state, formAction] = useActionState(wrappedLogin, { error: null });

  // Показуємо помилки через toast
  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <Image
          src={logo}
          alt="Mustage CRM logo"
          className={styles.logo}
          width={0}
          height={0}
          sizes="100vw"
        />
        <h2 className={styles.header}>{t('LoginForm.loginHeader')}</h2>
        <h4 className={styles.header_text}>{t('LoginForm.loginText')}</h4>
        <form
          action={formData => startTransition(() => formAction(formData))} // Використовуємо useTransition
          className={styles.form}
        >
          <label htmlFor="username" className={styles.label}>
            {t('LoginForm.username')}
          </label>
          <input
            className={styles.input}
            type="text"
            id="username"
            name="username"
            placeholder={t('LoginForm.placeholder')}
            value={usernameValue} // Контролюємо значення
            onChange={e => setUsernameValue(e.target.value)} // Оновлюємо стан
            required
          />
          <label htmlFor="password" className={styles.label}>
            {t('LoginForm.password')}
          </label>
          <input
            id="password"
            className={styles.input}
            type="password"
            name="password"
            placeholder={t('LoginForm.placeholder')}
            required
          />
          <button className={styles.button} type="submit" disabled={isPending}>
            {isPending ? (
              <span className={`${styles.loader}`}></span>
            ) : (
              t('LoginForm.loginButton')
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
