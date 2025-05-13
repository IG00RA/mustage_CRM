'use client';

import styles from '../ModalComponent.module.css';
import ownStyles from './ViewSettings.module.css';
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
  defaultColumns: string[];
  onSave: (newSelectedColumns: string[]) => void;
}

export default function ViewSettings({
  selectedColumns,
  defaultColumns,
  onClose,
  onSave,
}: ViewSettingsProps) {
  const t = useTranslations();

  const [checkedSettings, setCheckedSettings] = useState<
    Record<string, boolean>
  >(
    defaultColumns.reduce(
      (acc, id) => ({ ...acc, [id]: selectedColumns.includes(id) }),
      {}
    )
  );

  const [order, setOrder] = useState<string[]>(defaultColumns);

  useEffect(() => {
    setCheckedSettings(
      defaultColumns.reduce(
        (acc, id) => ({ ...acc, [id]: selectedColumns.includes(id) }),
        {}
      )
    );

    const selectedInOrder = selectedColumns.filter(id =>
      defaultColumns.includes(id)
    );
    const unselected = defaultColumns.filter(
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
    const id = defaultColumns.find(id => t(id) === label);
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
      <div className={ownStyles.buttons_wrap}>
        <CancelBtn text="DBSettings.form.cancelBtn" onClick={onClose} />
        <SubmitBtn text="AllAccounts.modalUpdate.createBtn" />
      </div>
    </form>
  );
}
