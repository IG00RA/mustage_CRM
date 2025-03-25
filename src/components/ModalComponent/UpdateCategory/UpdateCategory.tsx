import { useTranslations } from 'next-intl';
import styles from '../ModalComponent.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '@/constants/api';
import { fetchWithErrorHandling, getAuthHeaders } from '@/utils/apiUtils';
import { useCategoriesStore } from '@/store/categoriesStore';
import { useEffect } from 'react';
import {
  UpdateCategoryFormData,
  UpdateCategoryProps,
} from '@/types/componentsTypes';

export default function UpdateCategory({
  categoryId,
  initialName,
  initialDescription,
  onClose,
}: UpdateCategoryProps) {
  const t = useTranslations('');
  const { fetchCategories } = useCategoriesStore();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<UpdateCategoryFormData>({
    defaultValues: {
      account_category_name: initialName,
      description: initialDescription || '', // Встановлюємо початковий опис
    },
  });

  // Встановлюємо початкові значення для полів
  useEffect(() => {
    setValue('account_category_name', initialName);
    setValue('description', initialDescription || ''); // Оновлюємо description при зміні пропса
  }, [initialName, initialDescription, setValue]);

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
          }),
        },
        () => {} // Поки що не оновлюємо стан напряму
      );

      toast.success(t('Category.modalUpdate.successMessage'));
      await fetchCategories();
      reset();
      onClose();
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : t('Category.modalUpdate.errorMessage')
      );
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
      <div className={styles.buttons_wrap}>
        <CancelBtn
          text="DBSettings.form.cancelBtn"
          onClick={() => {
            reset();
            onClose();
          }}
        />
        <SubmitBtn text="Category.modalUpdate.createBtn" />
      </div>
    </form>
  );
}
