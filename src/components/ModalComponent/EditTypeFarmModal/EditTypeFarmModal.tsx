'use client';

import { useTranslations } from 'next-intl';
import styles from '../ModalComponent.module.css';
import ownStyles from './EditTypeFarmModal.module.css';
import { useAutofarmStore } from '@/store/autofarmStore';
import { useEffect, useState, useRef } from 'react';
import CancelBtn from '@/components/Buttons/CancelBtn/CancelBtn';
import WhiteBtn from '@/components/Buttons/WhiteBtn/WhiteBtn';
import ExcelJS from 'exceljs';
import { toast } from 'react-toastify';
import { AutofarmStatsByDay } from '@/types/autofarmTypes';
import Icon from '@/helpers/Icon';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

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
    historyByDay,
    loading,
    error,
    fetchStatisticsByDay,
    fetchStatisticsByDayDirect,
    fetchHistoryByDay,
  } = useAutofarmStore();
  const [isExportFilteredLoading, setIsExportFilteredLoading] =
    useState<boolean>(false);
  const [statsByDayLocal, setStatsByDayLocal] = useState<AutofarmStatsByDay[]>(
    []
  );
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const today = new Date().toISOString().split('T')[0];
  const DAY_OPTIONS = Object.keys(historyByDay)
    .filter(date => date !== today)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}.${month}.${year}`;
  };

  useEffect(() => {
    fetchStatisticsByDay({ geo, activity_mode: activityMode }).then(() => {
      setStatsByDayLocal([...statsByDay]);
    });
    fetchHistoryByDay({ geo, activity_mode: activityMode });
  }, [geo, activityMode, fetchStatisticsByDay, fetchHistoryByDay, statsByDay]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportFiltered = async () => {
    setIsExportFilteredLoading(true);
    toast.info(t('AutoFarmSection.modalEditType.generatingReport'));

    try {
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
                return { key: `${geo}-${mode}`, data: [] };
              })
          );
        }
      }

      const results = await Promise.all(promises);

      const allStatsByDay: { [key: string]: AutofarmStatsByDay[] } = {};
      results.forEach(({ key, data }) => {
        allStatsByDay[key] = data;
      });

      const workbook = new ExcelJS.Workbook();

      for (const geo of GEO_OPTIONS) {
        for (const mode of ACTIVITY_MODES) {
          const stat = stats.find(s => s.geo === geo && s.mode === mode);
          const key = `${geo}-${mode}`;
          const dayStats = allStatsByDay[key] || [];

          const sheetName = `${geo} - ${mode}`;
          const worksheet = workbook.addWorksheet(sheetName);

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
            worksheet.addRow([]);
          }

          worksheet.addRow([
            t('AutoFarmSection.modalEditType.day'),
            t('AutoFarmSection.modalEditType.accounts'),
          ]);

          const sortedStats = [...dayStats].sort(
            (a, b) => a.farm_day - b.farm_day
          );
          sortedStats.forEach(item => {
            worksheet.addRow([item.farm_day, item.accounts]);
          });

          worksheet.getRow(stat ? 9 : 1).font = { bold: true };
          worksheet.getRow(stat ? 9 : 1).alignment = { horizontal: 'center' };
          worksheet.getRow(stat ? 9 : 1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'F5F5F5' },
          };

          if (stat) {
            worksheet.getColumn(1).width = 20;
            worksheet.getColumn(2).width = 15;
            for (let i = 1; i <= 7; i++) {
              worksheet.getRow(i).font = { bold: true };
              worksheet.getCell(`A${i}`).alignment = { horizontal: 'left' };
              worksheet.getCell(`B${isExportFilteredLoading}`).alignment = {
                horizontal: 'right',
              };
            }
          }
        }
      }

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

  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setIsDropdownOpen(false);
  };

  const currentData = statsByDayLocal;
  const historicalData = selectedDate ? historyByDay[selectedDate] || [] : [];

  const allFarmDays = Array.from(
    new Set([
      ...currentData.map(item => item.farm_day),
      ...historicalData.map(item => item.farm_day),
    ])
  ).sort((a, b) => a - b);

  const currentDataMap = new Map(
    currentData.map(item => [item.farm_day, item.accounts])
  );
  const historicalDataMap = new Map(
    historicalData.map(item => [item.farm_day, item.accounts])
  );

  return (
    <SkeletonTheme baseColor="#e0e0e0" highlightColor="#f5f5f5">
      <div>
        {/* Geo and Activity Mode Labels */}
        <p className={ownStyles.label}>
          {t('AutoFarmSection.geo')}:{' '}
          <span className={ownStyles.text}>{geo}</span>
        </p>
        <p className={ownStyles.label}>
          {t('AutoFarmSection.modalEditType.mode')}:{' '}
          <span className={ownStyles.text}>{activityMode}</span>
        </p>

        {loading ? (
          // Skeleton Loading State
          <div className={ownStyles.modal_content}>
            <table className={ownStyles.table_top}>
              <thead>
                <tr>
                  <th className={ownStyles.th}>
                    <Skeleton width={100} />
                  </th>
                  <th className={ownStyles.th}>
                    <Skeleton width={150} />
                  </th>
                  <th className={ownStyles.th}>
                    <Skeleton width={150} />
                  </th>
                </tr>
              </thead>
            </table>
            <table className={ownStyles.table}>
              <tbody>
                {[...Array(5)].map((_, index) => (
                  <tr key={index}>
                    <td className={ownStyles.td}>
                      <Skeleton width={50} />
                    </td>
                    <td className={ownStyles.td}>
                      <Skeleton width={80} />
                    </td>
                    <td className={ownStyles.td}>
                      <Skeleton width={80} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : error ? (
          // Error State
          <p className={styles.error}>{error}</p>
        ) : (
          // Data Loaded State
          <>
            {allFarmDays.length > 0 ? (
              <>
                <table className={ownStyles.table_top}>
                  <thead>
                    <tr>
                      <th className={ownStyles.th}>
                        {t('AutoFarmSection.modalEditType.day')}
                      </th>
                      <th className={ownStyles.th}>
                        {t('AutoFarmSection.modalEditType.accountsCurrent')}
                      </th>
                      <th className={ownStyles.th}>
                        <div
                          className={ownStyles.dropdown_wrapper}
                          ref={dropdownRef}
                        >
                          <button
                            className={ownStyles.select}
                            type="button"
                            onClick={toggleDropdown}
                          >
                            <p className={ownStyles.select_text}>
                              {selectedDate
                                ? formatDate(selectedDate)
                                : t('AutoFarmSection.modalEditType.selectDate')}
                            </p>
                            <Icon
                              className={ownStyles.select_icon}
                              name="icon-stat_calendar_grey"
                              width={14}
                              height={14}
                            />
                          </button>
                          <ul
                            className={`${ownStyles.dropdown_list} ${
                              isDropdownOpen ? ownStyles.select_open : ''
                            }`}
                          >
                            <li
                              className={ownStyles.dropdown_item}
                              onClick={() => handleDateSelect('')}
                            >
                              {t('AutoFarmSection.modalEditType.noComparison')}
                            </li>
                            {DAY_OPTIONS.map(date => (
                              <li
                                key={date}
                                className={ownStyles.dropdown_item}
                                onClick={() => handleDateSelect(date)}
                              >
                                {formatDate(date)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </th>
                    </tr>
                  </thead>
                </table>
                <div className={ownStyles.modal_content}>
                  <table className={ownStyles.table}>
                    <tbody>
                      {allFarmDays.map((farmDay, index) => (
                        <tr key={index}>
                          <td className={ownStyles.td}>{farmDay}</td>
                          <td className={ownStyles.td}>
                            {currentDataMap.get(farmDay) || '-'}
                          </td>
                          {selectedDate && (
                            <td className={ownStyles.td}>
                              {historicalDataMap.get(farmDay) || '-'}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p className={ownStyles.table}>
                {t('AutoFarmSection.modalEditType.noData')}
              </p>
            )}
          </>
        )}

        {/* Buttons */}
        <div className={ownStyles.buttons_wrap}>
          <WhiteBtn
            onClick={handleExportFiltered}
            disabled={isExportFilteredLoading || loading}
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
    </SkeletonTheme>
  );
}
