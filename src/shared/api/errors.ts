export type NestedApiErrorBody = {
  error: {
    code: string;
    message: string;
  };
};

export type FlatApiErrorBody = {
  status: "error";
  errorCode: string;
  message: string;
  retryable?: boolean;
  requestId?: string;
};

export type ApiErrorBody = NestedApiErrorBody | FlatApiErrorBody;

export type ApiErrorDetails = {
  retryable?: boolean;
  requestId?: string;
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly retryable: boolean;
  readonly requestId: string | null;

  constructor(
    status: number,
    code: string,
    message: string,
    details: ApiErrorDetails = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.retryable = details.retryable ?? false;
    this.requestId = details.requestId ?? null;
  }
}

export function isApiErrorBody(value: unknown): value is ApiErrorBody {
  if (typeof value !== "object" || value === null) return false;

  const flat = value as Partial<FlatApiErrorBody>;
  if (
    flat.status === "error" &&
    typeof flat.errorCode === "string" &&
    typeof flat.message === "string"
  ) {
    return true;
  }

  const err = (value as { error?: unknown }).error;
  if (typeof err !== "object" || err === null) return false;
  const { code, message } = err as { code?: unknown; message?: unknown };
  return typeof code === "string" && typeof message === "string";
}

export function toApiErrorDetails(value: ApiErrorBody): {
  code: string;
  message: string;
  retryable?: boolean;
  requestId?: string;
} {
  if ("error" in value) {
    return {
      code: value.error.code,
      message: value.error.message,
    };
  }

  return {
    code: value.errorCode,
    message: value.message,
    retryable: value.retryable,
    requestId: value.requestId,
  };
}
