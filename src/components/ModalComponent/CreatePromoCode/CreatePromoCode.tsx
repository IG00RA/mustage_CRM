import { useTranslations } from 'next-intl';
import styles from '../ModalComponent.module.css';
import ownStyles from './CreatePromoCode.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import WhiteBtn from '@/components/Buttons/WhiteBtn/WhiteBtn';
import CustomButtonsInput from '@/components/Buttons/CustomButtonsInput/CustomButtonsInput';
import CustomCheckbox from '@/components/Buttons/CustomCheckbox/CustomCheckbox';
import { useState, useMemo } from 'react';
import CustomSelect from '@/components/Buttons/CustomSelect/CustomSelect';
import { useCategoriesStore } from '@/store/categoriesStore';
import { fetchWithErrorHandling, getAuthHeaders } from '@/utils/apiUtils';

type FormData = {
  name: string;
  promocode: string;
  discount: number;
  expires_at_date?: string;
  expires_at_time?: string;
};

type CategorySet = {
  id: number;
  name: string;
};

type SubcategorySet = {
  id: number;
  name: string;
};

export default function CreatePromoCode({ onClose }: { onClose: () => void }) {
  const t = useTranslations('');
  const { categories, subcategories } = useCategoriesStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<CategorySet[]>(
    []
  );
  const [selectedSubcategories, setSelectedSubcategories] = useState<
    SubcategorySet[]
  >([]);
  const [isExpirationEnabled, setIsExpirationEnabled] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  // Опції для категорій
  const categoryOptions = useMemo(
    () =>
      categories
        .filter(
          cat =>
            !selectedCategories.some(
              selected => selected.id === cat.account_category_id
            )
        )
        .map(cat => cat.account_category_name),
    [categories, selectedCategories]
  );

  // Фільтровані підкатегорії
  const subcategoryOptions = useMemo(() => {
    const selectedCategoryIds = selectedCategories.map(cat => cat.id);
    return subcategories
      .filter(
        sub =>
          selectedCategoryIds.includes(sub.account_category_id) &&
          !selectedSubcategories.some(
            selected => selected.id === sub.account_subcategory_id
          )
      )
      .map(sub => sub.account_subcategory_name);
  }, [subcategories, selectedCategories, selectedSubcategories]);

  // Додавання категорії
  const handleAddCategory = () => {
    if (!selectedCategory) {
      toast.error(t('DBSettings.form.errorMessage'));
      return;
    }
    const category = categories.find(
      cat => cat.account_category_name === selectedCategory
    );
    if (category) {
      setSelectedCategories(prev => [
        ...prev,
        {
          id: category.account_category_id,
          name: category.account_category_name,
        },
      ]);
      setSelectedCategory('');
      toast.success(t('PromoCodeSection.modal.categoryAdded'));
    }
  };

  // Додавання підкатегорії
  const handleAddSubcategory = () => {
    if (!selectedSubcategory) {
      toast.error(t('DBSettings.form.errorMessage'));
      return;
    }
    const subcategory = subcategories.find(
      sub => sub.account_subcategory_name === selectedSubcategory
    );
    if (subcategory) {
      setSelectedSubcategories(prev => [
        ...prev,
        {
          id: subcategory.account_subcategory_id,
          name: subcategory.account_subcategory_name,
        },
      ]);
      setSelectedSubcategory('');
      toast.success(t('PromoCodeSection.modal.subcategoryAdded'));
    }
  };

  // Видалення категорії
  const handleRemoveCategory = (name: string) => {
    setSelectedCategories(prev => prev.filter(cat => cat.name !== name));
  };

  // Видалення підкатегорії
  const handleRemoveSubcategory = (name: string) => {
    setSelectedSubcategories(prev => prev.filter(sub => sub.name !== name));
  };

  // Обробка відправки форми
  const onSubmit = async (data: FormData) => {
    let expiresAt: string | undefined;
    if (isExpirationEnabled && data.expires_at_date && data.expires_at_time) {
      expiresAt = new Date(
        `${data.expires_at_date}T${data.expires_at_time}`
      ).toISOString();
    }

    const requestBody = {
      name: data.name,
      promocode: data.promocode,
      discount: data.discount,
      expires_at: expiresAt,
      subcategory_ids: selectedSubcategories.map(sub => sub.id),
    };

    try {
      const response = await fetchWithErrorHandling(
        '/promocodes',
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(requestBody),
        },
        () => {}
      );

      toast.success(t('DBSettings.form.okMessage'));
      reset();
      setSelectedCategories([]);
      setSelectedSubcategories([]);
      setIsExpirationEnabled(false);
      onClose();
    } catch (error) {
      console.error('Error creating promocode:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : t('DBSettings.form.errorMessage')
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={ownStyles.field_wrap_main}>
        <div className={ownStyles.field_wrap}>
          <div className={styles.field}>
            <label className={styles.label}>
              {t('PromoCodeSection.modal.promoName')}
            </label>
            <input
              className={`${styles.input} ${
                errors.name ? styles.input_error : ''
              }`}
              placeholder={t('DBSettings.form.placeholder')}
              {...register('name', {
                required: t('DBSettings.form.errorMessage'),
              })}
            />
            {errors.name && (
              <p className={styles.error}>{errors.name.message}</p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              {t('PromoCodeSection.modal.code')}
            </label>
            <input
              className={`${styles.input} ${
                errors.promocode ? styles.input_error : ''
              }`}
              placeholder={t('DBSettings.form.placeholder')}
              {...register('promocode', {
                required: t('DBSettings.form.errorMessage'),
              })}
            />
            {errors.promocode && (
              <p className={styles.error}>{errors.promocode.message}</p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              {t('PromoCodeSection.modal.discount')}
            </label>
            <input
              className={`${styles.input} ${
                errors.discount ? styles.input_error : ''
              }`}
              type="number"
              step="any"
              placeholder={t('DBSettings.form.placeholder')}
              {...register('discount', {
                required: t('DBSettings.form.errorMessage'),
                valueAsNumber: true,
              })}
            />
            {errors.discount && (
              <p className={styles.error}>{errors.discount.message}</p>
            )}
          </div>

          <div className={styles.field}>
            <CustomCheckbox
              checked={isExpirationEnabled}
              onChange={() => setIsExpirationEnabled(prev => !prev)}
              label={t('PromoCodeSection.modal.check')}
            />
          </div>

          {isExpirationEnabled && (
            <div className={ownStyles.data_wrap}>
              <div className={ownStyles.field}>
                <label className={styles.label}>
                  {t('PromoCodeSection.modal.date')}
                </label>
                <input
                  className={`${styles.input} ${
                    errors.expires_at_date ? styles.input_error : ''
                  }`}
                  type="date"
                  {...register('expires_at_date', {
                    required: isExpirationEnabled
                      ? t('DBSettings.form.errorMessage')
                      : false,
                  })}
                />
                {errors.expires_at_date && (
                  <p className={styles.error}>
                    {errors.expires_at_date.message}
                  </p>
                )}
              </div>
              <div className={ownStyles.field}>
                <label className={styles.label}>
                  {t('PromoCodeSection.modal.time')}
                </label>
                <input
                  className={`${styles.input} ${
                    errors.expires_at_time ? styles.input_error : ''
                  }`}
                  type="time"
                  {...register('expires_at_time', {
                    required: isExpirationEnabled
                      ? t('DBSettings.form.errorMessage')
                      : false,
                  })}
                />
                {errors.expires_at_time && (
                  <p className={styles.error}>
                    {errors.expires_at_time.message}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className={ownStyles.field_wrap_second}>
          <p className={ownStyles.field_header}>
            {t('PromoCodeSection.modal.namesDiscount')}
          </p>
          <div className={ownStyles.buttons_wrap}>
            <label className={styles.label}>
              {t('PromoCodeSection.modal.category')}
            </label>
            <CustomSelect
              options={categoryOptions}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
            <WhiteBtn
              onClick={handleAddCategory}
              text={'PromoCodeSection.modal.categoryBtn'}
              icon="icon-add-color"
              iconFill="icon-add-color"
            />
            <CustomButtonsInput
              onRemove={handleRemoveCategory}
              buttons={selectedCategories.map(cat => cat.name)}
            />
          </div>
          <div className={ownStyles.buttons_wrap}>
            <label className={styles.label}>
              {t('PromoCodeSection.modal.names')}
            </label>
            <CustomSelect
              options={subcategoryOptions}
              selected={selectedSubcategory}
              onSelect={setSelectedSubcategory}
              width={602}
            />
            <WhiteBtn
              onClick={handleAddSubcategory}
              text={'PromoCodeSection.modal.namesBtn'}
              icon="icon-add-color"
              iconFill="icon-add-color"
            />
            <CustomButtonsInput
              onRemove={handleRemoveSubcategory}
              buttons={selectedSubcategories.map(sub => sub.name)}
            />
          </div>
        </div>
      </div>
      <div className={styles.buttons_wrap}>
        <CancelBtn
          text="DBSettings.form.cancelBtn"
          onClick={() => {
            reset();
            setSelectedCategories([]);
            setSelectedSubcategories([]);
            onClose();
          }}
        />
        <SubmitBtn text="PromoCodeSection.modal.addBtn" />
      </div>
    </form>
  );
}
