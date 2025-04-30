'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './CustomSelect.module.css';
import Icon from '@/helpers/Icon';

interface SelectProps {
  options: string[];
  onSelect: (values: string[]) => void;
  selected: string[];
  label?: string;
  width?: string | number;
  selectWidth?: string | number;
  minSelectWidth?: string | number;
  multiSelections?: boolean;
}

export default function CustomSelect({
  options,
  selected,
  onSelect,
  label,
  width,
  selectWidth,
  minSelectWidth,
  multiSelections = true,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOptionClick = (option: string, index: number) => {
    if (multiSelections) {
      if (index === 0) {
        onSelect([]);
        setIsOpen(false);
      } else {
        const newSelected = selected.includes(option)
          ? selected.filter(item => item !== option)
          : [...selected, option];
        onSelect(newSelected);
      }
    } else {
      const newSelected = selected.includes(option) ? [] : [option];
      onSelect(newSelected);
      setIsOpen(false);
    }
  };

  return (
    <div className={styles.select_wrapper} style={{ width }}>
      {label && <label className={styles.select_label}>{label}</label>}

      <div
        className={styles.select_container}
        style={{ maxWidth: selectWidth, minWidth: minSelectWidth }}
        ref={selectRef}
      >
        <div
          className={`${styles.select_box} ${isOpen ? styles.open : ''} ${
            selected.length === 0 ||
            selected.includes('Выберите селлера') ||
            selected.includes('Выберите функцию')
              ? ''
              : styles.text_selected
          }`}
          onClick={() => setIsOpen(prev => !prev)}
        >
          {selected.length > 0
            ? selected.join(', ').length > 20
              ? selected.join(', ').slice(0, 20) + '...'
              : selected.join(', ')
            : options[0]}
          <Icon name="icon-angle-down" width={16} height={16} color="#A9A9C1" />
        </div>

        <ul
          className={`${styles.select_options} ${
            isOpen ? styles.select_open : ''
          }`}
        >
          {options.map((option, index) => (
            <li
              key={index}
              className={`${styles.option_item} 
  ${selected.includes(option) ? styles.selected : ''} 
  ${option === 'Добавить должность' ? styles.add_position : ''}
`}
              onClick={() => handleOptionClick(option, index)}
            >
              <p className={styles.list_text}>{option}</p>
              {selected.includes(option) && (
                <Icon
                  className={styles.list_icon}
                  name="icon-list-check"
                  width={12}
                  height={12}
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
