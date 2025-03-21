'use client';

import styles from '../ModalComponent.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';
import { useTranslations } from 'next-intl';
import { useState, useEffect, useMemo } from 'react';
import CustomCheckbox from '@/components/Buttons/CustomCheckbox/CustomCheckbox';
import CustomButtonsInput from '@/components/Buttons/CustomButtonsInput/CustomButtonsInput';
import CustomDragDrop from '@/components/Buttons/CustomDragDrop/CustomDragDrop';

interface ViewSettingsProps {
  onClose: () => void;
  selectedColumns: string[];
  onSave: (newSelectedColumns: string[]) => void;
}

const settingsOptions = [
  'AllAccounts.modalUpdate.selects.id',
  'AllAccounts.modalUpdate.selects.name',
  'AllAccounts.modalUpdate.selects.category',
  'AllAccounts.modalUpdate.selects.seller',
  'AllAccounts.modalUpdate.selects.transfer',
  'AllAccounts.modalUpdate.selects.data',
  'AllAccounts.modalUpdate.selects.mega',
];

export default function ViewSettings({
  selectedColumns,
  onClose,
  onSave,
}: ViewSettingsProps) {
  const t = useTranslations();

  // Стан для вибору чекбоксів
  const [checkedSettings, setCheckedSettings] = useState<
    Record<string, boolean>
  >(
    settingsOptions.reduce(
      (acc, id) => ({ ...acc, [id]: selectedColumns.includes(id) }),
      {}
    )
  );

  // Стан для порядку елементів
  const [order, setOrder] = useState<string[]>(settingsOptions);

  useEffect(() => {
    // Синхронізація чекбоксів і порядку із selectedColumns при зміні пропса
    setCheckedSettings(
      settingsOptions.reduce(
        (acc, id) => ({ ...acc, [id]: selectedColumns.includes(id) }),
        {}
      )
    );

    // Оновлюємо порядок: спочатку вибрані колонки в їх збереженому порядку, потім решта
    const selectedInOrder = selectedColumns.filter(id =>
      settingsOptions.includes(id)
    );
    const unselected = settingsOptions.filter(
      id => !selectedColumns.includes(id)
    );
    setOrder([...selectedInOrder, ...unselected]);
  }, [selectedColumns]);

  const toggleCheckbox = (id: string) => {
    setCheckedSettings(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleReorder = (newOrder: string[]) => {
    setOrder(newOrder);
  };

  const handleRemoveButton = (label: string) => {
    const id = settingsOptions.find(id => t(id) === label);
    if (id) {
      setCheckedSettings(prev => ({
        ...prev,
        [id]: false,
      }));
    }
  };

  const handleSave = () => {
    const newSelectedColumns = order.filter(id => checkedSettings[id]);
    onSave(newSelectedColumns);
  };

  // Мемоїзоване обчислення activeButtons для моментального оновлення
  const activeButtons = useMemo(() => {
    return order.filter(id => checkedSettings[id]).map(id => t(id));
  }, [order, checkedSettings, t]);

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        handleSave();
      }}
      className={styles.form}
    >
      <div className={styles.field}>
        <CustomDragDrop settingsOptions={order} onReorder={handleReorder}>
          {(id: string) => (
            <CustomCheckbox
              checked={checkedSettings[id] || false}
              onChange={() => toggleCheckbox(id)}
              label={t(id)}
            />
          )}
        </CustomDragDrop>
      </div>
      <div className={styles.field}>
        <label className={styles.label}>{t('Names.modalCreate.format')}</label>
        <CustomButtonsInput
          buttons={activeButtons}
          onRemove={handleRemoveButton}
        />
      </div>
      <div className={styles.buttons_wrap}>
        <CancelBtn text="DBSettings.form.cancelBtn" onClick={onClose} />
        <SubmitBtn text="AllAccounts.modalUpdate.createBtn" />
      </div>
    </form>
  );
}
