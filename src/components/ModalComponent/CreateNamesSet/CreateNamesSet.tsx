'use client';

import { useTranslations } from 'next-intl';
import styles from '../ModalComponent.module.css';
import ownStyles from './CreateNamesSet.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import WhiteBtn from '@/components/Buttons/WhiteBtn/WhiteBtn';
import CustomButtonsInput from '@/components/Buttons/CustomButtonsInput/CustomButtonsInput';
import CustomSelect from '@/components/Buttons/CustomSelect/CustomSelect';
import { useMemo, useState, useEffect } from 'react';
import { useCategoriesStore } from '@/store/categoriesStore';
import { ENDPOINTS } from '@/constants/api';
import { fetchWithErrorHandling, getAuthHeaders } from '@/utils/apiUtils';

type FormData = {
  nameField: string;
  account_category_id: number;
  account_subcategory_id: number;
  set_price: number;
  quantity: number;
  cost: number;
  setDescription: string;
};

// Тип для набору підкатегорій
type SubcategorySet = {
  subcategory_id: number;
  quantity: number;
  name: string; // Для відображення в CustomButtonsInput
};

export default function CreateNamesSet({ onClose }: { onClose: () => void }) {
  const t = useTranslations('');
  const { categories, subcategories } = useCategoriesStore();

  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<number>(0);
  const [subcategorySets, setSubcategorySets] = useState<SubcategorySet[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      nameField: '',
      setDescription: '',
    },
  });

  const quantity = watch('quantity');

  // Опції для категорій
  const categoryOptions = useMemo(
    () =>
      categories
        .filter(cat => cat.is_set_category === true)
        .map(cat => cat.account_category_name),
    [categories]
  );

  // Фільтровані підкатегорії залежно від вибраної категорії та вже доданих наборів
  const filteredSubCategoryOptions = useMemo(() => {
    if (selectedCategoryId === 0) return [];

    // Отримуємо ID підкатегорій, які вже додані до наборів
    const addedSubCategoryIds = subcategorySets.map(set => set.subcategory_id);

    return subcategories
      .filter(
        sub =>
          sub.account_category_id === selectedCategoryId &&
          !addedSubCategoryIds.includes(sub.account_subcategory_id) // Виключаємо додані підкатегорії
      )
      .map(sub => sub.account_subcategory_name);
  }, [subcategories, selectedCategoryId, subcategorySets]); // Додаємо subcategorySets як залежність

  // Мапи для швидкого доступу до ID і cost_price
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

  const subCategoryMap = useMemo(
    () =>
      new Map(
        subcategories.map(subcategory => [
          subcategory.account_subcategory_id,
          subcategory.account_subcategory_name,
        ])
      ),
    [subcategories]
  );

  const subCategoryCostMap = useMemo(
    () =>
      new Map(
        subcategories.map(subcategory => [
          subcategory.account_subcategory_id,
          subcategory.cost_price,
        ])
      ),
    [subcategories]
  );

  // Розрахунок загальної собівартості набору
  const calculatedCost = useMemo(() => {
    return subcategorySets.reduce((total, set) => {
      const costPrice = subCategoryCostMap.get(set.subcategory_id) || 0;
      return total + costPrice * set.quantity;
    }, 0);
  }, [subcategorySets, subCategoryCostMap]);

  // Оновлення поля cost при зміні наборів
  useEffect(() => {
    setValue('cost', calculatedCost);
  }, [calculatedCost, setValue]);

  // Обробка вибору категорії
  const handleCategorySelect = (values: string[]) => {
    const selectedName = values[0];
    const selectedCat = categories.find(
      cat => cat.account_category_name === selectedName
    );
    if (selectedCat) {
      const categoryId = selectedCat.account_category_id;
      setSelectedCategoryId(categoryId);
      setValue('account_category_id', categoryId);
      setSelectedSubCategoryId(0);
      setValue('account_subcategory_id', 0);
    }
  };

  // Обробка вибору підкатегорії
  const handleSubCategorySelect = (values: string[]) => {
    const selectedName = values[0];
    const selectedSubCat = subcategories.find(
      sub => sub.account_subcategory_name === selectedName
    );
    if (selectedSubCat) {
      const subCategoryId = selectedSubCat.account_subcategory_id;
      setSelectedSubCategoryId(subCategoryId);
      setValue('account_subcategory_id', subCategoryId);
    }
  };

  // Додавання набору підкатегорії
  const toggleCreateName = () => {
    if (selectedSubCategoryId === 0 || quantity <= 0 || !quantity) {
      toast.error(t('Names.modalCreateSet.errorSetAddedMessage'));
      return;
    }

    const subName = subCategoryMap.get(selectedSubCategoryId) || '';
    const newSet: SubcategorySet = {
      subcategory_id: selectedSubCategoryId,
      quantity,
      name: `${subName} - ${quantity} шт.`,
    };

    setSubcategorySets(prev => [...prev, newSet]);
    setValue('quantity', 0);
    setSelectedSubCategoryId(0);
    setValue('account_subcategory_id', 0);
    toast.success(t('Names.modalCreateSet.setAdded'));
  };

  // Видалення набору
  const handleRemoveSet = (label: string) => {
    setSubcategorySets(prev => prev.filter(set => set.name !== label));
  };

  // Відправка форми
  const onSubmit = async (data: FormData) => {
    if (subcategorySets.length === 0) {
      toast.error(t('Names.modalCreateSet.errorMessage'));
      return;
    }

    const requestBody = {
      set_name: data.nameField,
      set_category_id: data.account_category_id,
      set_price: data.set_price,
      set_cost_price: data.cost,
      set_description: data.setDescription,
      set_subcategories: subcategorySets.map(set => ({
        subcategory_id: set.subcategory_id,
        quantity: set.quantity,
      })),
    };

    type ApiResponse = { message?: string };

    try {
      const response = (await fetchWithErrorHandling(
        ENDPOINTS.ACCOUNT_SETS,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(requestBody),
        },
        () => {}
      )) as ApiResponse;

      toast.success(response.message || t('Names.okMessage'));
      reset();
      setSubcategorySets([]);
      setSelectedCategoryId(0);
      setSelectedSubCategoryId(0);
      onClose();
    } catch (error) {
      console.error('Error creating set:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : t('Names.modalCreateSet.errorMessage')
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={ownStyles.field_wrap_main}>
        <div className={ownStyles.field_wrap}>
          <div className={styles.field}>
            <label className={styles.label}>
              {t('Names.modalCreateSet.nameField')}
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
              {t('Names.modalCreateSet.nameCategory')}
            </label>
            <CustomSelect
              options={categoryOptions}
              selected={
                selectedCategoryId
                  ? [categoryMap.get(selectedCategoryId) || '']
                  : ['']
              }
              onSelect={handleCategorySelect}
              width={'100%'}
              multiSelections={false}
            />
            {errors.account_category_id && (
              <p className={styles.error}>
                {errors.account_category_id.message}
              </p>
            )}
          </div>
          <div className={styles.field}>
            <label className={styles.label}>
              {t('Names.modalCreateSet.setPrice')}
            </label>
            <input
              className={`${styles.input} ${
                errors.set_price ? styles.input_error : ''
              }`}
              placeholder={t('DBSettings.form.placeholder')}
              type="number"
              step="any"
              {...register('set_price', {
                required: t('DBSettings.form.errorMessage'),
                valueAsNumber: true,
              })}
            />
            {errors.set_price && (
              <p className={styles.error}>{errors.set_price.message}</p>
            )}
          </div>
        </div>
        <div className={ownStyles.field_wrap_second}>
          <p className={ownStyles.field_header}>
            {t('Names.modalCreateSet.setSettings')}
          </p>
          <div className={styles.field}>
            <label className={styles.label}>
              {t('Names.modalCreateSet.setSettingsName')}
            </label>
            <CustomSelect
              options={filteredSubCategoryOptions}
              selected={
                selectedSubCategoryId
                  ? [subCategoryMap.get(selectedSubCategoryId) || '']
                  : ['']
              }
              onSelect={handleSubCategorySelect}
              width={'100%'}
              multiSelections={false}
            />
            {errors.account_subcategory_id && (
              <p className={styles.error}>
                {errors.account_subcategory_id.message}
              </p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              {t('Names.modalCreateSet.setSettingsQuantity')}
            </label>
            <input
              className={`${styles.input} ${
                errors.quantity ? styles.input_error : ''
              }`}
              type="number"
              step="any"
              placeholder={t('DBSettings.form.placeholder')}
              {...register('quantity', {
                required: t('DBSettings.form.errorMessage'),
                valueAsNumber: true,
              })}
            />
            {errors.quantity && (
              <p className={styles.error}>{errors.quantity.message}</p>
            )}
          </div>
          <div className={ownStyles.buttons_wrap}>
            <WhiteBtn
              onClick={toggleCreateName}
              text={'Names.modalCreateSet.setSettingBtn'}
              icon="icon-add-color"
              iconFill="icon-add-color"
            />
            <CustomButtonsInput
              onRemove={handleRemoveSet}
              buttons={subcategorySets.map(set => set.name)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>
              {t('Names.modalCreateSet.setSettingsPrice')}
            </label>
            <input
              className={`${styles.input} ${
                errors.cost ? styles.input_error : ''
              }`}
              placeholder={t('DBSettings.form.placeholder')}
              type="number"
              step="any"
              {...register('cost', {
                required: t('DBSettings.form.errorMessage'),
                valueAsNumber: true,
              })}
            />
            {errors.cost && (
              <p className={styles.error}>{errors.cost.message}</p>
            )}
          </div>
          <div className={styles.field}>
            <label className={styles.label}>
              {t('Names.modalCreateSet.setSettingsDescription')}
            </label>
            <input
              className={`${styles.input} ${
                errors.setDescription ? styles.input_error : ''
              }`}
              placeholder={t('DBSettings.form.placeholder')}
              {...register('setDescription', {
                required: t('DBSettings.form.errorMessage'),
              })}
            />
            {errors.setDescription && (
              <p className={styles.error}>{errors.setDescription.message}</p>
            )}
          </div>
        </div>
      </div>
      <div className={styles.buttons_wrap}>
        <CancelBtn
          text="DBSettings.form.cancelBtn"
          onClick={() => {
            reset();
            setSubcategorySets([]);
            setSelectedCategoryId(0);
            setSelectedSubCategoryId(0);
            onClose();
          }}
        />
        <SubmitBtn text="Names.modalCreateSet.createBtn" />
      </div>
    </form>
  );
}
