'use client';

import { useTranslations } from 'next-intl';
import styles from '../ModalComponent.module.css';
import ownStyles from './SearchResultReplace.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import { useForm, SubmitHandler } from 'react-hook-form';
import SubmitBtn from '@/components/Buttons/SubmitBtn/SubmitBtn';
import { Account } from '@/types/salesTypes';
import { SearchResults } from '@/components/ReplacementSection/ReplacementSection';

interface SearchResultReplaceProps {
  onContinue: () => void;
  onClose: () => void;
  searchResults: SearchResults | null;
}

export default function SearchResultReplace({
  onContinue,
  onClose,
  searchResults,
}: SearchResultReplaceProps) {
  const t = useTranslations();
  const { handleSubmit, reset } = useForm<FormData>();

  const onSubmit: SubmitHandler<FormData> = () => {
    onContinue();
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const inputAccountsText: string =
    searchResults?.inputAccounts?.join('\n') || '';
  const foundAccountsText: string =
    searchResults?.foundAccounts
      ?.map((acc: Account) => acc.account_name)
      .join('\n') || '';
  const notFoundAccountsText: string =
    searchResults?.notFoundAccounts?.join('\n') || '';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={ownStyles.input_wrap}>
        <p className={ownStyles.text}>
          {t('RemoveSaleSection.modal.wantedAccountsQuantity')}
          <span>{searchResults?.inputAccounts?.length || 0}</span>
        </p>
        <label className={styles.label}>
          {t('RemoveSaleSection.modal.wantedAccounts')}
        </label>
        <textarea
          className={`${ownStyles.input} ${ownStyles.textarea}`}
          value={inputAccountsText}
          readOnly
        />
      </div>
      <div className={ownStyles.input_wrap}>
        <p className={ownStyles.text}>
          {t('RemoveSaleSection.modal.foundAccountsQuantity')}
          <span>{searchResults?.foundAccounts?.length || 0}</span>
        </p>
        <label className={styles.label}>
          {t('RemoveSaleSection.modal.foundAccounts')}
        </label>
        <textarea
          className={`${ownStyles.input} ${ownStyles.textarea}`}
          value={foundAccountsText}
          readOnly
        />
      </div>
      <div className={ownStyles.input_wrap}>
        <p className={ownStyles.text}>
          {t('RemoveSaleSection.modal.notFoundAccountsQuantity')}
          <span>{searchResults?.notFoundAccounts?.length || 0}</span>
        </p>
        <label className={styles.label}>
          {t('RemoveSaleSection.modal.notFoundAccounts')}
        </label>
        <textarea
          className={`${ownStyles.input} ${ownStyles.textarea}`}
          value={notFoundAccountsText}
          readOnly
        />
      </div>
      <div className={styles.buttons_wrap}>
        <CancelBtn
          text="DistributionSettings.modalUpload.btnCancel"
          onClick={handleClose}
        />
        <SubmitBtn text="ReplacementSection.btnContinue" />
      </div>
    </form>
  );
}
