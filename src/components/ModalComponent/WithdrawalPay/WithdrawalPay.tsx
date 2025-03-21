import { useTranslations } from 'next-intl';
import styles from '../ModalComponent.module.css';
import ownStyles from './WithdrawalPay.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import CustomDragDropFile from '@/components/Buttons/CustomDragDropFile/CustomDragDropFile';

type FormData = {
  nameField: string;
  nameCategoryField: string;
  price: string;
  cost: string;
  nameDescription: string;
  settings: string[];
};

export default function WithdrawalPay() {
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

  const handleFileUpload = (file: File) => {
    console.log('Завантажений файл:', file);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label}>
          {t('ReferralsAll.modalPay.date')}
        </label>
        <input
          className={`${styles.input} ${errors.cost ? styles.input_error : ''}`}
          value="20/09/2024 15:00"
          placeholder={t('DBSettings.form.placeholder')}
          {...register('cost', {
            required: t('DBSettings.form.errorMessage'),
          })}
        />
        {errors.cost && <p className={styles.error}>{errors.cost.message}</p>}
      </div>
      <div className={styles.field}>
        <label className={styles.label}>{t('ReferralsAll.modalPay.ref')}</label>
        <input
          className={`${styles.input} ${errors.cost ? styles.input_error : ''}`}
          value="Рэндом нэйм"
          placeholder={t('DBSettings.form.placeholder')}
          {...register('cost', {
            required: t('DBSettings.form.errorMessage'),
          })}
        />
        {errors.cost && <p className={styles.error}>{errors.cost.message}</p>}
      </div>
      <div className={styles.field}>
        <label className={styles.label}>{t('ReferralsAll.modalPay.sum')}</label>
        <input
          className={`${styles.input} ${errors.cost ? styles.input_error : ''}`}
          value="200$"
          placeholder={t('DBSettings.form.placeholder')}
          {...register('cost', {
            required: t('DBSettings.form.errorMessage'),
          })}
        />
        {errors.cost && <p className={styles.error}>{errors.cost.message}</p>}
      </div>
      <div className={styles.field}>
        <label className={styles.label}>
          {t('ReferralsAll.modalPay.paySystem')}
        </label>
        <input
          className={`${styles.input} ${errors.cost ? styles.input_error : ''}`}
          value="Tether USD"
          placeholder={t('DBSettings.form.placeholder')}
          {...register('cost', {
            required: t('DBSettings.form.errorMessage'),
          })}
        />
        {errors.cost && <p className={styles.error}>{errors.cost.message}</p>}
      </div>
      <div className={styles.field}>
        <label className={styles.label}>
          {t('ReferralsAll.modalPay.detalis')}
        </label>
        <input
          className={`${styles.input} ${errors.cost ? styles.input_error : ''}`}
          value="TQs9wHrzQ2Wxo4XqQv8Jknq6C29vYmW1FX"
          placeholder={t('DBSettings.form.placeholder')}
          {...register('cost', {
            required: t('DBSettings.form.errorMessage'),
          })}
        />
        {errors.cost && <p className={styles.error}>{errors.cost.message}</p>}
      </div>
      <div className={ownStyles.input_wrap}>
        <label className={styles.label}>
          {t('ReferralsAll.modalPay.text')}
        </label>
        <textarea
          className={`${ownStyles.input} ${ownStyles.textarea}`}
          placeholder={t('RemoveSaleSection.fieldName')}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>
          {t('ReferralsAll.modalPay.file')}
        </label>
        <CustomDragDropFile
          acceptedExtensions={['xlsx', 'csv']}
          onFileUpload={handleFileUpload}
        />
        {errors.nameCategoryField && (
          <p className={styles.error}>{errors.nameCategoryField.message}</p>
        )}
      </div>
      <div className={styles.buttons_wrap}>
        <CancelBtn
          text="AutoFarmSection.modalReplenishmentAcc.btnCancel"
          onClick={() => reset()}
        />
        <SubmitBtn text="ReferralsAll.modalPay.addBtn" />
      </div>
    </form>
  );
}
