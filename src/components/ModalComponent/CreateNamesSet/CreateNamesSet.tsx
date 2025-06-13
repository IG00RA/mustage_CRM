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
import { useAccountSetsStore } from '@/store/accountSetsStore';

type FormData = {
  nameField: string;
  account_category_id: number;
  account_subcategory_id: number;
  set_price: number;
  quantity: number;
  cost: number;
  setDescription: string;
};

type SubcategorySet = {
  subcategory_id: number;
  quantity: number;
  name: string;
};

export default function CreateNamesSet({ onClose }: { onClose: () => void }) {
  const t = useTranslations('');
  const { categories, fetchCategories, subcategories, fetchSubcategories } =
    useCategoriesStore();
  const { createSet } = useAccountSetsStore();
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

  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
    if (subcategories.length === 0) {
      fetchSubcategories(undefined, false);
    }
  }, [categories, fetchCategories, subcategories, fetchSubcategories]);

  const quantity = watch('quantity');

  const categoryOptions = useMemo(
    () =>
      categories
        .filter(cat => cat.is_set_category === true)
        .map(cat => cat.account_category_name),
    [categories]
  );

  const filteredSubCategoryOptions = useMemo(() => {
    const filtered = subcategories
      .filter(
        sub =>
          !subcategorySets.some(
            set => set.subcategory_id === sub.account_subcategory_id
          )
      )
      .map(sub => sub.account_subcategory_name);

    return filtered.length > 0
      ? filtered
      : [t('Names.noSubcategoriesAvailable')];
  }, [subcategories, subcategorySets, t]);

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

  const calculatedCost = useMemo(() => {
    return subcategorySets.reduce((total, set) => {
      const costPrice = subCategoryCostMap.get(set.subcategory_id) || 0;
      return total + costPrice * set.quantity;
    }, 0);
  }, [subcategorySets, subCategoryCostMap]);

  useEffect(() => {
    setValue('cost', calculatedCost);
  }, [calculatedCost, setValue]);

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

  const handleRemoveSet = (label: string) => {
    setSubcategorySets(prev => prev.filter(set => set.name !== label));
  };

  const onSubmit = async (data: FormData) => {
    if (selectedCategoryId === 0) {
      toast.error(t('Names.modalCreateSet.errorCategoryNotSelected'));
      return;
    }
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
    try {
      await createSet(requestBody);
      toast.success(t('Names.okMessage'));
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
    <form onSubmit={handleSubmit(onSubmit)} className={ownStyles.form}>
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
              options={[t('Load.category'), ...categoryOptions]}
              selected={
                selectedCategoryId
                  ? [categoryMap.get(selectedCategoryId) || t('Load.category')]
                  : [t('Load.category')]
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
              min="0"
              {...register('set_price', {
                required: t('DBSettings.form.errorMessage'),
                valueAsNumber: true,
                min: {
                  value: 0,
                  message: t('DBSettings.form.errorNegativeNumber'),
                },
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
              options={[t('Load.names'), ...filteredSubCategoryOptions]}
              selected={
                selectedSubCategoryId
                  ? [
                      subCategoryMap.get(selectedSubCategoryId) ||
                        t('Load.names'),
                    ]
                  : [t('Load.names')]
              }
              onSelect={handleSubCategorySelect}
              width={'100%'}
              multiSelections={false}
              shortText={false}
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
              min="0"
              placeholder={t('DBSettings.form.placeholder')}
              {...register('quantity', {
                required: t('DBSettings.form.errorMessage'),
                valueAsNumber: true,
                min: {
                  value: 0,
                  message: t('DBSettings.form.errorNegativeNumber'),
                },
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
              min="0"
              {...register('cost', {
                required: t('DBSettings.form.errorMessage'),
                valueAsNumber: true,
                min: {
                  value: 0,
                  message: t('DBSettings.form.errorNegativeNumber'),
                },
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
