'use client';

import { useTranslations } from 'next-intl';
import styles from '../ModalComponent.module.css';
import ownStyles from './EditTypeFarmModal.module.css';
import { useAutofarmStore } from '@/store/autofarmStore';
import { useEffect, useState } from 'react';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import WhiteBtn from '@/components/Buttons/WhiteBtn/WhiteBtn';
import ExcelJS from 'exceljs';
import { toast } from 'react-toastify';
import { AutofarmStatsByDay } from '@/types/autofarmTypes';

interface EditTypeFarmModalProps {
  geo: string;
  activityMode: string;
  onClose: () => void;
}

const GEO_OPTIONS = ['Україна', 'Польша', 'США'];
const ACTIVITY_MODES = ['7 дней', '14 дней', '20 дней', '30 дней'];

export default function EditTypeFarmModal({
  geo,
  activityMode,
  onClose,
}: EditTypeFarmModalProps) {
  const t = useTranslations();
  const {
    stats,
    statsByDay,
    loading,
    error,
    fetchStatisticsByDay,
    fetchStatisticsByDayDirect,
  } = useAutofarmStore();
  const [isExportFilteredLoading, setIsExportFilteredLoading] =
    useState<boolean>(false);
  const [statsByDayLocal, setStatsByDayLocal] = useState<AutofarmStatsByDay[]>(
    []
  );

  useEffect(() => {
    fetchStatisticsByDay({ geo, activity_mode: activityMode }).then(() => {
      setStatsByDayLocal([...statsByDay]); // Зберігаємо локальну копію
    });
  }, [geo, activityMode, fetchStatisticsByDay, statsByDay]);

  const handleExportFiltered = async () => {
    setIsExportFilteredLoading(true);
    toast.info(t('AutoFarmSection.modalEditType.generatingReport'));

    try {
      // Створюємо масив промісів для всіх комбінацій
      const promises = [];
      for (const geo of GEO_OPTIONS) {
        for (const mode of ACTIVITY_MODES) {
          promises.push(
            fetchStatisticsByDayDirect({ geo, activity_mode: mode })
              .then(data => ({
                key: `${geo}-${mode}`,
                data,
              }))
              .catch(err => {
                console.error(`Error fetching ${geo}-${mode}:`, err);
                return { key: `${geo}-${mode}`, data: [] }; // Повертаємо порожній масив у разі помилки
              })
          );
        }
      }

      // Виконуємо всі запити паралельно
      const results = await Promise.all(promises);

      // Збираємо дані в об’єкт
      const allStatsByDay: { [key: string]: AutofarmStatsByDay[] } = {};
      results.forEach(({ key, data }) => {
        allStatsByDay[key] = data;
      });

      console.log('Collected statsByDay:', allStatsByDay);

      // Створюємо новий зошит
      const workbook = new ExcelJS.Workbook();

      // Проходимо по всіх комбінаціях geo і activityMode
      for (const geo of GEO_OPTIONS) {
        for (const mode of ACTIVITY_MODES) {
          // Знаходимо відповідні дані з stats (/autofarm/statistics-by-mode)
          const stat = stats.find(s => s.geo === geo && s.mode === mode);

          // Отримуємо дані для поточної комбінації
          const key = `${geo}-${mode}`;
          const dayStats = allStatsByDay[key] || [];

          console.log(`Processing sheet ${key}:`, dayStats); // Діагностика

          // Створюємо лист
          const sheetName = `${geo} - ${mode}`;
          const worksheet = workbook.addWorksheet(sheetName);

          // Додаємо заголовкову частину з stats
          if (stat) {
            worksheet.addRow([t('AutoFarmSection.geoTable'), stat.geo]);
            worksheet.addRow([t('AutoFarmSection.type'), stat.mode]);
            worksheet.addRow([
              t('AutoFarmSection.tableAcc.servers'),
              stat.total_servers,
            ]);
            worksheet.addRow([
              t('AutoFarmSection.tableAcc.workAcc'),
              stat.in_process,
            ]);
            worksheet.addRow([
              t('AutoFarmSection.tableAcc.doneAcc'),
              stat.ready,
            ]);
            worksheet.addRow([
              t('AutoFarmSection.tableAcc.noFP'),
              stat.ready_0_fp,
            ]);
            worksheet.addRow([
              t('AutoFarmSection.tableAcc.with2FP'),
              stat.ready_2_fp,
            ]);
            worksheet.addRow([]); // Порожній рядок для розділення
          }

          // Додаємо заголовки таблиці
          worksheet.addRow([
            t('AutoFarmSection.modalEditType.day'),
            t('AutoFarmSection.modalEditType.accounts'),
          ]);

          // Сортуємо дані за farm_day
          const sortedStats = [...dayStats].sort(
            (a, b) => a.farm_day - b.farm_day
          );

          console.log(`Sorted stats for ${key}:`, sortedStats); // Діагностика

          // Додаємо рядки таблиці
          sortedStats.forEach(item => {
            worksheet.addRow([item.farm_day, item.accounts]);
          });

          // Стилі для заголовків
          worksheet.getRow(stat ? 9 : 1).font = { bold: true };
          worksheet.getRow(stat ? 9 : 1).alignment = { horizontal: 'center' };
          worksheet.getRow(stat ? 9 : 1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'F5F5F5' },
          };

          // Стилі для заголовкової частини
          if (stat) {
            worksheet.getColumn(1).width = 20;
            worksheet.getColumn(2).width = 15;
            for (let i = 1; i <= 7; i++) {
              worksheet.getRow(i).font = { bold: true };
              worksheet.getCell(`A${i}`).alignment = { horizontal: 'left' };
              worksheet.getCell(`B${i}`).alignment = { horizontal: 'right' };
            }
          }
        }
      }

      // Генеруємо файл
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Autofarm_Full_Report_${
        new Date().toISOString().split('T')[0]
      }.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success(t('AutoFarmSection.modalEditType.reportGenerated'));
    } catch (err) {
      console.error('Export error:', err);
      toast.error(t('AutoFarmSection.modalEditType.reportError'));
    } finally {
      setIsExportFilteredLoading(false);
    }
  };

  return (
    <div className={styles.modal_content}>
      <p className={ownStyles.label}>
        {t('AutoFarmSection.geo')}:{' '}
        <span className={ownStyles.text}>{geo}</span>
      </p>
      <p className={ownStyles.label}>
        {t('AutoFarmSection.modalEditType.mode')}:{' '}
        <span className={ownStyles.text}>{activityMode}</span>
      </p>
      {loading && <p>{t('AutoFarmSection.loading')}</p>}
      {error && <p className={styles.error}>{error}</p>}
      {!loading && !error && (
        <>
          {statsByDayLocal.length > 0 ? (
            <table className={ownStyles.table}>
              <thead>
                <tr>
                  <th className={ownStyles.th}>
                    {t('AutoFarmSection.modalEditType.day')}
                  </th>
                  <th className={ownStyles.th}>
                    {t('AutoFarmSection.modalEditType.accounts')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {statsByDayLocal.map((item, index) => (
                  <tr key={index}>
                    <td className={ownStyles.td}>{item.farm_day}</td>
                    <td className={ownStyles.td}>{item.accounts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className={ownStyles.table}>
              {t('AutoFarmSection.modalEditType.noData')}
            </p>
          )}
        </>
      )}
      <div className={ownStyles.buttons_wrap}>
        <WhiteBtn
          onClick={handleExportFiltered}
          disabled={isExportFilteredLoading}
          text={
            isExportFilteredLoading
              ? 'AllAccounts.downloadBtLoad'
              : 'AutoFarmSection.modalEditType.downloadBtn'
          }
          icon="icon-cloud-download"
          iconFill="icon-cloud-download-fill"
        />
        <CancelBtn text="DBSettings.form.cancelBtn" onClick={onClose} />
      </div>
    </div>
  );
}
