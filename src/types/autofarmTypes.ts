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
  server_status?: string | string[];
  server_activity_mode?: string | string[];
  limit?: number;
  offset?: number;
}
export interface AutofarmDumpParams {
  geo: string;
  activity_mode: string;
  fp_number: number;
  subcategory_id: number;
  to_dump: number;
}

export interface GeoOption {
  name: string;
  user_friendly_name: string;
}

export interface ActivityModeOption {
  name: string;
  user_friendly_name: string;
}

export interface ServerStatusOption {
  name: string;
  user_friendly_name: string;
}
export interface GeosModesStatusesResponse {
  geos: GeoOption[];
  activity_modes: ActivityModeOption[];
  server_statuses: ServerStatusOption[];
}

export interface ServerProxy {
  proxy_id: number;
  host: string;
  port: number;
  modem: string;
  password: string;
  change_ip_link: string;
  geo: string;
  provider: string;
  operator: string;
}

export interface Server {
  server_id: number;
  server_name: string;
  activity_mode: string;
  capacity: number;
  geo: string;
  server_status: string;
  update_datetime: string;
  proxy: ServerProxy | null;
}

export interface ServersResponse {
  total_rows: number;
  returned: number;
  offset: number;
  limit: number;
  items: Server[];
}

export interface Proxy {
  proxy_id: number;
  host: string;
  port: number;
  modem: string;
  password: string;
  change_ip_link: string;
  geo: string;
  provider: string;
  operator: string;
  server: Server | null;
}

export interface ProxiesResponse {
  total_rows: number;
  returned: number;
  offset: number;
  limit: number;
  items: Proxy[];
}

export interface UpdateProxyRequest {
  host: string;
  port: number;
  modem: string;
  password: string;
  change_ip_link: string;
  geo: string;
  provider: string;
  operator: string;
  server_id: number;
}

export interface AutofarmState {
  stats: AutofarmStats[];
  missing: AutofarmMissing[];
  statsByDay: AutofarmStatsByDay[];
  geosModesStatuses: GeosModesStatusesResponse | null;
  servers: Server[];
  proxies: Proxy[];
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
  fetchGeosModesStatuses: () => Promise<void>;
  fetchServers: (params?: AutofarmRequestParams) => Promise<void>;
  fetchProxies: (params?: AutofarmRequestParams) => Promise<void>;
  updateProxy: (proxyId: number, data: UpdateProxyRequest) => Promise<Proxy>;
  deleteProxy: (proxyId: number) => Promise<void>;
}
