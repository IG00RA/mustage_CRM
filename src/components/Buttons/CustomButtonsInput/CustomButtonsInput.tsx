'use client';

import styles from './CustomButtonsInput.module.css';
import Icon from '@/helpers/Icon';

interface CustomButtonsInputProps {
  buttons: string[];
  onRemove: (label: string, index: number) => void; // Оновлена сигнатура
}

export default function CustomButtonsInput({
  buttons,
  onRemove,
}: CustomButtonsInputProps) {
  return (
    <div className={styles.container}>
      {buttons?.map((btn, index) => (
        <div key={btn} className={styles.button}>
          {btn}
          <button
            type="button"
            className={styles.close}
            onClick={() => onRemove(btn, index)} // Передаємо label і index
          >
            <Icon
              name="icon-close-small"
              className={styles.check_icon}
              width={16}
              height={16}
            />
          </button>
        </div>
      ))}
    </div>
  );
}
