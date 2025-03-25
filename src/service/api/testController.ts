// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** testLimit GET /api/test/testLimit */
export async function testLimitUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseString_>('/api/test/testLimit', {
    method: 'GET',
    ...(options || {}),
  })
}
