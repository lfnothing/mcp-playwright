// axios 实例工厂
import { env } from '../config/env'
import { ExternalApiError } from './error';
import axios, { AxiosInstance } from 'axios';

export function createClient(baseURL: string, timeout = env.AMAP_HTTP_TIMEOUT): AxiosInstance {
  const client = axios.create({ baseURL, timeout });

  // 请求拦截：统一加 token / header
  client.interceptors.request.use(
    (config) => {
      config.params = { ...config.params, appid: env.AMAP_HTTP_KEY };
      return config;
    },
    (err) => Promise.reject(err)
  );

  // 响应拦截：集中错误处理
  client.interceptors.response.use(
    (res) => res.data,
    (err) => {
      // 这里可以打日志、触发告警、重试
      throw new ExternalApiError(err);
    }
  );

  return client;
}