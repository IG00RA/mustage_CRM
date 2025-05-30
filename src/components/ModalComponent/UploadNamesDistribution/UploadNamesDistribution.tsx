import { useTranslations } from 'next-intl';
import styles from '../ModalComponent.module.css';
import ownStyles from './UploadNamesDistribution.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

type FormData = {
  columnName: string;
  displayName: string;
};

export default function UploadNamesDistribution() {
  const t = useTranslations('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log('Form Data:', data);
    toast.success(t('DBSettings.form.okMessage'));
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <p className={ownStyles.text}>
        {t('DistributionAll.modalCreate.sum')} <span>10</span>{' '}
      </p>
      <div className={styles.field}>
        <label className={styles.label}>
          {t('DistributionAll.modalCreate.sum')}
        </label>
        <input
          className={`${styles.input} ${
            errors.columnName ? styles.input_error : ''
          }`}
          value={'Facebook UA-фарм 7-дней - 100 шт'}
          placeholder={t('DBSettings.form.placeholder')}
          {...register('columnName', {
            required: t('DBSettings.form.errorMessage'),
          })}
        />
        {errors.displayName && (
          <p className={styles.error}>{errors.displayName.message}</p>
        )}
      </div>
      <div className={styles.buttons_wrap}>
        <CancelBtn
          text="DistributionSettings.modalUpload.btnCancel"
          onClick={() => reset()}
        />
      </div>
    </form>
  );
}
