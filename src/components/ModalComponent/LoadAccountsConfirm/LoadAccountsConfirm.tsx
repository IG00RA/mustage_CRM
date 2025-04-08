import { useTranslations } from 'next-intl';
import styles from './LoadAccountsConfirm.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';

interface ConfirmLoad {
  category: string;
  names: string;
  accQuantity: string;
  seller: string;
  sellSum: string;
  tgNick: string;
  onConfirm: () => void;
  onClose: () => void;
  isLoading: boolean;
}

export default function LoadAccountsConfirm({
  category,
  names,
  accQuantity,
  seller,
  sellSum,
  tgNick,
  onConfirm,
  onClose,
  isLoading,
}: ConfirmLoad) {
  const t = useTranslations();

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onConfirm();
      }}
      className={styles.form}
    >
      <div className={styles.field}>
        <label className={styles.label}>{t('Load.selectCategory')}</label>
        <p className={styles.text}>{category}</p>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>{t('Load.selectNames')}</label>
        <p className={styles.text}>{names}</p>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>{t('Load.accQuantity')}</label>
        <p className={styles.text}>{accQuantity}</p>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>{t('Load.seller')}</label>
        <p className={styles.text}>{seller}</p>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>{t('Load.sellSum')}</label>
        <p className={styles.text}>{sellSum}</p>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>{t('Load.tgNick')}</label>
        <p className={styles.text}>{tgNick}</p>
      </div>
      <div className={styles.buttons_wrap}>
        <CancelBtn text="DBSettings.form.cancelBtn" onClick={onClose} />
        <SubmitBtn
          text={
            isLoading ? 'Load.modalConfirm.loading' : 'Load.modalConfirm.btn'
          }
          disabled={isLoading}
        />
      </div>
    </form>
  );
}
