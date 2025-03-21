'use client';

import styles from './DBSettings.module.css';
import { useTranslations } from 'next-intl';
import React from 'react';
import { useForm } from 'react-hook-form';
import WhiteBtn from '../Buttons/WhiteBtn/WhiteBtn';
import AddBtn from '../Buttons/AddBtn/AddBtn';
import CancelBtn from '../Buttons/CancelBtn/CancelBtn';
import SubmitBtn from '../Buttons/SubmitBtn/SubmitBtn';
import { toast } from 'react-toastify';

type FormData = {
  columnName: string;
  displayName: string;
  dataType: string;
  defaultValue: string;
};

export default function DBSettings() {
  const t = useTranslations();

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

  const download = () => {};
  const add = () => {};

  return (
    <section className={styles.section}>
      <div className={styles.header_container}>
        <h2 className={styles.header}>{t('Sidebar.mainParMenu.settings')}</h2>
        <p className={styles.header_text}>{t('DBSettings.headerText')}</p>
        <div className={styles.button_wrap}>
          <WhiteBtn
            onClick={download}
            text={'DBSettings.downloadBtn'}
            icon="icon-cloud-download"
            iconFill="icon-cloud-download-fill"
          />
          <AddBtn onClick={add} text={'DBSettings.addBtn'} />
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>
            {t('DBSettings.form.columnName')}
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
            {t('DBSettings.form.displayName')}
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
            {t('DBSettings.form.dataType')}
          </label>
          <input
            className={`${styles.input} ${
              errors.dataType ? styles.input_error : ''
            }`}
            placeholder={t('DBSettings.form.placeholder')}
            {...register('dataType', {
              required: t('DBSettings.form.errorMessage'),
            })}
          />
          {errors.dataType && (
            <p className={styles.error}>{errors.dataType.message}</p>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            {t('DBSettings.form.defaultValue')}
          </label>
          <input
            className={`${styles.input} ${
              errors.defaultValue ? styles.input_error : ''
            }`}
            placeholder={t('DBSettings.form.placeholder')}
            {...register('defaultValue', {
              required: t('DBSettings.form.errorMessage'),
            })}
          />
          {errors.defaultValue && (
            <p className={styles.error}>{errors.defaultValue.message}</p>
          )}
        </div>

        <div className={styles.buttons_wrap}>
          <CancelBtn text="DBSettings.form.cancelBtn" onClick={() => reset()} />
          <SubmitBtn text="DBSettings.form.submitBtn" />
        </div>
      </form>
    </section>
  );
}
