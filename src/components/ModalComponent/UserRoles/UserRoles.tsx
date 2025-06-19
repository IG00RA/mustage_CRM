'use client';

import styles from '../ModalComponent.module.css';
import ownStyles from './UserRoles.module.css';
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
import { useCategoriesStore } from '@/store/categoriesStore';
import { ENDPOINTS } from '@/constants/api';
import { fetchWithErrorHandling, getAuthHeaders } from '@/utils/apiUtils';

export interface UserFunction {
  function_id: number;
  operations: string[];
  subcategories: number[];
}

interface FunctionType {
  function_id: number;
  name: string;
  available_operations: string[];
}

interface UserRolesProps {
  onRolesSubmit: (functions: UserFunction[]) => void;
  initialFunctions?: UserFunction[];
}

export default function UserRoles({
  onRolesSubmit,
  initialFunctions = [],
}: UserRolesProps) {
  const t = useTranslations('');
  const { categories, subcategories } = useCategoriesStore();

  const [functions, setFunctions] = useState<FunctionType[]>([]);
  const [selectedFunction, setSelectedFunction] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(
    []
  );
  const [addedSubcategories, setAddedSubcategories] = useState<string[]>([]);
  const [checkedOperations, setCheckedOperations] = useState<
    Record<string, boolean>
  >({});
  const [addedFunctions, setAddedFunctions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const hasFetchedFunctions = useRef(false);

  const { handleSubmit, reset } = useForm();

  useEffect(() => {
    const fetchFunctions = async () => {
      if (hasFetchedFunctions.current) return;

      try {
        setLoading(true);
        const data = await fetchWithErrorHandling<FunctionType[]>(
          ENDPOINTS.CRM_FUNCTIONS,
          {
            method: 'GET',
            headers: getAuthHeaders(),
            credentials: 'include',
          },
          state => {
            setLoading(state.loading ?? false);
          }
        );
        setFunctions(data);
        hasFetchedFunctions.current = true;
      } catch {
        toast.error(
          t('UserSection.modalRoles.fetchFunctionsError') ||
            'Failed to fetch functions'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFunctions();
  }, []);

  useEffect(() => {
    if (functions.length > 0 && initialFunctions.length > 0) {
      const formattedFunctions = initialFunctions.map(func => {
        const funcData = functions.find(
          f => f.function_id === func.function_id
        );
        const subcatNames = func.subcategories
          .map(
            id =>
              subcategories.find(sub => sub.account_subcategory_id === id)
                ?.account_subcategory_name
          )
          .filter((name): name is string => !!name);
        return `${funcData?.name || ''} (${func.operations.join(', ')})${
          subcatNames.length ? `, наименования - ${subcatNames.join(', ')}` : ''
        }`;
      });
      setAddedFunctions(formattedFunctions);
    }
  }, [functions, initialFunctions, subcategories]);

  const operationOptions = selectedFunction
    ? functions.find(f => f.name === selectedFunction)?.available_operations ||
      []
    : [];

  const categoryOptions = categories.map(cat => cat.account_category_name);

  const subcategoryOptions = subcategories
    .filter(sub => {
      const selectedCat = categories.find(
        cat => cat.account_category_name === selectedCategory
      );
      return selectedCat
        ? sub.account_category_id === selectedCat.account_category_id &&
            !addedSubcategories.includes(sub.account_subcategory_name)
        : false;
    })
    .map(sub => sub.account_subcategory_name);

  const availableFunctions = functions
    .filter(f => !addedFunctions.some(af => af.startsWith(`${f.name} (`)))
    .map(f => f.name);

  const toggleCheckbox = (id: string) => {
    setCheckedOperations(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddAllSubcategories = () => {
    if (!selectedCategory) {
      toast.error(
        t('UserSection.modalRoles.selectCategoryError') ||
          'Please select a category'
      );
      return;
    }
    const newSubcategories = subcategoryOptions.filter(
      sub => !addedSubcategories.includes(sub)
    );
    setAddedSubcategories(prev => [...prev, ...newSubcategories]);
  };

  const handleAddSelectedSubcategories = () => {
    if (selectedSubcategories.length === 0) {
      toast.error(
        t('UserSection.modalRoles.selectSubcategoriesError') ||
          'Please select subcategories'
      );
      return;
    }
    setAddedSubcategories(prev => [
      ...prev,
      ...selectedSubcategories.filter(sub => !prev.includes(sub)),
    ]);
    setSelectedSubcategories([]);
  };

  const handleAddFunction = () => {
    if (!selectedFunction) {
      toast.error(
        t('UserSection.modalRoles.selectFunctionError') ||
          'Please select a function'
      );
      return;
    }

    const selectedOps = operationOptions.filter(op => checkedOperations[op]);
    if (selectedOps.length === 0) {
      toast.error(
        t('UserSection.modalRoles.selectOperationError') ||
          'Please select at least one operation'
      );
      return;
    }

    const opsString = selectedOps.join(', ');
    const subcatString =
      addedSubcategories.length > 0
        ? `, наименования - ${addedSubcategories.join(', ')}`
        : '';
    const functionString = `${selectedFunction} (${opsString})${subcatString}`;

    setAddedFunctions(prev => [...prev, functionString]);
    setSelectedFunction('');
    setSelectedCategory('');
    setSelectedSubcategories([]);
    setAddedSubcategories([]);
    setCheckedOperations({});
  };

  const handleRemoveFunction = (func: string) => {
    setAddedFunctions(prev => prev.filter(f => f !== func));
  };

  const handleRemoveSubcategory = (sub: string) => {
    setAddedSubcategories(prev => prev.filter(s => s !== sub));
  };

  const onSubmit = () => {
    if (addedFunctions.length < 1) {
      toast.error(
        t('UserSection.modalRoles.selectAllFunctionError') ||
          'Please select a function'
      );
      return;
    }
    const formattedFunctions: UserFunction[] = addedFunctions.map(funcStr => {
      const [funcPart, subcatPart] = funcStr.split(', наименования - ');
      const funcName = funcPart.split(' (')[0];
      const operations = funcPart.split(' (')[1].slice(0, -1).split(', ');
      const functionData = functions.find(f => f.name === funcName);

      const subcatIds = subcatPart
        ? subcatPart
            .split(', ')
            .map(
              subName =>
                subcategories.find(
                  sub => sub.account_subcategory_name === subName
                )?.account_subcategory_id
            )
            .filter((id): id is number => id !== undefined)
        : [];

      return {
        function_id: functionData?.function_id || 0,
        operations,
        subcategories: subcatIds,
      };
    });

    onRolesSubmit(formattedFunctions);
    resetForm();
    toast.success(
      t('UserSection.modalRoles.success') || 'Roles added successfully'
    );
  };

  const resetForm = () => {
    setSelectedFunction('');
    setSelectedCategory('');
    setSelectedSubcategories([]);
    setAddedSubcategories([]);
    setCheckedOperations({});
    setAddedFunctions([]);
    reset();
  };

  const isNamesChecked = checkedOperations['UserSection.modalRoles.namesCheck'];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label}>
          {t('UserSection.modalRoles.function')}
        </label>
        <CustomSelect
          options={[
            t('UserSection.modalRoles.functionAll'),
            ...availableFunctions,
          ]}
          selected={selectedFunction ? [selectedFunction] : []}
          onSelect={values => {
            const selectedValue = values[0] || '';
            setSelectedFunction(
              selectedValue === t('UserSection.modalRoles.functionAll')
                ? ''
                : selectedValue
            );
          }}
          multiSelections={false}
        />
      </div>

      {selectedFunction && (
        <div className={`${styles.field} ${ownStyles.check_wrap}`}>
          {operationOptions.map(op => {
            const operationLabels: Record<string, string> = {
              READ: t('UserSection.modalRoles.viewCheck'),
              CREATE: t('UserSection.modalRoles.createCheck'),
              UPDATE: t('UserSection.modalRoles.editCheck'),
              DELETE: t('UserSection.modalRoles.deleteCheck'),
            };

            return (
              <CustomCheckbox
                key={op}
                checked={checkedOperations[op] || false}
                onChange={() => toggleCheckbox(op)}
                label={operationLabels[op] || op}
              />
            );
          })}
          <CustomCheckbox
            checked={
              checkedOperations['UserSection.modalRoles.namesCheck'] || false
            }
            onChange={() => toggleCheckbox('UserSection.modalRoles.namesCheck')}
            label={t('UserSection.modalRoles.namesCheck')}
          />
        </div>
      )}

      {isNamesChecked && (
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
              selected={selectedCategory ? [selectedCategory] : []}
              onSelect={values => {
                setSelectedCategory(values[0] || '');
                setAddedSubcategories([]);
              }}
              multiSelections={false}
            />
          </div>

          {selectedCategory && (
            <>
              <div className={`${styles.field} ${ownStyles.field_bottom}`}>
                <WhiteBtn
                  onClick={handleAddAllSubcategories}
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
                  selected={selectedSubcategories}
                  onSelect={setSelectedSubcategories}
                  multiSelections={true}
                />
              </div>

              <div className={`${styles.field} ${ownStyles.field_bottom}`}>
                <WhiteBtn
                  onClick={handleAddSelectedSubcategories}
                  text={'UserSection.modalRoles.namesBtn'}
                />
              </div>

              <div className={styles.field}>
                <CustomButtonsInput
                  buttons={addedSubcategories}
                  onRemove={handleRemoveSubcategory}
                />
              </div>
            </>
          )}
        </>
      )}

      <div className={`${styles.field} ${ownStyles.field}`}>
        <WhiteBtn
          onClick={handleAddFunction}
          text={'UserSection.modalRoles.addFunction'}
          icon="icon-add-color"
        />
      </div>

      <div className={styles.field}>
        <CustomButtonsInput
          buttons={addedFunctions}
          onRemove={handleRemoveFunction}
        />
      </div>

      <div className={styles.buttons_wrap}>
        <CancelBtn text="DBSettings.form.cancelBtn" onClick={resetForm} />
        <SubmitBtn text="UserSection.modalRoles.addBtn" disabled={loading} />
      </div>
    </form>
  );
}
