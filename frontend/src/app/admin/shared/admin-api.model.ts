export interface IAdminPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface IAdminPaginatedResponse<T> {
  message: string;
  data: T[];
  pagination: IAdminPagination;
}

export interface IAdminListParams {
  page?: number;
  limit?: number;
  excludeId?: string | null;
}
