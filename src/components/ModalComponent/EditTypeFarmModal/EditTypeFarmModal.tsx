import { useTranslations } from 'next-intl';
import styles from '../ModalComponent.module.css';
import ownStyles from './EditTypeFarmModal.module.css';
import { useAutofarmStore } from '@/store/autofarmStore';
import { useEffect } from 'react';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';

interface EditTypeFarmModalProps {
  geo: string;
  activityMode: string;
  onClose: () => void;
}

export default function EditTypeFarmModal({
  geo,
  activityMode,
  onClose,
}: EditTypeFarmModalProps) {
  const t = useTranslations();
  const { statsByDay, loading, error, fetchStatisticsByDay } =
    useAutofarmStore();

  useEffect(() => {
    fetchStatisticsByDay({ geo, activity_mode: activityMode });
  }, [geo, activityMode, fetchStatisticsByDay]);

  return (
    <div className={styles.modal_content}>
      <h3 className={styles.modal_title}>
        {t('AutoFarmSection.modalEditType.title')} ({geo}, {activityMode})
      </h3>
      {loading && <p>{t('AutoFarmSection.loading')}</p>}
      {error && <p className={styles.error}>{error}</p>}
      {!loading && !error && (
        <>
          {statsByDay.length > 0 ? (
            <table className={ownStyles.stats_table}>
              <thead>
                <tr>
                  <th>{t('AutoFarmSection.modalEditType.day')}</th>
                  <th>{t('AutoFarmSection.modalEditType.accounts')}</th>
                </tr>
              </thead>
              <tbody>
                {statsByDay.map((item, index) => (
                  <tr key={index}>
                    <td>{item.farm_day}</td>
                    <td>{item.accounts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>{t('AutoFarmSection.modalEditType.noData')}</p>
          )}
        </>
      )}
      <div className={styles.buttons_wrap}>
        <CancelBtn text="DBSettings.form.cancelBtn" onClick={onClose} />
      </div>
    </div>
  );
}
