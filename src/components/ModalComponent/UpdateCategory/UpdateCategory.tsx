import { useTranslations } from 'next-intl';
import styles from '../ModalComponent.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '@/constants/api';
import { fetchWithErrorHandling, getAuthHeaders } from '@/utils/apiUtils';
import { useCategoriesStore } from '@/store/categoriesStore';
import { useEffect, useState } from 'react';
import CustomCheckbox from '@/components/Buttons/CustomCheckbox/CustomCheckbox';
import {
  UpdateCategoryFormData,
  UpdateCategoryProps,
} from '@/types/componentsTypes';

interface ExtendedUpdateCategoryProps extends UpdateCategoryProps {
  initialIsSetCategory?: boolean;
}

export default function UpdateCategory({
  categoryId,
  initialName,
  initialDescription,
  initialIsSetCategory = false,
  onClose,
}: ExtendedUpdateCategoryProps) {
  const t = useTranslations('');
  const { fetchCategories } = useCategoriesStore();
  const [isSetCategory, setIsSetCategory] = useState(initialIsSetCategory);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<UpdateCategoryFormData>({
    defaultValues: {
      account_category_name: initialName,
      description: initialDescription || '',
    },
  });

  useEffect(() => {
    setValue('account_category_name', initialName);
    setValue('description', initialDescription || '');
    setIsSetCategory(initialIsSetCategory);
  }, [initialName, initialDescription, initialIsSetCategory, setValue]);

  const onSubmit = async (data: UpdateCategoryFormData) => {
    try {
      await fetchWithErrorHandling(
        `${ENDPOINTS.CATEGORIES}/${categoryId}`,
        {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            account_category_name: data.account_category_name,
            description: data.description,
            is_set_category: isSetCategory,
          }),
        },
        () => {}
      );

      toast.success(t('Category.modalUpdate.successMessage'));
      await fetchCategories();
      reset();
      setIsSetCategory(initialIsSetCategory);
      onClose();
    } catch (error) {
      toast.error(t('Category.modalUpdate.errorMessage'), error || '');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label}>
          {t('Category.modalCreate.nameField')}
        </label>
        <input
          className={`${styles.input} ${
            errors.account_category_name ? styles.input_error : ''
          }`}
          placeholder={t('DBSettings.form.placeholder')}
          {...register('account_category_name', {
            required: t('DBSettings.form.errorMessage'),
          })}
        />
        {errors.account_category_name && (
          <p className={styles.error}>{errors.account_category_name.message}</p>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          {t('Category.modalCreate.descriptionField')}
        </label>
        <input
          className={`${styles.input} ${
            errors.description ? styles.input_error : ''
          }`}
          placeholder={t('DBSettings.form.placeholder')}
          {...register('description', {
            required: t('DBSettings.form.errorMessage'),
          })}
        />
        {errors.description && (
          <p className={styles.error}>{errors.description.message}</p>
        )}
      </div>

      <div className={styles.field}>
        <CustomCheckbox
          checked={isSetCategory}
          onChange={() => setIsSetCategory(!isSetCategory)}
          label={t('Category.modalCreate.isSetCategory')}
        />
      </div>

      <div className={styles.buttons_wrap}>
        <CancelBtn
          text="DBSettings.form.cancelBtn"
          onClick={() => {
            reset();
            setIsSetCategory(initialIsSetCategory);
            onClose();
          }}
        />
        <SubmitBtn text="Category.modalUpdate.createBtn" />
      </div>
    </form>
  );
}
