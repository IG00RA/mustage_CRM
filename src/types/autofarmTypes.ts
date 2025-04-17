import { BaseRequest } from './globalTypes';

export interface AutofarmStats {
  geo: string;
  mode: string;
  total_servers: number;
  in_process: number;
  ready: number;
  ready_2_fp: number;
  ready_0_fp: number;
}

export interface AutofarmStatsResponse {
  [geo: string]: Omit<AutofarmStats, 'geo'>[];
}

export interface AutofarmMissing {
  geo: string;
  mode_name: string;
  total_missing: number;
}

export interface AutofarmMissingResponse {
  [geo: string]: {
    [mode: string]: Omit<AutofarmMissing, 'geo'>;
  };
}

export interface AutofarmStatsByDay {
  farm_day: number;
  accounts: number;
}

export interface AutofarmDumpResponse {
  subcategory_id: number;
  quantity: number;
  account_names: string[];
}

export interface Subcategory {
  id: number;
  name: string;
}

export interface AutofarmRequestParams extends BaseRequest {
  geo?: string | string[];
  activity_mode?: string | string[];
}

export interface AutofarmDumpParams {
  geo: string;
  activity_mode: string;
  fp_number: number;
  subcategory_id: number;
  to_dump: number;
}

export interface AutofarmState {
  stats: AutofarmStats[];
  missing: AutofarmMissing[];
  statsByDay: AutofarmStatsByDay[];
  loading: boolean;
  error: string | null;
  fetchStatistics: (params?: AutofarmRequestParams) => Promise<void>;
  fetchMissing: (params?: AutofarmRequestParams) => Promise<void>;
  fetchStatisticsByDay: (params: AutofarmRequestParams) => Promise<void>;
  fetchStatisticsByDayDirect: (
    params: AutofarmRequestParams
  ) => Promise<AutofarmStatsByDay[]>;
  dumpReadyAccounts: (
    params: AutofarmDumpParams
  ) => Promise<AutofarmDumpResponse>;
}
