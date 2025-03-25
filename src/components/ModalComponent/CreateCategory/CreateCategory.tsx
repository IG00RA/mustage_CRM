import { useTranslations } from 'next-intl';
import styles from '../ModalComponent.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useCategoriesStore } from '@/store/categoriesStore';
import { ENDPOINTS } from '@/constants/api';
import { fetchWithErrorHandling, getAuthHeaders } from '@/utils/apiUtils';
import { Category } from '@/types/salesTypes';

type FormData = {
  name: string;
  description: string;
};

export default function CreateCategory({ onClose }: { onClose: () => void }) {
  const t = useTranslations('');
  const { fetchCategories } = useCategoriesStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      const newCategory = await fetchWithErrorHandling<Category>(
        ENDPOINTS.CATEGORIES,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            account_category_name: data.name,
            description: data.description,
          }),
        },
        () => {}
      );

      await fetchCategories();
      toast.success(t('Category.modalCreate.successMessage'));
      reset();
      onClose();
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : t('Category.modalCreate.errorMessage')
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
          className={`${styles.input} ${errors.name ? styles.input_error : ''}`}
          placeholder={t('DBSettings.form.placeholder')}
          {...register('name', {
            required: t('DBSettings.form.errorMessage'),
          })}
        />
        {errors.name && <p className={styles.error}>{errors.name.message}</p>}
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
        <SubmitBtn text="Category.modalCreate.createBtn" />
      </div>
    </form>
  );
}
