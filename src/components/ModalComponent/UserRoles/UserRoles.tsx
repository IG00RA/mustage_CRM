'use client';

import styles from '../ModalComponent.module.css';
import ownStyles from './UserRoles.module.css';
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

export default function UserRoles() {
  const t = useTranslations('');

  const [selectAcc, setSelectAcc] = useState('');
  const [selectNames, setSelectNames] = useState('');
  const [selectCategory, setSelectCategory] = useState('');

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

  const settingsOptions = [
    'UserSection.modalRoles.viewCheck',
    'UserSection.modalRoles.editCheck',
    'UserSection.modalRoles.createCheck',
    'UserSection.modalRoles.namesCheck',
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label}>
          {t('UserSection.modalRoles.function')}
        </label>
        <CustomSelect
          options={['Раздача аккаунтов']}
          selected={selectAcc}
          onSelect={setSelectAcc}
        />
        {errors.nameField && (
          <p className={styles.error}>{errors.nameField.message}</p>
        )}
      </div>
      <div className={`${styles.field} ${ownStyles.check_wrap}`}>
        <CustomCheckbox
          checked={checkedSettings[settingsOptions[0]] || false}
          onChange={() => toggleCheckbox(settingsOptions[0])}
          label={t(settingsOptions[0])}
        />
        <CustomCheckbox
          checked={checkedSettings[settingsOptions[1]] || false}
          onChange={() => toggleCheckbox(settingsOptions[1])}
          label={t(settingsOptions[1])}
        />

        <CustomCheckbox
          checked={checkedSettings[settingsOptions[2]] || false}
          onChange={() => toggleCheckbox(settingsOptions[2])}
          label={t(settingsOptions[2])}
        />
        <CustomCheckbox
          checked={checkedSettings[settingsOptions[3]] || false}
          onChange={() => toggleCheckbox(settingsOptions[3])}
          label={t(settingsOptions[3])}
        />
        {errors.settings && (
          <p className={styles.error}>{errors.settings.message}</p>
        )}
      </div>
      <div className={styles.field}>
        <CustomSelect
          options={['Facebook UA (автофарм)', 'Facebook UA фарм 7-дней']}
          selected={selectNames}
          onSelect={setSelectNames}
        />
        {errors.cost && <p className={styles.error}>{errors.cost.message}</p>}
      </div>
      <div className={`${styles.field} ${ownStyles.field_bottom}`}>
        <WhiteBtn
          onClick={setClick}
          text={'UserSection.modalRoles.namesAllBtn'}
        />
        {errors.cost && <p className={styles.error}>{errors.cost.message}</p>}
      </div>

      <div className={styles.field}>
        <CustomSelect
          options={['Все наименования']}
          selected={selectCategory}
          onSelect={setSelectCategory}
        />
        {errors.cost && <p className={styles.error}>{errors.cost.message}</p>}
      </div>

      <div className={`${styles.field} ${ownStyles.field_bottom}`}>
        <WhiteBtn onClick={setClick} text={'UserSection.modalRoles.namesBtn'} />
        {errors.cost && <p className={styles.error}>{errors.cost.message}</p>}
      </div>
      <div className={styles.field}>
        <CustomButtonsInput
          onRemove={() => {}}
          buttons={['Facebook UA-фарм 7-дней']}
        />

        {errors.settings && (
          <p className={styles.error}>{errors.settings.message}</p>
        )}
      </div>

      <div className={`${styles.field} ${ownStyles.field}`}>
        <WhiteBtn
          onClick={setClick}
          text={'UserSection.modalRoles.addFunction'}
          icon="icon-add-color"
        />
        {errors.cost && <p className={styles.error}>{errors.cost.message}</p>}
      </div>

      <div className={styles.field}>
        <CustomButtonsInput
          onRemove={() => {}}
          buttons={[
            'Раздача аккантов (просмотр, редактирование, создание),наименования - Facebook UA-фарм 7-дней',
          ]}
        />

        {errors.settings && (
          <p className={styles.error}>{errors.settings.message}</p>
        )}
      </div>

      <div className={styles.buttons_wrap}>
        <CancelBtn text="DBSettings.form.cancelBtn" onClick={() => reset()} />
        <SubmitBtn text="UserSection.modalRoles.addBtn" />
      </div>
    </form>
  );
}
