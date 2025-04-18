'use client';

import styles from './AutoFarmSection.module.css';
import { useTranslations } from 'next-intl';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import WhiteBtn from '../Buttons/WhiteBtn/WhiteBtn';
import ModalComponent from '../ModalComponent/ModalComponent';
import CustomSelect from '../Buttons/CustomSelect/CustomSelect';
import AddBtn from '../Buttons/AddBtn/AddBtn';
import EditTypeFarmModal from '../ModalComponent/EditTypeFarmModal/EditTypeFarmModal';
import UploadAccountsAutoFarm from '../ModalComponent/UploadAccountsAutoFarm/UploadAccountsAutoFarm';
import ReplenishmentAccountsFarm from '../ModalComponent/ReplenishmentAccountsFarm/ReplenishmentAccountsFarm';
import EditServerFarmModal from '../ModalComponent/EditServerFarmModal/EditServerFarmModal';
import { useAutofarmStore } from '@/store/autofarmStore';
import { useUsersStore } from '@/store/usersStore';
import { AutofarmStats, AutofarmMissing } from '@/types/autofarmTypes';
import Loader from '../Loader/Loader';
import { UploadResponse } from '../UploadSection/UploadSection';
import { toast } from 'react-toastify';
import { getAuthHeaders } from '@/utils/apiUtils';

const GEO_OPTIONS = ['Україна', 'Польша', 'США'];
const ACTIVITY_MODES = ['7 дней', '14 дней', '20 дней', '30 дней'];

const MODE_NAME_MAP = {
  SEVEN_DAYS: '7 дней',
  FOURTEEN_DAYS: '14 дней',
  TWENTY_DAYS: '20 дней',
  THIRTY_DAYS: '30 дней',
};

