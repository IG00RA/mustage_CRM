'use client';

import styles from '../ModalComponent.module.css';
import ownStyles from './EditRole.module.css';
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
import { useRolesStore, Role } from '@/store/rolesStore';
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

interface EditRoleProps {
  onClose: () => void;
  role: Role;
  pagination: PaginationState;
}

interface GlobalSubcategoriesConfig {
  subcategories: number[];
  selectedCategory: string;
  selectedSubcategories: string[];
}

export default function EditRole({ onClose, role, pagination }: EditRoleProps) {
  const t = useTranslations('');
  const { editRole, fetchRoles, loading } = useRolesStore();
  const { categories, subcategories, fetchCategories, fetchSubcategories } =
    useCategoriesStore();

  const [isAccessSectionOpen, setIsAccessSectionOpen] = useState(
    role.functions.some(
      f =>
        f.operations.length > 0 ||
        (f.subcategories && f.subcategories.length > 0)
    )
  );

  // Ініціалізація глобальних підкатегорій із ролі
  const initialGlobalSubcategories =
    role.functions.length > 0
      ? role.functions.reduce((common, func) => {
          if (!common) return func.subcategories || [];
          return common.filter(id => (func.subcategories || []).includes(id));
        }, role.functions[0].subcategories || [])
      : [];

  const [isGlobalSubcategoriesOpen, setIsGlobalSubcategoriesOpen] = useState(
    initialGlobalSubcategories.length > 0 // Увімкнено, якщо є глобальні підкатегорії
  );
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
  >(
    role.functions.reduce(
      (acc, f) => ({
        ...acc,
        [f.function_id]: {
          operations: f.operations,
          subcategories: f.subcategories || [],
          isExpanded: false,
          isNamesChecked: f.subcategories && f.subcategories.length > 0,
          selectedCategory: '',
          selectedSubcategories: [],
        },
      }),
      {}
    )
  );
  const [globalSubcategoriesConfig, setGlobalSubcategoriesConfig] =
    useState<GlobalSubcategoriesConfig>({
      subcategories: initialGlobalSubcategories,
      selectedCategory: '',
      selectedSubcategories: [],
    });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: role.name,
      description: role.description || '',
    },
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

  // Очищення при зміні стану тоглерів
  useEffect(() => {
    if (!isAccessSectionOpen) {
      setRoleFunctions({}); // Скидаємо функції
      setGlobalSubcategoriesConfig({
        subcategories: [],
        selectedCategory: '',
        selectedSubcategories: [],
      });
      setIsGlobalSubcategoriesOpen(false); // Вимикаємо тоглер глобальних налаштувань
    }
  }, [isAccessSectionOpen]);

  // Очищення глобальних підкатегорій при вимкненні тоглера
  useEffect(() => {
    if (!isGlobalSubcategoriesOpen) {
      setGlobalSubcategoriesConfig(prev => ({
        ...prev,
        subcategories: [], // Скидаємо глобальні підкатегорії
        selectedSubcategories: [],
      }));
    }
  }, [isGlobalSubcategoriesOpen]);

  const onSubmit: SubmitHandler<FormData> = async data => {
    const updatedRoleFunctions = Object.fromEntries(
      Object.entries(roleFunctions).map(([functionId, config]) => {
        if (
          config.operations.length > 0 &&
          globalSubcategoriesConfig.subcategories.length > 0
        ) {
          return [
            functionId,
            {
              ...config,
              subcategories: [
                ...config.subcategories,
                ...globalSubcategoriesConfig.subcategories.filter(
                  id => !config.subcategories.includes(id)
                ),
              ],
            },
          ];
        }
        return [functionId, config];
      })
    );

    const roleData = {
      role_id: role.role_id,
      name: data.name,
      description: data.description,
      functions: Object.entries(updatedRoleFunctions)
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

    if (roleData.functions.length === 0) {
      toast.error(
        t('RoleSection.modalEdit.noFunctionsError') ||
          'Please select at least one function'
      );
      return;
    }

    try {
      await editRole(roleData);
      toast.success(
        t('RoleSection.modalEdit.successMessage') || 'Role updated successfully'
      );
      await fetchRoles({
        limit: pagination.pageSize,
        offset: pagination.pageIndex,
      });
      onClose();
    } catch {
      toast.error(
        t('RoleSection.modalEdit.errorMessage') || 'Failed to update role'
      );
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const toggleAccessSection = () => setIsAccessSectionOpen(prev => !prev);

  const toggleGlobalSubcategoriesSection = () =>
    setIsGlobalSubcategoriesOpen(prev => !prev);

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

      if (
        functions
          .find(f => f.function_id === functionId)
          ?.available_operations.includes('READ') &&
        (operation === 'CREATE' ||
          operation === 'UPDATE' ||
          operation === 'DELETE') &&
        !operations.includes('READ')
      ) {
        operations.push('READ');
      }

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
    setRoleFunctions(prev => {
      const current = prev[functionId] || {
        operations: [],
        subcategories: [],
        isExpanded: false,
        isNamesChecked: false,
        selectedCategory: '',
        selectedSubcategories: [],
      };
      const newNamesChecked = !current.isNamesChecked;

      return {
        ...prev,
        [functionId]: {
          ...current,
          isNamesChecked: newNamesChecked,
          subcategories:
            newNamesChecked &&
            globalSubcategoriesConfig.subcategories.length > 0
              ? [
                  ...current.subcategories,
                  ...globalSubcategoriesConfig.subcategories.filter(
                    id => !current.subcategories.includes(id)
                  ),
                ]
              : current.subcategories,
        },
      };
    });
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
      .filter(
        sub =>
          !globalSubcategoriesConfig.subcategories.includes(
            sub.account_subcategory_id
          )
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

  const handleGlobalCategoryChange = (category: string) => {
    setGlobalSubcategoriesConfig(prev => ({
      ...prev,
      selectedCategory: category,
      selectedSubcategories: [],
    }));
  };

  const handleGlobalSubcategoriesChange = (subcategories: string[]) => {
    setGlobalSubcategoriesConfig(prev => ({
      ...prev,
      selectedSubcategories: subcategories,
    }));
  };

  const handleAddGlobalSubcategories = () => {
    if (globalSubcategoriesConfig.selectedSubcategories.length === 0) {
      toast.error(
        t('RoleSection.modalCreate.noSubcategoriesError') ||
          'Please select subcategories'
      );
      return;
    }

    const subcatIds = subcategories
      .filter(sub =>
        globalSubcategoriesConfig.selectedSubcategories.includes(
          sub.account_subcategory_name
        )
      )
      .map(sub => sub.account_subcategory_id);

    setGlobalSubcategoriesConfig(prev => ({
      ...prev,
      subcategories: [
        ...prev.subcategories,
        ...subcatIds.filter(id => !prev.subcategories.includes(id)),
      ],
      selectedSubcategories: [],
    }));
  };

  const handleRemoveGlobalSubcategory = (subId: number) => {
    setGlobalSubcategoriesConfig(prev => ({
      ...prev,
      subcategories: prev.subcategories.filter(id => id !== subId),
    }));
  };

  const handleAddAllGlobalSubcategories = () => {
    if (!globalSubcategoriesConfig.selectedCategory) {
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
            cat =>
              cat.account_category_name ===
              globalSubcategoriesConfig.selectedCategory
          )?.account_category_id === sub.account_category_id
      )
      .map(sub => sub.account_subcategory_id);

    setGlobalSubcategoriesConfig(prev => ({
      ...prev,
      subcategories: [
        ...prev.subcategories,
        ...allSubcatIds.filter(id => !prev.subcategories.includes(id)),
      ],
    }));
  };

  const categoryOptions = categories.map(cat => cat.account_category_name);

  const globalSubcategoryOptions = subcategories
    .filter(sub =>
      globalSubcategoriesConfig.selectedCategory
        ? categories.find(
            cat =>
              cat.account_category_name ===
              globalSubcategoriesConfig.selectedCategory
          )?.account_category_id === sub.account_category_id
        : true
    )
    .filter(
      sub =>
        !globalSubcategoriesConfig.subcategories.includes(
          sub.account_subcategory_id
        )
    )
    .map(sub => sub.account_subcategory_name);

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
          {...register('description', {
            required: t('DBSettings.form.errorMessage'),
          })}
        />
        {errors.description && (
          <p className={styles.error}>{errors.description.message}</p>
        )}
      </div>
      <p className={ownStyles.settings_text}>
        {t('RoleSection.modalCreate.settings')}
      </p>
      <div className={ownStyles.accessSection}>
        <div className={ownStyles.toggler_wrap}>
          <p className={ownStyles.toggler_text}>
            {t('RoleSection.modalCreate.accSection')}
          </p>
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
          <>
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
                            cat.account_category_name ===
                            config.selectedCategory
                        )?.account_category_id === sub.account_category_id
                      : true
                  )
                  .filter(
                    sub =>
                      !config.subcategories.includes(sub.account_subcategory_id)
                  )
                  .filter(
                    sub =>
                      !globalSubcategoriesConfig.subcategories.includes(
                        sub.account_subcategory_id
                      )
                  )
                  .map(sub => sub.account_subcategory_name);

                return (
                  <div key={func.function_id} className={ownStyles.functionRow}>
                    <div
                      className={`${ownStyles.functionName_wrap} ${
                        isExpanded ? ownStyles.name_open : ''
                      }`}
                    >
                      <div
                        className={ownStyles.functionName}
                        onClick={() =>
                          toggleFunctionExpansion(func.function_id)
                        }
                      >
                        <span className={ownStyles.functionName_text}>
                          {func.name}
                        </span>
                        <button
                          type="button"
                          className={`${ownStyles.expandButton} ${
                            isExpanded ? ownStyles.expandButton_open : ''
                          }`}
                        >
                          <Icon
                            className={`${ownStyles.icon_angle} ${
                              isExpanded ? ownStyles.icon_angle_open : ''
                            }`}
                            name="icon-angle-down"
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
                                      handleAddAllSubcategories(
                                        func.function_id
                                      )
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
                                      t(
                                        'UserSection.modalRoles.subCategoryAll'
                                      ),
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
                                    onRemove={label => {
                                      const subId = config.subcategories.find(
                                        id => {
                                          const subName =
                                            subcategories.find(
                                              sub =>
                                                sub.account_subcategory_id ===
                                                id
                                            )?.account_subcategory_name || '';
                                          return (
                                            `${
                                              func.name
                                            } (${config.operations.join(
                                              ', '
                                            )}) - ${subName}` === label
                                          );
                                        }
                                      );
                                      if (subId !== undefined) {
                                        handleRemoveSubcategory(
                                          func.function_id,
                                          subId
                                        );
                                      }
                                    }}
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

            <div className={ownStyles.accessSection}>
              <div className={ownStyles.toggler_wrap}>
                <p className={ownStyles.toggler_text}>
                  {t('RoleSection.modalCreate.globalSubcategories')}
                </p>
                <div className={ownStyles.switch}>
                  <input
                    type="checkbox"
                    checked={isGlobalSubcategoriesOpen}
                    onChange={toggleGlobalSubcategoriesSection}
                    id="globalSubcategoriesToggle"
                  />
                  <label
                    htmlFor="globalSubcategoriesToggle"
                    className={ownStyles.switchLabel}
                  ></label>
                </div>
              </div>
              {isGlobalSubcategoriesOpen && (
                <div className={ownStyles.subcategoriesSection}>
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
                        globalSubcategoriesConfig.selectedCategory
                          ? [globalSubcategoriesConfig.selectedCategory]
                          : []
                      }
                      onSelect={values =>
                        handleGlobalCategoryChange(values[0] || '')
                      }
                      multiSelections={false}
                    />
                  </div>
                  <div className={`${styles.field} ${ownStyles.fieldBottom}`}>
                    <WhiteBtn
                      onClick={handleAddAllGlobalSubcategories}
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
                        ...globalSubcategoryOptions,
                      ]}
                      selected={globalSubcategoriesConfig.selectedSubcategories}
                      onSelect={handleGlobalSubcategoriesChange}
                      multiSelections={true}
                    />
                  </div>
                  <div className={`${styles.field} ${ownStyles.fieldBottom}`}>
                    <WhiteBtn
                      onClick={handleAddGlobalSubcategories}
                      text={'UserSection.modalRoles.namesBtn'}
                    />
                  </div>
                  <div className={styles.field}>
                    <CustomButtonsInput
                      buttons={globalSubcategoriesConfig.subcategories.map(
                        subId => {
                          const subName =
                            subcategories.find(
                              sub => sub.account_subcategory_id === subId
                            )?.account_subcategory_name || '';
                          return `(READ) - ${subName}`;
                        }
                      )}
                      onRemove={label => {
                        const subId =
                          globalSubcategoriesConfig.subcategories.find(id => {
                            const subName =
                              subcategories.find(
                                sub => sub.account_subcategory_id === id
                              )?.account_subcategory_name || '';
                            return `(READ) - ${subName}` === label;
                          });
                        if (subId !== undefined) {
                          handleRemoveGlobalSubcategory(subId);
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className={styles.buttons_wrap}>
        <CancelBtn text="DBSettings.form.cancelBtn" onClick={handleClose} />
        <SubmitBtn
          text={
            loading
              ? 'RoleSection.modalEdit.load'
              : 'RoleSection.modalEdit.updateBtn'
          }
          disabled={loading}
        />
      </div>
    </form>
  );
}
