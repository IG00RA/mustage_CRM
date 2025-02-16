import { useTranslations } from 'next-intl';
import styles from '../ModalComponent.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

type FormData = {
  columnName: string;
  displayName: string;
};

export default function CreateCategory() {
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
          {t('Category.modalCreate.nameField')}
        </label>
        <input
          className={`${styles.input} ${
            errors.columnName ? styles.input_error : ''
          }`}
          placeholder={t('DBSettings.form.placeholder')}
          {...register('columnName', {
            required: t('DBSettings.form.errorMessage'),
          })}
        />
        {errors.columnName && (
          <p className={styles.error}>{errors.columnName.message}</p>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          {t('Category.modalCreate.descriptionField')}
        </label>
        <input
          className={`${styles.input} ${
            errors.displayName ? styles.input_error : ''
          }`}
          placeholder={t('DBSettings.form.placeholder')}
          {...register('displayName', {
            required: t('DBSettings.form.errorMessage'),
          })}
        />
        {errors.displayName && (
          <p className={styles.error}>{errors.displayName.message}</p>
        )}
      </div>
      <div className={styles.buttons_wrap}>
        <CancelBtn text="DBSettings.form.cancelBtn" onClick={() => reset()} />
        <SubmitBtn text="Category.modalCreate.createBtn" />
      </div>
    </form>
  );
}
