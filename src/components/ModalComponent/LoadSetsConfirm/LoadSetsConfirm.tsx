import { useTranslations } from 'next-intl';
import styles from './LoadSetsConfirm.module.css';
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
  isLoadComplete: boolean;
}

export default function LoadSetsConfirm({
  category,
  names,
  accQuantity,
  seller,
  sellSum,
  tgNick,
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
        <label className={styles.label}>
          {t('Sets.upload.modal.categorySet')}
        </label>
        <p className={styles.text}>{category}</p>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>
          {t('Sets.upload.modal.namesSet')}
        </label>
        <p className={styles.text}>{names}</p>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>
          {t('Sets.upload.uploadQuantity')}
        </label>
        <p className={styles.text}>{accQuantity}</p>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>{t('Load.seller')}</label>
        <p className={styles.text}>{seller}</p>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>{t('Sets.upload.setSum')}</label>
        <p className={styles.text}>{sellSum}</p>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>{t('Load.tgNick')}</label>
        <p className={styles.text}>{tgNick}</p>
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
