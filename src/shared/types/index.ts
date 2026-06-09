export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error: { message: string; isOperational: boolean } | null;
  meta?: Record<string, unknown>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface JwtPayload {
  userId: string;
}
