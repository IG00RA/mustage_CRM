import { useTranslations } from 'next-intl';
import styles from '../ModalComponent.module.css';
import ownStyles from './FormingSet.module.css';
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

export default function FormingSet() {
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
          {t('Upload.modalForming.nameSet')}
        </label>
        <input
          className={`${styles.input} ${errors.cost ? styles.input_error : ''}`}
          placeholder={t('DBSettings.form.placeholder')}
          {...register('cost', {
            required: t('DBSettings.form.errorMessage'),
          })}
        />
        {errors.cost && <p className={styles.error}>{errors.cost.message}</p>}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          {t('Upload.modalForming.setQuantity')}
        </label>
        <input
          className={`${styles.input} ${errors.cost ? styles.input_error : ''}`}
          placeholder={t('DBSettings.form.placeholder')}
          {...register('cost', {
            required: t('DBSettings.form.errorMessage'),
          })}
        />
        {errors.cost && <p className={styles.error}>{errors.cost.message}</p>}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>{t('Upload.modalForming.info')}</label>
        <input
          className={`${styles.input} ${errors.cost ? styles.input_error : ''}`}
          placeholder={t('DBSettings.form.placeholder')}
          {...register('cost', {
            required: t('DBSettings.form.errorMessage'),
          })}
        />
        {errors.cost && <p className={styles.error}>{errors.cost.message}</p>}
      </div>

      <p className={ownStyles.info}>{t('Upload.modalForming.text')}</p>
      <div className={styles.buttons_wrap}>
        <CancelBtn text="DBSettings.form.cancelBtn" onClick={() => reset()} />
        <SubmitBtn text="Upload.modalForming.btn" />
      </div>
    </form>
  );
}
