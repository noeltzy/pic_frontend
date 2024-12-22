import { message } from 'ant-design-vue'
import axios from 'axios'

const request = axios.create({
  baseURL: 'http://localhost:8881',
  timeout: 50000,
  withCredentials: true,
})
// 全局请求拦截器
request.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 全局响应拦截器
request.interceptors.response.use((response) => {
  const { data } = response
  // 未登录拦截
  if (data.code == 40100) {
    // 不是获取用户信息的请求, 并且不是登录页面,则跳转到登录页面
    if (
      !response.request.responseURL.includes('/user/get/login') &&
      !window.location.pathname.includes('/user/login')
    ) {
      message.warning('请先登录')
      window.location.href = `/user/login?redirect=${window.location.href}`
    }
  }
  return response
})

export default request
