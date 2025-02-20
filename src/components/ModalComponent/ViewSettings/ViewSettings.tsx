'use client';

import styles from '../ModalComponent.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import CustomButtonsInput from '@/components/Buttons/CustomButtonsInput/CustomButtonsInput';
import { CustomDragDrop } from '@/components/Buttons/CustomDragDrop/CustomDragDrop';
import { useTranslations } from 'next-intl';
import CustomCheckbox from '@/components/Buttons/CustomCheckbox/CustomCheckbox';
import { useState } from 'react';

type FormData = {
  nameField: string;
  nameCategoryField: string;
  price: string;
  cost: string;
  nameDescription: string;
  settings: string[];
};

const settingsOptions = [
  'AllAccounts.modalUpdate.selects.id',
  'AllAccounts.modalUpdate.selects.name',
  'AllAccounts.modalUpdate.selects.category',
  'AllAccounts.modalUpdate.selects.seller',
  'AllAccounts.modalUpdate.selects.given',
  'AllAccounts.modalUpdate.selects.data',
  'AllAccounts.modalUpdate.selects.mega',
];

export default function ViewSettings() {
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
        <CustomDragDrop settingsOptions={settingsOptions}>
          {id => (
            <CustomCheckbox
              checked={checkedSettings[id] || false}
              onChange={() => toggleCheckbox(id)}
              label={t(id)}
            />
          )}
        </CustomDragDrop>
        {errors.settings && (
          <p className={styles.error}>{errors.settings.message}</p>
        )}
      </div>
      <div className={styles.field}>
        <label className={styles.label}>{t('Names.modalCreate.format')}</label>
        <CustomButtonsInput
          buttons={[
            'id',
            t('AllAccounts.table.name'),
            t('AllAccounts.table.category'),
            t('AllAccounts.table.seller'),
            t('AllAccounts.table.status'),
          ]}
        />

        {errors.settings && (
          <p className={styles.error}>{errors.settings.message}</p>
        )}
      </div>
      <div className={styles.buttons_wrap}>
        <CancelBtn text="DBSettings.form.cancelBtn" onClick={() => reset()} />
        <SubmitBtn text="AllAccounts.modalUpdate.createBtn" />
      </div>
    </form>
  );
}
