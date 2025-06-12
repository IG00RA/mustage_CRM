import { create } from 'zustand';
import {
  AutofarmState,
  AutofarmStats,
  AutofarmStatsResponse,
  AutofarmMissing,
  AutofarmMissingResponse,
  AutofarmStatsByDay,
  AutofarmRequestParams,
  AutofarmDumpResponse,
  AutofarmDumpParams,
  GeosModesStatusesResponse,
  ServersResponse,
  ProxiesResponse,
  Proxy,
  UpdateProxyRequest,
  AutofarmHistoryByDay,
} from '../types/autofarmTypes';
import { ENDPOINTS } from '../constants/api';
import { fetchWithErrorHandling, getAuthHeaders } from '../utils/apiUtils';

interface AutofarmStore extends AutofarmState {
  lastStatsParams?: string;
  lastMissingParams?: string;
  lastStatsByDayParams?: string;
  lastHistoryByDayParams?: string;
  setStats: (newStats: AutofarmStats[]) => void;
}

const GEO_MAPPING: { [key: string]: string } = {
  ua: 'Україна',
  pl: 'Польша',
  usa: 'США',
};

export const useAutofarmStore = create<AutofarmStore>((set, get) => ({
  stats: [],
  missing: [],
  statsByDay: [],
  historyByDay: {},
  geosModesStatuses: null,
  servers: [],
  proxies: [],
  loading: false,
  error: null,
  lastStatsParams: undefined,
  lastMissingParams: undefined,
  lastStatsByDayParams: undefined,
  lastHistoryByDayParams: undefined,
  totalServers: 0,
  totalProxies: 0,

  setStats: (newStats: AutofarmStats[]) => set({ stats: newStats }),

  fetchStatistics: async (params = {}) => {
    const paramsStr = JSON.stringify(params);
    if (paramsStr === get().lastStatsParams) {
      return;
    }

    set({ loading: true, error: null, lastStatsParams: paramsStr });

    const queryParams = new URLSearchParams();
    if (params.geo) {
      if (Array.isArray(params.geo)) {
        params.geo.forEach(geo => queryParams.append('geo', geo));
      } else {
        queryParams.append('geo', params.geo);
      }
    }
    if (params.activity_mode) {
      if (Array.isArray(params.activity_mode)) {
        params.activity_mode.forEach(mode =>
          queryParams.append('activity_mode', mode)
        );
      } else {
        queryParams.append('activity_mode', params.activity_mode);
      }
    }

    const url = `${ENDPOINTS.AUTO_FARM_STATISTICS}${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;

    try {
      const data = await fetchWithErrorHandling<AutofarmStatsResponse>(
        url,
        {
          method: 'GET',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        },
        () => {}
      );

      const stats: AutofarmStats[] = Object.entries(data).flatMap(
        ([geo, modes]) =>
          modes.map(mode => ({
            ...mode,
            geo: GEO_MAPPING[geo.toLowerCase()] || geo,
          }))
      );

      set({ stats, loading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      set({ loading: false, error: errorMessage });
      console.error('Fetch statistics error:', error);
      throw error;
    }
  },

  fetchMissing: async (params = {}) => {
    const paramsStr = JSON.stringify(params);
    if (paramsStr === get().lastMissingParams) {
      return;
    }

    set({ loading: true, error: null, lastMissingParams: paramsStr });

    const queryParams = new URLSearchParams();
    if (params.geo) {
      if (Array.isArray(params.geo)) {
        params.geo.forEach(geo => queryParams.append('geo', geo));
      } else {
        queryParams.append('geo', params.geo);
      }
    }
    if (params.activity_mode) {
      if (Array.isArray(params.activity_mode)) {
        params.activity_mode.forEach(mode =>
          queryParams.append('activity_mode', mode)
        );
      } else {
        queryParams.append('activity_mode', params.activity_mode);
      }
    }

    const url = `${ENDPOINTS.AUTO_FARM_MISSING || '/autofarm/missing'}${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;

    try {
      const data = await fetchWithErrorHandling<AutofarmMissingResponse>(
        url,
        {
          method: 'GET',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        },
        () => {}
      );

      const missing: AutofarmMissing[] = Object.entries(data).flatMap(
        ([geo, modes]) =>
          Object.entries(modes)
            .filter(([, missingData]) => missingData.total_missing > 0)
            .map(([mode_name, missingData]) => ({
              ...missingData,
              mode_name,
              geo: GEO_MAPPING[geo.toLowerCase()] || geo,
            }))
      );

      set({ missing, loading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      set({ loading: false, error: errorMessage });
      console.error('Fetch missing error:', error);
      throw error;
    }
  },

  fetchStatisticsByDay: async (params: AutofarmRequestParams = {}) => {
    const paramsStr = JSON.stringify(params);
    if (paramsStr === get().lastStatsByDayParams) {
      return;
    }

    set({ loading: true, error: null, lastStatsByDayParams: paramsStr });

    const data = await get().fetchStatisticsByDayDirect(params);

    set({ statsByDay: data, loading: false });
  },

  fetchStatisticsByDayDirect: async (params: AutofarmRequestParams = {}) => {
    const queryParams = new URLSearchParams();
    if (params.geo) {
      const geoArray = Array.isArray(params.geo) ? params.geo : [params.geo];
      geoArray.forEach(geo => queryParams.append('geo', geo));
    }
    if (params.activity_mode) {
      const modeArray = Array.isArray(params.activity_mode)
        ? params.activity_mode
        : [params.activity_mode];
      modeArray.forEach(mode => queryParams.append('activity_mode', mode));
    }

    const url = `${
      ENDPOINTS.AUTO_FARM_STATISTICS_BY_DAY || '/autofarm/statistics-by-day'
    }${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    try {
      const data = await fetchWithErrorHandling<AutofarmStatsByDay[]>(
        url,
        {
          method: 'GET',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        },
        () => {}
      );

      return data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      set({ loading: false, error: errorMessage });
      console.error('Fetch statistics by day error:', error);
      throw error;
    }
  },

  fetchHistoryByDay: async (params: AutofarmRequestParams = {}) => {
    const paramsStr = JSON.stringify(params);
    if (paramsStr === get().lastHistoryByDayParams) {
      return;
    }

    set({ loading: true, error: null, lastHistoryByDayParams: paramsStr });

    const queryParams = new URLSearchParams();
    if (params.geo) {
      const geoArray = Array.isArray(params.geo) ? params.geo : [params.geo];
      geoArray.forEach(geo => queryParams.append('geo', geo));
    }
    if (params.activity_mode) {
      const modeArray = Array.isArray(params.activity_mode)
        ? params.activity_mode
        : [params.activity_mode];
      modeArray.forEach(mode => queryParams.append('activity_mode', mode));
    }

    const url = `${ENDPOINTS.AUTO_FARM_HISTORY_BY_DAY}${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;

    try {
      const data = await fetchWithErrorHandling<AutofarmHistoryByDay>(
        url,
        {
          method: 'GET',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        },
        () => {}
      );

      set({ historyByDay: data, loading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      set({ loading: false, error: errorMessage });
      console.error('Fetch history by day error:', error);
      throw error;
    }
  },

  dumpReadyAccounts: async (params: AutofarmDumpParams) => {
    set({ loading: true, error: null });
    const url = ENDPOINTS.AUTO_FARM_DUMP_READY_ACCOUNTS;

    try {
      const data = await fetchWithErrorHandling<AutofarmDumpResponse>(
        url,
        {
          method: 'POST',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            geo: params.geo,
            activity_mode: params.activity_mode,
            fp_number: params.fp_number,
            subcategory_id: params.subcategory_id,
            to_dump: params.to_dump,
            target_platform: params.target_platform ?? 'CRM',
          }),
        },
        () => {}
      );
      set({ loading: false });
      return data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      set({ loading: false, error: errorMessage });
      console.error('Dump ready accounts error:', error);
      throw error;
    }
  },

  fetchGeosModesStatuses: async () => {
    set({ loading: true, error: null });
    const url = ENDPOINTS.AUTO_FARM_GEOS_MODES_STATUSES;

    try {
      const data = await fetchWithErrorHandling<GeosModesStatusesResponse>(
        url,
        {
          method: 'GET',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        },
        () => {}
      );
      set({ geosModesStatuses: data, loading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      set({ loading: false, error: errorMessage });
      console.error('Fetch geos modes statuses error:', error);
      throw error;
    }
  },
  fetchServers: async (params: AutofarmRequestParams = {}) => {
    set({ loading: true, error: null });
    const queryParams = new URLSearchParams();

    if (params.geo) {
      const geoArray = Array.isArray(params.geo) ? params.geo : [params.geo];
      geoArray.forEach(geo => queryParams.append('geo', geo));
    }
    if (params.activity_mode) {
      const modeArray = Array.isArray(params.activity_mode)
        ? params.activity_mode
        : [params.activity_mode];
      modeArray.forEach(mode => queryParams.append('activity_mode', mode));
    }
    if (params.server_status) {
      const statusArray = Array.isArray(params.server_status)
        ? params.server_status
        : [params.server_status];
      statusArray.forEach(status =>
        queryParams.append('server_status', status)
      );
    }
    queryParams.append('limit', params.limit?.toString() || '10');
    queryParams.append('offset', params.offset?.toString() || '0');

    const url = `${ENDPOINTS.AUTO_FARM_SERVERS}?${queryParams.toString()}`;

    try {
      const data = await fetchWithErrorHandling<ServersResponse>(
        url,
        {
          method: 'GET',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        },
        () => {}
      );
      set({
        servers: data.items,
        totalServers: data.total_rows,
        loading: false,
      });
      return { total_rows: data.total_rows };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      set({ loading: false, error: errorMessage });
      console.error('Fetch servers error:', error);
      throw error;
    }
  },

  fetchProxies: async (params: AutofarmRequestParams = {}) => {
    set({ loading: true, error: null });
    const queryParams = new URLSearchParams();

    if (params.geo) {
      const geoArray = Array.isArray(params.geo) ? params.geo : [params.geo];
      geoArray.forEach(geo => queryParams.append('geo', geo));
    }
    if (params.server_activity_mode) {
      const modeArray = Array.isArray(params.server_activity_mode)
        ? params.server_activity_mode
        : [params.server_activity_mode];
      modeArray.forEach(mode =>
        queryParams.append('server_activity_mode', mode)
      );
    }
    queryParams.append('limit', params.limit?.toString() || '10');
    queryParams.append('offset', params.offset?.toString() || '0');

    const url = `${ENDPOINTS.AUTO_FARM_PROXIES}?${queryParams.toString()}`;

    try {
      const data = await fetchWithErrorHandling<ProxiesResponse>(
        url,
        {
          method: 'GET',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        },
        () => {}
      );
      set({
        proxies: data.items,
        totalProxies: data.total_rows,
        loading: false,
      });
      return { total_rows: data.total_rows };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      set({ loading: false, error: errorMessage });
      console.error('Fetch proxies error:', error);
      throw error;
    }
  },

  updateProxy: async (proxyId: number, data: UpdateProxyRequest) => {
    set({ loading: true, error: null });
    const url = `${ENDPOINTS.AUTO_FARM_PROXIES}/${proxyId}`;

    try {
      const response = await fetchWithErrorHandling<Proxy>(
        url,
        {
          method: 'PATCH',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
          credentials: 'include',
        },
        () => {}
      );
      set(state => ({
        proxies: state.proxies.map(proxy =>
          proxy.proxy_id === proxyId ? response : proxy
        ),
        loading: false,
      }));
      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      set({ loading: false, error: errorMessage });
      console.error('Update proxy error:', error);
      throw error;
    }
  },

  deleteProxy: async (proxyId: number) => {
    set({ loading: true, error: null });
    const url = `${ENDPOINTS.AUTO_FARM_PROXIES}/${proxyId}`;

    try {
      await fetchWithErrorHandling(
        url,
        {
          method: 'DELETE',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        },
        () => {}
      );
      set(state => ({
        proxies: state.proxies.filter(proxy => proxy.proxy_id !== proxyId),
        loading: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      set({ loading: false, error: errorMessage });
      console.error('Delete proxy error:', error);
      throw error;
    }
  },
}));
