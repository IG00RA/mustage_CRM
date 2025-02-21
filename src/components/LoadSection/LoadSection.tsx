'use client';

import styles from './LoadSection.module.css';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import ModalComponent from '../ModalComponent/ModalComponent';
import { CustomSelect } from '../Buttons/CustomSelect/CustomSelect';
import SubmitBtn from '../Buttons/SubmitBtn/SubmitBtn';
import { useForm } from 'react-hook-form';
import CustomCheckbox from '../Buttons/CustomCheckbox/CustomCheckbox';
import LoadAccountsConfirm from '../ModalComponent/LoadAccountsConfirm/LoadAccountsConfirm';

type FormData = {
  nameField: string;
  nameCategoryField: string;
  price: string;
  cost: string;
  nameDescription: string;
  settings: string[];
};

const settingsOptions = ['Load.check'];

const LoadSection = () => {
  const t = useTranslations();

  const [formData, setFormData] = useState<FormData | null>(null);

  const [isOpenConfirm, setIsOpenConfirm] = useState(false);

  const [selectCategory, setSelectCategory] = useState('');
  const [selectNames, setSelectNames] = useState('');
  const [settings, setSettings] = useState(settingsOptions);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    setFormData(data);
    toggleConfirmModal();
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

  const toggleConfirmModal = () => {
    setIsOpenConfirm(!isOpenConfirm);
  };

  return (
    <section className={styles.section}>
      <div className={styles.header_container}>
        <h2 className={styles.header}>{t('Sidebar.accParMenu.load')}</h2>
        <p className={styles.header_text}>{t('Load.headerText')}</p>
        <div className={styles.selects_wrap}>
          <CustomSelect
            label={t('Load.selectCategory')}
            options={[t('Names.selectBtn'), t('Names.selectBtn')]}
            selected={selectCategory}
            onSelect={setSelectCategory}
            width={602}
          />
          <CustomSelect
            label={t('Load.selectNames')}
            options={['Все наименования']}
            selected={selectNames}
            onSelect={setSelectNames}
            width={602}
          />
        </div>
        {(selectNames || selectCategory) && (
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>{t('Load.namesQuantity')}</label>
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
              <label className={styles.label}>{t('Load.accQuantity')}</label>
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
                <p className={styles.error}>
                  {errors.nameCategoryField.message}
                </p>
              )}
            </div>
            <div className={styles.field}>
              <CustomSelect
                label={t('Load.seller')}
                options={['Максим Куролап']}
                selected={selectNames}
                onSelect={setSelectNames}
                width={602}
              />
              {errors.price && (
                <p className={styles.error}>{errors.price.message}</p>
              )}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{t('Load.namesCost')}</label>
              <input
                className={`${styles.input} ${
                  errors.cost ? styles.input_error : ''
                }`}
                placeholder={t('DBSettings.form.placeholder')}
                {...register('cost', {
                  required: t('DBSettings.form.errorMessage'),
                })}
              />
              {errors.cost && (
                <p className={styles.error}>{errors.cost.message}</p>
              )}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{t('Load.sellSum')}</label>
              <input
                className={`${styles.input} ${
                  errors.nameDescription ? styles.input_error : ''
                }`}
                placeholder={t('DBSettings.form.placeholder')}
                {...register('nameDescription', {
                  required: t('DBSettings.form.errorMessage'),
                })}
              />
              {errors.nameDescription && (
                <p className={styles.error}>{errors.nameDescription.message}</p>
              )}
            </div>
            <div className={styles.field}>
              <CustomSelect
                label={t('Load.tgNick')}
                options={['@storewonderweb']}
                selected={selectNames}
                onSelect={setSelectNames}
                width={602}
              />
              {errors.price && (
                <p className={styles.error}>{errors.price.message}</p>
              )}
            </div>
            <div className={styles.field}>
              <CustomCheckbox
                checked={checkedSettings[settings[0]] || false}
                onChange={() => toggleCheckbox(settings[0])}
                label={t(settings[0])}
              />
              {errors.nameCategoryField && (
                <p className={styles.error}>
                  {errors.nameCategoryField.message}
                </p>
              )}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{t('Load.dolphinMail')}</label>
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
            <div className={styles.buttons_wrap}>
              <SubmitBtn text="Load.button" />
            </div>
          </form>
        )}
      </div>

      <ModalComponent
        isOpen={isOpenConfirm}
        onClose={toggleConfirmModal}
        title="Load.modalConfirm.title"
      >
        <LoadAccountsConfirm
          category={formData?.nameCategoryField || ''}
          names={formData?.nameField || ''}
          accQuantity={formData?.price || ''}
          seller={formData?.cost || ''}
          sellSum={formData?.nameDescription || ''}
          tgNick={selectNames}
        />
      </ModalComponent>
    </section>
  );
};

export default LoadSection;
