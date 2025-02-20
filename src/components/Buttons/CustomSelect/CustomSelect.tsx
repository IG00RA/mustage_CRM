'use client';

import { useState, useRef, useEffect, Dispatch, SetStateAction } from 'react';
import styles from './CustomSelect.module.css';
import Icon from '@/helpers/Icon';

interface SelectProps {
  options: string[];
  onSelect: Dispatch<SetStateAction<string>>;
  selected: string;
  label: string;
  width?: string | number;
}

export const CustomSelect = ({
  options,
  selected,
  onSelect,
  label,
  width,
}: SelectProps) => {
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

  return (
    <div className={styles.select_wrapper} style={{ width }}>
      <label className={styles.select_label}>{label}</label>

      <div className={styles.select_container} ref={selectRef}>
        <div
          className={`${styles.select_box} ${isOpen ? styles.open : ''}`}
          onClick={() => setIsOpen(prev => !prev)}
        >
          {selected || options[0]}
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
              className={styles.option_item}
              onClick={() => {
                onSelect(option);
                setIsOpen(false);
              }}
            >
              <p className={styles.list_text}>{option}</p>
              <Icon
                className={styles.list_icon}
                name="icon-list-check"
                width={12}
                height={12}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
