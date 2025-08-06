// 统一错误处理
export class ExternalApiError extends Error {
  status: number;
  response: any;
  constructor(axiosError: any) {
    super(axiosError.message);
    this.name = 'ExternalApiError';
    this.status = axiosError.response?.status;
    this.response = axiosError.response?.data;
  }
}