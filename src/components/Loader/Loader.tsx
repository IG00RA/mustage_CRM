import styles from './Loader.module.css';
import logo from '../../img/logo.svg';
import Image from 'next/image';

export default function Loader() {
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
    </div>
  );
}
