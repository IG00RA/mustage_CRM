'use client';

import styles from './SetsItemCreateSection.module.css';
import { useTranslations } from 'next-intl';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useCategoriesStore } from '@/store/categoriesStore';
import { useAccountsStore } from '@/store/accountsStore';
import { useAccountSetsStore } from '@/store/accountSetsStore';
import CustomSelect from '@/components/Buttons/CustomSelect/CustomSelect';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';

type FormData = {
  namesPrice: number;
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

export default function SetsItemCreateSection({
  onClose,
}: {
  onClose: () => void;
}) {
  const t = useTranslations();
  const { categories, subcategories, fetchCategories } = useCategoriesStore();
  const { fetchAccounts } = useAccountsStore();
  const { createSetItem, fetchSets } = useAccountSetsStore();
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [selectedSet, setSelectedSet] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [accountSets, setAccountSets] = useState<AccountSet[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<FormData>();

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
        namesPrice: undefined,
        accQuantity: undefined,
      });
    }
  }, [selectedCategory, t, reset]);

  useEffect(() => {
    if (selectedSet.length > 0 && selectedSet[0] !== t('Load.names')) {
      const setId = accountSets.find(s => s.name === selectedSet[0])?.set_id;
      const set = accountSets.find(s => s.set_id === setId);
      if (set) {
        setValue('namesPrice', set.price);
        fetchAccounts({
          subcategory_ids: set.set_content.map(c => c.subcategory_id),
        });
      }
    } else {
      reset({
        namesPrice: undefined,
        accQuantity: undefined,
      });
    }
  }, [selectedSet, accountSets, fetchAccounts, setValue, t, reset]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    const setId = accountSets.find(s => s.name === selectedSet[0])?.set_id;

    if (!setId) {
      toast.error(t('Load.errorMessage'));
      setIsLoading(false);
      return;
    }

    const requestBody = {
      quantity: data.accQuantity,
      platform: 'CRM',
    };

    try {
      const response = await createSetItem(setId, requestBody);
      if (response.status === 'formed') {
        toast.success(response.message || t('Sets.createItem.successMessage'));
        reset({
          namesPrice: undefined,
          accQuantity: undefined,
        });
        setSelectedSet([]);
      } else {
        const shortageInfo = response.shortage_info?.[0];
        if (shortageInfo && subcategories) {
          const subcategory = subcategories.find(
            sub => sub.account_subcategory_id === shortageInfo.subcategory_id
          );
          if (subcategory) {
            const errorMessage = `Недостаточно аккаунтов в подкатегории ${subcategory.account_subcategory_name} в количестве ${shortageInfo.missing} для формирования едениц набора`;
            toast.error(errorMessage);
          } else {
            toast.error(response.message || t('Sets.createItem.errorMessage'));
          }
        } else {
          toast.error(response.message || t('Sets.createItem.errorMessage'));
        }
      }
    } catch (error) {
      toast.error(`${t('Sets.createItem.errorMessage')} : ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = (values: string[]) => {
    setSelectedSet([]);
    const value = values[0] || '';
    setSelectedCategory([value]);
    if (value === t('Load.category')) {
      setSelectedSet([]);
      reset({
        namesPrice: undefined,
        accQuantity: undefined,
      });
    }
  };

  const handleSetSelect = (values: string[]) => {
    const value = values[0] || '';
    setSelectedSet([value]);
    if (value === t('Load.names')) {
      reset({
        namesPrice: undefined,
        accQuantity: undefined,
      });
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
        <p>{t('Sets.createItem.categorySet')}</p>
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
        <p className={styles.select_label}>{t('Sets.createItem.namesSet')}</p>
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
                {t('Sets.createItem.accPrice')}
              </label>
              <input
                type="number"
                className={`${styles.input} ${
                  errors.namesPrice ? styles.input_error : ''
                }`}
                readOnly
                {...register('namesPrice', {
                  required: t('DBSettings.form.errorMessage'),
                })}
              />
            </div>
            {errors.namesPrice && (
              <p className={styles.error}>{errors.namesPrice.message}</p>
            )}
          </div>
          <div className={styles.field}>
            <div className={styles.label_wrap}>
              <label className={styles.label}>
                {t('Sets.createItem.setsQuantity')}
              </label>
              <input
                type="number"
                className={`${styles.input} ${
                  errors.accQuantity ? styles.input_error : ''
                }`}
                placeholder={t('DBSettings.form.placeholder')}
                {...register('accQuantity', {
                  required: t('DBSettings.form.errorMessage'),
                })}
              />
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
            <SubmitBtn text="Sets.createItem.createBtn" disabled={isLoading} />
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
          <SubmitBtn text="Sets.createItem.createBtn" disabled={true} />
        </div>
      )}
    </section>
  );
}
