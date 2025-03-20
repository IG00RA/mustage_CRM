import { useTranslations } from 'next-intl';
import styles from '../ModalComponent.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useSalesStore } from '@/store/salesStore';

type FormData = {
  name: string;
  description: string;
};

export default function CreateCategory({ onClose }: { onClose: () => void }) {
  const t = useTranslations('');
  const { fetchCategories } = useSalesStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    console.log('Cookies before request:', document.cookie); // Дебаг

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_HOST_BACK}/categories`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            name: data.name,
            description: data.description,
          }),
        }
      );

      console.log('Response status:', response.status);
      console.log('Response headers:', [...response.headers.entries()]);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Server error response:', errorText);
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || 'Failed to create category');
      }

      const newCategory = await response.json();
      console.log('Created category:', newCategory);

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
