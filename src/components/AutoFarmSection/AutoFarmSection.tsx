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
import WhiteBtn from '../Buttons/WhiteBtn/WhiteBtn';
import ModalComponent from '../ModalComponent/ModalComponent';
import CustomSelect from '../Buttons/CustomSelect/CustomSelect';
import AddBtn from '../Buttons/AddBtn/AddBtn';
import EditTypeFarmModal from '../ModalComponent/EditTypeFarmModal/EditTypeFarmModal';
import UploadAccountsAutoFarm from '../ModalComponent/UploadAccountsAutoFarm/UploadAccountsAutoFarm';
import ReplenishmentAccountsFarm from '../ModalComponent/ReplenishmentAccountsFarm/ReplenishmentAccountsFarm';
import EditServerFarmModal from '../ModalComponent/EditServerFarmModal/EditServerFarmModal';
import { useAutofarmStore } from '@/store/autofarmStore';
import { AutofarmStats, AutofarmMissing } from '@/types/autofarmTypes';
import Loader from '../Loader/Loader';

const GEO_OPTIONS = ['Україна', 'Польша', 'США'];
const ACTIVITY_MODES = ['7 дней', '14 дней', '20 дней', '30 дней'];

export default function AutoFarmSection() {
  const t = useTranslations();
  const { stats, missing, loading, error, fetchStatistics, fetchMissing } =
    useAutofarmStore();
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]); // Додано для сортування
  const [isOpenEditType, setIsOpenEditType] = useState(false);
  const [isOpenServer, setIsOpenServer] = useState(false);
  const [isOpenReplenishmentAccounts, setIsOpenReplenishmentAccounts] =
    useState(false);
  const [isOpenUpdate, setIsOpenUpdate] = useState(false);
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateServerName, setUpdateServerName] = useState('');
  const [updateTitleSecond, setUpdateTitleSecond] = useState('');
  const [selectedRow, setSelectedRow] = useState<{
    geo: string;
    mode: string;
  } | null>(null); // Для передачі в модалку
  const [selectGeoAcc, setSelectGeoAcc] = useState<string[]>([]);
  const [selectTypeAcc, setSelectTypeAcc] = useState<string[]>([]);
  const [selectGeoReplenishment, setSelectGeoReplenishment] = useState<
    string[]
  >([]);
  const [selectTypeReplenishment, setSelectTypeReplenishment] = useState<
    string[]
  >([]);
  const [showLoader, setShowLoader] = useState<boolean>(true);

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

  const toggleUpdateModal = useCallback((title = '', titleSecond = '') => {
    setUpdateTitle(title);
    setUpdateTitleSecond(titleSecond);
    setIsOpenUpdate(prev => !prev);
  }, []);

  const fetchData = useCallback(() => {
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
    const timeout = setTimeout(() => {
      fetchData();
    }, 300);

    return () => clearTimeout(timeout);
  }, [fetchData]);

  const filteredStats = useMemo(
    () =>
      stats.filter(
        item =>
          (selectGeoAcc.length === 0 || selectGeoAcc.includes(item.geo)) &&
          (selectTypeAcc.length === 0 || selectTypeAcc.includes(item.mode))
      ),
    [stats, selectGeoAcc, selectTypeAcc]
  );

  const filteredMissing = useMemo(
    () =>
      missing.filter(
        item =>
          (selectGeoReplenishment.length === 0 ||
            selectGeoReplenishment.includes(item.geo)) &&
          (selectTypeReplenishment.length === 0 ||
            selectTypeReplenishment.includes(item.mode_name))
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
    {
      id: 'actions',
      header: t('AutoFarmSection.actions'),
      cell: ({ row }) => (
        <div className={styles.table_buttons}>
          <WhiteBtn
            onClick={() =>
              toggleUpdateModal(
                `гео - ${row.original.geo}, тип - ${row.original.mode}`,
                `Facebook ${row.original.geo}-автофарм ${row.original.mode}`
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
    },
  ];

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

  return (
    <section className={styles.section}>
      {(showLoader || loading) && <Loader error={error} />}
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
        <div className={styles.table_add_btn}>
          <AddBtn
            onClick={toggleReplenishmentAccountsModal}
            text={'AutoFarmSection.tableReplenishment.btn'}
          />
        </div>
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
        <ReplenishmentAccountsFarm />
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
        onClose={toggleUpdateModal}
        title="AutoFarmSection.modalLoad.title"
        titleSecond="AutoFarmSection.modalLoad.titleSecond"
        editedTitle={`"${updateTitle}"`}
        editedTitleSecond={`"${updateTitleSecond}"`}
      >
        <UploadAccountsAutoFarm />
      </ModalComponent>
    </section>
  );
}