export default function AutoFarmSection() {
  const t = useTranslations();
  const router = useRouter();
  const { stats, missing, error, fetchStatistics, fetchMissing } =
    useAutofarmStore();
  const { currentUser, fetchCurrentUser, loading } = useUsersStore();

  const [globalFilter, setGlobalFilter] = useState('');
  const [isOpenError, setIsOpenError] = useState(false);
  const [responseData, setResponseData] = useState<UploadResponse | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isOpenEditType, setIsOpenEditType] = useState(false);
  const [isOpenServer, setIsOpenServer] = useState(false);
  const [isOpenReplenishmentAccounts, setIsOpenReplenishmentAccounts] =
    useState(false);
  const [isOpenUpdate, setIsOpenUpdate] = useState(false);
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateServerName, setUpdateServerName] = useState('');
  const [selectedRow, setSelectedRow] = useState<{
    geo: string;
    mode: string;
  } | null>(null);
  const [selectGeoAcc, setSelectGeoAcc] = useState<string[]>([]);
  const [selectTypeAcc, setSelectTypeAcc] = useState<string[]>([]);
  const [selectGeoReplenishment, setSelectGeoReplenishment] = useState<
    string[]
  >([]);
  const [selectTypeReplenishment, setSelectTypeReplenishment] = useState<
    string[]
  >([]);
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [hasFetchedUser, setHasFetchedUser] = useState(false);

  // Перевірка доступу
  useEffect(() => {
    if (!currentUser && !loading && !hasFetchedUser) {
      setHasFetchedUser(true);
      fetchCurrentUser().catch(error => {
        console.error('Failed to fetch current user:', error);
        toast.error(t('Errors.fetchUserFailed'));
        router.push('/ru');
      });
    }
  }, [currentUser, loading, hasFetchedUser, fetchCurrentUser, router, t]);

  const autofarmAccess = useMemo(() => {
    if (!currentUser) return { hasAccess: false, hasUpdate: false };

    // Якщо користувач є адміном, надаємо повний доступ
    if (currentUser.is_admin) {
      return { hasAccess: true, hasUpdate: true };
    }

    // Інакше перевіряємо функції
    const autofarmFunction = currentUser.functions.find(
      func => func.function_name === 'Управление автофармом'
    );
    if (!autofarmFunction) return { hasAccess: false, hasUpdate: false };
    const hasRead = autofarmFunction.operations.includes('READ');
    const hasUpdate = autofarmFunction.operations.includes('UPDATE');
    return { hasAccess: hasRead, hasUpdate };
  }, [currentUser]);

  // Перенаправлення, якщо немає доступу
  useEffect(() => {
    if (!loading && !autofarmAccess.hasAccess && currentUser) {
      router.push('/ru');
    }
  }, [autofarmAccess, loading, router, currentUser]);

  const toggleEditTypeModal = useCallback((geo?: string, mode?: string) => {
    setSelectedRow(geo && mode ? { geo, mode } : null);
    setIsOpenEditType(prev => !prev);
  }, []);

  const toggleServerModal = useCallback((server = '') => {
    setUpdateServerName(server);
    setIsOpenServer(prev => !prev);
  }, []);

  const toggleReplenishmentAccountsModal = useCallback(() => {
    setIsOpenReplenishmentAccounts(prev => !prev);
  }, []);

  const toggleUpdateModal = useCallback(
    (title = '', geo?: string, mode?: string) => {
      setUpdateTitle(title);
      setSelectedRow(geo && mode ? { geo, mode } : null);
      setIsOpenUpdate(prev => !prev);
    },
    []
  );

  const fetchData = useCallback(() => {
    if (!autofarmAccess.hasAccess) return;
    fetchStatistics({
      geo: selectGeoAcc.length ? selectGeoAcc : undefined,
      activity_mode: selectTypeAcc.length ? selectTypeAcc : undefined,
    });
    fetchMissing({
      geo: selectGeoReplenishment.length ? selectGeoReplenishment : undefined,
      activity_mode: selectTypeReplenishment.length
        ? selectTypeReplenishment
        : undefined,
    });
  }, [
    autofarmAccess,
    selectGeoAcc,
    selectTypeAcc,
    selectGeoReplenishment,
    selectTypeReplenishment,
    fetchStatistics,
    fetchMissing,
  ]);

  useEffect(() => {
    if (stats.length !== 0) setShowLoader(false);
  }, [stats]);

  useEffect(() => {
    if (!autofarmAccess.hasAccess) return;
    const timeout = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timeout);
  }, [fetchData, autofarmAccess]);

  const filteredStats = useMemo(
    () =>
      stats.filter(
        item =>
          (selectGeoAcc.length === 0 || selectGeoAcc.includes(item.geo)) &&
          (selectTypeAcc.length === 0 || selectTypeAcc.includes(item.mode))
      ),
    [stats, selectGeoAcc, selectTypeAcc]
  );

  const toggleErrorModal = () => {
    setIsOpenError(!isOpenError);
  };

  const downloadErrorFile = async () => {
    if (!responseData?.file) {
      toast.error(t('Upload.downloadError.noFile'));
      return;
    }

    try {
      const headers = {
        ...getAuthHeaders(),
        accept: 'application/octet-stream',
      };

      const response = await fetch(responseData.file, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            errorData.detail ||
            t('Upload.downloadError.error')
        );
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download =
        responseData.file.split('/').pop() || 'upload-errors.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(t('Upload.downloadError.success'));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t('Upload.downloadError.error')
      );
      console.error('Download error:', error);
    }
  };

  const downloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/assets/farm_replenish_template.xlsx';
    link.download = 'farm_replenish_template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredMissing = useMemo(
    () =>
      missing.filter(
        item =>
          (selectGeoReplenishment.length === 0 ||
            selectGeoReplenishment.includes(item.geo)) &&
          (selectTypeReplenishment.length === 0 ||
            selectTypeReplenishment.includes(
              MODE_NAME_MAP[item.mode_name as keyof typeof MODE_NAME_MAP] ||
                item.mode_name
            ))
      ),
    [missing, selectGeoReplenishment, selectTypeReplenishment]
  );

  const mainColumns: ColumnDef<AutofarmStats>[] = [
    {
      accessorKey: 'geo',
      header: t('AutoFarmSection.geoTable'),
    },
    {
      accessorKey: 'mode',
      header: t('AutoFarmSection.type'),
    },
    {
      accessorKey: 'total_servers',
      header: t('AutoFarmSection.tableAcc.servers'),
    },
    {
      accessorKey: 'in_process',
      header: t('AutoFarmSection.tableAcc.workAcc'),
    },
    {
      accessorKey: 'ready',
      header: t('AutoFarmSection.tableAcc.doneAcc'),
    },
    {
      accessorKey: 'ready_0_fp',
      header: t('AutoFarmSection.tableAcc.noFP'),
    },
    {
      accessorKey: 'ready_2_fp',
      header: t('AutoFarmSection.tableAcc.with2FP'),
    },
  ];

  // Умовно додаємо колонку дій, якщо є права на UPDATE або is_admin: true
  if (autofarmAccess.hasUpdate) {
    mainColumns.push({
      id: 'actions',
      header: t('AutoFarmSection.actions'),
      cell: ({ row }) => (
        <div className={styles.table_buttons}>
          <WhiteBtn
            onClick={() =>
              toggleUpdateModal(
                `гео - ${row.original.geo}, тип - ${row.original.mode}`,
                row.original.geo,
                row.original.mode
              )
            }
            text={'AutoFarmSection.tableAcc.btnLoad'}
            icon="icon-upload"
          />
          <WhiteBtn
            onClick={() =>
              toggleEditTypeModal(row.original.geo, row.original.mode)
            }
            text={'AutoFarmSection.tableAcc.btnEdit'}
          />
        </div>
      ),
    });
  }

  const shortageColumns: ColumnDef<AutofarmMissing>[] = [
    {
      accessorKey: 'geo',
      header: () => (
        <div className={styles.sortable_header}>
          {t('AutoFarmSection.geoTable')}
          {sorting.find(s => s.id === 'geo')?.desc ? (
            <span>↓</span>
          ) : (
            <span>↑</span>
          )}
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'mode_name',
      header: t('AutoFarmSection.type'),
      cell: ({ row }) => {
        const modeKey = row.original.mode_name;
        return MODE_NAME_MAP[modeKey as keyof typeof MODE_NAME_MAP] || modeKey;
      },
    },
    {
      accessorKey: 'total_missing',
      header: t('AutoFarmSection.tableReplenishment.lackAcc'),
    },
  ];

  const mainTable = useReactTable({
    data: filteredStats,
    columns: mainColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    filterFns: {
      global: (row, columnId, filterValue) => {
        if (!filterValue) return true;
        const cellValue = String(row.getValue(columnId) ?? '').toLowerCase();
        return cellValue.includes(filterValue.toLowerCase());
      },
    },
  });

  const shortageTable = useReactTable({
    data: filteredMissing,
    columns: shortageColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    onSortingChange: setSorting,
  });

  const totalMissing = useMemo(
    () => filteredMissing.reduce((sum, item) => sum + item.total_missing, 0),
    [filteredMissing]
  );

  if (loading || !currentUser) {
    return <Loader />;
  }

  return (
    <section className={styles.section}>
      {showLoader && <Loader error={error} />}
      <div className={styles.header_container}>
        <h2 className={styles.header}>{t('AutoFarmSection.title')}</h2>
        <p className={styles.header_text}>{t('AutoFarmSection.headerText')}</p>
      </div>
      <div className={styles.table_container_first}>
        <h3 className={styles.table_header}>
          {t('AutoFarmSection.tableAcc.header')}
        </h3>
        <div className={styles.buttons_wrap}>
          <CustomSelect
            label={`${t('AutoFarmSection.geo')}:`}
            options={[t('AutoFarmSection.geoSelect'), ...GEO_OPTIONS]}
            selected={selectGeoAcc}
            onSelect={setSelectGeoAcc}
            width={296}
          />
          <CustomSelect
            label={`${t('AutoFarmSection.type')}:`}
            options={[t('AutoFarmSection.typeSelect'), ...ACTIVITY_MODES]}
            selected={selectTypeAcc}
            onSelect={setSelectTypeAcc}
            width={296}
          />
        </div>
        <div className={styles.table_wrapper}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              {mainTable.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th className={styles.th} key={header.id}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className={styles.tbody}>
              {mainTable.getRowModel().rows.map(row => (
                <tr className={styles.tr} key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td className={styles.td} key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className={styles.table_container}>
        <h3 className={styles.table_header}>
          {t('AutoFarmSection.tableReplenishment.header')}
        </h3>
        <div className={styles.buttons_wrap}>
          <CustomSelect
            label={`${t('AutoFarmSection.geo')}:`}
            options={[t('AutoFarmSection.geoSelect'), ...GEO_OPTIONS]}
            selected={selectGeoReplenishment}
            onSelect={setSelectGeoReplenishment}
            width={250}
          />
          <CustomSelect
            label={`${t('AutoFarmSection.type')}:`}
            options={[t('AutoFarmSection.typeSelect'), ...ACTIVITY_MODES]}
            selected={selectTypeReplenishment}
            onSelect={setSelectTypeReplenishment}
            width={350}
          />
        </div>
        <div className={styles.replenishment_table_wrapper}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              {shortageTable.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      className={styles.th}
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      style={{
                        cursor: header.column.getCanSort()
                          ? 'pointer'
                          : 'default',
                      }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className={styles.tbody}>
              {shortageTable.getRowModel().rows.map(row => (
                <tr className={styles.tr} key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td className={styles.td} key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={styles.table_text}>
          {t('AutoFarmSection.tableReplenishment.amount')}{' '}
          <span>{totalMissing}</span>
        </p>
        {/* Умовно відображаємо кнопки для додавання/завантаження */}
        {autofarmAccess.hasUpdate && (
          <div className={styles.table_add_btn}>
            <WhiteBtn
              onClick={downloadTemplate}
              text={'AutoFarmSection.downloadTemplate'}
              icon="icon-cloud-download"
              iconFill="icon-cloud-download-fill"
            />
            <AddBtn
              onClick={toggleReplenishmentAccountsModal}
              text={'AutoFarmSection.tableReplenishment.btn'}
            />
          </div>
        )}
      </div>
      <ModalComponent
        isOpen={isOpenEditType}
        onClose={() => toggleEditTypeModal()}
        title="AutoFarmSection.modalEditType.title"
      >
        {selectedRow && (
          <EditTypeFarmModal
            geo={selectedRow.geo}
            activityMode={selectedRow.mode}
            onClose={() => toggleEditTypeModal()}
          />
        )}
      </ModalComponent>
      <ModalComponent
        isOpen={isOpenReplenishmentAccounts}
        onClose={toggleReplenishmentAccountsModal}
        title="AutoFarmSection.modalReplenishmentAcc.title"
      >
        <ReplenishmentAccountsFarm
          setResponseData={setResponseData}
          toggleErrorModal={toggleErrorModal}
          onClose={toggleReplenishmentAccountsModal}
        />
      </ModalComponent>
      <ModalComponent
        isOpen={isOpenServer}
        onClose={toggleServerModal}
        editedTitle={`"${updateServerName}"`}
        title="AutoFarmSection.modalServerType.title"
      >
        <EditServerFarmModal />
      </ModalComponent>
      <ModalComponent
        isOpen={isOpenUpdate}
        onClose={() => toggleUpdateModal()}
        title="AutoFarmSection.modalLoad.title"
        editedTitle={`"${updateTitle}"`}
      >
        {selectedRow && (
          <UploadAccountsAutoFarm
            geo={selectedRow.geo}
            activityMode={selectedRow.mode}
            onClose={() => toggleUpdateModal()}
          />
        )}
      </ModalComponent>
      <ModalComponent
        isOpen={isOpenError}
        onClose={toggleErrorModal}
        title="Upload.modalUpload.titleError"
        icon="icon-error-load"
      >
        <div className={styles.modal_error}>
          <p className={styles.error_text}>
            {t('Upload.textError')} <span>{responseData?.message}</span>
          </p>
          <p className={styles.error_download_text}>
            {t('Upload.textDownloadError')}
          </p>
        </div>
        <WhiteBtn
          onClick={downloadErrorFile}
          text={'Upload.buttons.errorDownload'}
          icon="icon-cloud-download"
          iconFill="icon-cloud-download-fill"
        />
      </ModalComponent>
    </section>
  );
}
