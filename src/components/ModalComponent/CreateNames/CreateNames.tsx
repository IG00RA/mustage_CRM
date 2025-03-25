'use client';

import styles from '../ModalComponent.module.css';
import ownStyles from './CreateNames.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import CustomButtonsInput from '@/components/Buttons/CustomButtonsInput/CustomButtonsInput';
import CustomDragDrop from '@/components/Buttons/CustomDragDrop/CustomDragDrop';
import { useTranslations } from 'next-intl';
import CustomCheckbox from '@/components/Buttons/CustomCheckbox/CustomCheckbox';
import { useState, useMemo } from 'react';
import CustomSelect from '@/components/Buttons/CustomSelect/CustomSelect';
import { useCategoriesStore } from '@/store/categoriesStore';
import { ENDPOINTS } from '@/constants/api';
import { fetchWithErrorHandling, getAuthHeaders } from '@/utils/apiUtils';
import { Subcategory } from '@/types/salesTypes';

type FormData = {
  nameField: string;
  account_category_id: string; // Змінено на string для селекту
  price: string;
  cost: string;
  nameDescription: string;
  separator: string;
  settings: string[];
};

export default function CreateNames({ onClose }: { onClose: () => void }) {
  const t = useTranslations('');
  const { categories, fetchSubcategories } = useCategoriesStore();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      account_category_id: '', // Початкове значення для селекту
    },
  });

  const [checkedSettings, setCheckedSettings] = useState<
    Record<string, boolean>
  >({});
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  const toggleCheckbox = (id: string) => {
    setCheckedSettings(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const settingsOptions = [
    'Names.modalCreate.id',
    'Names.modalCreate.data',
    'Names.modalCreate.megaLink',
  ];

  const categoryOptions = useMemo(
    () => categories.map(cat => cat.account_category_name),
    [categories]
  );

  const categoryMap = useMemo(
    () =>
      new Map(
        categories.map(category => [
          category.account_category_id,
          category.account_category_name,
        ])
      ),
    [categories]
  );

  const handleCategorySelect = (values: string[]) => {
    const selectedName = values[0]; // Беремо тільки перше значення, бо вибір один
    const selectedCat = categories.find(
      cat => cat.account_category_name === selectedName
    );
    if (selectedCat) {
      const categoryId = String(selectedCat.account_category_id);
      setSelectedCategoryId(categoryId);
      setValue('account_category_id', categoryId); // Оновлюємо значення форми
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      const selectedSettings = Object.entries(checkedSettings)
        .filter(([, checked]) => checked)
        .map(([id]) => id);

      const newSubcategory = await fetchWithErrorHandling<Subcategory>(
        ENDPOINTS.SUBCATEGORIES,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            account_subcategory_name: data.nameField,
            account_category_id: Number(data.account_category_id),
            price: Number(data.price),
            cost_price: Number(data.cost),
            description: data.nameDescription,
            output_format_field: selectedSettings,
            output_separator: data.separator,
          }),
        },
        () => {}
      );

      await fetchSubcategories(); // Оновлюємо список підкатегорій
      toast.success(t('Names.modalCreate.successMessage'));
      reset();
      setCheckedSettings({});
      setSelectedCategoryId('');
      onClose();
    } catch (error) {
      console.error('Error creating subcategory:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : t('Names.modalCreate.errorMessage')
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`${styles.form} ${ownStyles.form}`}
    >
      <div className={styles.field}>
        <label className={styles.label}>
          {t('Names.modalCreate.nameField')}
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
        <CustomSelect
          label={t('Names.modalCreate.nameCategoryField')}
          options={categoryOptions}
          selected={
            selectedCategoryId
              ? [categoryMap.get(parseInt(selectedCategoryId)) || '']
              : ['']
          }
          onSelect={handleCategorySelect}
          width={298}
          multiSelections={false}
        />
        {errors.account_category_id && (
          <p className={styles.error}>{errors.account_category_id.message}</p>
        )}
        <input
          type="hidden"
          {...register('account_category_id', {
            required: t('DBSettings.form.errorMessage'),
          })}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>{t('Names.modalCreate.price')}</label>
        <input
          className={`${styles.input} ${
            errors.price ? styles.input_error : ''
          }`}
          placeholder={t('DBSettings.form.placeholder')}
          type="number"
          {...register('price', {
            required: t('DBSettings.form.errorMessage'),
            valueAsNumber: true,
          })}
        />
        {errors.price && <p className={styles.error}>{errors.price.message}</p>}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>{t('Names.modalCreate.cost')}</label>
        <input
          className={`${styles.input} ${errors.cost ? styles.input_error : ''}`}
          placeholder={t('DBSettings.form.placeholder')}
          type="number"
          {...register('cost', {
            required: t('DBSettings.form.errorMessage'),
            valueAsNumber: true,
          })}
        />
        {errors.cost && <p className={styles.error}>{errors.cost.message}</p>}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          {t('Names.modalCreate.nameDescription')}
        </label>
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
        <label className={styles.label}>
          {t('Names.modalCreate.settings')}
        </label>
        <CustomDragDrop settingsOptions={settingsOptions} onReorder={() => {}}>
          {id => (
            <CustomCheckbox
              checked={checkedSettings[id] || false}
              onChange={() => toggleCheckbox(id)}
              label={t(id)}
            />
          )}
        </CustomDragDrop>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>{t('Names.modalCreate.format')}</label>
        <CustomButtonsInput
          onRemove={() => {}}
          buttons={Object.keys(checkedSettings).filter(
            key => checkedSettings[key]
          )}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          {t('Names.modalCreate.separator')}
        </label>
        <input
          className={`${styles.input} ${
            errors.separator ? styles.input_error : ''
          }`}
          placeholder={t('DBSettings.form.placeholder')}
          {...register('separator', {
            required: t('DBSettings.form.errorMessage'),
          })}
        />
        {errors.separator && (
          <p className={styles.error}>{errors.separator.message}</p>
        )}
        <span className={ownStyles.separator_text}>
          {t('Names.modalCreate.separatorText')}
        </span>
      </div>

      <div className={styles.buttons_wrap}>
        <CancelBtn
          text="DBSettings.form.cancelBtn"
          onClick={() => {
            reset();
            setCheckedSettings({});
            setSelectedCategoryId('');
            onClose();
          }}
        />
        <SubmitBtn text="Names.modalCreate.createBtn" />
      </div>
    </form>
  );
}
