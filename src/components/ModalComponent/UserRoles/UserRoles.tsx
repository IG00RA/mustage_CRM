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
import { useState, useEffect } from 'react';
import CustomSelect from '@/components/Buttons/CustomSelect/CustomSelect';
import WhiteBtn from '@/components/Buttons/WhiteBtn/WhiteBtn';
import { useCategoriesStore } from '@/store/categoriesStore';
import { ENDPOINTS } from '@/constants/api';
import { fetchWithErrorHandling, getAuthHeaders } from '@/utils/apiUtils';

type FormData = {
  settings: string[];
  operations: string[];
};

type FunctionType = {
  function_id: number;
  name: string;
  available_operations: string[];
};

export default function UserRoles({
  onRolesSubmit,
}: {
  onRolesSubmit: (functions: any[]) => void;
}) {
  const t = useTranslations('');
  const { categories, subcategories } = useCategoriesStore();

  const [functions, setFunctions] = useState<FunctionType[]>([]);
  const [selectedFunction, setSelectedFunction] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(
    []
  );
  const [addedSubcategories, setAddedSubcategories] = useState<string[]>([]);
  const [checkedOperations, setCheckedOperations] = useState<
    Record<string, boolean>
  >({});
  const [addedFunctions, setAddedFunctions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { handleSubmit, reset } = useForm<FormData>();

  const setState = (
    state: Partial<{ loading: boolean; error: string | null }>
  ) => {
    if (state.loading !== undefined) setLoading(state.loading);
    if (state.error !== undefined) setError(state.error);
  };

  useEffect(() => {
    const fetchFunctions = async () => {
      try {
        const data = await fetchWithErrorHandling<FunctionType[]>(
          ENDPOINTS.CRM_FUNCTIONS,
          {
            method: 'GET',
            headers: getAuthHeaders(),
            credentials: 'include',
          },
          setState
        );
        setFunctions(data);
      } catch (error) {
        toast.error(
          t('UserSection.modalRoles.fetchFunctionsError') ||
            'Failed to fetch functions'
        );
      }
    };
    fetchFunctions();
  }, [t]);

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
        ? sub.account_category_id === selectedCat.account_category_id
        : false;
    })
    .map(sub => sub.account_subcategory_name);

  const toggleCheckbox = (id: string) => {
    setCheckedOperations(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAddAllSubcategories = () => {
    if (!selectedCategory) {
      toast.error(
        t('UserSection.modalRoles.selectCategoryError') ||
          'Please select a category first'
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

    const selectedOps = operationOptions
      .filter(op => checkedOperations[op])
      .join(', ');
    const subcatString =
      addedSubcategories.length > 0
        ? `, наименования - ${addedSubcategories.join(', ')}`
        : '';
    const functionString = `${selectedFunction} (${selectedOps})${subcatString}`;

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
    const formattedFunctions = addedFunctions.map(funcStr => {
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
          options={functions.map(f => f.name)}
          selected={selectedFunction ? [selectedFunction] : []}
          onSelect={values => setSelectedFunction(values[0] || '')}
          multiSelections={false}
        />
      </div>

      {selectedFunction && (
        <div className={`${styles.field} ${ownStyles.check_wrap}`}>
          {operationOptions.map(op => (
            <CustomCheckbox
              key={op}
              checked={checkedOperations[op] || false}
              onChange={() => toggleCheckbox(op)}
              label={op}
            />
          ))}
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
              options={categoryOptions}
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
                  options={subcategoryOptions}
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
