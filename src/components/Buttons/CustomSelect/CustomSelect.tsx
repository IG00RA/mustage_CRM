'use client';

import { useState, useRef, useEffect, Dispatch, SetStateAction } from 'react';
import styles from './CustomSelect.module.css';
import Icon from '@/helpers/Icon';

interface SelectProps {
  options: string[];
  onSelect: Dispatch<SetStateAction<string>>;
  selected: string;
  label: string;
}

export const CustomSelect = ({
  options,
  selected,
  onSelect,
  label,
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
    <div className={styles.selectWrapper}>
      <label className={styles.selectLabel}>{label}</label>

      <div className={styles.selectContainer} ref={selectRef}>
        <div
          className={`${styles.selectBox} ${isOpen ? styles.open : ''}`}
          onClick={() => setIsOpen(prev => !prev)}
        >
          {selected || options[0]}
          <Icon name="icon-angle-down" width={16} height={16} />
        </div>

        <ul
          className={`${styles.selectOptions} ${
            isOpen ? styles.selectOpen : ''
          }`}
        >
          {options.map((option, index) => (
            <li
              key={index}
              className={styles.optionItem}
              onClick={() => {
                onSelect(option);
                setIsOpen(false);
              }}
            >
              {option}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
