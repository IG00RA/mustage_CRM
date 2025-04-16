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

export interface AutofarmRequestParams extends BaseRequest {
  geo?: string | string[];
  activity_mode?: string | string[];
}

export interface AutofarmState {
  stats: AutofarmStats[];
  missing: AutofarmMissing[];
  loading: boolean;
  error: string | null;
  fetchStatistics: (params?: AutofarmRequestParams) => Promise<void>;
  fetchMissing: (params?: AutofarmRequestParams) => Promise<void>;
}
