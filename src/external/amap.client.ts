import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'

// 高德 http 请求 key
const amap_http_key = "key"

// 创建 axios 实例
const amap_client = axios.create({
  // API 请求的默认前缀
  baseURL: "url",
  timeout: 6000, // 请求超时时间
})

export type RequestError = AxiosError<{
  status: string
  info: string
  infocode: string
  pois: any
}>

// 请求拦截器
function requestHandler(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig> {
  // 处理已有参数的情况
  const separator = config.url.includes('?') ? '&' : '?'
  config.url += `${separator}key=${amap_http_key}`

  return config
}

// 响应拦截器
function responseHandler(response: { data: any }) {
  const data = response.data

  if (data.status !== '1') {
    return Promise.reject(new Error(data.info || '请求错误'))
  }

  return data
}

// Add a request interceptor
amap_client.interceptors.request.use(requestHandler)

// Add a response interceptor
amap_client.interceptors.response.use(responseHandler)

export default amap_client
