import { useTranslations } from 'next-intl';
import styles from './LoadAccountsConfirm.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

type FormData = {
  nameField: string;
  nameCategoryField: string;
  price: string;
  cost: string;
  nameDescription: string;
  settings: string[];
};

interface ConfirmLoad {
  category: string;
  names: string;
  accQuantity: string;
  seller: string;
  sellSum: string;
  tgNick: string;
}

export default function LoadAccountsConfirm({
  category,
  names,
  accQuantity,
  seller,
  sellSum,
  tgNick,
}: ConfirmLoad) {
  const t = useTranslations('');

  const {
    handleSubmit,
    reset,
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log('Form Data:', data);
    toast.success(t('DBSettings.form.okMessage'));
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
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
        <CancelBtn text="DBSettings.form.cancelBtn" onClick={() => reset()} />
        <SubmitBtn text="Load.modalConfirm.btn" />
      </div>
    </form>
  );
}
