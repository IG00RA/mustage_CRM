'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
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
import styles from './ServersProxiesSection.module.css';
import CustomSelect from '@/components/Buttons/CustomSelect/CustomSelect';
import ModalComponent from '@/components/ModalComponent/ModalComponent';
import EditProxyModal from '../../ModalComponent/EditProxyModal/EditProxyModal';
import WhiteBtn from '@/components/Buttons/WhiteBtn/WhiteBtn';
import Loader from '../../Loader/Loader';
import { useAutofarmStore } from '@/store/autofarmStore';
import { useUsersStore } from '@/store/usersStore';
import { Server, Proxy } from '@/types/autofarmTypes';
import AddBtn from '../../Buttons/AddBtn/AddBtn';
import ReplenishmentProxyFarm, {
  ErrorResponse,
} from '../../ModalComponent/ReplenishmentProxyFarm/ReplenishmentProxyFarm';
import { toast } from 'react-toastify';
import { getAuthHeaders } from '@/utils/apiUtils';
import Icon from '@/helpers/Icon';

const SERVERS_PAGINATION_KEY = 'serversPaginationSettings';
const PROXIES_PAGINATION_KEY = 'proxiesPaginationSettings';

interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export default function ServersProxiesSection() {
  const t = useTranslations();
  const router = useRouter();
  const {
    servers,
    proxies,
    totalServers,
    totalProxies,
    geosModesStatuses,
    error,
    fetchGeosModesStatuses,
    fetchServers,
    fetchProxies,
    deleteProxy,
  } = useAutofarmStore();
  const { currentUser, fetchCurrentUser, loading } = useUsersStore();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectGeo, setSelectGeo] = useState<string[]>([]);
  const [selectMode, setSelectMode] = useState<string[]>([]);
  const [selectStatus, setSelectStatus] = useState<string[]>([]);
  const [selectProxyGeo, setSelectProxyGeo] = useState<string[]>([]);
  const [selectProxyMode, setSelectProxyMode] = useState<string[]>([]);
  const [isOpenEditProxy, setIsOpenEditProxy] = useState(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | null>(null);
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [isOpenReplenishmentProxyFarm, setIsOpenReplenishmentProxyFarm] =
    useState(false);
  const [isOpenError, setIsOpenError] = useState(false);
  const [responseData, setResponseData] = useState<ErrorResponse | null>(null);
  const [hasFetchedUser, setHasFetchedUser] = useState(false);

  const [serversPagination, setServersPagination] = useState<PaginationState>(
    () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(SERVERS_PAGINATION_KEY);
        return saved ? JSON.parse(saved) : { pageIndex: 0, pageSize: 10 };
      }
      return { pageIndex: 0, pageSize: 10 };
    }
  );
  const [proxiesPagination, setProxiesPagination] = useState<PaginationState>(
    () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(PROXIES_PAGINATION_KEY);
        return saved ? JSON.parse(saved) : { pageIndex: 0, pageSize: 10 };
      }
      return { pageIndex: 0, pageSize: 10 };
    }
  );

  useEffect(() => {
    if (!currentUser && !loading && !hasFetchedUser) {
      setHasFetchedUser(true);
      fetchCurrentUser().catch(error => {
        toast.error(`${t('Errors.fetchUserFailed')} : ${error}`);
              router.push('/ru');
      });
    }
  }, [currentUser, loading, hasFetchedUser, fetchCurrentUser, router, t]);

  const autofarmAccess = useMemo(() => {
    if (!currentUser) return { hasAccess: false, hasUpdate: false };

    if (currentUser.is_admin) {
      return { hasAccess: true, hasUpdate: true };
    }

    const autofarmFunction = currentUser.functions.find(
      func => func.function_name === 'Управление автофармом'
    );
    if (!autofarmFunction) return { hasAccess: false, hasUpdate: false };
    const hasRead = autofarmFunction.operations.includes('READ');
    const hasUpdate = autofarmFunction.operations.includes('UPDATE');
    return { hasAccess: hasRead, hasUpdate };
  }, [currentUser]);

  useEffect(() => {
    if (!loading && !autofarmAccess.hasAccess && currentUser) {
      router.push('/ru/dashboard');
    }
  }, [autofarmAccess, loading, router, currentUser]);

  const toggleEditProxyModal = useCallback((proxy?: Proxy) => {
    setSelectedProxy(proxy || null);
    setIsOpenEditProxy(previous => !previous);
  }, []);

  useEffect(() => {
    if (servers.length > 0) {
      setShowLoader(false);
    }
  }, [servers]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        SERVERS_PAGINATION_KEY,
        JSON.stringify(serversPagination)
      );
    }
  }, [serversPagination]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        PROXIES_PAGINATION_KEY,
        JSON.stringify(proxiesPagination)
      );
    }
  }, [proxiesPagination]);

  const toggleReplenishmentProxyFarmModal = useCallback(() => {
    setIsOpenReplenishmentProxyFarm(prev => !prev);
  }, []);

  const handleDeleteProxy = useCallback(
    async (proxyId: number) => {
      const confirmDelete = window.confirm(
        t('ServersProxiesSection.confirmDelete', { proxyId })
      );

      if (!confirmDelete) return;

      try {
        await deleteProxy(proxyId);
        toast.success(t('ServersProxiesSection.deleteSuccess'));
        const proxyParams = {
          geo: selectProxyGeo.length > 0 ? selectProxyGeo : undefined,
          server_activity_mode:
            selectProxyMode.length > 0 ? selectProxyMode : undefined,
          limit: proxiesPagination.pageSize,
          offset: proxiesPagination.pageIndex * proxiesPagination.pageSize,
        };
        await fetchProxies(proxyParams);
      } catch (error) {
        toast.error(`${t('ServersProxiesSection.deleteError')} : ${error}`);
      }
    },
    [
      t,
      deleteProxy,
      fetchProxies,
      selectProxyGeo,
      selectProxyMode,
      proxiesPagination,
    ]
  );

  const fetchData = useCallback(async () => {
    if (!autofarmAccess.hasAccess) return;
    const serverParams = {
      geo: selectGeo.length > 0 ? selectGeo : undefined,
      activity_mode: selectMode.length > 0 ? selectMode : undefined,
      server_status: selectStatus.length > 0 ? selectStatus : undefined,
      limit: serversPagination.pageSize,
      offset: serversPagination.pageIndex * serversPagination.pageSize,
    };
    const proxyParams = {
      geo: selectProxyGeo.length > 0 ? selectProxyGeo : undefined,
      server_activity_mode:
        selectProxyMode.length > 0 ? selectProxyMode : undefined,
      limit: proxiesPagination.pageSize,
      offset: proxiesPagination.pageIndex * proxiesPagination.pageSize,
    };
    await Promise.all([
      fetchGeosModesStatuses(),
      fetchServers(serverParams),
      fetchProxies(proxyParams),
    ]);
  }, [
    autofarmAccess,
    selectGeo,
    selectMode,
    selectStatus,
    selectProxyGeo,
    selectProxyMode,
    serversPagination,
    proxiesPagination,
    fetchGeosModesStatuses,
    fetchServers,
    fetchProxies,
  ]);

  useEffect(() => {
    if (!autofarmAccess.hasAccess) return;
    const timeout = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timeout);
  }, [fetchData, autofarmAccess]);

  const downloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/assets/proxies_template.xlsx';
    link.download = 'proxies_template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const geoOptions = useMemo(() => {
    const options = [t('AutoFarmSection.geoSelect')];
    if (geosModesStatuses?.geos) {
      options.push(
        ...geosModesStatuses.geos.map(geo => geo.user_friendly_name)
      );
    }
    return options;
  }, [geosModesStatuses, t]);

  const modeOptions = useMemo(() => {
    const options = [t('AutoFarmSection.typeSelect')];
    if (geosModesStatuses?.activity_modes) {
      options.push(
        ...geosModesStatuses.activity_modes.map(mode => mode.user_friendly_name)
      );
    }
    return options;
  }, [geosModesStatuses, t]);

  const statusOptions = useMemo(() => {
    const options = [t('ServersProxiesSection.statusSelect')];
    if (geosModesStatuses?.server_statuses) {
      options.push(
        ...geosModesStatuses.server_statuses.map(
          status => status.user_friendly_name
        )
      );
    }
    return options;
  }, [geosModesStatuses, t]);

  const serverColumns: ColumnDef<Server>[] = [
    {
      accessorKey: 'geo',
      header: t('ServersProxiesSection.geo'),
    },
    {
      accessorKey: 'activity_mode',
      header: t('ServersProxiesSection.activityMode'),
    },
    {
      accessorKey: 'server_status',
      header: t('ServersProxiesSection.serverStatus'),
    },
    {
      accessorKey: 'update_datetime',
      header: t('ServersProxiesSection.updateTime'),
      cell: ({ row }) =>
        new Date(row.original.update_datetime).toLocaleString(),
    },
    {
      accessorKey: 'proxy',
      header: t('ServersProxiesSection.proxy'),
      cell: ({ row }) =>
        row.original.proxy
          ? `${row.original.proxy.host}:${row.original.proxy.port}@${row.original.proxy.modem}:${row.original.proxy.password}`
          : '-',
    },
    {
      accessorKey: 'server_id',
      header: t('ServersProxiesSection.serverId'),
    },
    {
      accessorKey: 'server_name',
      header: t('ServersProxiesSection.serverName'),
    },
  ];

  const proxyColumns: ColumnDef<Proxy>[] = [
    {
      accessorKey: 'proxy_id',
      header: t('ServersProxiesSection.proxyId'),
    },
    {
      accessorKey: 'host',
      header: t('ServersProxiesSection.host'),
    },
    {
      accessorKey: 'port',
      header: t('ServersProxiesSection.port'),
    },
    {
      accessorKey: 'modem',
      header: t('ServersProxiesSection.login'),
    },
    {
      accessorKey: 'password',
      header: t('ServersProxiesSection.password'),
    },
    {
      accessorKey: 'change_ip_link',
      header: t('ServersProxiesSection.rotationLink'),
    },
    {
      accessorKey: 'provider',
      header: t('ServersProxiesSection.provider'),
    },
    {
      accessorKey: 'operator',
      header: t('ServersProxiesSection.operator'),
    },
    {
      accessorKey: 'server.server_name',
      header: t('ServersProxiesSection.serverName'),
      cell: ({ row }) => row.original.server?.server_name || '-',
    },
    {
      accessorKey: 'server.activity_mode',
      header: t('ServersProxiesSection.serverActivityMode'),
      cell: ({ row }) => row.original.server?.activity_mode || '-',
    },
    {
      accessorKey: 'server.update_datetime',
      header: t('ServersProxiesSection.updateDate'),
      cell: ({ row }) =>
        row.original.server
          ? new Date(row.original.server.update_datetime).toLocaleString()
          : '-',
    },
  ];

  if (autofarmAccess.hasUpdate) {
    proxyColumns.push({
      id: 'actions',
      header: t('ServersProxiesSection.actions'),
      cell: ({ row }) => (
        <div className={styles.table_buttons}>
          <WhiteBtn
            onClick={() => toggleEditProxyModal(row.original)}
            text={'ServersProxiesSection.edit'}
          />
          <WhiteBtn
            onClick={() => handleDeleteProxy(row.original.proxy_id)}
            text={'ServersProxiesSection.delete'}
            icon="icon-trash"
            iconFill="icon-fill_trash"
          />
        </div>
      ),
    });
  }

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
      toast.error(`${t('Upload.downloadError.error')} : ${error}`);
       }
  };

  const toggleErrorModal = () => {
    setIsOpenError(!isOpenError);
  };

  const serversTable = useReactTable({
    data: servers,
    columns: serverColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { pagination: serversPagination },
    onPaginationChange: setServersPagination,
    manualPagination: true,
    pageCount: Math.ceil(totalServers / serversPagination.pageSize),
  });

  const proxiesTable = useReactTable({
    data: proxies,
    columns: proxyColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting, pagination: proxiesPagination },
    onSortingChange: setSorting,
    onPaginationChange: setProxiesPagination,
    manualPagination: true,
    pageCount: Math.ceil(totalProxies / proxiesPagination.pageSize),
  });

  if (loading || !currentUser) {
    return <Loader />;
  }

  return (
    <section className={styles.section}>
      {showLoader && <Loader error={error} />}
      <div className={styles.header_container}>
        <h2 className={styles.header}>{t('AutoFarmSection.titleServers')}</h2>
        <p className={styles.header_text}>
          {t('AutoFarmSection.headerServersText')}
        </p>
      </div>

      <div className={styles.table_container}>
        <h3 className={styles.table_header}>
          {t('ServersProxiesSection.servers')}
        </h3>
        <div className={styles.buttons_wrap}>
          <CustomSelect
            label={`${t('ServersProxiesSection.geo')}:`}
            options={geoOptions}
            selected={selectGeo}
            onSelect={setSelectGeo}
            width={'100%'}
          />
          <CustomSelect
            label={`${t('ServersProxiesSection.activityMode')}:`}
            options={modeOptions}
            selected={selectMode}
            onSelect={setSelectMode}
            width={'100%'}
          />
          <CustomSelect
            label={`${t('ServersProxiesSection.serverStatus')}:`}
            options={statusOptions}
            selected={selectStatus}
            onSelect={setSelectStatus}
            width={'100%'}
          />
        </div>
        <div className={styles.table_wrapper}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              {serversTable.getHeaderGroups().map(headerGroup => (
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
              {serversTable.getRowModel().rows.map(row => (
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
        <div className={styles.pagination}>
          <span className={styles.pagination_text}>
            {t('Category.table.pagination')}
          </span>
          <select
            className={styles.pagination_select}
            value={serversPagination.pageSize}
            onChange={e => {
              const newPageSize = Number(e.target.value);
              const newPagination = {
                ...serversPagination,
                pageSize: newPageSize,
                pageIndex: 0,
              };
              setServersPagination(newPagination);
              fetchData();
            }}
          >
            {[5, 10, 20, 50, 100].map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className={styles.pagination_text}>
            {serversPagination.pageIndex * serversPagination.pageSize + 1}-
            {Math.min(
              (serversPagination.pageIndex + 1) * serversPagination.pageSize,
              totalServers
            )}
            {t('Category.table.pages')}
            {totalServers}
          </span>
          <div className={styles.pagination_btn_wrap}>
            <button
              className={styles.pagination_btn}
              onClick={() => {
                const newPagination = {
                  ...serversPagination,
                  pageIndex: serversPagination.pageIndex - 1,
                };
                setServersPagination(newPagination);
                fetchData();
              }}
              disabled={serversPagination.pageIndex === 0}
            >
              <Icon
                className={styles.icon_back}
                name="icon-table_arrow"
                width={20}
                height={20}
              />
            </button>
            <button
              className={styles.pagination_btn}
              onClick={() => {
                const newPagination = {
                  ...serversPagination,
                  pageIndex: serversPagination.pageIndex + 1,
                };
                setServersPagination(newPagination);
                fetchData();
              }}
              disabled={
                (serversPagination.pageIndex + 1) *
                  serversPagination.pageSize >=
                totalServers
              }
            >
              <Icon
                className={styles.icon_forward}
                name="icon-table_arrow"
                width={20}
                height={20}
              />
            </button>
          </div>
        </div>
      </div>

      <div className={styles.table_container}>
        <h3 className={styles.table_header}>
          {t('ServersProxiesSection.proxies')}
        </h3>
        <div className={styles.buttons_wrap}>
          <CustomSelect
            label={`${t('ServersProxiesSection.geo')}:`}
            options={geoOptions}
            selected={selectProxyGeo}
            onSelect={setSelectProxyGeo}
            width={'100%'}
          />
          <CustomSelect
            label={`${t('ServersProxiesSection.activityMode')}:`}
            options={modeOptions}
            selected={selectProxyMode}
            onSelect={setSelectProxyMode}
            width={'100%'}
          />
        </div>
        <div className={styles.table_wrapper}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              {proxiesTable.getHeaderGroups().map(headerGroup => (
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
                      {header.column.getIsSorted()
                        ? header.column.getIsSorted() === 'desc'
                          ? ' ↓'
                          : ' ↑'
                        : ''}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className={styles.tbody}>
              {proxiesTable.getRowModel().rows.map(row => (
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
        <div className={styles.pagination}>
          <span className={styles.pagination_text}>
            {t('Category.table.pagination')}
          </span>
          <select
            className={styles.pagination_select}
            value={proxiesPagination.pageSize}
            onChange={e => {
              const newPageSize = Number(e.target.value);
              const newPagination = {
                ...proxiesPagination,
                pageSize: newPageSize,
                pageIndex: 0,
              };
              setProxiesPagination(newPagination);
              fetchData();
            }}
          >
            {[5, 10, 20, 50, 100].map(size => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className={styles.pagination_text}>
            {proxiesPagination.pageIndex * proxiesPagination.pageSize + 1}-
            {Math.min(
              (proxiesPagination.pageIndex + 1) * proxiesPagination.pageSize,
              totalProxies
            )}
            {t('Category.table.pages')}
            {totalProxies}
          </span>
          <div className={styles.pagination_btn_wrap}>
            <button
              className={styles.pagination_btn}
              onClick={() => {
                const newPagination = {
                  ...proxiesPagination,
                  pageIndex: proxiesPagination.pageIndex - 1,
                };
                setProxiesPagination(newPagination);
                fetchData();
              }}
              disabled={proxiesPagination.pageIndex === 0}
            >
              <Icon
                className={styles.icon_back}
                name="icon-table_arrow"
                width={20}
                height={20}
              />
            </button>
            <button
              className={styles.pagination_btn}
              onClick={() => {
                const newPagination = {
                  ...proxiesPagination,
                  pageIndex: proxiesPagination.pageIndex + 1,
                };
                setProxiesPagination(newPagination);
                fetchData();
              }}
              disabled={
                (proxiesPagination.pageIndex + 1) *
                  proxiesPagination.pageSize >=
                totalProxies
              }
            >
              <Icon
                className={styles.icon_forward}
                name="icon-table_arrow"
                width={20}
                height={20}
              />
            </button>
          </div>
        </div>
        {autofarmAccess.hasUpdate && (
          <div className={styles.table_add_btn}>
            <WhiteBtn
              onClick={downloadTemplate}
              text={'AutoFarmSection.downloadTemplate'}
              icon="icon-cloud-download"
              iconFill="icon-cloud-download-fill"
            />
            <AddBtn
              onClick={toggleReplenishmentProxyFarmModal}
              text={'ServersProxiesSection.proxyBtn'}
            />
          </div>
        )}
      </div>

      <ModalComponent
        isOpen={isOpenEditProxy}
        onClose={() => toggleEditProxyModal()}
        title="ServersProxiesSection.editProxy"
      >
        {selectedProxy && (
          <EditProxyModal
            proxy={selectedProxy}
            onClose={() => toggleEditProxyModal()}
          />
        )}
      </ModalComponent>
      <ModalComponent
        isOpen={isOpenReplenishmentProxyFarm}
        onClose={toggleReplenishmentProxyFarmModal}
        title="ServersProxiesSection.proxyTitle"
      >
        <ReplenishmentProxyFarm
          setResponseData={setResponseData}
          toggleErrorModal={toggleErrorModal}
          onClose={toggleReplenishmentProxyFarmModal}
        />
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
