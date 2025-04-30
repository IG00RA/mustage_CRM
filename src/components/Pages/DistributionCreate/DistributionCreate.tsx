'use client';

import styles from './DistributionCreate.module.css';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import ModalComponent from '@/components/ModalComponent/ModalComponent';
import CustomSelect from '@/components/Buttons/CustomSelect/CustomSelect';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';
import { useForm } from 'react-hook-form';
import WhiteBtn from '@/components/Buttons/WhiteBtn/WhiteBtn';
import UploadAccountsLack from '@/components/ModalComponent/UploadAccountsLack/UploadAccountsLack';

type FormData = {
  nameField: string;
  nameCategoryField: string;
  price: string;
  cost: string;
  nameDescription: string;
  settings: string[];
};

export default function DistributionCreate() {
  const t = useTranslations();

  // const [formData, setFormData] = useState<FormData | null>(null);

  const [isOpenConfirm, setIsOpenConfirm] = useState(false);

  const [selectNames, setSelectNames] = useState(['']);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = () => {
    // setFormData(data);
    toggleConfirmModal();
  };

  // const [checkedSettings, setCheckedSettings] = useState<
  //   Record<string, boolean>
  // >({});

  // const toggleCheckbox = (id: string) => {
  //   setCheckedSettings(prev => ({
  //     ...prev,
  //     [id]: !prev[id],
  //   }));
  // };

  const toggleConfirmModal = () => {
    setIsOpenConfirm(!isOpenConfirm);
  };

  return (
    <section className={styles.section}>
      <div className={styles.header_container}>
        <h2 className={styles.header}>
          {t('Sidebar.accParMenu.distributionCreate')}
        </h2>
        <p className={styles.header_text}>
          {t('DistributionCreate.headerText')}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>
              {t('DistributionCreate.distributionSetting')}
            </label>
            <CustomSelect
              options={['Еженедельный розыгрыш', 'Еженедневний розыгрыш']}
              selected={selectNames}
              onSelect={setSelectNames}
            />
            {errors.nameField && (
              <p className={styles.error}>{errors.nameField.message}</p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              {t('DistributionCreate.name')}
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
              {t('DistributionCreate.tgId')}
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
              {t('DistributionCreate.quantity')}
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
            <WhiteBtn
              onClick={toggleConfirmModal}
              text={'DistributionCreate.lack'}
            />
            {errors.nameField && (
              <p className={styles.error}>{errors.nameField.message}</p>
            )}
          </div>

          <div className={styles.buttons_wrap}>
            <SubmitBtn text="DistributionCreate.addBtn" />
          </div>
        </form>
      </div>

      <ModalComponent
        isOpen={isOpenConfirm}
        onClose={toggleConfirmModal}
        title="DistributionCreate.modalCreate.title"
      >
        <UploadAccountsLack />
      </ModalComponent>
    </section>
  );
}
