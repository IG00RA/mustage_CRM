'use client';

import { useAuthStore } from '@/store/authStore';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from './LoginForm.module.css';
import logo from '@/img/logo.svg';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore(state => state.login);
  const router = useRouter();
  const t = useTranslations();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      login(username);
      router.push('/ru/dashboard');
    }
  };

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
        <form className={styles.form} onSubmit={handleSubmit}>
          <label htmlFor="username" className={styles.label}>
            {t('LoginForm.username')}
          </label>
          <input
            className={styles.input}
            type="text"
            id="username"
            placeholder={t('LoginForm.placeholder')}
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <label htmlFor="password" className={styles.label}>
            {t('LoginForm.password')}
          </label>
          <input
            id="password"
            className={styles.input}
            type="password"
            placeholder={t('LoginForm.placeholder')}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button className={styles.button} type="submit">
            {t('LoginForm.loginButton')}
          </button>
        </form>
      </div>
    </section>
  );
}
