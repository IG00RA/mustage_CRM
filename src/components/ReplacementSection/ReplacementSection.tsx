'use client';

import styles from './ReplacementSection.module.css';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import ModalComponent from '../ModalComponent/ModalComponent';
import WhiteBtn from '../Buttons/WhiteBtn/WhiteBtn';
import SearchResultReplace from '../ModalComponent/SearchResultReplace/SearchResultReplace';
import ResultReplace from '../ModalComponent/ResultReplace/ResultReplace';
import { toast } from 'react-toastify';
import { useAccountsStore } from '@/store/accountsStore';
import { Account } from '@/types/salesTypes';

interface SearchResults {
  inputAccounts: string[];
  foundAccounts: Account[];
  notFoundAccounts: (number | string)[];
}

export default function ReplacementSection() {
  const t = useTranslations();
  const [isOpenSearch, setIsOpenSearch] = useState(false);
  const [isOpenReplace, setIsOpenReplace] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResults | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const { searchAccounts } = useAccountsStore();

  const handleSearch = async () => {
    const accountNames = searchInput.split('\n').filter(name => name.trim());
    if (!accountNames.length) {
      toast.error(t('ReplacementSection.emptyInputError'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await searchAccounts(accountNames);
      setSearchResults({
        inputAccounts: accountNames,
        foundAccounts: response.found_accounts,
        notFoundAccounts: Object.values(response.not_found_accounts).flat(),
      });
      setIsOpenSearch(true);
      toast.success(t('ReplacementSection.searchSuccess'));
    } catch (error) {
      toast.error(t('ReplacementSection.searchError'));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSearchModal = () => {
    setIsOpenSearch(!isOpenSearch);
  };

  const toggleReplaceModal = () => {
    setIsOpenReplace(!isOpenReplace);
    if (isOpenReplace) setSearchResults(null);
  };

  return (
    <section className={styles.section}>
      <div className={styles.header_container}>
        <h2 className={styles.header}>{t('Sidebar.accParMenu.replacement')}</h2>
        <p className={styles.header_text}>
          {t('ReplacementSection.headerText')}
        </p>
        <div className={styles.input_wrap}>
          <label className={styles.label}>{t('RemoveSaleSection.field')}</label>
          <textarea
            className={`${styles.input} ${styles.textarea}`}
            placeholder={t('RemoveSaleSection.fieldName')}
            value={searchInput}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setSearchInput(e.target.value)
            }
          />
          <WhiteBtn
            onClick={handleSearch}
            text={
              isLoading
                ? 'ReplacementSection.loading'
                : 'RemoveSaleSection.searchBtn'
            }
            icon="icon-search-btn-fill"
          />
        </div>
      </div>

      <ModalComponent
        isOpen={isOpenSearch}
        onClose={toggleSearchModal}
        title="RemoveSaleSection.modal.title"
        text="RemoveSaleSection.modal.text"
      >
        <SearchResultReplace
          onContinue={toggleReplaceModal}
          onClose={toggleSearchModal}
          searchResults={searchResults}
        />
      </ModalComponent>
      <ModalComponent
        isOpen={isOpenReplace}
        onClose={toggleReplaceModal}
        title="RemoveSaleSection.modal.title"
        text="RemoveSaleSection.modal.text"
      >
        <ResultReplace
          searchResults={searchResults}
          onClose={toggleReplaceModal}
        />
      </ModalComponent>
    </section>
  );
}
