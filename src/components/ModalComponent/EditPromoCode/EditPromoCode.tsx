import { useTranslations } from 'next-intl';
import styles from '../ModalComponent.module.css';
import ownStyles from '../CreatePromoCode/CreatePromoCode.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import WhiteBtn from '@/components/Buttons/WhiteBtn/WhiteBtn';
import CustomButtonsInput from '@/components/Buttons/CustomButtonsInput/CustomButtonsInput';
import CustomCheckbox from '@/components/Buttons/CustomCheckbox/CustomCheckbox';
import { useState, useMemo, useEffect } from 'react';
import CustomSelect from '@/components/Buttons/CustomSelect/CustomSelect';
import { useCategoriesStore } from '@/store/categoriesStore';
import { fetchWithErrorHandling, getAuthHeaders } from '@/utils/apiUtils';
import { ENDPOINTS } from '@/constants/api';
import { PromoCode } from '@/types/componentsTypes';
import { usePromoCodesStore } from '@/store/promoCodesStore';

type FormData = {
  name: string;
  promocode: string;
  discount: number;
  expires_at_date?: string;
  expires_at_time?: string;
  promocode_status: 'ACTIVE' | 'DEACTIVATED';
};

type CategorySet = {
  id: number;
  name: string;
};

type SubcategorySet = {
  id: number;
  name: string;
};

interface EditPromoCodeProps {
  promoCode: PromoCode;
  onClose: () => void;
}

