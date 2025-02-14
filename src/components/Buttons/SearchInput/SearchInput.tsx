'use client';

import { useTranslations } from 'next-intl';
import Icon from '@/helpers/Icon';
import styles from './SearchInput.module.css';
import { useState, useEffect } from 'react';

interface SearchInputProps {
  onSearch: (query: string) => void;
  text: string;
  options: string[];
}

const SearchInput: React.FC<SearchInputProps> = ({
  onSearch,
  text,
  options,
}) => {
  const t = useTranslations();
  const [query, setQuery] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (query.length === 0) {
      setFilteredOptions([]);
      setShowDropdown(false);
    } else {
      const filtered = options.filter(option =>
        option.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredOptions(filtered);
      setShowDropdown(true);
    }

    onSearch(query);
  }, [query, options, onSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleSelectOption = (option: string) => {
    setQuery(option);
    setShowDropdown(false);
    onSearch(option);
  };

  return (
    <div className={styles.searchContainer}>
      <button
        type="button"
        className={styles.button}
        onClick={() => onSearch(query)}
      >
        <Icon
          className={styles.icon}
          name="icon-search-input"
          width={16}
          height={16}
        />
      </button>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        className={styles.input}
        placeholder={t(text)}
      />
      {showDropdown && filteredOptions.length > 0 && (
        <ul className={styles.dropdown}>
          {filteredOptions.map((option, index) => (
            <li
              key={index}
              className={`${styles.dropdownItem} ${
                query === option ? styles.active : ''
              }`}
              onClick={() => handleSelectOption(option)}
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
      )}
    </div>
  );
};

export default SearchInput;
