import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import styles from './AccHistory.module.css';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import { AccountHistoryResponse } from '@/types/accountsTypes';
import { useAccountsStore } from '@/store/accountsStore';
import Image from 'next/image';
import folder from '@/img/folder-empty.webp';

interface AccHistoryProps {
  accountId: number | undefined;
  onClose: () => void;
}

export default function AccHistory({ accountId, onClose }: AccHistoryProps) {
  const t = useTranslations('');
  const [historyData, setHistoryData] = useState<AccountHistoryResponse | null>(
    null
  );
  const fetchAccountHistory = useAccountsStore(
    state => state.fetchAccountHistory
  );
  const loading = useAccountsStore(state => state.loading);
  const error = useAccountsStore(state => state.error);

  useEffect(() => {
    if (accountId) {
      fetchAccountHistory(accountId).then(data => {
        setHistoryData(data);
      });
    }
  }, [accountId, fetchAccountHistory]);

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return `${date.toLocaleDateString('uk-UA')} ${date.toLocaleTimeString(
      'uk-UA'
    )}`;
  };

  if (loading) {
    return (
      <SkeletonTheme baseColor="#e0e0e0" highlightColor="#f5f5f5">
        <div className={styles.account_info}>
          {[...Array(6)].map((_, index) => (
            <p className={styles.info_text} key={index}>
              <Skeleton width={100} />
              <Skeleton width={200} />
            </p>
          ))}
        </div>
        <div className={styles.history_section}>
          <h3 className={styles.history_title}>
            <Skeleton width={150} />
          </h3>
          <ul>
            {[...Array(2)].map((_, index) => (
              <li className={styles.history_item} key={index}>
                <Skeleton width={120} />
                <Skeleton width={300} />
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.buttons_wrap}>
          <Skeleton width={350} height={40} />
        </div>
      </SkeletonTheme>
    );
  }

  if (error) {
  return (
    <div className={styles.error_wrap}>
      <div className={styles.error_icon}>⚠️</div>
      <p className={styles.error_text}>
        {t('AllAccounts.modalHistory.error', { message: error })}
      </p>
      <div className={styles.buttons_wrap}>
        <CancelBtn
          text="Load.modalConfirm.btnClose"
          onClick={() => {
            onClose();
          }}
        />
      </div>
    </div>
  );
  }

  if (!historyData) {
    return (
      <>
        <div className={styles.no_data_wrap}>
          <Image
            src={folder}
            alt="No data image"
            className={styles.logo}
            width={0}
            height={0}
            sizes="100vw"
          />
          <p className={styles.no_data_text}>
            {t('AllAccounts.modalHistory.noData')}
          </p>
        </div>
        <div className={styles.buttons_wrap}>
          <CancelBtn
            text="Load.modalConfirm.btnClose"
            onClick={() => {
              onClose();
            }}
          />
        </div>
      </>
    );
  }

  const { account, history } = historyData;

  return (
    <>
      <div className={styles.account_info}>
        <p className={styles.info_text}>
          <span>{t('AllAccounts.modalHistory.accId')}:</span>
          <span className={styles.info_text_data}>{account.account_id}</span>
        </p>
        <p className={styles.info_text}>
          <span>{t('AllAccounts.modalHistory.dataLoad')}:</span>
          <span className={styles.info_text_data}>
            {formatDateTime(account.upload_datetime)}
          </span>
        </p>
        {account.sold_datetime && (
          <p className={styles.info_text}>
            <span>{t('AllAccounts.modalHistory.dataSell')}:</span>
            <span className={styles.info_text_data}>
              {formatDateTime(account.sold_datetime)}
            </span>
          </p>
        )}
        <p className={styles.info_text}>
          <span>{t('AllAccounts.modalHistory.worker')}:</span>
          <span className={styles.info_text_data}>{account.worker_name}</span>
        </p>
        {account.teamlead_name && (
          <p className={styles.info_text}>
            <span>{t('AllAccounts.modalHistory.teamlead')}:</span>
            <span className={styles.info_text_data}>
              {account.teamlead_name}
            </span>
          </p>
        )}
        <p className={styles.info_text}>
          <span>{t('AllAccounts.modalHistory.statusSell')}:</span>
          <span className={styles.info_text_data}>
            {account.status === 'SOLD'
              ? t('AllAccounts.modalHistory.sell')
              : t('AllAccounts.modalHistory.noSell')}
          </span>
        </p>
        <p className={styles.info_text}>
          <span>{t('AllAccounts.modalHistory.statusTransfer')}:</span>
          <span className={styles.info_text_data}>
            {account.destination
              ? t('AllAccounts.modalHistory.transfer')
              : t('AllAccounts.modalHistory.noTransfer')}
          </span>
        </p>
      </div>

      <div className={styles.history_section}>
        <h3 className={styles.history_title}>
          {t('AllAccounts.modalHistory.history')}
        </h3>
        {history.length > 0 ? (
          <ul>
            {history.map(event => (
              <li className={styles.history_item} key={event.event_id}>
                <span className={styles.history_time}>
                  {formatDateTime(event.event_datetime)}
                </span>
                <p className={styles.history_text}>{event.event_message}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.info_text}>
            {t('AllAccounts.modalHistory.noHistory')}
          </p>
        )}
      </div>

      <div className={styles.buttons_wrap}>
        <CancelBtn
          text="Load.modalConfirm.btnClose"
          onClick={() => {
            onClose();
          }}
        />
      </div>
    </>
  );
}
