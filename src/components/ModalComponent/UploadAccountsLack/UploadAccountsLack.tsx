import { useTranslations } from 'next-intl';
import styles from '../ModalComponent.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';

type FormData = {
  columnName: string;
  displayName: string;
};

export default function UploadAccountsLack() {
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
      <div className={styles.field}>
        <label className={styles.label}>
          {t('DistributionCreate.modalCreate.field')}
        </label>
        <input
          className={`${styles.input} ${
            errors.columnName ? styles.input_error : ''
          }`}
          value={
            'Facebook UA-фарм 7-дней, необходимо: 200, в наличии: 100, недостача: 100.'
          }
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
        <SubmitBtn text="DistributionCreate.modalCreate.addBtn" />
      </div>
    </form>
  );
}
