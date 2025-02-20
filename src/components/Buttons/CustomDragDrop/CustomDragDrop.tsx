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
import { FC, ReactNode, useState } from 'react';
import Icon from '@/helpers/Icon';
import { useTranslations } from 'next-intl';

const settingsOptions = [
  'Names.modalCreate.id',
  'Names.modalCreate.data',
  'Names.modalCreate.megaLink',
];

export const CustomDragDrop: FC<{ children: (id: string) => ReactNode }> = ({
  children,
}) => {
  const t = useTranslations('');
  const [settings, setSettings] = useState(settingsOptions);
  const [checkedSettings, setCheckedSettings] = useState<
    Record<string, boolean>
  >({});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = ({ active, over }: any) => {
    if (active.id !== over.id) {
      setSettings(prev =>
        arrayMove(prev, prev.indexOf(active.id), prev.indexOf(over.id))
      );
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
};
