'use client';

import styles from '../ModalComponent.module.css';
import ownStyles from './CreateRole.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import WhiteBtn from '@/components/Buttons/WhiteBtn/WhiteBtn';
import CustomCheckbox from '@/components/Buttons/CustomCheckbox/CustomCheckbox';
import CustomSelect from '@/components/Buttons/CustomSelect/CustomSelect';
import CustomButtonsInput from '@/components/Buttons/CustomButtonsInput/CustomButtonsInput';
import { useRolesStore } from '@/store/rolesStore';
import { useCategoriesStore } from '@/store/categoriesStore';
import { PaginationState } from '@/types/componentsTypes';
import { fetchWithErrorHandling, getAuthHeaders } from '@/utils/apiUtils';
import { ENDPOINTS } from '@/constants/api';
import Icon from '@/helpers/Icon';

interface FormData {
  name: string;
  description: string;
}

interface FunctionType {
  function_id: number;
  name: string;
  available_operations: string[];
}

interface CreateRoleProps {
  onClose: () => void;
  pagination: PaginationState;
}

export default function CreateRole({ onClose, pagination }: CreateRoleProps) {
  const t = useTranslations('');
  const { createRole, fetchRoles, loading } = useRolesStore();
  const { categories, subcategories, fetchCategories, fetchSubcategories } =
    useCategoriesStore();

  const [isAccessSectionOpen, setIsAccessSectionOpen] = useState(false);
  const [functions, setFunctions] = useState<FunctionType[]>([]);
  const [roleFunctions, setRoleFunctions] = useState<
    Record<
      number,
      {
        operations: string[];
        subcategories: number[];
        isExpanded: boolean;
        isNamesChecked: boolean;
        selectedCategory: string;
        selectedSubcategories: string[];
      }
    >
  >({});

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    mode: 'onChange',
  });

  // Завантаження функцій та категорій
  useEffect(() => {
    const loadData = async () => {
      try {
        const funcs = await fetchWithErrorHandling<FunctionType[]>(
          ENDPOINTS.CRM_FUNCTIONS,
          { method: 'GET', headers: getAuthHeaders(), credentials: 'include' },
          () => {}
        );
        setFunctions(funcs);

        if (categories.length === 0) await fetchCategories();
        if (subcategories.length === 0) await fetchSubcategories();
      } catch {
        toast.error(
          t('RoleSection.modalCreate.fetchError') || 'Failed to load data'
        );
      }
    };
    loadData();
  }, [
    categories.length,
    subcategories.length,
    fetchCategories,
    fetchSubcategories,
  ]);

  // Очищення roleFunctions при вимкненні перемикача
  useEffect(() => {
    if (!isAccessSectionOpen) {
      setRoleFunctions({});
    }
  }, [isAccessSectionOpen]);

  const onSubmit: SubmitHandler<FormData> = async data => {
    const roleData = {
      name: data.name,
      description: data.description,
      functions: Object.entries(roleFunctions)
        .filter(
          ([, config]) =>
            config.operations.length > 0 || config.subcategories.length > 0
        )
        .map(([functionId, config]) => ({
          function_id: Number(functionId),
          operations: config.operations,
          subcategories: config.subcategories,
        })),
    };

    try {
      await createRole(roleData);
      toast.success(
        t('RoleSection.modalCreate.successMessage') ||
          'Role created successfully'
      );
      await fetchRoles({
        limit: pagination.pageSize,
        offset: pagination.pageIndex,
      });
      reset();
      onClose();
    } catch {
      toast.error(
        t('RoleSection.modalCreate.errorMessage') || 'Failed to create role'
      );
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const toggleAccessSection = () => setIsAccessSectionOpen(prev => !prev);

  const toggleFunctionExpansion = (functionId: number) => {
    setRoleFunctions(prev => ({
      ...prev,
      [functionId]: {
        ...(prev[functionId] || {
          operations: [],
          subcategories: [],
          isExpanded: false,
          isNamesChecked: false,
          selectedCategory: '',
          selectedSubcategories: [],
        }),
        isExpanded: !prev[functionId]?.isExpanded,
      },
    }));
  };

  const handleOperationChange = (functionId: number, operation: string) => {
    setRoleFunctions(prev => {
      const current = prev[functionId] || {
        operations: [],
        subcategories: [],
        isExpanded: false,
        isNamesChecked: false,
        selectedCategory: '',
        selectedSubcategories: [],
      };
      const operations = current.operations.includes(operation)
        ? current.operations.filter(op => op !== operation)
        : [...current.operations, operation];

      // Автоматично додавати READ, якщо вибрано CREATE, UPDATE або DELETE, але лише якщо READ доступний
      const func = functions.find(f => f.function_id === functionId);
      if (
        func?.available_operations.includes('READ') &&
        (operation === 'CREATE' ||
          operation === 'UPDATE' ||
          operation === 'DELETE') &&
        !operations.includes('READ')
      ) {
        operations.push('READ');
      }

      // Якщо операцій більше немає, скидаємо isNamesChecked
      const updatedConfig = {
        ...current,
        operations,
        isNamesChecked: operations.length > 0 ? current.isNamesChecked : false,
      };

      return {
        ...prev,
        [functionId]: updatedConfig,
      };
    });
  };

  const handleNamesCheck = (functionId: number) => {
    setRoleFunctions(prev => ({
      ...prev,
      [functionId]: {
        ...(prev[functionId] || {
          operations: [],
          subcategories: [],
          isExpanded: false,
          isNamesChecked: false,
          selectedCategory: '',
          selectedSubcategories: [],
        }),
        isNamesChecked: !prev[functionId]?.isNamesChecked,
      },
    }));
  };

  const handleCategoryChange = (functionId: number, category: string) => {
    setRoleFunctions(prev => ({
      ...prev,
      [functionId]: {
        ...(prev[functionId] || {
          operations: [],
          subcategories: [],
          isExpanded: false,
          isNamesChecked: false,
          selectedCategory: '',
          selectedSubcategories: [],
        }),
        selectedCategory: category,
        selectedSubcategories: [],
      },
    }));
  };

  const handleSubcategoriesChange = (
    functionId: number,
    subcategories: string[]
  ) => {
    setRoleFunctions(prev => ({
      ...prev,
      [functionId]: {
        ...(prev[functionId] || {
          operations: [],
          subcategories: [],
          isExpanded: false,
          isNamesChecked: false,
          selectedCategory: '',
          selectedSubcategories: [],
        }),
        selectedSubcategories: subcategories,
      },
    }));
  };

  const handleAddSubcategories = (functionId: number) => {
    const config = roleFunctions[functionId];
    if (!config || config.selectedSubcategories.length === 0) {
      toast.error(
        t('RoleSection.modalCreate.noSubcategoriesError') ||
          'Please select subcategories'
      );
      return;
    }

    const subcatIds = subcategories
      .filter(sub =>
        config.selectedSubcategories.includes(sub.account_subcategory_name)
      )
      .map(sub => sub.account_subcategory_id);

    setRoleFunctions(prev => ({
      ...prev,
      [functionId]: {
        ...prev[functionId],
        subcategories: [
          ...(prev[functionId]?.subcategories || []),
          ...subcatIds.filter(
            id => !(prev[functionId]?.subcategories || []).includes(id)
          ),
        ],
        selectedSubcategories: [],
      },
    }));
  };

  const handleRemoveSubcategory = (functionId: number, subId: number) => {
    setRoleFunctions(prev => ({
      ...prev,
      [functionId]: {
        ...(prev[functionId] || {
          operations: [],
          subcategories: [],
          isExpanded: false,
          isNamesChecked: false,
          selectedCategory: '',
          selectedSubcategories: [],
        }),
        subcategories: (prev[functionId]?.subcategories || []).filter(
          id => id !== subId
        ),
      },
    }));
  };

  const handleAddAllSubcategories = (functionId: number) => {
    const config = roleFunctions[functionId];
    if (!config || !config.selectedCategory) {
      toast.error(
        t('RoleSection.modalCreate.noCategoryError') ||
          'Please select a category'
      );
      return;
    }

    const allSubcatIds = subcategories
      .filter(
        sub =>
          categories.find(
            cat => cat.account_category_name === config.selectedCategory
          )?.account_category_id === sub.account_category_id
      )
      .map(sub => sub.account_subcategory_id);

    setRoleFunctions(prev => ({
      ...prev,
      [functionId]: {
        ...prev[functionId],
        subcategories: [
          ...(prev[functionId]?.subcategories || []),
          ...allSubcatIds.filter(
            id => !(prev[functionId]?.subcategories || []).includes(id)
          ),
        ],
      },
    }));
  };

  const categoryOptions = categories.map(cat => cat.account_category_name);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`${styles.form} ${ownStyles.form}`}
    >
      <div className={styles.field}>
        <label className={styles.label}>
          {t('RoleSection.modalCreate.name')}
        </label>
        <input
          className={`${styles.input} ${errors.name ? styles.input_error : ''}`}
          placeholder={t('DBSettings.form.placeholder')}
          {...register('name', { required: t('DBSettings.form.errorMessage') })}
        />
        {errors.name && <p className={styles.error}>{errors.name.message}</p>}
      </div>
      <div className={styles.field}>
        <label className={styles.label}>
          {t('RoleSection.modalCreate.description')}
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

      <div className={ownStyles.accessSection}>
        <p>{t('RoleSection.modalCreate.accSection')}</p>
        <div className={ownStyles.switch}>
          <input
            type="checkbox"
            checked={isAccessSectionOpen}
            onChange={toggleAccessSection}
            id="accessToggle"
          />
          <label
            htmlFor="accessToggle"
            className={ownStyles.switchLabel}
          ></label>
        </div>
      </div>

      {isAccessSectionOpen && (
        <div className={ownStyles.functionsTable}>
          <div className={ownStyles.tableHeader}>
            <div className={ownStyles.headerCheckboxes}>
              <span>{t('RoleSection.modalCreate.readCheck')}</span>
              <span>{t('RoleSection.modalCreate.addCheck')}</span>
              <span>{t('RoleSection.modalCreate.editCheck')}</span>
              <span>{t('RoleSection.modalCreate.delCheck')}</span>
            </div>
          </div>
          {functions.map(func => {
            const config = roleFunctions[func.function_id] || {
              operations: [],
              subcategories: [],
              isExpanded: false,
              isNamesChecked: false,
              selectedCategory: '',
              selectedSubcategories: [],
            };
            const isExpanded = config.isExpanded;

            const subcategoryOptions = subcategories
              .filter(sub =>
                config.selectedCategory
                  ? categories.find(
                      cat =>
                        cat.account_category_name === config.selectedCategory
                    )?.account_category_id === sub.account_category_id
                  : true
              )
              .filter(
                sub =>
                  !config.subcategories.includes(sub.account_subcategory_id)
              )
              .map(sub => sub.account_subcategory_name);

            return (
              <div key={func.function_id} className={ownStyles.functionRow}>
                <div className={ownStyles.functionName}>
                  <span>{func.name}</span>
                  <button
                    type="button"
                    onClick={() => toggleFunctionExpansion(func.function_id)}
                    className={ownStyles.expandButton}
                  >
                    <Icon
                      name={isExpanded ? 'icon-arrow-up' : 'icon-arrow-down'}
                      width={16}
                      height={16}
                    />
                  </button>
                </div>
                <div className={ownStyles.checkboxes}>
                  {['READ', 'CREATE', 'UPDATE', 'DELETE'].map(op => (
                    <CustomCheckbox
                      key={op}
                      checked={config.operations.includes(op)}
                      onChange={() =>
                        handleOperationChange(func.function_id, op)
                      }
                      disabled={!func.available_operations.includes(op)}
                    />
                  ))}
                </div>

                {isExpanded && (
                  <div className={ownStyles.subcategoriesSection}>
                    <CustomCheckbox
                      checked={config.isNamesChecked}
                      onChange={() => handleNamesCheck(func.function_id)}
                      label={t('UserSection.modalRoles.namesCheck')}
                      disabled={config.operations.length === 0}
                    />
                    {config.isNamesChecked && (
                      <>
                        <div className={styles.field}>
                          <label className={styles.label}>
                            {t('UserSection.modalCreate.category')}
                          </label>
                          <CustomSelect
                            options={[
                              t('UserSection.modalRoles.categoryAll'),
                              ...categoryOptions,
                            ]}
                            selected={
                              config.selectedCategory
                                ? [config.selectedCategory]
                                : []
                            }
                            onSelect={values =>
                              handleCategoryChange(
                                func.function_id,
                                values[0] || ''
                              )
                            }
                            multiSelections={false}
                          />
                        </div>
                        {config.selectedCategory && (
                          <>
                            <div
                              className={`${styles.field} ${ownStyles.fieldBottom}`}
                            >
                              <WhiteBtn
                                onClick={() =>
                                  handleAddAllSubcategories(func.function_id)
                                }
                                text={'UserSection.modalRoles.namesAllBtn'}
                              />
                            </div>
                            <div className={styles.field}>
                              <label className={styles.label}>
                                {t('UserSection.modalCreate.names')}
                              </label>
                              <CustomSelect
                                options={[
                                  t('UserSection.modalRoles.subCategoryAll'),
                                  ...subcategoryOptions,
                                ]}
                                selected={config.selectedSubcategories}
                                onSelect={values =>
                                  handleSubcategoriesChange(
                                    func.function_id,
                                    values
                                  )
                                }
                                multiSelections={true}
                              />
                            </div>
                            <div
                              className={`${styles.field} ${ownStyles.fieldBottom}`}
                            >
                              <WhiteBtn
                                onClick={() =>
                                  handleAddSubcategories(func.function_id)
                                }
                                text={'UserSection.modalRoles.namesBtn'}
                              />
                            </div>
                            <div className={styles.field}>
                              <CustomButtonsInput
                                buttons={config.subcategories.map(subId => {
                                  const subName =
                                    subcategories.find(
                                      sub =>
                                        sub.account_subcategory_id === subId
                                    )?.account_subcategory_name || '';
                                  return `${
                                    func.name
                                  } (${config.operations.join(
                                    ', '
                                  )}) - ${subName}`;
                                })}
                                onRemove={(_, index) =>
                                  handleRemoveSubcategory(
                                    func.function_id,
                                    config.subcategories[index]
                                  )
                                }
                              />
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className={styles.buttons_wrap}>
        <CancelBtn text="DBSettings.form.cancelBtn" onClick={handleClose} />
        <SubmitBtn
          text={
            loading
              ? 'RoleSection.modalCreate.load'
              : 'RoleSection.modalCreate.addBtn'
          }
          disabled={loading}
        />
      </div>
    </form>
  );
}
