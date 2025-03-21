import { useTranslations } from 'next-intl';
import styles from '../ModalComponent.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useState } from 'react';
import CustomCheckbox from '@/components/Buttons/CustomCheckbox/CustomCheckbox';

type FormData = {
  columnName: string;
  displayName: string;
};

const settingsOptions = ['AutoFarmSection.modalLoad.check'];

export default function UploadAccountsAutoFarm() {
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

  const [settings, setSettings] = useState(settingsOptions);

console.log(setSettings);

  const [checkedSettings, setCheckedSettings] = useState<
    Record<string, boolean>
  >({});

  const toggleCheckbox = (id: string) => {
    setCheckedSettings(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label}>
          {t('AutoFarmSection.modalLoad.ablQuantity')}
        </label>
        <input
          className={`${styles.input} ${
            errors.columnName ? styles.input_error : ''
          }`}
          placeholder={t('DBSettings.form.placeholder')}
          {...register('columnName', {
            required: t('DBSettings.form.errorMessage'),
          })}
          value="1208"
        />
        {errors.columnName && (
          <p className={styles.error}>{errors.columnName.message}</p>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          {t('AutoFarmSection.modalLoad.loadQuantity')}
        </label>
        <input
          className={`${styles.input} ${
            errors.displayName ? styles.input_error : ''
          }`}
          value="1200"
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
        <CustomCheckbox
          checked={checkedSettings[settings[0]] || false}
          onChange={() => toggleCheckbox(settings[0])}
          label={t(settings[0])}
        />
      </div>
      <div className={styles.buttons_wrap}>
        <CancelBtn
          text="AutoFarmSection.modalLoad.btnCancel"
          onClick={() => reset()}
        />
        <SubmitBtn text="AutoFarmSection.modalLoad.btn" />
      </div>
    </form>
  );
}
