'use client';

import styles from './SetsItemDeleteModal.module.css';
import { useTranslations } from 'next-intl';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useCategoriesStore } from '@/store/categoriesStore';
import { useAccountSetsStore } from '@/store/accountSetsStore';
import CustomSelect from '@/components/Buttons/CustomSelect/CustomSelect';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';

type FormData = {
  accQuantity: number;
};

type AccountSet = {
  set_id: number;
  name: string;
  set_category_id: number;
  price: number;
  cost_price: number;
  items_available: number;
  description: string;
  set_content: { subcategory_id: number; accounts_quantity: number }[];
};

export default function SetsItemDeleteModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const t = useTranslations();
  const { categories, fetchCategories } = useCategoriesStore();
  const { fetchSets, deleteSetItem } = useAccountSetsStore();
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [selectedSet, setSelectedSet] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [accountSets, setAccountSets] = useState<AccountSet[]>([]);
  const [maxQuantity, setMaxQuantity] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    getValues,
    watch,
  } = useForm<FormData>({
    defaultValues: {
      accQuantity: 0,
    },
  });

  const accQuantity = watch('accQuantity');

  useEffect(() => {
    fetchCategories();
    fetchSets().then(data => {
      setAccountSets(data.items);
    });
  }, [fetchCategories, fetchSets]);

  useEffect(() => {
    if (
      selectedCategory.length > 0 &&
      selectedCategory[0] !== t('Load.category')
    ) {
      setSelectedSet([]);
      reset({
        accQuantity: 0,
      });
    }
  }, [selectedCategory, t, reset]);

  useEffect(() => {
    if (selectedSet.length > 0 && selectedSet[0] !== t('Load.names')) {
      const set = accountSets.find(s => s.name === selectedSet[0]);
      if (set) {
        setMaxQuantity(set.items_available);
      }
    } else {
      setMaxQuantity(0);
      reset({
        accQuantity: 0,
      });
    }
  }, [selectedSet, accountSets, reset, t]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    const setId = accountSets.find(s => s.name === selectedSet[0])?.set_id;

    if (!setId) {
      toast.error(t('Load.errorMessage'));
      setIsLoading(false);
      return;
    }

    const requestBody = {
      set_id: setId,
      quantity: data.accQuantity,
    };

    try {
      const response = await deleteSetItem(requestBody);
      toast.success(response.message || t('Sets.deleteItem.successMessage'));
      reset({
        accQuantity: 0,
      });
      setSelectedSet([]);
      fetchSets().then(data => {
        setAccountSets(data.items);
      });
    } catch (error) {
      toast.error(`${t('Sets.deleteItem.errorMessage')} : ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = (values: string[]) => {
    const value = values[0] || '';
    setSelectedCategory([value]);
    setSelectedSet([]);
    reset({
      accQuantity: 0,
    });
  };

  const handleSetSelect = (values: string[]) => {
    const value = values[0] || '';
    setSelectedSet([value]);
    reset({
      accQuantity: 0,
    });
  };

  const handleIncrement = () => {
    const current = getValues('accQuantity');
    if (current < maxQuantity) {
      setValue('accQuantity', current + 1, { shouldValidate: true });
    }
  };

  const handleDecrement = () => {
    const current = getValues('accQuantity');
    if (current > 0) {
      setValue('accQuantity', current - 1, { shouldValidate: true });
    }
  };

  const filteredCategories = categories.filter(cat => cat.is_set_category);

  const filteredSets = accountSets
    .filter(
      set =>
        selectedCategory.length === 0 ||
        selectedCategory[0] === t('Load.category') ||
        set.set_category_id ===
          categories.find(
            cat => cat.account_category_name === selectedCategory[0]
          )?.account_category_id
    )
    .map(set => set.name);

  return (
    <section className={styles.section}>
      <div className={styles.selects_wrap}>
        <p>{t('Sets.deleteItem.categorySet')}</p>
        <CustomSelect
          options={[
            t('Load.category'),
            ...filteredCategories.map(cat => cat.account_category_name),
          ]}
          selected={selectedCategory}
          onSelect={handleCategorySelect}
          width={'100%'}
          multiSelections={false}
        />
        <p className={styles.select_label}>{t('Sets.deleteItem.namesSet')}</p>
        <CustomSelect
          options={[t('Load.names'), ...filteredSets]}
          selected={selectedSet}
          onSelect={handleSetSelect}
          width={'100%'}
          multiSelections={false}
        />
      </div>
      {selectedSet.length > 0 && selectedSet[0] !== t('Load.names') ? (
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.field}>
            <div className={styles.label_wrap}>
              <label className={styles.label}>
                {t('Sets.deleteItem.setsQuantity')}
              </label>
              <div className={styles.quantity_container}>
                <button
                  type="button"
                  className={styles.quantity_button}
                  onClick={handleDecrement}
                  disabled={getValues('accQuantity') <= 0}
                >
                  -
                </button>
                <input
                  type="number"
                  className={`${styles.input} ${
                    errors.accQuantity ? styles.input_error : ''
                  }`}
                  placeholder={t('DBSettings.form.placeholder')}
                  {...register('accQuantity', {
                    required: t('DBSettings.form.errorMessage'),
                    min: {
                      value: 0,
                      message: t('Sets.deleteItem.minQuantityError'),
                    },
                    max: {
                      value: maxQuantity,
                      message: t('Sets.deleteItem.maxQuantityError', {
                        max: maxQuantity,
                      }),
                    },
                  })}
                />
                <button
                  type="button"
                  className={styles.quantity_button}
                  onClick={handleIncrement}
                  disabled={getValues('accQuantity') >= maxQuantity}
                >
                  +
                </button>
                <span className={styles.max_quantity}>
                  ({t('Sets.deleteItem.maxQuantity', { max: maxQuantity })})
                </span>
              </div>
            </div>
            {errors.accQuantity && (
              <p className={styles.error}>{errors.accQuantity.message}</p>
            )}
          </div>
          <div className={styles.buttons_wrap}>
            <CancelBtn
              text="DBSettings.form.cancelBtn"
              onClick={() => {
                reset();
                onClose();
              }}
            />
            <SubmitBtn
              text="Sets.deleteItem.deleteBtn"
              disabled={isLoading || maxQuantity === 0 || accQuantity <= 0}
            />
          </div>
        </form>
      ) : (
        <div className={styles.buttons_wrap}>
          <CancelBtn
            text="DBSettings.form.cancelBtn"
            onClick={() => {
              reset();
              onClose();
            }}
          />
          <SubmitBtn text="Sets.deleteItem.deleteBtn" disabled={true} />
        </div>
      )}
    </section>
  );
}
