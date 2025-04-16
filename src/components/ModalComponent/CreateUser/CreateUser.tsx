'use client';

import styles from '../ModalComponent.module.css';
import ownStyles from './CreateUser.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';
import { useForm, SubmitHandler } from 'react-hook-form';
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
import { useRolesStore } from '@/store/rolesStore';
import ModalComponent from '../ModalComponent';
import Icon from '@/helpers/Icon';
import CreateRole from '../CreateRole/CreateRole';
import { PaginationState } from '@/types/componentsTypes';

// Define interfaces
interface FormData {
  login: string;
  pass: string;
  confirmPass: string;
  name: string;
  secondName: string;
  tgId: number;
  tgNick: string;
  email?: string;
  roleId?: number;
}

interface CreateUserProps {
  onClose: () => void;
  pagination: PaginationState;
}

export default function CreateUser({ onClose, pagination }: CreateUserProps) {
  const t = useTranslations('');
  const { fetchCategories, fetchSubcategories, categories, subcategories } =
    useCategoriesStore();
  const { createUser, fetchUsers, loading } = useUsersStore();
  const { fetchRoles, roles } = useRolesStore();

  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(
    []
  );
  const [addedSubcategories, setAddedSubcategories] = useState<string[]>([]);
  const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
  const [isCreateRoleModalOpen, setIsCreateRoleModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<number | undefined>(
    undefined
  );
  const hasLoadedRef = useRef(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    mode: 'onChange',
  });

  const password = watch('pass');

  useEffect(() => {
    const loadInitialData = async () => {
      if (!hasLoadedRef.current) {
        try {
          if (categories.length === 0) await fetchCategories();
          if (subcategories.length === 0) await fetchSubcategories();
          await fetchRoles({ limit: 100 });
          hasLoadedRef.current = true;
        } catch {
          toast.error(
            t('UserSection.modalCreate.dataLoadError') ||
              'Failed to load initial data'
          );
        }
      }
    };
    loadInitialData();
  }, [
    categories.length,
    fetchCategories,
    fetchSubcategories,
    subcategories.length,
    fetchRoles,
    t,
  ]);

  const onSubmit: SubmitHandler<FormData> = async data => {
    if (!selectedRoleId) {
      toast.error(
        t('UserSection.modalCreate.roleRequired') || 'Please select a role'
      );
      return;
    }

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
      is_seller: isSeller,
      telegram_id: data.tgId,
      telegram_username: data.tgNick,
      role_id: selectedRoleId,
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
      await fetchUsers({
        limit: pagination.pageSize,
        offset: pagination.pageIndex,
      });
      reset();
      onClose();
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'Such user already exists'
      ) {
        toast.error(t('UserSection.modalCreate.errorMessageUserExist'));
      } else {
        toast.error(t('UserSection.modalCreate.errorMessage'));
      }
    }
  };

  const handleRolesSubmit = () => {
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

  const handleAddAllSubcategories = () => {
    const filteredSubcategories = subcategories
      .filter(sub => {
        if (
          selectedCategories.includes(t('UserSection.modalCreate.categoryAll'))
        ) {
          return true;
        }
        return categories
          .filter(cat => selectedCategories.includes(cat.account_category_name))
          .some(cat => cat.account_category_id === sub.account_category_id);
      })
      .map(sub => sub.account_subcategory_name)
      .filter(sub => !addedSubcategories.includes(sub));

    setAddedSubcategories(prev => [
      ...prev,
      ...filteredSubcategories.filter(sub => !prev.includes(sub)),
    ]);
    toast.success(
      t('UserSection.modalCreate.subcategoriesAdded') ||
        'All subcategories added successfully'
    );
  };

  const handleRemoveSubcategory = (subcategory: string) => {
    setAddedSubcategories(prev => prev.filter(sub => sub !== subcategory));
  };

  const toggleRolesModal = () => setIsRolesModalOpen(!isRolesModalOpen);
  const toggleCreateRoleModal = () =>
    setIsCreateRoleModalOpen(!isCreateRoleModalOpen);

  const handleCreateRoleClose = async () => {
    toggleCreateRoleModal();
    try {
      await fetchRoles({ limit: 100 });
    } catch {
      toast.error(
        t('UserSection.modalCreate.dataLoadError') || 'Failed to refresh roles'
      );
    }
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
      .map(sub => sub.account_subcategory_name)
      .filter(sub => !addedSubcategories.includes(sub)),
  ];

  const roleOptions = roles.map(role => role.name);

  const handleCategorySelect = (values: string[]) => {
    if (values.includes(t('UserSection.modalCreate.categoryAll'))) {
      setSelectedCategories([t('UserSection.modalCreate.categoryAll')]);
    } else {
      setSelectedCategories(values);
    }
    setSelectedSubcategories([]);
  };

  const handleRoleSelect = (values: string[]) => {
    const selectedValue = values[0];
    if (selectedValue === t('UserSection.modalCreate.jobSelect')) {
      setSelectedRoleId(undefined);
    } else if (selectedValue === t('RoleSection.addBtn')) {
      toggleCreateRoleModal(); // Open the CreateRole modal
    } else {
      const selectedRole = roles.find(role => role.name === selectedValue);
      setSelectedRoleId(selectedRole ? selectedRole.role_id : undefined);
    }
  };

  const handleNotificationsToggle = () => {
    const newValue = !isNotificationsEnabled;
    setIsNotificationsEnabled(newValue);
    if (!newValue) {
      setSelectedCategories([]);
      setSelectedSubcategories([]);
      setAddedSubcategories([]);
    }
  };

  const handleSellerToggle = () => {
    setIsSeller(!isSeller);
  };

  const isAddAllSubcategoriesEnabled =
    selectedCategories.length > 0 &&
    !selectedCategories.includes(t('UserSection.modalCreate.categoryAll'));

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
              minLength: {
                value: 5,
                message: `${t('DBSettings.form.minLengthError')} 5 ${t(
                  'DBSettings.form.minLengthErrorSec'
                )}`,
              },
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
          <div className={ownStyles.inputWrapper}>
            <input
              className={`${styles.input} ${
                errors.pass ? styles.input_error : ''
              }`}
              placeholder={t('DBSettings.form.placeholder')}
              type={showPassword ? 'text' : 'password'}
              {...register('pass', {
                required: t('DBSettings.form.errorMessage'),
                minLength: {
                  value: 8,
                  message: `${t('DBSettings.form.minLengthPassError')} 8 ${t(
                    'DBSettings.form.minLengthPassErrorSec'
                  )}`,
                },
                pattern: {
                  value:
                    /^(?=.*[a-zа-яґєіїё])(?=.*[A-ZА-ЯҐЄІЇЁ])(?=.*\d).{8,}$/,
                  message: t('DBSettings.form.passwordPatternError'),
                },
              })}
            />
            <button
              type="button"
              className={ownStyles.togglePassword}
              onClick={() => setShowPassword(!showPassword)}
            >
              {!showPassword ? (
                <Icon name="icon-view-hide" width={19} height={19} />
              ) : (
                <Icon name="icon-view-show" width={19} height={19} />
              )}
            </button>
          </div>
          {errors.pass && <p className={styles.error}>{errors.pass.message}</p>}
        </div>
        <div className={styles.field}>
          <label className={styles.label}>
            {t('UserSection.modalCreate.confirmPass')}
          </label>
          <div className={ownStyles.inputWrapper}>
            <input
              className={`${styles.input} ${
                errors.confirmPass ? styles.input_error : ''
              }`}
              placeholder={t('DBSettings.form.placeholder')}
              type={showConfirmPassword ? 'text' : 'password'}
              {...register('confirmPass', {
                required: t('DBSettings.form.errorMessage'),
                validate: value =>
                  value === password ||
                  t('UserSection.modalCreate.passwordMismatch'),
              })}
            />
            <button
              type="button"
              className={ownStyles.togglePassword}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {!showConfirmPassword ? (
                <Icon name="icon-view-hide" width={19} height={19} />
              ) : (
                <Icon name="icon-view-show" width={19} height={19} />
              )}
            </button>
          </div>
          {errors.confirmPass && (
            <p className={styles.error}>{errors.confirmPass.message}</p>
          )}
        </div>
        <div className={styles.field}>
          <label className={styles.label}>
            {t('UserSection.modalCreate.job')}
          </label>
          <CustomSelect
            options={
              roleOptions.length > 0
                ? [
                    t('UserSection.modalCreate.jobSelect'),
                    ...roleOptions,
                    t('RoleSection.addBtn'),
                  ]
                : [
                    t('UserSection.modalCreate.jobSelect'),
                    t('RoleSection.addBtn'),
                  ]
            }
            selected={
              selectedRoleId
                ? [roles.find(r => r.role_id === selectedRoleId)!.name]
                : []
            }
            onSelect={handleRoleSelect}
            multiSelections={false}
          />
        </div>
        <div className={styles.field}>
          <CustomCheckbox
            checked={isSeller}
            onChange={handleSellerToggle}
            label={t('UserSection.modalCreate.isSeller')}
          />
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
            onChange={handleNotificationsToggle}
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
              <div className={ownStyles.checkboxWrapper}>
                <WhiteBtn
                  onClick={handleAddSubcategories}
                  text={'UserSection.modalCreate.namesBtn'}
                  icon="icon-add-color"
                />
                {isAddAllSubcategoriesEnabled && (
                  <WhiteBtn
                    onClick={handleAddAllSubcategories}
                    text={'UserSection.modalCreate.addAllSubcategoriesBtn'}
                    icon="icon-add-color"
                  />
                )}
              </div>
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

      <ModalComponent
        isOpen={isCreateRoleModalOpen}
        onClose={toggleCreateRoleModal}
        title="RoleSection.modalCreate.title"
      >
        <CreateRole pagination={pagination} onClose={handleCreateRoleClose} />
      </ModalComponent>
    </>
  );
}
