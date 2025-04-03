'use client';

import styles from '../ModalComponent.module.css';
import ownStyles from './CreateUser.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import CustomButtonsInput from '@/components/Buttons/CustomButtonsInput/CustomButtonsInput';
import { useTranslations } from 'next-intl';
import CustomCheckbox from '@/components/Buttons/CustomCheckbox/CustomCheckbox';
import { useState, useEffect, useRef } from 'react';
import CustomSelect from '@/components/Buttons/CustomSelect/CustomSelect';
import WhiteBtn from '@/components/Buttons/WhiteBtn/WhiteBtn';
import UserRoles from '../UserRoles/UserRoles';
import { useCategoriesStore } from '@/store/categoriesStore';
import { useUsersStore } from '@/store/usersStore';
import ModalComponent from '../ModalComponent';

type FormData = {
  login: string;
  pass: string;
  name: string;
  secondName: string;
  tgId: string;
  tgNick: string;
  email?: string;
};

export default function CreateUser({ onClose }: { onClose: () => void }) {
  const t = useTranslations('');
  const { fetchCategories, fetchSubcategories, categories, subcategories } =
    useCategoriesStore();
  const { createUser, fetchUsers, loading } = useUsersStore();

  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(
    []
  );
  const [addedSubcategories, setAddedSubcategories] = useState<string[]>([]);
  const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
  const [userFunctions, setUserFunctions] = useState<any[]>([]);
  const hasLoadedRef = useRef(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  useEffect(() => {
    const loadInitialData = async () => {
      if (!hasLoadedRef.current) {
        try {
          if (categories.length === 0) {
            await fetchCategories();
          }
          if (subcategories.length === 0) {
            await fetchSubcategories();
          }
        } catch (error) {
          toast.error(
            t('UserSection.modalCreate.dataLoadError') ||
              'Failed to load categories/subcategories'
          );
        } finally {
          hasLoadedRef.current = true;
        }
      }
    };
    loadInitialData();
  }, []);

  const onSubmit = async (data: FormData) => {
    const subcatIds = subcategories
      .filter(sub => addedSubcategories.includes(sub.account_subcategory_name))
      .map(sub => sub.account_subcategory_id);

    const userDataBase = {
      login: data.login,
      password: data.pass,
      first_name: data.name,
      last_name: data.secondName,
      is_admin: false,
      is_referral: false,
      telegram_id: Number(data.tgId),
      telegram_username: data.tgNick,
      functions: userFunctions,
      notifications_for_subcategories: isNotificationsEnabled ? subcatIds : [],
    };

    const userData = data.email
      ? { ...userDataBase, email: data.email }
      : userDataBase;

    try {
      await createUser(userData);
      toast.success(
        t('UserSection.modalCreate.successMessage') ||
          'User created successfully'
      );
      // Оновлюємо список користувачів після успішного створення
      await fetchUsers({ limit: 5, offset: 0 });
      reset();
      onClose();
    } catch (error) {
      toast.error(
        t('UserSection.modalCreate.errorMessage') || 'Failed to create user'
      );
    }
  };

  const handleRolesSubmit = (functions: any[]) => {
    setUserFunctions(functions);
    setIsRolesModalOpen(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleAddSubcategories = () => {
    if (selectedSubcategories.length === 0) {
      toast.error(
        t('UserSection.modalCreate.noSubcategoriesError') ||
          'Please select subcategories first'
      );
      return;
    }

    const subcategoriesToAdd = selectedSubcategories.includes(
      t('UserSection.modalCreate.subcategoryAll')
    )
      ? subcategoryOptions.filter(
          opt => opt !== t('UserSection.modalCreate.subcategoryAll')
        )
      : selectedSubcategories;

    setAddedSubcategories(prev => [
      ...prev,
      ...subcategoriesToAdd.filter(sub => !prev.includes(sub)),
    ]);
    setSelectedSubcategories([]);
    toast.success(
      t('UserSection.modalCreate.subcategoriesAdded') ||
        'Subcategories added successfully'
    );
  };

  const handleRemoveSubcategory = (subcategory: string) => {
    setAddedSubcategories(prev => prev.filter(sub => sub !== subcategory));
  };

  const toggleRolesModal = () => {
    setIsRolesModalOpen(!isRolesModalOpen);
  };

  const categoryOptions = [
    t('UserSection.modalCreate.categoryAll'),
    ...categories.map(cat => cat.account_category_name),
  ];

  const subcategoryOptions = [
    t('UserSection.modalCreate.subcategoryAll'),
    ...subcategories
      .filter(sub => {
        if (
          selectedCategories.length === 0 ||
          selectedCategories.includes(t('UserSection.modalCreate.categoryAll'))
        ) {
          return true;
        }
        return categories
          .filter(cat => selectedCategories.includes(cat.account_category_name))
          .some(cat => cat.account_category_id === sub.account_category_id);
      })
      .map(sub => sub.account_subcategory_name),
  ];

  const handleCategorySelect = (values: string[]) => {
    if (values.includes(t('UserSection.modalCreate.categoryAll'))) {
      setSelectedCategories([t('UserSection.modalCreate.categoryAll')]);
    } else {
      setSelectedCategories(values);
    }
    setSelectedSubcategories([]);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`${styles.form} ${ownStyles.form}`}
      >
        <div className={styles.field}>
          <label className={styles.label}>
            {t('UserSection.modalCreate.name')}
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
          {errors.name && <p className={styles.error}>{errors.name.message}</p>}
        </div>
        <div className={styles.field}>
          <label className={styles.label}>
            {t('UserSection.modalCreate.secondName')}
          </label>
          <input
            className={`${styles.input} ${
              errors.secondName ? styles.input_error : ''
            }`}
            placeholder={t('DBSettings.form.placeholder')}
            {...register('secondName', {
              required: t('DBSettings.form.errorMessage'),
            })}
          />
          {errors.secondName && (
            <p className={styles.error}>{errors.secondName.message}</p>
          )}
        </div>
        <div className={styles.field}>
          <label className={styles.label}>
            {t('UserSection.modalCreate.login')}
          </label>
          <input
            className={`${styles.input} ${
              errors.login ? styles.input_error : ''
            }`}
            placeholder={t('DBSettings.form.placeholder')}
            {...register('login', {
              required: t('DBSettings.form.errorMessage'),
            })}
          />
          {errors.login && (
            <p className={styles.error}>{errors.login.message}</p>
          )}
        </div>
        <div className={styles.field}>
          <label className={styles.label}>
            {t('UserSection.modalCreate.pass')}
          </label>
          <input
            className={`${styles.input} ${
              errors.pass ? styles.input_error : ''
            }`}
            placeholder={t('DBSettings.form.placeholder')}
            type="password"
            {...register('pass', {
              required: t('DBSettings.form.errorMessage'),
            })}
          />
          {errors.pass && <p className={styles.error}>{errors.pass.message}</p>}
        </div>
        <div className={styles.field}>
          <label className={styles.label}>
            {t('UserSection.modalCreate.tgId')}
          </label>
          <input
            className={`${styles.input} ${
              errors.tgId ? styles.input_error : ''
            }`}
            placeholder={t('DBSettings.form.placeholder')}
            type="number"
            {...register('tgId', {
              required: t('DBSettings.form.errorMessage'),
            })}
          />
          {errors.tgId && <p className={styles.error}>{errors.tgId.message}</p>}
        </div>
        <div className={styles.field}>
          <label className={styles.label}>
            {t('UserSection.modalCreate.tgNick')}
          </label>
          <input
            className={`${styles.input} ${
              errors.tgNick ? styles.input_error : ''
            }`}
            placeholder={t('DBSettings.form.placeholder')}
            {...register('tgNick', {
              required: t('DBSettings.form.errorMessage'),
            })}
          />
          {errors.tgNick && (
            <p className={styles.error}>{errors.tgNick.message}</p>
          )}
        </div>
        <div className={styles.field}>
          <label className={styles.label}>
            {t('UserSection.modalCreate.email')}
          </label>
          <input
            className={`${styles.input} ${
              errors.email ? styles.input_error : ''
            }`}
            placeholder={t('DBSettings.form.placeholder')}
            type="email"
            {...register('email', {
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: t('ReplacementSection.invalidEmail'),
              },
            })}
          />
          {errors.email && (
            <p className={styles.error}>{errors.email.message}</p>
          )}
        </div>

        <div className={styles.field}>
          <CustomCheckbox
            checked={isNotificationsEnabled}
            onChange={() => setIsNotificationsEnabled(!isNotificationsEnabled)}
            label={t('UserSection.modalCreate.notifSettings')}
          />
        </div>

        {isNotificationsEnabled && (
          <>
            <p className={ownStyles.text}>
              {t('UserSection.modalCreate.notifSettings')}
            </p>
            <div className={styles.field}>
              <label className={styles.label}>
                {t('UserSection.modalCreate.category')}
              </label>
              <CustomSelect
                options={categoryOptions}
                selected={selectedCategories}
                onSelect={handleCategorySelect}
                multiSelections={true}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>
                {t('UserSection.modalCreate.names')}
              </label>
              <CustomSelect
                options={subcategoryOptions}
                selected={selectedSubcategories}
                onSelect={setSelectedSubcategories}
                multiSelections={true}
              />
            </div>
            <div className={`${styles.field} ${ownStyles.field}`}>
              <WhiteBtn
                onClick={handleAddSubcategories}
                text={'UserSection.modalCreate.namesBtn'}
                icon="icon-add-color"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>
                {t('UserSection.modalCreate.distributionNames')}
              </label>
              <CustomButtonsInput
                buttons={addedSubcategories}
                onRemove={handleRemoveSubcategory}
              />
            </div>
          </>
        )}

        <div className={`${styles.field} ${ownStyles.fieldBottom}`}>
          <WhiteBtn
            onClick={toggleRolesModal}
            text={'UserSection.modalCreate.rolesBtn'}
            icon="icon-settings-btn"
          />
        </div>

        <div className={styles.buttons_wrap}>
          <CancelBtn text="DBSettings.form.cancelBtn" onClick={handleClose} />
          <SubmitBtn
            text={
              loading
                ? 'UserSection.modalCreate.load'
                : 'UserSection.modalCreate.addBtn'
            }
            disabled={loading}
          />
        </div>
      </form>

      <ModalComponent
        isOpen={isRolesModalOpen}
        onClose={toggleRolesModal}
        title="UserSection.modalRoles.title"
      >
        <UserRoles onRolesSubmit={handleRolesSubmit} />
      </ModalComponent>
    </>
  );
}
