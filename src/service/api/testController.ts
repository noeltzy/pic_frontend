// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** downloadImage GET /api/test/image */
export async function downloadImageUsingGet1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.downloadImageUsingGET1Params,
  options?: { [key: string]: any }
) {
  return request<API.Resource>('/api/test/image', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}
