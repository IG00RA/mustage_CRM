import { useTranslations } from 'next-intl';
import styles from '../ModalComponent.module.css';
import ownStyles from './CreateNamesSet.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import WhiteBtn from '@/components/Buttons/WhiteBtn/WhiteBtn';
import CustomButtonsInput from '@/components/Buttons/CustomButtonsInput/CustomButtonsInput';

type FormData = {
  columnName: string;
  displayName: string;
};

export default function CreateNamesSet() {
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

  const toggleCreateName = () => {
    toast.success(t('DBSettings.form.okMessage'));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={ownStyles.field_wrap_main}>
        <div className={ownStyles.field_wrap}>
          <div className={styles.field}>
            <label className={styles.label}>
              {t('Names.modalCreateSet.nameField')}
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
              {t('Names.modalCreateSet.nameCategory')}
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
          <div className={styles.field}>
            <label className={styles.label}>
              {t('Names.modalCreateSet.setPrice')}
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
        </div>
        <div className={ownStyles.field_wrap_second}>
          <p className={ownStyles.field_header}>
            {t('Names.modalCreateSet.setSettings')}
          </p>
          <div className={styles.field}>
            <label className={styles.label}>
              {t('Names.modalCreateSet.setSettingsName')}
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
              {t('Names.modalCreateSet.setSettingsQuantity')}
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
          <div className={ownStyles.buttons_wrap}>
            <WhiteBtn
              onClick={toggleCreateName}
              text={'Names.modalCreateSet.setSettingBtn'}
              icon="icon-add-color"
              iconFill="icon-add-color"
            />
            <CustomButtonsInput
              buttons={['Facebook UA-фарм 7-дней - 10 шт.']}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>
              {t('Names.modalCreateSet.setSettingsPrice')}
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
          <div className={styles.field}>
            <label className={styles.label}>
              {t('Names.modalCreateSet.setSettingsDescription')}
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
        </div>
      </div>
      <div className={styles.buttons_wrap}>
        <CancelBtn text="DBSettings.form.cancelBtn" onClick={() => reset()} />
        <SubmitBtn text="Names.modalCreateSet.createBtn" />
      </div>
    </form>
  );
}
