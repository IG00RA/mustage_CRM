import { useTranslations } from 'next-intl';
import styles from '../ModalComponent.module.css';
import ownStyles from './SearchResult.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import AddBtn from '@/components/Buttons/AddBtn/AddBtn';
import { SearchResponse } from '@/types/salesTypes';
import { useAccountsStore } from '@/store/accountsStore';
import { toast } from 'react-toastify';

interface SearchResultProps {
  searchResult: SearchResponse | null;
  onRemove: () => void;
  onClose: () => void;
}

export default function SearchResult({
  searchResult,
  onRemove,
  onClose,
}: SearchResultProps) {
  const t = useTranslations('');
  const { stopSellingAccounts } = useAccountsStore();

  const wantedAccounts =
    searchResult?.found_accounts.map(acc => acc.account_name).join('\n') || '';
  const foundAccounts =
    searchResult?.found_accounts.map(acc => acc.account_name).join('\n') || '';
  const notFoundAccounts = searchResult?.not_found_accounts
    ? Object.values(searchResult.not_found_accounts)
        .flatMap(arr => arr.filter(item => typeof item === 'string'))
        .join('\n')
    : '';

  const handleRemove = async () => {
    if (!searchResult?.found_accounts.length) return;

    const accountIds = searchResult.found_accounts.map(acc => acc.account_id);
    try {
      const response = await stopSellingAccounts(accountIds);
      if (response.success) {
        toast.success(response.message);
        onRemove();
        onClose();
      }
    } catch (error) {
      toast.error(String(error));
    }
  };

  return (
    searchResult && (
      <div className={styles.form}>
        <div className={ownStyles.input_wrap}>
          <p className={ownStyles.text}>
            {t('RemoveSaleSection.modal.wantedAccountsQuantity')}
            <span>
              {searchResult?.found_accounts.length +
                Object.values(searchResult?.not_found_accounts || {}).flat()
                  .length || 0}
            </span>
          </p>
          <label className={styles.label}>
            {t('RemoveSaleSection.modal.wantedAccounts')}
          </label>
          <textarea
            className={`${ownStyles.input} ${ownStyles.textarea}`}
            placeholder={t('RemoveSaleSection.fieldName')}
            value={wantedAccounts}
            readOnly
          />
        </div>
        <div className={ownStyles.input_wrap}>
          <p className={ownStyles.text}>
            {t('RemoveSaleSection.modal.foundAccountsQuantity')}
            <span>{searchResult?.found_accounts.length || 0}</span>
          </p>
          <label className={styles.label}>
            {t('RemoveSaleSection.modal.foundAccounts')}
          </label>
          <textarea
            className={`${ownStyles.input} ${ownStyles.textarea}`}
            placeholder={t('RemoveSaleSection.fieldName')}
            value={foundAccounts}
            readOnly
          />
        </div>
        <div className={ownStyles.input_wrap}>
          <p className={ownStyles.text}>
            {t('RemoveSaleSection.modal.notFoundAccountsQuantity')}
            <span>
              {searchResult?.not_found_accounts
                ? Object.values(searchResult.not_found_accounts).flat().length
                : 0}
            </span>
          </p>
          <label className={styles.label}>
            {t('RemoveSaleSection.modal.notFoundAccounts')}
          </label>
          <textarea
            className={`${ownStyles.input} ${ownStyles.textarea}`}
            placeholder={t('RemoveSaleSection.fieldName')}
            value={notFoundAccounts}
            readOnly
          />
        </div>
        <div className={styles.buttons_wrap}>
          <CancelBtn
            text="DistributionSettings.modalUpload.btnCancel"
            onClick={onClose}
          />
          <AddBtn
            onClick={handleRemove}
            icon="icon-trash-btn-white"
            iconFill="icon-trash-btn-white"
            text={'RemoveSaleSection.removeBtn'}
          />
        </div>
      </div>
    )
  );
}
