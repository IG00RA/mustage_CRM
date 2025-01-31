'use client';
import Icon from '@/helpers/Icon';
import styles from './LanguageSwitcher.module.css';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface LanguageSwitcherProps {
  headerStyle: boolean;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ headerStyle }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState<string>('');

  const handleLanguageChange = (lang: string) => {
    const path = pathname?.split('/').slice(2).join('/');
    router.push(`/${lang}/${path}${query}`);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlSearchParams = new URLSearchParams(window.location.search);
      const queryString = urlSearchParams.toString();
      setQuery(queryString ? `?${queryString}` : '');
    }
  }, []);

  const getLocaleFromPath = (pathname: string): string => {
    const pathSegments = pathname.split('/');
    return pathSegments[1] || 'uk';
  };

  const localeFromPath = getLocaleFromPath(pathname || '');

  return (
    <div className={`${styles.language} ${headerStyle && styles.scroll}`}>
      <Icon name="icon-local" width={24} height={24} />
      <button
        className={`${styles.button} ${
          localeFromPath === 'uk' && styles.buttonActive
        }`}
        onClick={() => handleLanguageChange('uk')}
        type="button"
      >
        UA
      </button>
      <button
        className={`${styles.button} ${
          localeFromPath === 'ru' && styles.buttonActive
        }`}
        onClick={() => handleLanguageChange('ru')}
        type="button"
      >
        RU
      </button>
      <button
        className={`${styles.button} ${
          localeFromPath === 'en' && styles.buttonActive
        }`}
        onClick={() => handleLanguageChange('en')}
        type="button"
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSwitcher;
