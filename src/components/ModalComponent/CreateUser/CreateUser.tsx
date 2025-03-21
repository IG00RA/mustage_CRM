'use client';

import styles from '../ModalComponent.module.css';
import ownStyles from './CreateUser.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import CustomButtonsInput from '@/components/Buttons/CustomButtonsInput/CustomButtonsInput';
import { useTranslations } from 'next-intl';
import CustomCheckbox from '@/components/Buttons/CustomCheckbox/CustomCheckbox';
import { useState } from 'react';
import CustomSelect from '@/components/Buttons/CustomSelect/CustomSelect';
import WhiteBtn from '@/components/Buttons/WhiteBtn/WhiteBtn';

type FormData = {
  nameField: string;
  nameCategoryField: string;
  price: string;
  cost: string;
  nameDescription: string;
  settings: string[];
};

export default function CreateUser() {
  const t = useTranslations('');

  const [selectNames, setSelectNames] = useState('');
  const [selectCategory, setSelectCategory] = useState('');

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

  const [checkedSettings, setCheckedSettings] = useState<
    Record<string, boolean>
  >({});

  const toggleCheckbox = (id: string) => {
    setCheckedSettings(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const setClick = () => {
    console.log(123);
  };

  const settingsOptions = ['UserSection.modalCreate.check'];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label}>
          {t('UserSection.modalCreate.fullName')}
        </label>
        <input
          className={`${styles.input} ${
            errors.nameField ? styles.input_error : ''
          }`}
          placeholder={t('DBSettings.form.placeholder')}
          {...register('nameField', {
            required: t('DBSettings.form.errorMessage'),
          })}
        />
        {errors.nameField && (
          <p className={styles.error}>{errors.nameField.message}</p>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          {t('UserSection.modalCreate.tgId')}
        </label>
        <input
          className={`${styles.input} ${
            errors.nameCategoryField ? styles.input_error : ''
          }`}
          placeholder={t('DBSettings.form.placeholder')}
          {...register('nameCategoryField', {
            required: t('DBSettings.form.errorMessage'),
          })}
        />
        {errors.nameCategoryField && (
          <p className={styles.error}>{errors.nameCategoryField.message}</p>
        )}
      </div>
      <div className={styles.field}>
        <label className={styles.label}>
          {t('Names.modalCreate.settings')}
        </label>
        <CustomCheckbox
          checked={checkedSettings[settingsOptions[0]] || false}
          onChange={() => toggleCheckbox(settingsOptions[0])}
          label={t(settingsOptions[0])}
        />
        {errors.settings && (
          <p className={styles.error}>{errors.settings.message}</p>
        )}
      </div>
      <p className={ownStyles.text}>
        {t('UserSection.modalCreate.notifSettings')}
      </p>
      <div className={styles.field}>
        <label className={styles.label}>
          {t('UserSection.modalCreate.category')}
        </label>
        <CustomSelect
          options={['Facebook UA (автофарм)', 'Facebook UA фарм 7-дней']}
          selected={selectNames}
          onSelect={setSelectNames}
        />
        {errors.cost && <p className={styles.error}>{errors.cost.message}</p>}
      </div>
      <div className={styles.field}>
        <label className={styles.label}>
          {t('UserSection.modalCreate.names')}
        </label>
        <CustomSelect
          options={['Все наименования']}
          selected={selectCategory}
          onSelect={setSelectCategory}
        />
        {errors.cost && <p className={styles.error}>{errors.cost.message}</p>}
      </div>

      <div className={`${styles.field} ${ownStyles.field}`}>
        <WhiteBtn
          onClick={setClick}
          text={'UserSection.modalCreate.namesBtn'}
          icon="icon-add-color"
        />
        {errors.cost && <p className={styles.error}>{errors.cost.message}</p>}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          {t('UserSection.modalCreate.distributionNames')}
        </label>
        <CustomButtonsInput
          onRemove={() => {}}
          buttons={['Facebook UA-фарм 7-дней']}
        />

        {errors.settings && (
          <p className={styles.error}>{errors.settings.message}</p>
        )}
      </div>

      <div className={`${styles.field} ${ownStyles.fieldBottom}`}>
        <WhiteBtn
          onClick={setClick}
          text={'UserSection.modalCreate.rolesBtn'}
          icon="icon-settings-btn"
        />
        {errors.cost && <p className={styles.error}>{errors.cost.message}</p>}
      </div>
      <div className={styles.buttons_wrap}>
        <CancelBtn text="DBSettings.form.cancelBtn" onClick={() => reset()} />
        <SubmitBtn text="UserSection.modalCreate.addBtn" />
      </div>
    </form>
  );
}
