import { useTranslations } from 'next-intl';
import styles from '../ModalComponent.module.css';
import ownStyles from './ReplenishmentAccountsFarm.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';
import { useForm, useFormContext } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from '@dnd-kit/core';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FC } from 'react';
import { UseFormRegister } from 'react-hook-form';
import Icon from '@/helpers/Icon';
import CustomCheckbox from '@/components/Buttons/CustomCheckbox/CustomCheckbox';
import CustomButtonsInput from '@/components/Buttons/CustomButtonsInput/CustomButtonsInput';
import { CustomSelect } from '@/components/Buttons/CustomSelect/CustomSelect';
import CustomDragDropFile from '@/components/Buttons/CustomDragDropFile/CustomDragDropFile';

type FormData = {
  nameField: string;
  nameCategoryField: string;
  price: string;
  cost: string;
  nameDescription: string;
  settings: string[];
};

export default function ReplenishmentAccountsFarm() {
  const t = useTranslations('');

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

  const handleFileUpload = (file: File) => {
    console.log('Завантажений файл:', file);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label}>{t('AutoFarmSection.geo')}</label>
        <CustomSelect
          options={['UA', 'PL']}
          selected={selectCategory}
          onSelect={setSelectCategory}
        />
        {errors.nameField && (
          <p className={styles.error}>{errors.nameField.message}</p>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          {t('AutoFarmSection.modalReplenishmentAcc.type')}
        </label>
        <CustomSelect
          options={['7 дней', '10 дней']}
          selected={selectCategory}
          onSelect={setSelectCategory}
        />
        {errors.nameCategoryField && (
          <p className={styles.error}>{errors.nameCategoryField.message}</p>
        )}
      </div>
      <div className={styles.field}>
        <label className={styles.label}>
          {t('AutoFarmSection.modalReplenishmentAcc.lack')}
        </label>
        <input
          className={`${styles.input} ${errors.cost ? styles.input_error : ''}`}
          value="80"
          placeholder={t('DBSettings.form.placeholder')}
          {...register('cost', {
            required: t('DBSettings.form.errorMessage'),
          })}
        />
        {errors.cost && <p className={styles.error}>{errors.cost.message}</p>}
      </div>
      <div className={styles.field}>
        <CustomDragDropFile
          acceptedExtensions={['xlsx', 'csv']}
          onFileUpload={handleFileUpload}
        />
        {errors.nameCategoryField && (
          <p className={styles.error}>{errors.nameCategoryField.message}</p>
        )}
      </div>
      <p className={ownStyles.locate_accounts}>
        {t('Upload.modalUpload.accounts')} <span>500</span>
      </p>
      <div className={styles.buttons_wrap}>
        <CancelBtn
          text="AutoFarmSection.modalReplenishmentAcc.btnCancel"
          onClick={() => reset()}
        />
        <SubmitBtn text="AutoFarmSection.modalReplenishmentAcc.btn" />
      </div>
    </form>
  );
}
