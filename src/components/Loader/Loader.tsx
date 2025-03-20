import styles from './Loader.module.css';
import logo from '../../img/logo.svg';
import Image from 'next/image';

interface LoaderType {
  error?: string | null;
}

export default function Loader({ error }: LoaderType) {
  return (
    <div className={styles.logo_wrap}>
      <Image
        src={logo}
        alt="Mustage logo"
        className={styles.logo}
        width={0}
        height={0}
        sizes="100vw"
      />
      {error && <div className={styles.error_message}>Error: {error}</div>}
    </div>
  );
}
