'use client';

import { useTranslations } from 'next-intl';
import ownStyles from './EditNames.module.css';
import styles from '../ModalComponent.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import CustomButtonsInput from '@/components/Buttons/CustomButtonsInput/CustomButtonsInput';
import CustomDragDrop from '@/components/Buttons/CustomDragDrop/CustomDragDrop';
import CustomCheckbox from '@/components/Buttons/CustomCheckbox/CustomCheckbox';
import { useMemo, useState, useEffect } from 'react';
import { useCategoriesStore } from '@/store/categoriesStore';
import { ENDPOINTS } from '@/constants/api';
import { fetchWithErrorHandling, getAuthHeaders } from '@/utils/apiUtils';
import { Subcategory } from '@/types/categoriesTypes';

type FormData = {
  nameField: string;
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

const reverseSettingsMapping: Record<string, string> = {
  account_subcategory_id: 'Names.modalCreate.id',
  account_data: 'Names.modalCreate.data',
  archive_link: 'Names.modalCreate.megaLink',
  account_id: 'Names.modalCreate.accountId',
  worker_name: 'Names.modalCreate.workerName',
  teamlead_name: 'Names.modalCreate.teamleadName',
  client_name: 'Names.modalCreate.clientName',
  account_name: 'Names.modalCreate.accountName',
  price: 'Names.modalCreate.price',
  profile_link: 'Names.modalCreate.profileLink',
  seller_name: 'Names.modalCreate.sellerName',
  account_category_id: 'Names.modalCreate.categoryId',
};

interface EditNamesProps {
  onClose: () => void;
  subcategory: Subcategory | null;
}

export default function EditNames({ onClose, subcategory }: EditNamesProps) {
  const t = useTranslations('');
  const { fetchSubcategories } = useCategoriesStore();

  const [checkedSettings, setCheckedSettings] = useState<
    Record<string, boolean>
  >({});
  const [order, setOrder] = useState<string[]>(settingsOptions);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      nameField: '',
      price: 0,
      cost: 0,
      nameDescription: '',
      separator: '',
    },
  });

  useEffect(() => {
    if (subcategory) {
      setValue('nameField', subcategory.account_subcategory_name);
      setValue('price', subcategory.price);
      setValue('cost', subcategory.cost_price);
      setValue('nameDescription', subcategory.description || '');
      setValue('separator', subcategory.output_separator || '');

      const formatFields = subcategory.output_format_field || [];
      const mappedFields = formatFields.map(
        field => reverseSettingsMapping[field] || field
      );

      const initialSettings: Record<string, boolean> = {};
      settingsOptions.forEach(option => {
        initialSettings[option] = mappedFields.includes(option);
      });
      setCheckedSettings(initialSettings);

      const remainingOptions = settingsOptions.filter(
        opt => !mappedFields.includes(opt)
      );
      setOrder([...mappedFields, ...remainingOptions]);
    }
  }, [subcategory, setValue]);

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

  const onSubmit = async (data: FormData) => {
    if (!subcategory) return;

    try {
      const selectedSettings = order.filter(id => checkedSettings[id]);
      const mappedSettings = selectedSettings.map(
        setting => settingsMapping[setting]
      );

      await fetchWithErrorHandling<Subcategory>(
        `${ENDPOINTS.SUBCATEGORIES}/${subcategory.account_subcategory_id}`,
        {
          method: 'PATCH',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify({
            account_subcategory_name: data.nameField,
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
      onClose();
    } catch (error) {
      console.error('Error updating subcategory:', error);
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
          {...register('nameDescription', {})}
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
          text="Names.modalUpdate.closeBtn"
          onClick={() => {
            reset();
            setCheckedSettings({});
            onClose();
          }}
        />
        <SubmitBtn text="Names.modalUpdate.createBtn" />
      </div>
    </form>
  );
}
