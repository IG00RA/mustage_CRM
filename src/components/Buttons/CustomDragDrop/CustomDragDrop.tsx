'use client';

import styles from './CustomDragDrop.module.css';
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FC, ReactNode, useState, useEffect } from 'react';
import Icon from '@/helpers/Icon';
import { useTranslations } from 'next-intl';

type CustomDragDropProps = {
  settingsOptions: string[];
  onReorder: (newOrder: string[]) => void;
  children: (id: string) => ReactNode;
};

export default function SubmitBtn({
  settingsOptions,
  onReorder,
  children,
}: CustomDragDropProps) {
  const t = useTranslations('');
  const [settings, setSettings] = useState(settingsOptions);

  // Синхронізуємо внутрішній стан із settingsOptions при їх зміні
  useEffect(() => {
    setSettings(settingsOptions);
  }, [settingsOptions]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = ({ active, over }: any) => {
    if (active.id !== over.id) {
      const newSettings = arrayMove(
        settings,
        settings.indexOf(active.id),
        settings.indexOf(over.id)
      );
      setSettings(newSettings);
      onReorder(newSettings); // Оновлюємо батьківський стан
    }
  };

  const SortableItem: FC<{ id: string; children: ReactNode }> = ({
    id,
    children,
  }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id });
    return (
      <div
        ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform), transition }}
        className={styles.checkbox_field}
        {...attributes}
        {...listeners}
      >
        <Icon
          name="icon-line-drag"
          className={styles.drag_icon}
          width={16}
          height={16}
          color="#e1e1ec"
        />
        {children}
      </div>
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={settings}>
        {settings.map(id => (
          <SortableItem key={id} id={id}>
            {children(id)}
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  );
}
