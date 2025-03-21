import { useTranslations } from 'next-intl';
import styles from '../ModalComponent.module.css';
import ownStyles from './SearchResult.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

type FormData = {
  columnName: string;
  displayName: string;
};

export default function SearchResult() {
  const t = useTranslations('');

  const {
    handleSubmit,
    reset,
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log('Form Data:', data);
    toast.success(t('DBSettings.form.okMessage'));
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={ownStyles.input_wrap}>
        <p className={ownStyles.text}>
          {t('RemoveSaleSection.modal.wantedAccountsQuantity')}
          <span>550</span>
        </p>
        <label className={styles.label}>
          {t('RemoveSaleSection.modal.wantedAccounts')}
        </label>
        <textarea
          className={`${ownStyles.input} ${ownStyles.textarea}`}
          placeholder={t('RemoveSaleSection.fieldName')}
        />
      </div>
      <div className={ownStyles.input_wrap}>
        <p className={ownStyles.text}>
          {t('RemoveSaleSection.modal.foundAccountsQuantity')} <span>550</span>
        </p>
        <label className={styles.label}>
          {t('RemoveSaleSection.modal.foundAccounts')}
        </label>
        <textarea
          className={`${ownStyles.input} ${ownStyles.textarea}`}
          placeholder={t('RemoveSaleSection.fieldName')}
        />
      </div>
      <div className={ownStyles.input_wrap}>
        <p className={ownStyles.text}>
          {t('RemoveSaleSection.modal.notFoundAccountsQuantity')}
          <span>50</span>
        </p>
        <label className={styles.label}>
          {t('RemoveSaleSection.modal.notFoundAccounts')}
        </label>
        <textarea
          className={`${ownStyles.input} ${ownStyles.textarea}`}
          placeholder={t('RemoveSaleSection.fieldName')}
        />
      </div>
      <div className={styles.buttons_wrap}>
        <CancelBtn
          text="DistributionSettings.modalUpload.btnCancel"
          onClick={() => reset()}
        />
      </div>
    </form>
  );
}
