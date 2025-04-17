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
} from '../types/autofarmTypes';
import { ENDPOINTS } from '../constants/api';
import { fetchWithErrorHandling, getAuthHeaders } from '../utils/apiUtils';

interface AutofarmStore extends AutofarmState {
  lastStatsParams?: string;
  lastMissingParams?: string;
  lastStatsByDayParams?: string;
}

const GEO_MAPPING: { [key: string]: string } = {
  ua: 'Україна',
  pl: 'Польша',
  usa: 'США',
};

export const useAutofarmStore = create<AutofarmStore>(set => ({
  stats: [],
  missing: [],
  statsByDay: [],
  loading: false,
  error: null,
  lastStatsParams: undefined,
  lastMissingParams: undefined,
  lastStatsByDayParams: undefined,

  fetchStatistics: async (params = {}) => {
    const paramsStr = JSON.stringify(params);
    if (paramsStr === useAutofarmStore.getState().lastStatsParams) {
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
    if (paramsStr === useAutofarmStore.getState().lastMissingParams) {
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
            .filter(([_, missingData]) => missingData.total_missing > 0)
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
    if (paramsStr === useAutofarmStore.getState().lastStatsByDayParams) {
      return;
    }

    set({ loading: true, error: null, lastStatsByDayParams: paramsStr });

    const data = await useAutofarmStore
      .getState()
      .fetchStatisticsByDayDirect(params);

    set({ statsByDay: data, loading: false });
    console.log('Statistics by day fetched:', data);
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
      console.error('Fetch statistics by day error:', error);
      throw error;
    }
  },

  dumpReadyAccounts: async (params: AutofarmDumpParams) => {
    set({ loading: true, error: null });
    const queryParams = new URLSearchParams({
      geo: params.geo,
      activity_mode: params.activity_mode,
      fp_number: params.fp_number.toString(),
      subcategory_id: params.subcategory_id.toString(),
      to_dump: params.to_dump.toString(),
    });

    const url = `${
      ENDPOINTS.AUTO_FARM_DUMP_READY_ACCOUNTS
    }?${queryParams.toString()}`;

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
}));
