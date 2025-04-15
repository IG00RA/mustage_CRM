import { useTranslations } from 'next-intl';
import styles from '../ModalComponent.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import CustomSelect from '@/components/Buttons/CustomSelect/CustomSelect';
import { useState } from 'react';

type FormData = {
  columnName: string;
  displayName: string;
};

export default function EditServerFarmModal() {
  const t = useTranslations('');

  const [selectGeoAcc, setSelectGeoAcc] = useState(['']);

  const {
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
        <label className={styles.label}>{t('AutoFarmSection.geo')}</label>
        <CustomSelect
          options={['UA', 'PL']}
          selected={selectGeoAcc}
          onSelect={setSelectGeoAcc}
        />
        {errors.columnName && (
          <p className={styles.error}>{errors.columnName.message}</p>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>{t('AutoFarmSection.type')}</label>
        <CustomSelect
          options={['7 дней', '10 дней']}
          selected={selectGeoAcc}
          onSelect={setSelectGeoAcc}
        />
        {errors.displayName && (
          <p className={styles.error}>{errors.displayName.message}</p>
        )}
      </div>
      <div className={styles.buttons_wrap}>
        <CancelBtn text="DBSettings.form.cancelBtn" onClick={() => reset()} />
        <SubmitBtn text="AutoFarmSection.modalServerType.btn" />
      </div>
    </form>
  );
}
