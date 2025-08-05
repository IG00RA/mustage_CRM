import { useTranslations } from 'next-intl';
import styles from './LoadAccountsConfirm.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';

interface ConfirmLoad {
  category: string;
  names: string;
  accQuantity: string;
  purpose: string;
  onConfirm: () => void;
  onClose: () => void;
  isLoading: boolean;
  isLoadComplete: boolean;
}

export default function LoadAccountsConfirmSelfUse({
  category,
  names,
  accQuantity,
  purpose,
  onConfirm,
  onClose,
  isLoading,
  isLoadComplete,
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
        <label className={styles.label}>{t('Load.purpose')}</label>
        <p className={styles.text}>{purpose}</p>
      </div>
      <div className={styles.buttons_wrap}>
        <CancelBtn
          text={
            isLoadComplete
              ? 'Load.modalConfirm.btnClose'
              : 'DBSettings.form.cancelBtn'
          }
          onClick={onClose}
        />

        {!isLoadComplete && (
          <SubmitBtn
            text={
              isLoading ? 'Load.modalConfirm.loading' : 'Load.modalConfirm.btn'
            }
            disabled={isLoading}
          />
        )}
      </div>
    </form>
  );
}
