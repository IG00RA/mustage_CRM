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
import { Subcategory } from '@/types/categoriesTypes';

type FormData = {
  nameField: string;
  account_category_id: number;
  price: number;
  cost: number;
  nameDescription: string;
  separator: string;
  settings: string[];
};

const settingsOptions = [
  'Names.modalCreate.id',
  'Names.modalCreate.data',
  'Names.modalCreate.megaLink',
  'Names.modalCreate.accountId',
  'Names.modalCreate.workerName',
  'Names.modalCreate.teamleadName',
  'Names.modalCreate.clientName',
  'Names.modalCreate.accountName',
  'Names.modalCreate.price',
  'Names.modalCreate.profileLink',
  'Names.modalCreate.sellerName',
  'Names.modalCreate.categoryId',
];

const settingsMapping: Record<string, string> = {
  'Names.modalCreate.id': 'account_subcategory_id',
  'Names.modalCreate.data': 'account_data',
  'Names.modalCreate.megaLink': 'archive_link',
  'Names.modalCreate.accountId': 'account_id',
  'Names.modalCreate.workerName': 'worker_name',
  'Names.modalCreate.teamleadName': 'teamlead_name',
  'Names.modalCreate.clientName': 'client_name',
  'Names.modalCreate.accountName': 'account_name',
  'Names.modalCreate.price': 'price',
  'Names.modalCreate.profileLink': 'profile_link',
  'Names.modalCreate.sellerName': 'seller_name',
  'Names.modalCreate.categoryId': 'account_category_id',
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
      account_category_id: 0,
    },
  });

  const [checkedSettings, setCheckedSettings] = useState<
    Record<string, boolean>
  >({});
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);
  const [order, setOrder] = useState<string[]>(settingsOptions);

  const toggleCheckbox = (id: string) => {
    setCheckedSettings(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleReorder = (newOrder: string[]) => {
    setOrder(newOrder);
  };

  const handleRemoveButton = (label: string) => {
    const id = settingsOptions.find(id => t(id) === label);
    if (id) {
      setCheckedSettings(prev => ({
        ...prev,
        [id]: false,
      }));
    }
  };

  const activeButtons = useMemo(() => {
    return order.filter(id => checkedSettings[id]).map(id => t(id));
  }, [order, checkedSettings, t]);

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
    const selectedName = values[0];
    const selectedCat = categories.find(
      cat => cat.account_category_name === selectedName
    );
    if (selectedCat) {
      const categoryId = Number(selectedCat.account_category_id);
      setSelectedCategoryId(categoryId);
      setValue('account_category_id', categoryId);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      const selectedSettings = order.filter(id => checkedSettings[id]);

      const mappedSettings = selectedSettings.map(
        setting => settingsMapping[setting]
      );
      await fetchWithErrorHandling<Subcategory>(
        ENDPOINTS.SUBCATEGORIES,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify({
            account_subcategory_name: data.nameField,
            account_category_id: data.account_category_id,
            price: data.price,
            cost_price: data.cost,
            description: data.nameDescription,
            output_format_field: mappedSettings,
            output_separator: data.separator,
          }),
        },
        () => {}
      );

      await fetchSubcategories();
      toast.success(t('Names.okMessage'));
      reset();
      setCheckedSettings({});
      setSelectedCategoryId(0);
      onClose();
    } catch (error) {
      toast.error(`${t('Names.modalCreate.errorMessage')} : ${error}`);
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
        <label className={styles.label}>
          {t('Names.modalCreate.nameCategoryField')}
        </label>
        <CustomSelect
          options={categoryOptions}
          selected={
            selectedCategoryId
              ? [
                  categoryMap.get(selectedCategoryId) ||
                    t('AllAccounts.selectBtn'),
                ]
              : [t('AllAccounts.selectBtn')]
          }
          onSelect={handleCategorySelect}
          width={'100%'}
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
          step="any"
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
          step="any"
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
        <CustomDragDrop settingsOptions={order} onReorder={handleReorder}>
          {(id: string) => (
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
          buttons={activeButtons}
          onRemove={handleRemoveButton}
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

      <div className={ownStyles.buttons_wrap}>
        <CancelBtn
          text="DBSettings.form.cancelBtn"
          onClick={() => {
            reset();
            setCheckedSettings({});
            setSelectedCategoryId(0);
            onClose();
          }}
        />
        <SubmitBtn text="Names.modalCreate.createBtn" />
      </div>
    </form>
  );
}
