export interface Response<T> {
  total_rows: number;
  returned: number;
  offset: number;
  limit: number;
  items: T[];
}

export interface BaseRequest {
  limit?: number;
  offset?: number;
  like_query?: string;
}

export interface BaseResponse {
  success?: boolean;
  message?: string;
}

export interface ValidationErrorDetail {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface ValidationErrorResponse {
  detail: ValidationErrorDetail[];
}

export interface ClientErrorResponse {
  detail: string;
}