export default function EditPromoCode({
  promoCode,
  onClose,
}: EditPromoCodeProps) {
  const t = useTranslations('');
  const { categories, subcategories } = useCategoriesStore();
  const { fetchPromoCodes } = usePromoCodesStore();

  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);
  const [selectedStatus, setSelectedStatus] = useState<string>(
    promoCode.promocode_status
  );
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number>(0);
  const [selectedCategories, setSelectedCategories] = useState<CategorySet[]>(
    []
  );
  const [selectedSubcategories, setSelectedSubcategories] = useState<
    SubcategorySet[]
  >([]);
  const [isExpirationEnabled, setIsExpirationEnabled] = useState(
    !!promoCode.expires_at
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: promoCode.name,
      promocode: promoCode.promocode,
      discount: promoCode.discount,
      expires_at_date: promoCode.expires_at
        ? promoCode.expires_at.split('T')[0]
        : '',
      expires_at_time: promoCode.expires_at
        ? promoCode.expires_at.split('T')[1].slice(0, 5)
        : '',
      promocode_status: promoCode.promocode_status,
    },
  });

  // Мапи для швидкого доступу
  const categoryMap = useMemo(
    () =>
      new Map(
        categories.map(cat => [
          cat.account_category_id,
          cat.account_category_name,
        ])
      ),
    [categories]
  );

  const subcategoryMap = useMemo(
    () =>
      new Map(
        subcategories.map(sub => [
          sub.account_subcategory_id,
          sub.account_subcategory_name,
        ])
      ),
    [subcategories]
  );

  // Ініціалізація вибраних категорій і підкатегорій
  useEffect(() => {
    if (promoCode.subcategory_ids && promoCode.subcategory_ids.length > 0) {
      const initialSubcategories = subcategories
        .filter(sub =>
          promoCode.subcategory_ids!.includes(sub.account_subcategory_id)
        )
        .map(sub => ({
          id: sub.account_subcategory_id,
          name: sub.account_subcategory_name,
        }));
      setSelectedSubcategories(initialSubcategories);

      const relatedCategoryIds = [
        ...new Set(
          subcategories
            .filter(sub =>
              promoCode.subcategory_ids!.includes(sub.account_subcategory_id)
            )
            .map(sub => sub.account_category_id)
        ),
      ];
      const initialCategories = categories
        .filter(cat => relatedCategoryIds.includes(cat.account_category_id))
        .map(cat => ({
          id: cat.account_category_id,
          name: cat.account_category_name,
        }));
      setSelectedCategories(initialCategories);
    }
  }, [promoCode.subcategory_ids, categories, subcategories]);

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

  // Опції для статусу
  const statusOptions = useMemo(
    () => [
      t('PromoCodeSection.selects.activeOne'),
      t('PromoCodeSection.selects.deactivatedOne'),
    ],
    [t]
  );

  // Обробка вибору категорії
  const handleCategorySelect = (values: string[]) => {
    const selectedName = values[0];
    const selectedCat = categories.find(
      cat => cat.account_category_name === selectedName
    );
    setSelectedCategoryId(selectedCat ? selectedCat.account_category_id : 0);
  };

  // Обробка вибору підкатегорії
  const handleSubcategorySelect = (values: string[]) => {
    const selectedName = values[0];
    const selectedSub = subcategories.find(
      sub => sub.account_subcategory_name === selectedName
    );
    setSelectedSubcategoryId(
      selectedSub ? selectedSub.account_subcategory_id : 0
    );
  };

  const handleStatusSelect = (values: string[]) => {
    const selectedValue = values[0];
    const status =
      selectedValue === t('PromoCodeSection.selects.deactivatedOne')
        ? 'DEACTIVATED'
        : 'ACTIVE';
    setSelectedStatus(status);
    setValue('promocode_status', status);
  };

  // Додавання категорії
  const handleAddCategory = () => {
    if (!selectedCategoryId) {
      toast.error(t('DBSettings.form.errorMessage'));
      return;
    }
    const categoryName = categoryMap.get(selectedCategoryId);
    if (categoryName) {
      setSelectedCategories(prev => [
        ...prev,
        { id: selectedCategoryId, name: categoryName },
      ]);
      setSelectedCategoryId(0);
      toast.success(t('PromoCodeSection.modal.categoryAdded'));
    }
  };

  // Додавання підкатегорії
  const handleAddSubcategory = () => {
    if (!selectedSubcategoryId) {
      toast.error(t('DBSettings.form.errorMessage'));
      return;
    }
    const subcategoryName = subcategoryMap.get(selectedSubcategoryId);
    if (subcategoryName) {
      setSelectedSubcategories(prev => [
        ...prev,
        { id: selectedSubcategoryId, name: subcategoryName },
      ]);
      setSelectedSubcategoryId(0);
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
    if (selectedSubcategories.length === 0) {
      toast.error(t('PromoCodeSection.modal.noSubcategoriesError'));
      return;
    }

    let expiresAt: string | null = null;
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
      promocode_status: data.promocode_status,
    };

    try {
      await fetchWithErrorHandling(
        `${ENDPOINTS.PROMO_CODES}/${promoCode.promocode_id}`,
        {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify(requestBody),
        },
        () => {}
      );

      toast.success(t('PromoCodeSection.modal.editSuccess'));
      reset();
      setSelectedCategories([]);
      setSelectedSubcategories([]);
      setIsExpirationEnabled(false);
      setSelectedCategoryId(0);
      setSelectedSubcategoryId(0);
      fetchPromoCodes();
      onClose();
    } catch (error) {
      console.error('Error editing promocode:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : t('PromoCodeSection.modal.error')
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`${styles.form} ${ownStyles.form}`}
    >
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
            <label className={styles.label}>
              {t('PromoCodeSection.modal.status')}
            </label>
            <CustomSelect
              options={statusOptions}
              selected={[
                selectedStatus === 'ACTIVE'
                  ? t('PromoCodeSection.selects.activeOne')
                  : t('PromoCodeSection.selects.deactivatedOne'),
              ]}
              onSelect={handleStatusSelect}
              width={'100%'}
              multiSelections={false}
            />
            {errors.promocode_status && (
              <p className={styles.error}>{errors.promocode_status.message}</p>
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
              selected={
                selectedCategoryId
                  ? [categoryMap.get(selectedCategoryId) || '']
                  : ['']
              }
              onSelect={handleCategorySelect}
              width={'100%'}
              multiSelections={false}
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
              selected={
                selectedSubcategoryId
                  ? [subcategoryMap.get(selectedSubcategoryId) || '']
                  : ['']
              }
              onSelect={handleSubcategorySelect}
              width={'100%'}
              multiSelections={false}
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
            setSelectedCategoryId(0);
            setSelectedSubcategoryId(0);
            onClose();
          }}
        />
        <SubmitBtn text="PromoCodeSection.modal.saveBtn" />
      </div>
    </form>
  );
}
