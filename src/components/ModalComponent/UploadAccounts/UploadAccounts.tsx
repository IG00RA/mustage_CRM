import { useTranslations } from 'next-intl';
import styles from '../ModalComponent.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';
import { useForm, useFormContext } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from '@dnd-kit/core';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FC } from 'react';
import { UseFormRegister } from 'react-hook-form';
import Icon from '@/helpers/Icon';
import CustomCheckbox from '@/components/Buttons/CustomCheckbox/CustomCheckbox';
import CustomButtonsInput from '@/components/Buttons/CustomButtonsInput/CustomButtonsInput';

type FormData = {
  nameField: string;
  nameCategoryField: string;
  price: string;
  cost: string;
  nameDescription: string;
  settings: string[];
};

const data: string[] = [
  'ID',
  'Название аккаунта',
  'Название категории',
  'Селлер',
  'Передан',
];

const settingsOptions = [
  'Names.modalCreate.id',
  'Names.modalCreate.data',
  'Names.modalCreate.megaLink',
];

interface SortableItemProps {
  id: string;
  value: string;
  index: number;
  register: UseFormRegister<any>;
}

interface SortableListProps {
  items: string[];
  register: UseFormRegister<any>;
}

export default function UploadAccounts() {
  const t = useTranslations('');

  const [settings, setSettings] = useState(settingsOptions);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const [checkedSettings, setCheckedSettings] = useState<{
    [key: string]: boolean;
  }>({});

  // Функція для зміни стану чекбокса
  const toggleCheckbox = (id: string) => {
    setCheckedSettings(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const onSubmit = (data: FormData) => {
    console.log('Form Data:', data);
    toast.success(t('DBSettings.form.okMessage'));
    reset();
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = settings.indexOf(active.id);
      const newIndex = settings.indexOf(over.id);
      const updatedSettings = [...settings];
      updatedSettings.splice(oldIndex, 1);
      updatedSettings.splice(newIndex, 0, active.id);
      setSettings(updatedSettings);
    }
  };

  const SortableItem: FC<
    SortableItemProps & { checked: boolean; onChange: () => void }
  > = ({ id, value, index, register, checked, onChange }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div
        className={styles.checkbox_field}
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
      >
        <Icon
          name="icon-line-drag"
          className={styles.drag_icon}
          width={16}
          height={16}
        />
        <CustomCheckbox
          checked={checked}
          onChange={onChange}
          label={t(value)}
        />
      </div>
    );
  };

  const SortableList: FC<SortableListProps> = ({ items, register }) => {
    return (
      <SortableContext items={items}>
        <div>
          {items.map((value, index) => (
            <SortableItem
              key={value}
              id={value}
              value={value}
              index={index}
              register={register}
              checked={checkedSettings[value] || false}
              onChange={() => toggleCheckbox(value)}
            />
          ))}
        </div>
      </SortableContext>
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label}>
          {t('Names.modalCreate.nameField')}
        </label>
        <input
          className={`${styles.input} ${
            errors.nameField ? styles.input_error : ''
          }`}
          placeholder={t('DBSettings.form.placeholder')}
          {...register('nameField', {
            required: t('DBSettings.form.errorMessage'),
          })}
        />
        {errors.nameField && (
          <p className={styles.error}>{errors.nameField.message}</p>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          {t('Names.modalCreate.nameCategoryField')}
        </label>
        <input
          className={`${styles.input} ${
            errors.nameCategoryField ? styles.input_error : ''
          }`}
          placeholder={t('DBSettings.form.placeholder')}
          {...register('nameCategoryField', {
            required: t('DBSettings.form.errorMessage'),
          })}
        />
        {errors.nameCategoryField && (
          <p className={styles.error}>{errors.nameCategoryField.message}</p>
        )}
      </div>
      <div className={styles.field}>
        <label className={styles.label}>{t('Names.modalCreate.price')}</label>
        <input
          className={`${styles.input} ${
            errors.price ? styles.input_error : ''
          }`}
          placeholder={t('DBSettings.form.placeholder')}
          {...register('price', {
            required: t('DBSettings.form.errorMessage'),
          })}
        />
        {errors.price && <p className={styles.error}>{errors.price.message}</p>}
      </div>
      <div className={styles.field}>
        <label className={styles.label}>{t('Names.modalCreate.cost')}</label>
        <input
          className={`${styles.input} ${errors.cost ? styles.input_error : ''}`}
          placeholder={t('DBSettings.form.placeholder')}
          {...register('cost', {
            required: t('DBSettings.form.errorMessage'),
          })}
        />
        {errors.cost && <p className={styles.error}>{errors.cost.message}</p>}
      </div>
      <div className={styles.field}>
        <label className={styles.label}>
          {t('Names.modalCreate.nameDescription')}
        </label>
        <input
          className={`${styles.input} ${
            errors.nameDescription ? styles.input_error : ''
          }`}
          placeholder={t('DBSettings.form.placeholder')}
          {...register('nameDescription', {
            required: t('DBSettings.form.errorMessage'),
          })}
        />
        {errors.nameDescription && (
          <p className={styles.error}>{errors.nameDescription.message}</p>
        )}
      </div>
      <div className={styles.field}>
        <label className={styles.label}>
          {t('Names.modalCreate.settings')}
        </label>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableList items={settings} register={register} />
        </DndContext>

        {errors.settings && (
          <p className={styles.error}>{errors.settings.message}</p>
        )}
      </div>
      <div className={styles.field}>
        <label className={styles.label}>{t('Names.modalCreate.format')}</label>
        <CustomButtonsInput
          buttons={[
            'id',
            t('AllAccounts.table.name'),
            t('AllAccounts.table.category'),
            t('AllAccounts.table.seller'),
            t('AllAccounts.table.status'),
          ]}
        />

        {errors.settings && (
          <p className={styles.error}>{errors.settings.message}</p>
        )}
      </div>
      <div className={styles.buttons_wrap}>
        <CancelBtn text="DBSettings.form.cancelBtn" onClick={() => reset()} />
        <SubmitBtn text="Names.modalCreate.createBtn" />
      </div>
    </form>
  );
}
