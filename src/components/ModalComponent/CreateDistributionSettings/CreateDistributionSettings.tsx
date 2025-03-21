import { useTranslations } from 'next-intl';
import styles from '../ModalComponent.module.css';
import ownStyles from './CreateDistributionSettings.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import WhiteBtn from '@/components/Buttons/WhiteBtn/WhiteBtn';
import CustomButtonsInput from '@/components/Buttons/CustomButtonsInput/CustomButtonsInput';
import CustomSelect from '@/components/Buttons/CustomSelect/CustomSelect';
import { useState } from 'react';

type FormData = {
  columnName: string;
  displayName: string;
};

export default function CreateDistributionSettings() {
  const t = useTranslations('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const [selectCategory, setSelectCategory] = useState('');
  const [selectNames, setSelectNames] = useState('');

  const onSubmit = (data: FormData) => {
    console.log('Form Data:', data);
    toast.success(t('DBSettings.form.okMessage'));
    reset();
  };

  const toggleCreateName = () => {
    toast.success(t('DBSettings.form.okMessage'));
  };

  const handleRemoveButton = () => {
    // const id = settingsOptions.find(id => t(id) === label);
    // if (id) {
    //   setCheckedSettings(prev => ({
    //     ...prev,
    //     [id]: false,
    //   }));
    // }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label}>
          {t('DistributionSettings.modalCreate.name')}
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
          {t('DistributionSettings.modalCreate.category')}
        </label>
        <CustomSelect
          options={['Facebook UA (ручной фарм)', 'Facebook ']}
          selected={selectCategory}
          onSelect={setSelectCategory}
        />
        {errors.displayName && (
          <p className={styles.error}>{errors.displayName.message}</p>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          {t('DistributionSettings.modalCreate.names')}
        </label>
        <CustomSelect
          options={['Facebook UA фарм 7-дней', 'Facebook UA фарм 10-дней']}
          selected={selectNames}
          onSelect={setSelectNames}
        />
        {errors.displayName && (
          <p className={styles.error}>{errors.displayName.message}</p>
        )}
      </div>
      <div className={styles.field}>
        <label className={styles.label}>
          {t('DistributionSettings.modalCreate.ablQuantity')}
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
          {t('DistributionSettings.modalCreate.quantity')}
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
      <div className={`${styles.field} ${ownStyles.field}`}>
        <WhiteBtn
          onClick={toggleCreateName}
          text={'DistributionSettings.modalCreate.btnAdd'}
          icon="icon-add-color"
        />
        {errors.displayName && (
          <p className={styles.error}>{errors.displayName.message}</p>
        )}
      </div>
      <div className={styles.field}>
        <label className={styles.label}>
          {t('DistributionSettings.modalCreate.nameDistribution')}
        </label>
        <CustomButtonsInput
          buttons={['Facebook UA-фарм 7-дней - 10 шт.']}
          onRemove={handleRemoveButton}
        />
        {errors.displayName && (
          <p className={styles.error}>{errors.displayName.message}</p>
        )}
      </div>

      <div className={styles.buttons_wrap}>
        <CancelBtn
          text="DistributionSettings.modalCreate.btnCancel"
          onClick={() => reset()}
        />
        <SubmitBtn text="DistributionSettings.modalCreate.btnOk" />
      </div>
    </form>
  );
}
